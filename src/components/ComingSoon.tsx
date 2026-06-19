'use client';

import { Smartphone } from 'lucide-react';
import { AppleLogo } from '@/components/Icons';
import { useReveal } from '@/hooks/useReveal';

// iPhone & iPad shipped 2026-06-10 (App Store live, see
// LINKS.iosAppStore) — removed from this "coming soon" list so the
// teaser only carries items that are still genuinely pending.
const PLATFORMS = [
  { label: 'Mac App Store', sub: 'macOS', Icon: AppleLogo },
  { label: 'Android', sub: 'Google Play', Icon: Smartphone },
] as const;

// Coming-soon teaser at the bottom of the page. Visually quieter than
// Download / Pricing so it doesn't compete for attention — smaller title
// (clamp 32-56 instead of the section-standard 40-72), softer card
// styling, no CTA. Sits on bg-soft to break up FAQ's bg-bg above it.
export function ComingSoon() {
  const ref = useReveal<HTMLElement>();

  return (
    <section
      ref={ref}
      id="roadmap"
      className="bg-[--bg-soft] px-6 py-20 sm:px-10 sm:py-28 lg:px-16"
    >
      <div className="mx-auto max-w-[1000px] text-center">
        <h2
          className="reveal mb-14 font-bold leading-[1.05] tracking-[-0.01em] text-ink"
          style={{ fontSize: 'clamp(32px, 5vw, 56px)' }}
        >
          未来将支持更多平台 · <span className="text-accent">Coming soon</span>
        </h2>

        <div className="mx-auto grid max-w-[640px] grid-cols-1 gap-4 sm:grid-cols-2">
          {PLATFORMS.map((p, i) => (
            <div
              key={p.label}
              className={`reveal reveal-delay-${i + 1} flex flex-col items-center justify-center rounded-xl border border-[--hairline] bg-[--bg-elev] px-6 py-10`}
            >
              <p.Icon className="mb-5 h-7 w-7 text-[--ink-soft]" />
              <p className="mb-1.5 text-lg font-semibold text-ink">{p.label}</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[--ink-faint]">
                {p.sub}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
