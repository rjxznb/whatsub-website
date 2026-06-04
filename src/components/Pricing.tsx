'use client';

import { Check, Clock, GraduationCap, ShoppingBag, X, Zap } from 'lucide-react';
import { useState } from 'react';
import { useReveal } from '@/hooks/useReveal';
import { usePromotion, type PromoStatus } from '@/hooks/usePromotion';
import { LINKS, PRICING } from '@/lib/constants';
import { createOrder } from '@/lib/payment-api';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// One feature in the pricing card carries a hyperlink to Xiaohongshu
// support. Keep this match exact — if the constants.ts string changes,
// update the match here too.
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

/** "29.90" → "¥29.9" (drop trailing zero, prepend ¥). */
function formatCny(numericString: string): string {
  const n = Number(numericString);
  return Number.isFinite(n) ? `¥${n}` : numericString;
}

function formatRemaining(ms: number): string {
  if (ms <= 0) return '已结束';
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  if (days > 0) return `${days}天 ${pad(h)}:${pad(m)}:${pad(s)}`;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function reasonToCN(reason: string): string {
  switch (reason) {
    case 'not_found':
      return '优惠码无效';
    case 'sold_out':
      return '名额已满';
    case 'used':
      return '此码已被使用';
    case 'expired':
      return '优惠码已过期';
    case 'network':
      return '网络异常，请稍后再试';
    default:
      return '优惠码不可用';
  }
}

/** `variant` controls how the component renders its outer chrome:
 *  - "standalone" (default): own <section> + page-level <h2> + PromoBanner above.
 *    Used on /mobile and as a fallback for any caller that just wants
 *    the full standalone section.
 *  - "compact": NO section, NO h2, NO PromoBanner. Renders just the
 *    inner card box so a parent (CombinedPricing) can drop two cards
 *    side-by-side inside one shared section + heading. PromoBanner is
 *    dropped because compact mode is only used on the home page where
 *    the user typically lands without a promo URL; the standalone view
 *    on /mobile keeps its full promo flow intact.
 *  2026-06-04 (combined pricing module). */
export function Pricing({
  variant = 'standalone',
}: {
  variant?: 'standalone' | 'compact';
} = {}) {
  const ref = useReveal<HTMLElement>();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { state, applyCode, clearCode } = usePromotion();

  // Coupon input state — collapsed by default. Only revealed when buyer
  // clicks "我有优惠码". `couponInput` is the in-flight typed value;
  // applying it hands the trimmed string to the hook which persists +
  // validates against the backend.
  const [couponOpen, setCouponOpen] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [couponBusy, setCouponBusy] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const isApplied =
    state.status === 'active_promotion' || state.status === 'active_coupon';

  const onApplyCoupon = async () => {
    const trimmed = couponInput.trim();
    if (!trimmed) return;
    setCouponBusy(true);
    setCouponError(null);
    const next = await applyCode(trimmed);
    setCouponBusy(false);
    if (next.status === 'error') {
      setCouponError(reasonToCN(next.reason));
    } else if (next.status === 'active_promotion' || next.status === 'active_coupon') {
      setCouponInput('');
      setCouponOpen(false);
    }
  };

  const onClearCoupon = () => {
    clearCode();
    setCouponInput('');
    setCouponError(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!EMAIL_RE.test(email)) {
      setError('请输入有效的邮箱地址');
      return;
    }
    setBusy(true);
    try {
      const promoCode = isApplied ? state.code : undefined;
      const { payUrl } = await createOrder(email, promoCode);
      window.location.href = payUrl;
    } catch (err) {
      setBusy(false);
      const msg = err instanceof Error ? err.message : 'unknown';
      if (msg === 'invalid_email') {
        setError('邮箱格式不正确');
      } else if (msg === 'promo_invalid' || msg === 'promo_used' || msg === 'promo_sold_out') {
        setError(reasonToCN(msg.replace('promo_', '')) + '，请重试');
        // Backend rejected the code we thought was valid — likely raced with
        // another buyer. Clear locally so the next attempt uses default price.
        clearCode();
      } else {
        setError('网络异常，请稍后再试');
      }
    }
  };

  // Display values driven by promo state.
  const primaryPrice =
    isApplied ? formatCny(state.finalPrice) : PRICING.amount;
  const anchorPrice =
    isApplied ? PRICING.amount : PRICING.originalAmount;
  const buyButtonLabel = isApplied
    ? `立即购买 · ${formatCny(state.finalPrice)} 跳转支付宝`
    : '立即购买 · 跳转支付宝';

  // The actual card markup, shared between both render modes.
  const card = (
    <div
      className={
        (variant === 'compact'
          ? 'rounded-2xl border border-[--hairline-strong] bg-[--bg-elev] p-7 sm:p-9'
          : 'reveal reveal-delay-1 mx-auto max-w-[440px] rounded-2xl border border-[--hairline-strong] bg-[--bg-elev] p-7 sm:p-9')
      }
      style={{ boxShadow: '0 0 80px rgba(59,155,255,0.05)' }}
    >
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-[--ink-faint]">
            {priceTagLabel(state)}
          </p>

          <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span
              className="font-bold leading-none text-ink"
              style={{ fontSize: 'clamp(44px, 11vw, 72px)' }}
            >
              {primaryPrice}
            </span>
            {anchorPrice ? (
              <span
                className="text-[--ink-faint] line-through"
                style={{ fontSize: 'clamp(20px, 5vw, 30px)' }}
              >
                {anchorPrice}
              </span>
            ) : null}
            {PRICING.period ? (
              <span
                className="text-[--ink-faint]"
                style={{ fontSize: 'clamp(20px, 5vw, 30px)' }}
              >
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
                <span>{renderFeature(f)}</span>
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
              {busy ? '处理中...' : buyButtonLabel}
            </button>
            {error ? (
              <p className="text-center text-xs text-red-400">{error}</p>
            ) : null}
          </form>

          <CouponSection
            state={state}
            open={couponOpen}
            input={couponInput}
            busy={couponBusy}
            error={couponError}
            onOpen={() => setCouponOpen(true)}
            onClose={() => {
              setCouponOpen(false);
              setCouponInput('');
              setCouponError(null);
            }}
            onChange={setCouponInput}
            onApply={onApplyCoupon}
            onClear={onClearCoupon}
          />

          <p className="mb-2 mt-4 text-center text-xs text-[--ink-muted]">
            软件授权 · 不含视频内容 · 无版权风险
          </p>
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
  );

  // Compact mode: just the card (CombinedPricing supplies the section
  // wrapper + heading + promo banner-equivalent affordance). The active
  // promo state is still respected — price/buyButtonLabel above bake it
  // in — so applying ?promo=XHS_EARLY in the URL still discounts the
  // buyout card inside the combined module. PromoBanner is intentionally
  // omitted in compact (the standalone /home view is what's URL-promo'd
  // historically; we keep the banner there).
  if (variant === 'compact') {
    return card;
  }

  return (
    <section
      ref={ref}
      id="pricing"
      className="bg-[--bg-soft] px-6 py-24 sm:px-10 sm:py-32 lg:px-16"
    >
      <div className="mx-auto max-w-[1200px]">
        <h2
          className="reveal mb-10 max-w-[900px] font-bold leading-[1.05] tracking-[-0.01em] text-ink"
          style={{ fontSize: 'clamp(30px, 6.5vw, 72px)' }}
        >
          一份授权,<span className="text-accent">3 台设备</span>
        </h2>

        <PromoBanner state={state} />

        {card}
      </div>
    </section>
  );
}

function priceTagLabel(state: PromoStatus): string {
  if (state.status === 'active_promotion') {
    return state.key === 'XHS_EARLY' ? '粉丝早鸟价' : '优惠价';
  }
  if (state.status === 'active_coupon') {
    return state.promotionKey === 'STUDENT' ? '学生认证价' : '优惠价';
  }
  return '授权方式';
}

function PromoBanner({ state }: { state: PromoStatus }) {
  if (state.status === 'active_promotion') {
    return (
      <div
        className="reveal mx-auto mb-6 flex max-w-[480px] flex-col items-center gap-2 rounded-2xl border border-accent/40 bg-accent/10 px-6 py-4 sm:flex-row sm:justify-between sm:gap-6"
        style={{ boxShadow: '0 0 40px rgba(59,155,255,0.18)' }}
      >
        <div className="flex items-center gap-2 text-accent">
          <Zap className="h-4 w-4" strokeWidth={2.5} />
          <span className="text-sm font-bold sm:text-base">
            粉丝早鸟价 {formatCny(state.finalPrice)}
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-xs text-[--ink-soft] sm:text-sm">
          {state.remaining != null && state.maxUses != null ? (
            <>
              <span>
                剩{' '}
                <span className="font-bold text-ink">{state.remaining}</span> /{' '}
                {state.maxUses} 名
              </span>
              {state.remainingMs != null ? (
                <span className="text-[--ink-faint]">·</span>
              ) : null}
            </>
          ) : null}
          {state.remainingMs != null ? (
            <span>还剩 {formatRemaining(state.remainingMs)}</span>
          ) : null}
        </div>
      </div>
    );
  }
  if (state.status === 'active_coupon') {
    return (
      <div
        className="reveal mx-auto mb-6 flex max-w-[440px] items-center justify-center gap-2 rounded-2xl border border-accent/40 bg-accent/10 px-6 py-3"
        style={{ boxShadow: '0 0 24px rgba(59,155,255,0.12)' }}
      >
        <GraduationCap className="h-4 w-4 text-accent" strokeWidth={2.5} />
        <span className="text-sm font-bold text-accent sm:text-base">
          {state.promotionKey === 'STUDENT' ? '学生认证价' : '专属优惠'}{' '}
          {formatCny(state.finalPrice)}
        </span>
      </div>
    );
  }
  // Show a soft note when a URL-based promo is no longer available
  // (sold-out, expired) OR a previously-applied coupon has since been
  // used. Stays gray + low-key — this is NOT an error the buyer caused,
  // just "you came via the early-bird link but the window closed".
  // Other error reasons (not_found / network / missing_code) stay
  // silent: they're either tampered URLs (don't help an attacker) or
  // transient network blips.
  if (state.status === 'error') {
    let label: string | null = null;
    if (state.reason === 'sold_out') label = '粉丝早鸟价名额已满';
    else if (state.reason === 'expired') label = '粉丝早鸟价已结束';
    else if (state.reason === 'used') label = '此优惠码已被使用';
    if (!label) return null;
    return (
      <div className="reveal mx-auto mb-6 flex max-w-[440px] items-center justify-center gap-2 rounded-2xl border border-[--hairline] bg-[--bg-elev] px-6 py-3">
        <Clock className="h-4 w-4 text-[--ink-muted]" strokeWidth={2} />
        <span className="text-sm text-[--ink-soft]">
          <span className="font-semibold">{label}</span>
          <span className="text-[--ink-muted]"> · 当前显示官网价</span>
        </span>
      </div>
    );
  }
  return null;
}

function CouponSection({
  state,
  open,
  input,
  busy,
  error,
  onOpen,
  onClose,
  onChange,
  onApply,
  onClear,
}: {
  state: PromoStatus;
  open: boolean;
  input: string;
  busy: boolean;
  error: string | null;
  onOpen: () => void;
  onClose: () => void;
  onChange: (s: string) => void;
  onApply: () => void;
  onClear: () => void;
}) {
  // Promotion key applied (URL-driven, e.g. XHS_EARLY). Show a friendly
  // label — the raw key is ugly and buyer-facing prose should match the
  // banner above ("粉丝早鸟价"). No code to expose either, so we just
  // confirm + give a [×] to undo.
  if (state.status === 'active_promotion') {
    return (
      <div className="mt-4 flex items-center justify-between rounded-lg border border-accent/30 bg-accent/5 px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm text-accent">
          <Zap className="h-4 w-4" strokeWidth={2.5} />
          <span className="font-semibold">已享受早鸟价</span>
        </div>
        <button
          type="button"
          onClick={onClear}
          aria-label="移除早鸟价"
          className="rounded text-[--ink-muted] hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }
  // Coupon code applied (student code, STU-XXXXXX). Buyer knows their
  // code — surface it for confirmation + give [×] to undo.
  if (state.status === 'active_coupon') {
    return (
      <div className="mt-4 flex items-center justify-between rounded-lg border border-accent/30 bg-accent/5 px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm text-accent">
          <GraduationCap className="h-4 w-4" strokeWidth={2.5} />
          <span className="font-mono font-semibold">{state.code}</span>
          <span className="text-[--ink-soft]">已应用</span>
        </div>
        <button
          type="button"
          onClick={onClear}
          aria-label="移除优惠码"
          className="rounded text-[--ink-muted] hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }
  // Collapsed: prominent bordered "我是学生 →" pill — full-width inside
  // the card so it doesn't read as an afterthought. Hover lights up the
  // accent so it telegraphs "this is interactive".
  if (!open) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[--hairline-strong] bg-bg/50 px-4 py-2.5 text-sm font-semibold text-[--ink-soft] transition-colors hover:border-accent/40 hover:text-accent"
      >
        <GraduationCap className="h-4 w-4" strokeWidth={2} />
        我是学生 →
      </button>
    );
  }
  // Expanded: full guidance panel — steps + 私信申请 button + divider +
  // input. Covers both first-time visitors (who need to know HOW to get
  // a code) and returning ones (who already have a STU-XXX in hand).
  return (
    <div className="mt-4 space-y-4 rounded-xl border border-[--hairline-strong] bg-bg/40 p-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <GraduationCap className="h-4 w-4 text-accent" strokeWidth={2.5} />
        <span className="text-sm font-semibold text-ink">
          学生认证价 <span className="text-accent">¥29.9</span>
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="收起"
          className="ml-auto rounded text-[--ink-muted] hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Steps */}
      <ol className="space-y-1.5 text-xs leading-relaxed text-[--ink-soft]">
        <li>
          <span className="text-[--ink-faint]">1.</span> 小红书私信我们,附上
          <a
            href="https://my.chsi.com.cn/archive/bab/xj/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline-offset-2 hover:underline"
          >
            学信网在线学籍验证码
          </a>
          {' '}+ 你的邮箱
        </li>
        <li>
          <span className="text-[--ink-faint]">2.</span> 核验后我们会回复一个 STU-XXXXXX 认证码
        </li>
        <li>
          <span className="text-[--ink-faint]">3.</span> 把认证码粘到下方,下单时自动应用
        </li>
      </ol>

      {/* Primary CTA for first-time students */}
      <a
        href={LINKS.supportXhs}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-4 py-2.5 text-sm font-semibold text-accent transition-colors hover:bg-accent/20"
      >
        → 私信小红书申请认证
      </a>

      {/* Divider — separates "first time" from "already have a code" */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[--hairline]" />
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[--ink-faint]">
          已有认证码
        </span>
        <div className="h-px flex-1 bg-[--hairline]" />
      </div>

      {/* Returning-student input */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="STU-XXXXXX"
            value={input}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onApply();
              }
            }}
            disabled={busy}
            className="block flex-1 rounded-lg border border-[--hairline-strong] bg-bg/50 px-3 py-2 font-mono text-sm text-ink placeholder:text-[--ink-faint] focus:border-accent focus:outline-none disabled:opacity-50"
          />
          <button
            type="button"
            onClick={onApply}
            disabled={busy || !input.trim()}
            className="rounded-lg border border-accent/40 bg-accent/10 px-4 text-sm font-semibold text-accent transition-colors hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? '校验中' : '应用'}
          </button>
        </div>
        {error ? <p className="text-xs text-red-400">{error}</p> : null}
      </div>
    </div>
  );
}
