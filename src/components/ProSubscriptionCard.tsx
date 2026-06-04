'use client';

import { Check, Star } from 'lucide-react';
import { useState } from 'react';
import { useReveal } from '@/hooks/useReveal';
import { LINKS, SUBSCRIPTION } from '@/lib/constants';
import { createOrder, type SubProduct } from '@/lib/payment-api';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * whatSub Pro 订阅 card — Alipay flow for ¥22/月 or ¥168/年 (was ¥12/¥88
 * until 2026-06-04 when the price was bumped to fund the managed-LLM relay).
 *
 * Sits on /mobile (not /pricing) because the value props are mostly mobile-side
 * (50 cloud videos, 500MB/60min per-video, 1000-entry corpus, cross-device sync).
 * The home /pricing section keeps the desktop ¥59.9 buyout card unchanged.
 *
 * Apple policy note: iOS users must subscribe via in-app IAP, not Alipay on the
 * web — the card surfaces this with a small "iOS 用户请在 app 内订阅" note.
 * No UA sniff (users on iOS Safari will see the note; non-iOS users ignore it).
 */
/** `variant`: see `Pricing.tsx` for the symmetric pattern. Default
 *  "standalone" keeps the existing /mobile page behavior; "compact"
 *  drops the section + h2 + sub-paragraph so CombinedPricing can place
 *  this card next to the buyout card under one shared heading.
 *  2026-06-04 (combined pricing module). */
export function ProSubscriptionCard({
  variant = 'standalone',
}: {
  variant?: 'standalone' | 'compact';
} = {}) {
  const ref = useReveal<HTMLElement>();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Default to yearly — flagged as ~40% savings vs monthly × 12.
  const [plan, setPlan] = useState<SubProduct>('sub_year');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!EMAIL_RE.test(email)) {
      setError('请输入有效的邮箱地址');
      return;
    }
    setBusy(true);
    try {
      // Subscription SKUs use fixed env prices on the backend; no promoCode.
      const { payUrl } = await createOrder(email, undefined, plan);
      window.location.href = payUrl;
    } catch (err) {
      setBusy(false);
      const msg = err instanceof Error ? err.message : 'unknown';
      if (msg === 'invalid_email') setError('邮箱格式不正确');
      else setError('网络异常，请稍后再试');
    }
  };

  // Card markup, shared between both render modes.
  const card = (
    <div
      className={
        variant === 'compact'
          ? 'rounded-2xl border border-[--hairline-strong] bg-[--bg-elev] p-7 sm:p-9'
          : 'reveal reveal-delay-1 mx-auto max-w-[440px] rounded-2xl border border-[--hairline-strong] bg-[--bg-elev] p-7 sm:p-9'
      }
      style={{ boxShadow: '0 0 80px rgba(59,155,255,0.05)' }}
    >
          <p className="mb-3 flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.2em] text-accent">
            <Star className="h-3 w-3" fill="currentColor" strokeWidth={0} />
            订阅
          </p>

          {/* Plan toggle (月 / 年). Yearly is default; bumps the savings pill. */}
          <div className="mb-5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPlan('sub_month')}
              className={`rounded-lg border px-4 py-3 text-left transition-colors ${
                plan === 'sub_month'
                  ? 'border-accent bg-accent/10'
                  : 'border-[--hairline-strong] bg-bg/40 hover:border-[--hairline-strong]/80'
              }`}
            >
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[--ink-faint]">月度</div>
              <div className="mt-0.5 text-2xl font-bold text-ink">
                {SUBSCRIPTION.monthlyAmount}
                <span className="text-sm font-normal text-[--ink-faint]"> /月</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setPlan('sub_year')}
              className={`relative rounded-lg border px-4 py-3 text-left transition-colors ${
                plan === 'sub_year'
                  ? 'border-accent bg-accent/10'
                  : 'border-[--hairline-strong] bg-bg/40 hover:border-[--hairline-strong]/80'
              }`}
            >
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-accent">年度 · 省 40%</div>
              <div className="mt-0.5 text-2xl font-bold text-ink">
                {SUBSCRIPTION.yearlyAmount}
                <span className="text-sm font-normal text-[--ink-faint]"> /年</span>
              </div>
            </button>
          </div>

          <p className="mb-8 text-sm text-[--ink-soft]">{SUBSCRIPTION.label}</p>

          <ul className="mb-8 space-y-3">
            {SUBSCRIPTION.features.map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm text-[--ink-soft]">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                  <Check className="h-3 w-3" strokeWidth={2.5} />
                </span>
                <span>{renderFeature(f)}</span>
              </li>
            ))}
          </ul>

          <form onSubmit={onSubmit} className="mb-3 space-y-3">
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="邮箱地址，订阅状态绑定到此邮箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={busy}
              className="block w-full rounded-lg border border-[--hairline-strong] bg-bg/50 px-4 py-3 text-sm text-ink placeholder:text-[--ink-faint] focus:border-accent focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={busy || !email}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-accent text-sm font-semibold text-white transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
              style={{ boxShadow: '0 0 0 1px rgba(59,155,255,0.4), 0 0 32px var(--accent-glow)' }}
            >
              <Star className="h-4 w-4" fill="currentColor" strokeWidth={0} />
              {busy
                ? '处理中...'
                : `立即订阅 · ${plan === 'sub_year' ? SUBSCRIPTION.yearlyAmount + '/年' : SUBSCRIPTION.monthlyAmount + '/月'} 跳转支付宝`}
            </button>
            {error ? (
              <p className="text-center text-xs text-red-400">{error}</p>
            ) : null}
          </form>

          <p className="mb-2 mt-4 text-center text-xs text-[--ink-muted]">
            iOS 用户请在 app 内订阅
          </p>
          <p className="text-center text-xs text-[--ink-faint]">
            随时可在支付宝订单中关闭 · 到期自然结束
          </p>
    </div>
  );

  if (variant === 'compact') {
    return card;
  }

  return (
    <section
      ref={ref}
      id="pro"
      className="bg-[--bg-soft] px-6 py-24 sm:px-10 sm:py-32 lg:px-16"
    >
      <div className="mx-auto max-w-[1200px]">
        <h2
          className="reveal mb-3 max-w-[900px] font-bold leading-[1.05] tracking-[-0.01em] text-ink"
          style={{ fontSize: 'clamp(30px, 6.5vw, 56px)' }}
        >
          不想自己折腾 API？<span className="text-accent">whatSub Pro</span>
        </h2>
        <p className="reveal reveal-delay-1 mb-10 max-w-[640px] text-base text-[--ink-soft]">
          订阅后内置 DeepSeek 中转，不用注册 / 实名 / 充值。月度 ≈ 130 次 AI 视频解析 + 云端视频 50 个 + 个人语料 1000 条；桌面 / 浏览器插件 / iOS 一份订阅全平台共用。
        </p>

        {card}
      </div>
    </section>
  );
}

// Mirror the link patching used on the home Pricing card for the
// 客服协助解决 bullet — keeps the support link consistent across both cards.
function renderFeature(f: string): React.ReactNode {
  if (f === '使用中遇到问题，客服协助解决') {
    return (
      <>
        使用中遇到问题，
        <a
          href={LINKS.supportXhs}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent underline-offset-2 transition-colors hover:underline"
        >
          客服协助解决
        </a>
      </>
    );
  }
  return f;
}
