'use client';

import { useReveal } from '@/hooks/useReveal';
import { Pricing } from './Pricing';
import { ProSubscriptionCard } from './ProSubscriptionCard';

/**
 * Home-page pricing module — both purchase options inside ONE section.
 *
 *   ┌── selector column 1 ──┐  ┌── selector column 2 ──┐
 *   │  Pricing (compact)    │  │  ProSubscriptionCard  │
 *   │  ¥59.9 永久授权        │  │  ¥22/月 · ¥168/年     │
 *   │  BYOK / 桌面 / 3 设备 │  │  托管 LLM + 高配额    │
 *   └───────────────────────┘  └───────────────────────┘
 *
 * Each card carries its own state (promo for buyout, plan toggle for
 * subscription) — we just share the section wrapper + heading so the
 * user sees "both options on one page" rather than scrolling through
 * two near-identical sections.
 *
 * Used on `/` only. `/mobile` still uses the standalone
 * `<ProSubscriptionCard />` since there's no parallel buyout offer
 * there. 2026-06-04 (combined pricing module).
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
          买断 <span className="text-[--ink-faint]">或</span>{' '}
          <span className="text-accent">订阅</span>，任选其一
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
              are immune. */}
          <p>
            <strong className="font-semibold text-ink">一次买断 ¥59.9</strong>
            {' —— 桌面客户端永久授权,3 台设备同步激活。翻译与 AI 分析由你自选的大模型服务提供,按用量直接结算给服务商,单视频成本通常不足一毛;数据流向与成本支出完全自主可控。'}
            {/* 8 折福利的"段中提示"——夹在段末,与正文同色但加粗 ink 强调
                "8 折"两字,买断买家读完优惠条款立即看到"日后升级 Pro 也有
                额外让利",降低决策摩擦。位置故意不放段首(段首该让"买断"
                主词站住),也不放卡片里(那里已有 ★ amber 小字 + 中段
                bullet 各一处)。三处不同密度的呈现避免任一处过载。
                2026-06-08。 */}
            {' '}
            <span className="text-[--ink-soft]">
              日后升级 Pro 订阅自动享{' '}
              <strong className="font-semibold text-ink">8 折</strong>。
            </span>
          </p>
          <p>
            <strong className="font-semibold text-ink">订阅 Pro ¥22/月起</strong>
            {' —— 内置 AI 服务,即装即用,免去全部配置环节。同步开通手机端、浏览器插件的完整访问,云端视频与个人语料库容量更为宽裕;可随时在支付宝订单中关闭,无合约绑定。'}
          </p>
        </div>

        <div className="reveal reveal-delay-2 grid grid-cols-1 items-start gap-6 lg:grid-cols-2 lg:gap-8">
          <Pricing variant="compact" />
          <ProSubscriptionCard variant="compact" />
        </div>
      </div>
    </section>
  );
}
