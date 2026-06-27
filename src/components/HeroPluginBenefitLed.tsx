'use client';

import { Download as DownloadIcon, Sparkles } from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';
import { LINKS } from '@/lib/constants';

/**
 * Benefit-led Hero for /plugin/v1 — scenario questions targeting the
 * browser-extension audience (someone who learns English while watching
 * YouTube and browsing English sites).
 *
 * Plugin's actual capability stack (from PluginShowcase FEATURES +
 * SETUP_STEPS):
 *   ① YouTube 整片双语字幕 — default uses Microsoft 免费翻译, no setup
 *   ② AI 重点标黄 + 悬停释义 + AI 重译 — user-configured LLM key
 *   ③ 任意网页划词收藏 — long-press → 收藏卡 with context
 *   ④ 三端同步语料库 — corpus syncs to cloud; desktop + iOS read same
 *
 * Hero structure:
 *   Q1 — pain: while刷 YouTube, wanting bilingual subs + wanting to
 *        save 地道表达 with one click
 *   Q2 — pain: wanting the saved words to form a personal corpus that
 *        syncs across desktop / mobile, but no tool ties it together
 *   Answer — names the product trio (双语字幕 / 划词收藏 / 多端同步)
 *   Free signal — 完全免费 in accent, since plugin has no paid model
 *
 * Brand Caveat signature removed. Bound by /plugin/v1 only — original
 * /plugin keeps the inline default Hero in PluginShowcase.
 */
export function HeroPluginBenefitLed() {
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
            你是否遇到过 —— 刷 YouTube 学英语时，希望有
            <span className="text-accent [text-shadow:0_0_24px_var(--accent-glow)]">
              实时双语字幕
            </span>
            ，看到地道表达想
            <span className="text-accent [text-shadow:0_0_24px_var(--accent-glow)]">
              一键划词收下来
            </span>
            ？
          </span>
          <span className="block">
            你是否有过 —— 想把划下来的词攒成
            <span className="text-accent [text-shadow:0_0_24px_var(--accent-glow)]">
              属于自己的语料库
            </span>
            ，在桌面、手机随时
            <span className="text-accent [text-shadow:0_0_24px_var(--accent-glow)]">
              接着翻阅复习
            </span>
            ，却没有一个工具能把这些事统一起来？
          </span>
        </h1>

        <p
          className="reveal reveal-delay-1 mx-auto mb-10 max-w-[820px] leading-[1.5]"
          style={{ fontSize: 'clamp(17px, 2vw, 22px)' }}
        >
          <span className="font-semibold text-ink">
            whatSub 浏览器插件把这件事做成了一个工具
          </span>
          <span className="font-medium text-[--ink-soft]">
            {' '}—— YouTube 整片双语字幕、AI 重点标黄、任意网页划词收藏、多端同步语料库
          </span>
        </p>

        <div className="reveal reveal-delay-2 flex flex-wrap items-center justify-center gap-3">
          <a
            href={LINKS.edgeAddonStore}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center gap-2.5 rounded-lg bg-white px-7 text-sm font-semibold text-bg transition-transform hover:-translate-y-px"
          >
            <DownloadIcon className="h-4 w-4" strokeWidth={2} />
            Edge 加载项
          </a>
          <a
            href={LINKS.chromeAddonStore}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center gap-2.5 rounded-lg border border-[--hairline-strong] bg-white/[0.04] px-7 text-sm font-semibold text-ink transition-transform hover:-translate-y-px"
          >
            <DownloadIcon className="h-4 w-4" strokeWidth={2} />
            Chrome 应用商店
          </a>
        </div>

        {/* Free signal — plugin is fully free, no trial. Sparkles +
            accent highlight on 完全免费 echoes the homepage trial badge
            treatment so the visual language stays consistent. */}
        <p className="reveal reveal-delay-3 mt-6 inline-flex items-center justify-center gap-2 text-[15px] text-[--ink-soft]">
          <Sparkles className="h-4 w-4 shrink-0 text-accent" strokeWidth={2.5} aria-hidden="true" />
          商店一键添加 ·
          <span className="font-bold text-accent [text-shadow:0_0_16px_var(--accent-glow)]">
            完全免费
          </span>
          · 浏览器自动更新
        </p>
      </div>
    </section>
  );
}
