'use client';

import { useReveal } from '@/hooks/useReveal';

/**
 * Brand sign-off — Caveat "hey, what'Sub?" signature mounted at the
 * bottom of each v1 page (between the last content section and the
 * Footer). Was the Hero on every page before 2026-06-26; demoted here
 * so each page LEADS with pain/value, and only sees the playful
 * brand wordmark after the pitch.
 *
 * Identical typography to the old Hero signature (font-display Caveat,
 * clamp(48px, 13vw, 180px), Sub in accent blue with glow + hover scale)
 * so the brand asset itself is unchanged — only its position in the
 * page flow moves. The hover-scale interaction is intentionally kept
 * since the playful tactile feel is part of the brand identity.
 *
 * Used by /v1, /plugin/v1, /mobile/v1. Each page wraps it in its own
 * route file so the original /, /plugin, /mobile (still Hero-led) are
 * untouched.
 */
export function BrandSignOff() {
  const ref = useReveal<HTMLElement>();

  return (
    <section
      ref={ref}
      aria-label="brand sign-off"
      className="relative overflow-hidden border-t border-[--hairline] px-6 py-28 sm:px-10 sm:py-36 lg:px-16 lg:py-44"
    >
      <div className="mx-auto max-w-[1200px] text-center">
        <h2
          className="reveal font-display font-bold leading-none tracking-[-0.01em] text-ink"
          style={{ fontSize: 'clamp(48px, 13vw, 180px)' }}
        >
          hey,&nbsp;what
          <span className="text-ink">’</span>
          <span className="inline-block text-accent cursor-pointer transition-transform duration-300 ease-out [text-shadow:0_0_32px_var(--accent-glow)] hover:scale-125 hover:[text-shadow:0_0_24px_rgba(255,255,255,0.85),0_0_48px_rgba(255,255,255,0.4)]">
            Sub
          </span>
          ?
        </h2>
      </div>
    </section>
  );
}
