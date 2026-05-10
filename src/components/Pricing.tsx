'use client';

import { Check, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { useReveal } from '@/hooks/useReveal';
import { LINKS, PRICING } from '@/lib/constants';
import { createOrder } from '@/lib/payment-api';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Pricing() {
  const ref = useReveal<HTMLElement>();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!EMAIL_RE.test(email)) {
      setError('请输入有效的邮箱地址');
      return;
    }
    setBusy(true);
    try {
      const { payUrl } = await createOrder(email);
      window.location.href = payUrl;
    } catch (err) {
      setBusy(false);
      const msg = err instanceof Error ? err.message : 'unknown';
      setError(msg === 'invalid_email' ? '邮箱格式不正确' : '网络异常，请稍后再试');
    }
  };

  return (
    <section
      ref={ref}
      id="pricing"
      className="bg-[--bg-soft] px-6 py-24 sm:px-10 sm:py-32 lg:px-16"
    >
      <div className="mx-auto max-w-[1200px]">
        <h2
          className="reveal mb-14 max-w-[900px] font-bold leading-[1.05] tracking-[-0.01em] text-ink"
          style={{ fontSize: 'clamp(40px, 6vw, 72px)' }}
        >
          一份授权,<span className="text-accent">3 台设备</span>
        </h2>

        <div
          className="reveal reveal-delay-1 mx-auto max-w-[480px] rounded-2xl border border-[--hairline-strong] bg-[--bg-elev] p-8 sm:p-10"
          style={{ boxShadow: '0 0 80px rgba(59,155,255,0.05)' }}
        >
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-[--ink-faint]">
            授权方式
          </p>

          <div className="mb-3 flex items-baseline gap-3">
            <span className="text-7xl font-bold leading-none text-ink">
              {PRICING.amount}
            </span>
            {PRICING.originalAmount ? (
              <span className="text-2xl text-[--ink-faint] line-through">
                {PRICING.originalAmount}
              </span>
            ) : null}
            {PRICING.period ? (
              <span className="text-2xl text-[--ink-faint]">
                {PRICING.period}
              </span>
            ) : null}
          </div>
          <p className="mb-8 text-sm text-[--ink-soft]">{PRICING.label}</p>

          <ul className="mb-8 space-y-3">
            {PRICING.features.map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm text-[--ink-soft]">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                  <Check className="h-3 w-3" strokeWidth={2.5} />
                </span>
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <form onSubmit={onSubmit} className="mb-3 space-y-3">
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="邮箱地址，授权码会发到这里"
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
              <ShoppingBag className="h-4 w-4" strokeWidth={2} />
              {busy ? '处理中...' : '立即购买 · 跳转支付宝'}
            </button>
            {error ? (
              <p className="text-center text-xs text-red-400">{error}</p>
            ) : null}
          </form>

          <p className="text-center text-xs text-[--ink-faint]">
            或{' '}
            <a
              href={LINKS.xhsStore}
              target="_blank"
              rel="noopener noreferrer"
              className="underline transition-colors hover:text-[--ink-muted]"
            >
              私信小红书购买
            </a>
            {' · '}
            数字商品售出不退
          </p>
        </div>
      </div>
    </section>
  );
}
