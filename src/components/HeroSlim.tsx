'use client';

import Link from 'next/link';
import { Clock } from 'lucide-react';
import { AppleLogo, WindowsLogo } from '@/components/Icons';
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
          style={{ fontSize: 'clamp(48px, 13vw, 180px)' }}
        >
          hey,&nbsp;what
          <span className="text-ink">’</span>
          <span className="inline-block text-accent cursor-pointer transition-transform duration-300 ease-out [text-shadow:0_0_32px_var(--accent-glow)] hover:scale-125 hover:[text-shadow:0_0_24px_rgba(255,255,255,0.85),0_0_48px_rgba(255,255,255,0.4)]">
            Sub
          </span>
          ?
        </h1>

        <p className="reveal reveal-delay-1 mx-auto mb-4 max-w-[640px] text-[clamp(16px,2vw,22px)] leading-[1.55] text-[--ink-soft]">
          让一句字幕，慢慢成为你的英语
        </p>

        <p className="reveal reveal-delay-1 mx-auto mb-10 max-w-[560px] text-[clamp(13px,1.5vw,16px)] leading-[1.6] text-[--ink-muted]">
          桌面客户端 · 浏览器插件，一处划词收藏，多端同步复习
        </p>

        <div className="reveal reveal-delay-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/download/win"
            className="inline-flex h-12 items-center gap-2.5 rounded-lg bg-white px-7 text-sm font-semibold text-bg transition-transform hover:-translate-y-px"
          >
            <WindowsLogo className="h-[13px] w-[13px]" />
            Windows 下载
          </Link>
          <Link
            href="/download/mac"
            className="inline-flex h-12 items-center gap-2.5 rounded-lg border border-[--hairline-strong] bg-white/[0.04] px-7 text-sm font-semibold text-ink transition-transform hover:-translate-y-px"
          >
            <AppleLogo className="h-[22px] w-[22px]" />
            macOS 下载
          </Link>
        </div>

        <p className="reveal reveal-delay-3 mt-6 inline-flex items-center justify-center gap-2 text-sm text-[--ink-muted]">
          <Clock className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
          下载即享 24 小时免费试用 · 满意再付款
        </p>
      </div>
    </section>
  );
}
