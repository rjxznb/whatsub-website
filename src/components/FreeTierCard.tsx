'use client';

import { Check, Gift } from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';
import { FREE_TIER } from '@/lib/constants';

/**
 * ¥0 免费档卡片 — 跟 ProSubscriptionCard 并排展示在 /mobile,告诉新用户
 * 安装后能直接拿到什么。结构故意跟 Pro 卡片几何对齐(同样的 rounded-2xl、
 * padding、border、border radius),所以两张卡片并排时视觉重量平衡;只在
 * 三处刻意区分:
 *  1. chip 用绿色 emerald 而不是 Pro 的蓝色 accent,潜意识识别"这是入门档"
 *  2. 价格大字写 "¥0",右侧附 "不订阅" 小字,跟 Pro 的月/年 toggle 形成对比
 *  3. 没有购买表单 — 替换成一行 "iOS 在 App Store 即将上线" 的状态提示
 *     (MobileShowcase 顶部已经有完整的下载/即将上线 CTA,这里不重复)
 *
 * 2026-06-08。
 */
export function FreeTierCard({
  variant = 'compact',
}: {
  variant?: 'standalone' | 'compact';
} = {}) {
  const ref = useReveal<HTMLElement>();

  const card = (
    <div
      className={
        variant === 'compact'
          ? 'rounded-2xl border border-[--hairline-strong] bg-[--bg-elev] p-7 sm:p-9'
          : 'reveal reveal-delay-1 mx-auto max-w-[440px] rounded-2xl border border-[--hairline-strong] bg-[--bg-elev] p-7 sm:p-9'
      }
    >
      <p className="mb-3 flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">
        <Gift className="h-3 w-3" strokeWidth={2} />
        免费
      </p>

      {/* Price row — ¥0 大字 + 不订阅 小字,与 Pro 卡片的月/年 toggle
          高度大致齐平,保证两卡顶部对齐(垂直节奏一致 = 视觉舒适)。 */}
      <div className="mb-5 flex items-baseline gap-3">
        <span className="text-4xl font-bold text-ink sm:text-5xl">
          {FREE_TIER.amount}
        </span>
        <span className="text-sm text-[--ink-faint]">不订阅 · 永久免费</span>
      </div>

      <p className="mb-8 text-sm text-[--ink-soft]">{FREE_TIER.label}</p>

      <ul className="mb-8 space-y-4">
        {FREE_TIER.features.map((f) => (
          <li key={f.title} className="flex items-start gap-3 text-sm">
            <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-400">
              <Check className="h-3 w-3" strokeWidth={2.5} />
            </span>
            <div className="flex-1">
              <div className="font-medium text-ink">{f.title}</div>
              {f.desc ? (
                <div className="mt-0.5 text-xs leading-relaxed text-[--ink-muted]">
                  {f.desc}
                </div>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      {/* Footer — 与 Pro 卡片的 form/button 高度匹配,免费档没有购买
          动作,占位为一段状态信息。MobileShowcase 顶部已有"App Store
          即将上线"的状态 pill + 下载链接,这里不再放下载按钮,只用
          一句轻提示告诉用户"这就是默认体验"。 */}
      <div className="rounded-lg border border-[--hairline] bg-bg/30 px-4 py-3">
        <p className="text-center text-xs text-[--ink-muted]">
          iOS 安装即生效 · 不用注册付费 · 三端同步默认开启
        </p>
      </div>

      <p className="mt-4 text-center text-xs text-[--ink-faint]">
        想要更大容量？看右边 <span className="text-accent">订阅 Pro</span>
      </p>
    </div>
  );

  if (variant === 'compact') return card;

  return (
    <section
      ref={ref}
      id="free"
      className="bg-[--bg-soft] px-6 py-24 sm:px-10 sm:py-32 lg:px-16"
    >
      <div className="mx-auto max-w-[1200px]">
        <h2
          className="reveal mb-3 max-w-[900px] font-bold leading-[1.05] tracking-[-0.01em] text-ink"
          style={{ fontSize: 'clamp(30px, 6.5vw, 56px)' }}
        >
          先免费用着 <span className="text-emerald-400">¥0</span>
        </h2>
        {card}
      </div>
    </section>
  );
}
