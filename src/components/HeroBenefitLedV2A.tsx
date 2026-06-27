'use client';

import Link from 'next/link';
import { Clock } from 'lucide-react';
import { AppleLogo, WindowsLogo } from '@/components/Icons';
import { useReveal } from '@/hooks/useReveal';
import { SubtitleMockup } from '@/components/SubtitleMockup';

/**
 * Hero v2a — Apple-style stacked layout: same centered HeroBenefitLed
 * content on top, SubtitleMockup centered BELOW the trial badge.
 *
 * Lowest-risk of the 3 v2 layouts — doesn't change the existing copy
 * hierarchy at all, just adds a visual anchor underneath. The mockup
 * acts as "and here's what whatSub actually puts on your screen"
 * before the user scrolls into DemoDiagonal.
 */
export function HeroBenefitLedV2A() {
  const containerRef = useReveal<HTMLDivElement>();

  return (
    <section
      ref={containerRef}
      id="top"
      className="relative overflow-hidden px-6 pt-32 pb-24 sm:px-10 lg:px-16 lg:pt-44 lg:pb-32"
    >
      <div className="mx-auto max-w-[1100px] text-center">
        <h1
          className="reveal mx-auto mb-8 max-w-[960px] font-sans font-bold leading-[1.45] tracking-[-0.01em] text-ink"
          style={{ fontSize: 'clamp(19px, 2.5vw, 30px)' }}
        >
          <span className="block mb-5">
            你是否遇到过 —— 想把 YouTube、Bilibili 这些平台上的英语视频
            <span className="text-accent [text-shadow:0_0_24px_var(--accent-glow)]">
              下载下来逐句精读
            </span>
            ？
          </span>
          <span className="block">
            你是否有过 —— 想
            <span className="text-accent [text-shadow:0_0_24px_var(--accent-glow)]">
              构建一个属于自己的语料库
            </span>
            ，把视频和攒下的语料
            <span className="text-accent [text-shadow:0_0_24px_var(--accent-glow)]">
              云端同步
            </span>
            ，在桌面、浏览器、iOS 三端随时接着看，却没有一个工具能把这些事统一起来？
          </span>
        </h1>

        <p
          className="reveal reveal-delay-1 mx-auto mb-10 max-w-[820px] leading-[1.5]"
          style={{ fontSize: 'clamp(17px, 2vw, 22px)' }}
        >
          <span className="font-semibold text-ink">whatSub 把这件事做成了一个工具</span>
          <span className="font-medium text-[--ink-soft]">
            {' '}—— 多平台视频下载解析、AI 自动标出重点表达、云端同步桌面 / 浏览器 / iOS
          </span>
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

        <p className="reveal reveal-delay-3 mt-6 inline-flex items-center justify-center gap-2 text-[15px] text-[--ink-soft]">
          <Clock className="h-4 w-4 shrink-0 text-accent" strokeWidth={2.5} aria-hidden="true" />
          下载即享 24 小时
          <span className="font-bold text-accent [text-shadow:0_0_16px_var(--accent-glow)]">
            免费试用
          </span>
          · 满意再付款
        </p>
      </div>

      {/* SubtitleMockup as Apple-style centered visual anchor — sits a
          comfortable 16-24 below the trial badge, max-width snug to
          the card so it doesn't compete with the wider text block. */}
      <div className="reveal reveal-delay-3 mx-auto mt-16 sm:mt-20 lg:mt-24">
        <SubtitleMockup />
      </div>
    </section>
  );
}
