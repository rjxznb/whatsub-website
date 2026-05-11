# 改价格

价格在**两个地方**，必须一致：

- **后端** `/opt/whatsub/.env` 的 `LICENSE_PRICE_CNY` —— Alipay 实际收的钱（不信任前端，这里是 source of truth）
- **前端** `src/lib/constants.ts` 的 `PRICING.amount` —— 网页上展示的金额（纯视觉）

只改一边的后果：
- 只改前端 → 用户看到 ¥39.9 但实际付 ¥29.9（少收钱）
- 只改后端 → 用户看到 ¥29.9 但 Alipay 跳转后显示 ¥39.9（被骗感、转化崩）

---

## 1. 改后端（实际付款金额）

服务器一行命令搞定，无需重新 build 镜像：

```bash
ssh -i ~/.ssh/id_ed25519 root@47.93.87.206 \
  "sed -i 's|^LICENSE_PRICE_CNY=.*|LICENSE_PRICE_CNY=39.9|' /opt/whatsub/.env && \
   cd /opt/whatsub && docker compose --env-file .env up -d --force-recreate"
```

把 `39.9` 换成你要的价格。`--force-recreate` 重启容器，10 秒内完成。

## 2. 改前端（页面显示）

编辑 `src/lib/constants.ts`：

```ts
export const PRICING = {
  amount: '¥39.9',           // ← 改这里
  originalAmount: '¥99',     // ← 划掉的原价，要不要保留你定
  period: null,
  label: '永久授权',
  features: [...],
};
```

本地 build + 部署：

```bash
cd /c/Users/renjx/Desktop/whatsub-website
pnpm build
tar czf /tmp/whatsub-web.tar.gz -C out .
scp -i ~/.ssh/id_ed25519 /tmp/whatsub-web.tar.gz root@47.93.87.206:/tmp/
ssh -i ~/.ssh/id_ed25519 root@47.93.87.206 "
  rm -rf /data/whatsub-web/* &&
  tar xzf /tmp/whatsub-web.tar.gz -C /data/whatsub-web/ &&
  rm /tmp/whatsub-web.tar.gz
"
```

## 3. 验证

无痕窗口打开 https://whatsub.eversay.cc/#pricing：

- 页面显示的新价格对吗
- 点「立即购买 · 跳转支付宝」→ 跳到 Alipay 收银台后**确认 Alipay 那边显示的金额跟前端完全一致**

## 4. 限时促销 / 回滚

促销时把两边都改成 `19.9`，结束后再改回 `29.9`。整个流程 < 2 分钟。

如果改完发现金额不对，直接重复步骤 1+2 改回旧值。已经创建但未付款的订单（`status='pending'`）会在 24 小时后被定时任务自动 `expired`；想立即清理可以手动 SQL：

```bash
ssh -i ~/.ssh/id_ed25519 root@47.93.87.206 \
  "docker compose -f /opt/enghub/docker-compose.yml exec -T postgres psql -U whatsub_license_user -d whatsub_license -c \"UPDATE orders SET status='cancelled' WHERE status='pending' AND amount_cny='29.9';\""
```

（把 `29.9` 换成你旧价格）

## 5. 其他价格相关位置

`originalAmount` 是划线原价，目前是 `¥99`。改它不会影响支付，只是视觉锚定（让买家感觉打折）。要 / 要不要保留划线原价根据营销策略来。

`PRICING.features` 是特性列表（"3 台设备" "永久使用" 等）—— 跟价格独立，但如果你做不同档位价格（比如限时低价 vs 标准价），可以顺便调一下文案。
