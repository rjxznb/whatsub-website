# Alipay 电脑网站支付 v3 接入 — 设计文档

**日期**：2026-05-10
**作者**：rjxznb1@gmail.com（与 Claude 协作 brainstorm）
**状态**：待实施
**涉及仓库**：`whatsub-license`（后端，主战场）+ `whatsub-website`（前端 + 成功页）

---

## 1. 目标 + 非目标

### 1.1 目标

把 whatSub 当前的"小红书私信下单 + seller 手工 mint key + 私信发码"流程替换为支付宝电脑网站支付的全自动流程：买家在 `whatsub.eversay.cc` 留邮箱 + 立即购买 → 支付宝完成付款 → 后端验签 + mint license key + 邮件送达 + 成功页同时显示。

具体可衡量的目标：

- 用户从点 "立即购买" 到看到 license key 的端到端时长 ≤ 30 秒（含支付宝付款交互时间）。
- Notify 主路径失败时，客户端轮询 + 服务端反查 Alipay query API **两路兜底**保证 99.9% 订单能在客户端会话内完成。
- 即使买家关掉浏览器，邮件交付仍然异步完成；不丢单。
- Seller 不再需要手工 mint key 或私信回复。

### 1.2 非目标（明确不做）

- **退款流程**：CLAUDE.md 已明确 "lifetime license, no revocation, no refunds"。极端重复扣款由 seller 在 Alipay 商户后台手动退款 + admin SPA 标记 order 为 `cancelled`。
- **手机网站支付 / APP 支付**：本次只做电脑网站支付（PC 浏览器扫码 / 网银）。
- **多 SKU / 优惠券 / 促销码**：单 SKU 永久授权 ¥29.9。
- **邮箱真实性预校验**（如发验证码再付款）：增加摩擦、降转化；典型买家邮箱有错的概率低，靠成功页同时显示 key 兜底。
- **国际信用卡 / PayPal**：本期纯人民币、纯 Alipay。
- **小红书购买入口下线**：保留为退路（小字降级），怕支付宝路径出问题没法卖。

---

## 2. 决策记录（Why this and not that）

| 决策 | 选定 | 备选 | 理由 |
|---|---|---|---|
| 整体架构 | **Notify + Query 兜底** | A) 纯 Notify 轮询；C) 预 mint + 付款激活 | A 在 notify 完全没到时无法自动恢复；C 引入"鬼 key" + 清理 job 增加复杂度。B 兜底成本（一次额外的 query API 调用）换来全场景一致性。 |
| License key 生成时机 | **付款确认后 mint** | 下单时预 mint | 不留废 key；status='paid' 是唯一状态触发器。 |
| 买家身份采集 | **预填邮箱 + 邮件 + 同时页面显示** | 仅页面显示 / 仅短信 | 短信需企业资质 + 实名审核，个体卖家不友好；纯页面有买家关掉浏览器丢 key 的尾巴。邮件 + 页面双通道最稳。 |
| 邮件传输 | **nodemailer + QQ SMTP 465** | Aliyun DirectMail / Resend | Enghub 已有同模式可复用，零新增依赖外部账号。Resend 对国内邮箱投递不可控；Aliyun DirectMail 需要给 eversay.cc 配 SPF/DKIM，工作量大于收益。 |
| 价格存储 | **后端 env 单一来源** | 后端 products 表 / 客户端传 amount | 单 SKU 不需要表；客户端传 amount 是安全洞。 |
| 沙箱策略 | **沙箱开发，env 切换到 prod** | 直接 prod | Alipay 沙箱与 prod 完全隔离（独立 APPID + 密钥），切换只需改 env，零代码改动。 |
| Spec 落地仓库 | **whatsub-website** | whatsub-license | 用户对话从这里发起，且 spec 跨仓库描述。实施时再决定是否复制一份到 license 仓。 |

---

## 3. 整体架构

### 3.1 数据流

```
┌──────────────────────────────┐         ┌───────────────────────────────────┐
│  whatsub-website (静态)      │         │  whatsub-license (Hono backend)   │
│                              │         │                                   │
│  Pricing 区:                 │  POST   │  POST /api/license/payment/       │
│   [邮箱输入框] [立即购买] ───┼────────►│       create-order                │
│                              │         │   ├─ 校验邮箱                     │
│  浏览器跳转到付款页 ◄────────┼─────────┤   ├─ 生成 out_trade_no (UUID)     │
│                              │ payUrl  │   ├─ INSERT orders (status=pending│
│                              │         │   │  email, amount, created_at)   │
│  ┌─────────────────────────┐ │         │   └─ alipay.pageExec() 拿付款页 URL│
│  │ Alipay 收银台付款       │ │         │                                   │
│  │ (扫码 / 网银)           │ │         │                                   │
│  └─────────────────────────┘ │         │                                   │
│            │                 │         │                                   │
│            │ 跳回 (return_url)│         │                                   │
│            ▼                 │         │                                   │
│  /payment/success?           │  GET    │  GET /api/license/payment/        │
│   out_trade_no=...   ────────┼────────►│       status/:no                  │
│   ↑ 每 1.5s 轮询             │  JSON   │   ├─ SELECT orders WHERE no=...   │
│   显示 key + 复制按钮        │ ◄───────┤   ├─ status=paid → 返回 key      │
│                              │         │   ├─ status=pending + 已超 5s:    │
│                              │         │   │  调 alipay.trade.query →     │
│                              │         │   │  TRADE_SUCCESS → mintLicense  │
│                              │         │   └─ 否则 status=pending         │
│                              │         │                                   │
└──────────────────────────────┘         │  ◄─── Alipay 异步 notify ───      │
                                         │  POST /api/license/payment/notify │
                                         │   ├─ 验签                         │
                                         │   ├─ 幂等检查（status 已 paid 则 │
                                         │   │  直接返 success）             │
                                         │   ├─ mintLicenseForOrder()       │
                                         │   │  · INSERT licenses           │
                                         │   │  · UPDATE orders              │
                                         │   │  · sendLicenseEmail()         │
                                         │   └─ 返回 'success' 给 Alipay    │
                                         └───────────────────────────────────┘
                                                       │
                                                       ▼
                                         ┌───────────────────────────────────┐
                                         │  QQ SMTP (smtp.qq.com:465)        │
                                         │  nodemailer 发邮件                │
                                         │  内容：license key + 激活说明     │
                                         └───────────────────────────────────┘
```

### 3.2 三条独立时间线

1. **同步**：浏览器跳转 → 付款 → 跳回成功页 → 轮询 status → 拿 key 显示
2. **异步主路径**：Alipay → notify 我们 → 后端落库 + mint key + 邮件
3. **兜底**：成功页轮询 5 秒未果 → 后端调 Alipay `trade.query` → 确认到付款 → 补 mint + 邮件 + 通过下次轮询返回 key

哪怕 notify 完全没到（极端情况），用户回到成功页也能通过 query 兜底拿到 key。哪怕用户关掉了成功页，key 仍由 notify 异步生成 + 邮件送达。

---

## 4. 后端设计（whatsub-license）

### 4.1 Schema 增量

新增 1 张表，不改现有 `licenses` / `activations` 结构：

```sql
CREATE TABLE IF NOT EXISTS orders (
  out_trade_no     TEXT     PRIMARY KEY,         -- 我们生成的 UUID
  email            TEXT     NOT NULL,            -- 买家邮箱（pre-checkout 收集）
  amount_cny       NUMERIC(10,2) NOT NULL,        -- 下单时锁定的金额（不信任客户端）
  status           TEXT     NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','paid','expired','cancelled')),
  alipay_trade_no  TEXT,                         -- Alipay 平台的交易号（notify/query 时填）
  license_key      TEXT     REFERENCES licenses(key),  -- mint 后填
  created_at       BIGINT   NOT NULL,
  paid_at          BIGINT,
  notify_payload   JSONB                         -- 原始 notify body，留作审计
);

CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders (status, created_at);
CREATE INDEX IF NOT EXISTS idx_orders_email          ON orders (email);
```

迁移：append 到现有 `schema.sql`，幂等（IF NOT EXISTS），无停机。生产应用：

```bash
docker compose exec -T postgres \
  psql -U whatsub_license_user -d whatsub_license < schema.sql
```

### 4.2 新模块（src/lib/）

| 文件 | 职责 | 主要导出 |
|------|------|---------|
| `lib/alipay.ts` | 包装 `alipay-sdk` v4 实例，env-driven gateway 切换 | `createPagePay(outTradeNo, amount, subject) → payUrl` / `verifyNotify(formBody) → boolean` / `queryTrade(outTradeNo) → { tradeStatus, alipayTradeNo? }` |
| `lib/mail.ts` | 简化版 Enghub MailService（只 SMTP，不要 resend / console 抽象） | `sendLicenseEmail(to, key, outTradeNo, paidAt) → Promise<void>` |
| `lib/db.ts` (扩展) | 加 orders CRUD | `createOrder` / `getOrder` / `markOrderPaidAndMintLicense` (single CTE atomic) / `findExpiredPendingOrders` |

### 4.3 端点（`src/routes/payment.ts` → mount 在 `/api/payment/*`，外部经 nginx 走 `/api/license/payment/*`）

#### 4.3.1 `POST /api/license/payment/create-order`

请求：
```json
{ "email": "buyer@example.com" }
```

成功响应（200）：
```json
{
  "outTradeNo": "ord_8f3a1c2d-…-…",
  "payUrl": "https://openapi.alipay.com/gateway.do?...&sign=..."
}
```

失败响应：
- 400 `{ "error": "invalid_email" }`
- 500 `{ "error": "internal" }`（log 实际错）

逻辑：
1. 邮箱 regex 校验（`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`），失败 → 400
2. `out_trade_no = "ord_" + crypto.randomUUID()`
3. INSERT orders (status='pending', amount=env LICENSE_PRICE_CNY, created_at=Date.now())
4. `alipay.pageExec('alipay.trade.page.pay', { out_trade_no, total_amount, subject, product_code: 'FAST_INSTANT_TRADE_PAY', notify_url, return_url: env.ALIPAY_RETURN_URL + `?out_trade_no=${outTradeNo}` })` → 拿到 URL
5. 返回 `{ outTradeNo, payUrl }`

#### 4.3.2 `GET /api/license/payment/status/:outTradeNo`

请求：path param 即 outTradeNo

响应（200）：
```json
{ "status": "pending" }
{ "status": "paid", "licenseKey": "WHATSUB-XXXX-XXXX-XXXX-XXXX" }
{ "status": "expired" }
```

失败：404 `{ "error": "order_not_found" }`

逻辑：
1. SELECT order by `out_trade_no` → 不存在 404
2. 若 `status='paid'` → 返回 `{ status: 'paid', licenseKey }`
3. 若 `status='pending'` 且 `Date.now() - created_at > 5000`（5 秒兜底门槛）：
   a. 调 `queryTrade(outTradeNo)`
   b. 若 `tradeStatus === 'TRADE_SUCCESS' || tradeStatus === 'TRADE_FINISHED'`：调 `markOrderPaidAndMintLicense(...)` → 返回 `{ status: 'paid', licenseKey }`
   c. 否则（包括 TRADE_CLOSED / WAIT_BUYER_PAY / 查不到）→ 返回 `{ status: 'pending' }`，让 60 秒客户端超时统一处理
4. 若 `status='pending'` 且年龄 ≤ 5s → 返回 `{ status: 'pending' }`（快速跳过兜底）
5. 若 `status='expired' / 'cancelled'` → 返回对应 status

#### 4.3.3 `POST /api/license/payment/notify`

请求：Alipay form-encoded body（含 `sign`、`out_trade_no`、`trade_status`、`trade_no` 等约 30 字段）

响应（必须 text，不能 JSON，per Alipay v3 spec）：
- 处理成功 → `success`
- 任何失败 → `failure`（Alipay 会重试 8 次：4m、10m、10m、1h、2h、6h、15h）

逻辑：
1. `verifyNotify(body)` → 失败直接返回 `failure`（log 异常）
2. 提取 `trade_status`，仅 `TRADE_SUCCESS` / `TRADE_FINISHED` 算成功，其他（如 `WAIT_BUYER_PAY` / `TRADE_CLOSED`）返回 `success` 但不动 db
3. SELECT order by out_trade_no → 不存在记 warning + `success`（防止幻觉订单卡住 Alipay 重试）
4. 若 `status='paid'` → 直接返 `success`（幂等）
5. 调 `markOrderPaidAndMintLicense(order, alipayTradeNo, body)` 原子操作
6. 若 CTE 影响行 > 0（说明本次真的抢到了 mint）→ `sendLicenseEmail()`（fail-open：邮件失败也不影响支付状态）
7. 返回 `success`

### 4.4 共享原子操作 `markOrderPaidAndMintLicense`

被 notify 路径和 status 路径的 query 兜底**两条独立路径**调用。靠单条 SQL 的 `WHERE status='pending'` 守卫保证只 mint 一次：

```sql
WITH claimed AS (
  UPDATE orders
  SET    status = 'paid',
         alipay_trade_no = $alipayTradeNo,
         license_key = $generatedKey,
         paid_at = $now,
         notify_payload = $payloadJson
  WHERE  out_trade_no = $outTradeNo AND status = 'pending'
  RETURNING out_trade_no, email, license_key
)
INSERT INTO licenses (key, email, max_devices, created_at)
SELECT license_key, email, 3, $now
FROM claimed
ON CONFLICT (key) DO NOTHING
RETURNING key;
```

返回 0 行 = 已被另一路径 mint，跳过邮件。
返回 1 行 = 本次抢到，触发邮件。

### 4.5 文件变更清单

**新增：**
- `src/lib/alipay.ts`
- `src/lib/mail.ts`
- `src/routes/payment.ts`
- `tests/lib/alipay.test.ts`
- `tests/lib/mail.test.ts`
- `tests/routes/payment.test.ts`

**改动：**
- `src/lib/db.ts` — 加 5 个 orders 相关方法 + 抢占式 mint
- `src/lib/keygen.ts` — 不改（复用现有 WHATSUB-XXXX-XXXX-XXXX-XXXX 生成器）
- `src/index.ts` — 注册 payment 路由
- `schema.sql` — append `orders` 表 DDL（§4.1）
- `package.json` — `dependencies` 加 `alipay-sdk@^4` + `nodemailer@^6` + `@types/nodemailer`
- `.env.example` — 加 §6.1 列出的 12 个 env vars
- `CLAUDE.md` — Quick map 加新端点 + 新模块说明

---

## 5. 前端设计（whatsub-website）

### 5.1 Pricing 组件改造

把 `src/components/Pricing.tsx` 现有的 "在小红书购买" 单按钮换成"邮箱表单 + 立即购买"，小红书降级为小字链接：

```
┌────────────────────────────────────────┐
│ 授权方式                               │
│                                        │
│ ¥29.9    ~~¥99~~                       │
│ 永久授权                               │
│                                        │
│ ✓ 永久使用，不订阅                     │
│ ✓ 一份授权码可在 3 台设备同时激活      │
│ ✓ 换设备联系客服免费释放槽位           │
│ ✓ 所有未来更新免费                     │
│ ✓ 不限制视频数量、不限制使用时长       │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │ [邮箱地址，授权码会发到这里]        │ │  ← 新增
│ └────────────────────────────────────┘ │
│ ┌────────────────────────────────────┐ │
│ │     立即购买 · 跳转支付宝          │ │  ← 替换原 CTA
│ └────────────────────────────────────┘ │
│                                        │
│ 或私信小红书购买            ←  小字降级│
│ 数字商品售出不退                       │
└────────────────────────────────────────┘
```

行为：
- 邮箱本地校验（`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`）→ POST `/api/license/payment/create-order` { email }
- 200：`window.location.href = res.payUrl`（浏览器整页跳转到 Alipay）
- 失败：按钮下方红字 inline 显示错误（"网络异常，请稍后再试"）
- loading 状态：按钮文字 → "处理中..."；输入框禁用

### 5.2 新页面 `/payment/success`

`src/app/payment/success/page.tsx`（Next.js static export → `out/payment/success/index.html`）

读取 URL `?out_trade_no=xxx`（用 `useSearchParams()` + `<Suspense>` 包装，static export 必需）。

三个状态：

| 状态 | 触发 | UI |
|------|------|-----|
| 等待 | 进入页面后开始轮询 | spinner + "正在确认付款..." + 小字 "订单号 ord_..." |
| 成功 | 轮询返回 `{ status: 'paid', licenseKey }` | 大字号 mono 显示 key + 复制按钮 + "已同步发送至 ***@your.com" + "下载 whatSub" 按钮 + 3 步激活说明 |
| 超时 | 60 秒仍未拿到 key | "正在确认付款，请稍候。如已完成支付未收到激活码，[联系客服]" |

轮询规则：
- `useEffect` 启动 `setInterval(fetch, 1500ms)`
- 拿到 `status === 'paid'` 后立即 `clearInterval` + 显示
- 客户端硬超时 60 秒，停止轮询、显示降级文案
- 卸载时清理 interval（防止 React StrictMode 二次挂载漏 leak）

### 5.3 失败 / 取消路径

- 用户在 Alipay 页面点 "取消" 或关闭 → 跳回 `/payment/success?out_trade_no=xxx`，order 仍 pending → 60s 客户端超时显示降级文案
- 不单独做 `/payment/cancelled` 页面（额外 route 增加复杂度，超时降级足够）

### 5.4 文件变更清单

**新增：**
- `src/app/payment/success/page.tsx`
- 可能：`src/lib/payment-api.ts`（封装 fetch + 轮询逻辑，便于测试）

**改动：**
- `src/components/Pricing.tsx` — 加 email + 立即购买表单 + 小红书降级
- 可能：`src/components/Nav.tsx` 加 nav link 跳到 #pricing（已经有了，无需改）

---

## 6. 配置 + 凭证

### 6.1 服务器 env 变量（`/opt/whatsub/.env`，chmod 600）

```bash
# ── Alipay ─────────────────────────────────────────────────────
ALIPAY_APP_ID=2021xxxxxxxxxxxx          # 在 open.alipay.com 创建应用拿到
ALIPAY_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
ALIPAY_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
ALIPAY_GATEWAY=https://openapi.alipay.com/gateway.do
                                        # 沙箱: https://openapi-sandbox.dl.alipaydev.com/gateway.do
ALIPAY_NOTIFY_URL=https://whatsub.eversay.cc/api/license/payment/notify
ALIPAY_RETURN_URL=https://whatsub.eversay.cc/payment/success

# ── 商品信息 ───────────────────────────────────────────────────
LICENSE_PRICE_CNY=29.9
LICENSE_PRODUCT_NAME=whatSub 永久授权    # Alipay 收银台显示

# ── QQ SMTP ────────────────────────────────────────────────────
SMTP_HOST=smtp.qq.com
SMTP_PORT=465
SMTP_USER=xxx@qq.com
SMTP_PASS=xxxxxxxxxxxx                  # QQ 授权码（不是 QQ 密码）
SMTP_FROM_EMAIL=whatSub <xxx@qq.com>    # 可选，不填则用 SMTP_USER
```

### 6.2 Alipay 商户后台一次性配置

1. open.alipay.com → 控制台 → 找到已开通的电脑网站支付应用，记下 **APPID**
2. 接口加签方式选 **公钥模式**（不要证书模式，证书模式更复杂）
3. 用 alipay-sdk 自带工具 / openssl 生成 RSA2 密钥对：
   - 把**我们的公钥**上传到 Alipay 后台
   - 把 **Alipay 的公钥**复制下来（控制台显示）
4. 配置 **应用网关 / 授权回调地址 / 异步通知地址** 都填 `https://whatsub.eversay.cc/...`（具体 URL 见 §6.1）
5. 沙箱：opendocs.alipay.com → 工具 → 沙箱 → 拿独立的沙箱 APPID + 密钥 + 沙箱买家账号

### 6.3 用户需要提供的凭证

| 项 | 谁负责 | 必需性 |
|---|---|---|
| Alipay APPID（沙箱 + 生产） | 用户（在控制台拿） | 必需 |
| Alipay 应用私钥 + 应用公钥 | 用户（生成 + 上传公钥） | 必需 |
| Alipay 平台公钥 | 用户（控制台复制） | 必需 |
| QQ 邮箱 + 授权码 | 用户（QQ 邮箱设置 → SMTP 服务） | 必需 |
| 商品文案确认 | 默认 "whatSub 永久授权"，可改 | 可改 |

代码可以**先用沙箱凭证写完跑通**，等用户准备好生产凭证后只换 env 变量切到 prod。

---

## 7. 错误处理 + 边界情况

### 7.1 幂等

- **Notify 重复**：Alipay 在 8 个时间窗内最多重试 8 次。`markOrderPaidAndMintLicense` 的 CTE `WHERE status='pending'` 守卫 + `INSERT ... ON CONFLICT DO NOTHING` 保证只 mint 一次、只发一封邮件。
- **Notify + Query 同时触发 mint**：两条路径都进入同一个 SQL，靠 status 守卫单点串行，先到先得。

### 7.2 异常

| 场景 | 行为 |
|---|---|
| Alipay verifyNotify 失败 | 返回 `failure`、log warning（含 raw body 供排查） |
| Alipay query API 503 | status 路径 fallback 到 `pending`（不影响 notify 主路径） |
| nodemailer SMTP 连接失败 | log error、不影响 db 状态（key 已 mint，下次 admin 可手动重发） |
| db pg.Pool 连接耗尽 | 返回 500 + log；create-order 失败用户能立即重试 |
| 用户提交了不存在的 out_trade_no（手敲 URL） | status 端点返回 404 |
| 用户提交了别人的 out_trade_no（拼凑 URL） | status 端点不暴露 email，只返回 status + key —— 仍然算泄露，但 out_trade_no 是 UUID，遍历不可行；**接受此风险** |
| Alipay notify body 解析失败 | 返回 `failure`、log raw |

### 7.3 过期清理

后端启动时 `setInterval`，每 24h 扫一次：
```sql
UPDATE orders SET status='expired'
WHERE status='pending' AND created_at < $now - 86_400_000;
```
不需要独立 cron 容器，Hono 服务自己做。

### 7.4 防刷

v1 不加速率限制。如果发现 create-order 被刷，在 `routes/payment.ts` 加一段：用内存 Map 缓存 `(email|ip, count)`，"5 次/邮箱/小时" 即可。

---

## 8. 测试策略

### 8.1 单元 + 路由（vitest）

| 文件 | 覆盖 |
|---|---|
| `tests/lib/alipay.test.ts` | mock alipay-sdk，测 createPagePay 入参组装、verifyNotify 边界、queryTrade 解析 |
| `tests/lib/mail.test.ts` | mock nodemailer，验证 subject / html / text 模板内容 + 收件人 |
| `tests/lib/db.test.ts` | pg-mem，覆盖 markOrderPaidAndMintLicense 幂等：连续两次调用只 mint 一次 |
| `tests/routes/payment.test.ts` | 覆盖三个端点 + 6 条主要路径：成功 / 重复 notify / 验签失败 / query 兜底命中 / order 不存在 / 客户端超时 |

### 8.2 沙箱 e2e（手动）

- 后端用沙箱凭证启动
- 用 sandbox 买家账号付款
- 验证：notify 命中 + db 状态 + 邮件送达 + 成功页轮询出 key

### 8.3 生产烟测

- 自己付一次真钱（¥29.9），全流程验证
- 验证后 Alipay 商户后台手工退款（避免污染数据）

---

## 9. 部署顺序

**先后端再前端**——反过来会有窗口期前端按钮 404。

1. **后端**：`whatsub-license` commit + 切到沙箱凭证 → docker build → scp 镜像 → 服务器 docker compose up
2. **schema 迁移**：`docker compose exec -T postgres psql -U whatsub_license_user -d whatsub_license < schema.sql`（IF NOT EXISTS 幂等，无停机）
3. **后端 smoke**：`curl -X POST https://whatsub.eversay.cc/api/license/payment/create-order -H 'content-type: application/json' -d '{"email":"test@xxx.com"}'` 应返回 `{outTradeNo, payUrl}`，浏览器打开 payUrl 跳到沙箱付款页
4. **前端**：`whatsub-website` commit + pnpm build + scp tarball + 服务器原地解压
5. **沙箱 e2e**：从 pricing 走完整流程，确认轮询拿到 key + 邮箱收到邮件
6. **切 prod**：服务器 `.env` 改 `ALIPAY_*` 五个变量为生产凭证 → `docker compose up -d --force-recreate`（重启快、不重建镜像）
7. **生产烟测**：自己真买一次

---

## 10. 验收标准

- [ ] 沙箱：买家完整 100 次流程不丢单（Notify + Query 兜底各贡献至少一次）
- [ ] 沙箱：成功页 P95 在 8 秒内拿到 key（含付款交互）
- [ ] 沙箱：所有邮件 24 小时内送达 QQ + 163 + Outlook 邮箱（垃圾箱不算）
- [ ] 生产：自己真付一次，端到端跑通
- [ ] 单元 + 路由测试覆盖率：payment 模块 ≥ 90%（vitest --coverage）
- [ ] schema 迁移在生产 db 上幂等执行 2 次无报错
- [ ] CLAUDE.md 在 whatsub-license + whatsub-website 双仓库都更新到反映新端点 + 新模块

---

## 11. 实施顺序（建议给 implementation plan 的输入）

1. whatsub-license 的 schema + db 方法（含 markOrderPaidAndMintLicense + 幂等测试）
2. whatsub-license 的 alipay.ts + mail.ts（含 mock 单测）
3. whatsub-license 的 payment.ts 路由（含端点测试）
4. whatsub-license 的 .env.example + CLAUDE.md 更新
5. whatsub-license 沙箱 deploy + 后端 smoke
6. whatsub-website 的 Pricing 表单 + payment-api lib
7. whatsub-website 的 /payment/success 页面 + 轮询
8. whatsub-website CLAUDE.md 更新
9. whatsub-website build + deploy
10. 沙箱 e2e 全流程
11. 切 prod env + 生产烟测

---

## 12. 开放项 / 待用户决定

- [ ] Alipay 沙箱凭证（用户在控制台获取后提供）
- [ ] Alipay 生产凭证（同上）
- [ ] QQ 邮箱 + 授权码（用户在 QQ 邮箱设置中开通 SMTP 服务）
- [ ] 商品文案确认（默认 "whatSub 永久授权"，是否需要改）
- [ ] 是否在 Pricing 上保留 "或私信小红书购买" 小字链接（默认保留作为退路）
