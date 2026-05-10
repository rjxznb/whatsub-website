'use client';

import Link from 'next/link';
import { useReveal } from '@/hooks/useReveal';

export function HeroSlim() {
  const containerRef = useReveal<HTMLDivElement>();

  return (
    <section
      ref={containerRef}
      id="top"
      className="relative overflow-hidden px-6 pt-32 pb-24 sm:px-10 lg:px-16 lg:pt-48 lg:pb-32"
    >
      <div className="mx-auto max-w-[1200px] text-center">
        <h1
          className="reveal mb-12 font-display font-bold leading-none tracking-[-0.01em] text-ink"
          style={{ fontSize: 'clamp(64px, 12vw, 130px)' }}
        >
          hey,&nbsp;what
          <span className="text-ink">’</span>
          <span className="inline-block text-accent cursor-pointer transition-transform duration-300 ease-out [text-shadow:0_0_32px_var(--accent-glow)] hover:scale-125 hover:[text-shadow:0_0_24px_rgba(255,255,255,0.85),0_0_48px_rgba(255,255,255,0.4)]">
            Sub
          </span>
          ?
        </h1>

        <p className="reveal reveal-delay-1 mx-auto mb-10 max-w-[640px] text-[clamp(16px,2vw,22px)] leading-[1.55] text-[--ink-soft]">
          让一句字幕，慢慢成为你的英语
        </p>

        <div className="reveal reveal-delay-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/download/win"
            className="inline-flex h-12 items-center gap-2 rounded-lg bg-white px-7 text-sm font-semibold text-bg transition-transform hover:-translate-y-px"
          >
            <span aria-hidden="true">⬇</span> Windows 下载
          </Link>
          <Link
            href="/download/mac"
            className="inline-flex h-12 items-center gap-2 rounded-lg border border-[--hairline-strong] bg-white/[0.04] px-7 text-sm font-semibold text-ink transition-transform hover:-translate-y-px"
          >
            <span aria-hidden="true">⬇</span> macOS 下载
          </Link>
        </div>
      </div>
    </section>
  );
}
