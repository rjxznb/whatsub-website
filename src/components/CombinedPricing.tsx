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
        <p className="reveal reveal-delay-1 mb-12 max-w-[760px] text-base text-[--ink-soft]">
          一次性 ¥59.9 永久解锁桌面 BYOK；订阅 Pro 解锁 whatSub 托管 LLM（零配置 DeepSeek）+ 全平台高配额。同一邮箱也可以两种都买 —— 它们是叠加的：买断保证桌面永远能用，订阅给你 AI 中转和云端额度。
        </p>

        <div className="reveal reveal-delay-2 grid grid-cols-1 items-start gap-6 lg:grid-cols-2 lg:gap-8">
          <Pricing variant="compact" />
          <ProSubscriptionCard variant="compact" />
        </div>
      </div>
    </section>
  );
}
