'use client';

import { useReveal } from '@/hooks/useReveal';
import { FreeTierCard } from './FreeTierCard';
import { Pricing } from './Pricing';
import { ProSubscriptionCard } from './ProSubscriptionCard';

/**
 * Home-page pricing module — three tiers inside ONE section (2026-06-08).
 *
 *   ┌── Free ──────────┐  ┌── Buyout ───────┐  ┌── Pro ──────────┐
 *   │ ¥0               │  │ ¥59.9 永久      │  │ ¥22/月 · ¥168/年│
 *   │ 安装即用全核心   │  │ BYOK / 桌面     │  │ 托管 AI + 高配额 │
 *   └──────────────────┘  └─────────────────┘  └─────────────────┘
 *
 * Was 2 cards (buyout + Pro). Free was added 2026-06-08 after user feedback
 * that visitors couldn't see what they get without paying. Each card
 * carries its own state (promo for buyout, plan toggle + email pricing
 * lookup for Pro, info-only for Free) — section wrapper + heading shared.
 *
 * Used on `/` only. `/mobile` shows just Free + Pro (no buyout — desktop
 * client only).
 */
export function CombinedPricing() {
  const ref = useReveal<HTMLElement>();

  return (
    <section
      ref={ref}
      id="pricing"
      className="bg-[--bg-soft] px-6 py-24 sm:px-10 sm:py-32 lg:px-16"
    >
      <div className="mx-auto max-w-[1200px]">
        <h2
          className="reveal mb-3 max-w-[900px] font-bold leading-[1.05] tracking-[-0.01em] text-ink"
          style={{ fontSize: 'clamp(30px, 6.5vw, 64px)' }}
        >
          <span className="text-emerald-400">免费</span>{' '}
          <span className="text-[--ink-faint]">/</span>{' '}
          买断{' '}
          <span className="text-[--ink-faint]">/</span>{' '}
          <span className="text-accent">订阅</span>，按需选其一
        </h2>
        {/* Two-option intro — formal register (no 你, objective voice),
            parallel structure so the two paragraphs read side-by-side
            cleanly: each opens with "price · headline benefit", then
            describes how AI is handled, then states what else is
            included / what the cost dynamic is.

            Quiet psychological framing — features positive, drawbacks
            reframed rather than denied:
            • Buyout's AI-setup-required is reframed as "自选的 AI 服务"
              (choice/sovereignty) instead of "you must register a key"
              (task/burden).
            • Buyout's per-call AI cost is reframed as "数据流向与成本
              支出完全自主可控" (control) — anchored by "单视频成本
              通常不足一毛" so the absolute number lands cheap before
              the user can multiply it out.
            • Subscription's recurring fee is reframed as "可随时在
              支付宝订单中关闭,无合约绑定" (flexibility) to neutralize
              commitment anxiety.
            • Subscription's specific quota numbers are softened to
              "更为宽裕" (qualitative positive) — concrete limits are
              left for the card body to disclose, where the buyer is
              already past the comparison stage.
            • The fact that buyout doesn't include mobile / extended
              quotas is simply NOT mentioned in the buyout paragraph;
              the Pro paragraph introduces them as add-ons rather than
              positioning them as something buyout "lacks".
          */}
        <div className="reveal reveal-delay-1 mb-12 max-w-[820px] space-y-4 text-base leading-relaxed text-[--ink-soft]">
          {/* Each paragraph body wraps the post-label prose in a JS
              string literal `{'...'}` rather than raw JSX text. Raw
              JSX text inserts a literal space at every source-line
              break, which on Chinese (no inter-word spaces) leaves
              visible gaps mid-sentence ("与 成本"). String literals
              are immune.

              Three paragraphs since 2026-06-08 — free / buyout / Pro,
              matching the three cards below in the same order. */}
          <p>
            <strong className="font-semibold text-ink">免费 ¥0</strong>
            {' —— 下载安装即用,核心功能(双语字幕、AI 标黄、跟读、卡片测验、AI 口语陪练)完整开放。云端视频 3 个 + 个人语料库 50 条 + 一次性 200K token AI 体验,够你完整试几个视频判断是不是要的工具。'}
            {/* 「需要注意」 — 三端的免费档不是一回事:iOS / 浏览器插件永久免费,
                桌面客户端只是 24h 试用,过了要买断或订阅才能用桌面端。
                诚实说出来,避免桌面用户期待落空。2026-06-08。 */}
            {' '}
            <span className="text-[--ink-muted]">
              <strong className="font-semibold text-[--ink-soft]">需要注意：</strong>
              iOS 和浏览器插件的免费档永久可用;桌面客户端是首次免费试用 24 小时,试用期结束需买断或订阅 Pro 才能继续用。
            </span>
          </p>
          <p>
            <strong className="font-semibold text-ink">一次买断 ¥59.9</strong>
            {' —— 桌面客户端永久授权,3 台设备同步激活。翻译与 AI 分析由你自选的大模型服务提供,按用量直接结算给服务商,单视频成本通常不足一毛;数据流向与成本支出完全自主可控。'}
            {' '}
            <span className="text-[--ink-soft]">
              日后升级 Pro 订阅自动享{' '}
              <strong className="font-semibold text-ink">8 折</strong>。
            </span>
            {/* 「需要注意」 — 诚实说出本档真实代价。买断的"门槛"是首次
                得自己注册大模型账号 + 配 API Key(~3-5 分钟),之后所有
                AI 调用按 token 用量自费付给服务商。--ink-muted 收住,
                视觉权重低于卖点段落,但不让买家事后惊讶。2026-06-08。 */}
            {' '}
            <span className="text-[--ink-muted]">
              <strong className="font-semibold text-[--ink-soft]">需要注意：</strong>
              翻译和 AI 功能要你自己注册一个大模型账号、配置 API Key(首次约 3-5 分钟),之后按 token 用量自费支付给所选服务商。
            </span>
          </p>
          <p>
            <strong className="font-semibold text-ink">订阅 Pro ¥22/月起</strong>
            {' —— 内置 AI 服务,即装即用,免去全部配置环节。同步开通手机端、浏览器插件的完整访问,云端视频与个人语料库容量更为宽裕;可随时在支付宝订单中关闭,无合约绑定。'}
            {/* 同上 — Pro 的"代价"是按月/年持续付费,订阅停止后 Pro 容量
                就回到免费档。诚实表达:不是"app 不能用了",而是"扩展额度
                没了"。用户停付后核心功能仍在,这点不能含糊掉,否则会被
                读成误导。2026-06-08。 */}
            {' '}
            <span className="text-[--ink-muted]">
              <strong className="font-semibold text-[--ink-soft]">需要注意：</strong>
              按月/年持续付费;订阅停止后 Pro 容量会回落到免费档(云端视频 50 → 3、语料库 1000 → 50、AI 也不再内置),核心功能仍可用但额度收窄。
            </span>
          </p>
        </div>

        {/* 3 列网格(lg 屏);中屏 1200px 容器下每张 ≈ 370px 宽,信息密度
            刚好。窄屏自动 grid-cols-1 单列堆叠。Free 在最左(入门 → 中间
            买断 → 右侧最贵 Pro),价格从低到高的视觉节奏。 */}
        <div className="reveal reveal-delay-2 grid grid-cols-1 items-start gap-6 lg:grid-cols-3 lg:gap-6">
          <FreeTierCard variant="compact" />
          <Pricing variant="compact" />
          <ProSubscriptionCard variant="compact" />
        </div>
      </div>
    </section>
  );
}
