'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { AppleLogo } from '@/components/Icons';
import { useReveal } from '@/hooks/useReveal';
import { LINKS } from '@/lib/constants';

const BTN_PRIMARY =
  'inline-flex h-12 items-center gap-2.5 rounded-lg bg-white px-7 text-sm font-semibold text-bg transition-transform hover:-translate-y-px';
const BTN_SECONDARY =
  'inline-flex h-12 items-center gap-2.5 rounded-lg border border-[--hairline-strong] bg-white/[0.04] px-7 text-sm font-semibold text-ink transition-transform hover:-translate-y-px';

/**
 * Benefit-led Hero for /mobile/v1 — scenario questions targeting the
 * mobile audience (someone who刷s YouTube on their phone AND wants
 * the desktop's parsed library to follow them around).
 *
 * Mobile's actual capability stack (from MobileShowcase FEATURES +
 * client/CLAUDE.md):
 *   ① 手机端直接解析 YouTube — share-extension: share URL into
 *      whatSub → if captions exist (most YouTube), pull them + run
 *      the LLM analysis on-device; if not, queue to desktop. Needs
 *      VPN to access YouTube itself but the parse runs on the phone
 *   ② 桌面端解析的视频随身看 — `library_sync_to_cloud` pushed 720p mp4
 *      to OSS; iOS reads via auth_from_license session, 国内免 VPN
 *   ③ 词汇本 + 离线英汉词典(125k entries IPA)+ AI 释义 — 长按字幕
 *      → 收藏卡里挑词, 离线 IPA + meaning
 *   ④ 多端同步语料库 — 1000-entry Pro cap, timestamps back to video
 *
 * Hero structure (iter 2 — user feedback: don't frame mobile as a
 * desktop-dependent consumer; mobile can parse directly while刷ing
 * YouTube on the go):
 *   Q1 — pain: while通勤 / 躺床上刷 YouTube,wanting to parse the video
 *        directly on the phone OR pick up something the desktop already
 *        parsed
 *   Q2 — pain: wanting to review the corpus during fragment time,
 *        synced across desktop/plugin/iOS
 *   Answer — names the product trio (手机端一键解析 / 桌面端同步随身
 *           看 / 跨端同账号同步)
 *   Free signal — App Store 免费下载 in accent
 *
 * Brand Caveat signature removed. Bound by /mobile/v1 only — original
 * /mobile keeps the inline default Hero in MobileShowcase.
 */
export function HeroMobileBenefitLed() {
  const containerRef = useReveal<HTMLDivElement>();

  return (
    <section
      ref={containerRef}
      id="top"
      className="relative overflow-hidden px-6 pt-32 pb-20 sm:px-10 lg:px-16 lg:pt-44 lg:pb-28"
    >
      <div className="mx-auto max-w-[1100px] text-center">
        <h1
          className="reveal mx-auto mb-8 max-w-[960px] font-sans font-bold leading-[1.45] tracking-[-0.01em] text-ink"
          style={{ fontSize: 'clamp(19px, 2.5vw, 30px)' }}
        >
          <span className="block mb-5">
            你是否遇到过 —— 通勤、躺在床上刷 YouTube 时，想
            <span className="text-accent [text-shadow:0_0_24px_var(--accent-glow)]">
              手机上一键解析这段视频精读
            </span>
            ，或者把
            <span className="text-accent [text-shadow:0_0_24px_var(--accent-glow)]">
              桌面端学过的视频接着复习
            </span>
            ？
          </span>
          <span className="block">
            你是否有过 —— 想把
            <span className="text-accent [text-shadow:0_0_24px_var(--accent-glow)]">
              属于自己的语料库
            </span>
            随身带着，在地铁、排队的碎片时间
            <span className="text-accent [text-shadow:0_0_24px_var(--accent-glow)]">
              接着复习
            </span>
            ，却没有一个能跟桌面、插件同步互通的工具？
          </span>
        </h1>

        <p
          className="reveal reveal-delay-1 mx-auto mb-10 max-w-[820px] leading-[1.5]"
          style={{ fontSize: 'clamp(17px, 2vw, 22px)' }}
        >
          <span className="font-semibold text-ink">
            whatSub iOS 把这件事做成了一个工具
          </span>
          <span className="font-medium text-[--ink-soft]">
            {' '}—— 手机端一键解析 YouTube 视频、桌面端同步的视频国内免 VPN 随身看、语料库跨端同账号同步
          </span>
        </p>

        <div className="reveal reveal-delay-2 flex flex-wrap items-center justify-center gap-3">
          <a
            href={LINKS.iosAppStore}
            target="_blank"
            rel="noopener noreferrer"
            className={BTN_PRIMARY}
          >
            <AppleLogo className="h-[18px] w-[18px]" />
            App Store 下载
          </a>
          <Link href="/" className={BTN_SECONDARY}>
            看桌面客户端
          </Link>
        </div>

        {/* Free signal — iOS app is free to install, in-app purchase
            for Pro tier. Sparkles + accent highlight on 免费下载 echoes
            the homepage trial badge treatment for visual consistency. */}
        <p className="reveal reveal-delay-3 mt-6 inline-flex items-center justify-center gap-2 text-[15px] text-[--ink-soft]">
          <Sparkles className="h-4 w-4 shrink-0 text-accent" strokeWidth={2.5} aria-hidden="true" />
          App Store
          <span className="font-bold text-accent [text-shadow:0_0_16px_var(--accent-glow)]">
            免费下载
          </span>
          · 同邮箱即开即用
        </p>
      </div>
    </section>
  );
}
