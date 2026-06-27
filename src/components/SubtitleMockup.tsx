'use client';

import { useEffect, useState } from 'react';

/**
 * App-screenshot carousel mockup (iteration 6 — 2026-06-27).
 *
 * 7 real macOS-client screenshots; each paired with a Caveat
 * handwritten label that crossfades together with the image.
 *
 * Label position: all labels at top-center of the outer card, no
 * leading arrow, no rotation — rendered above all other layers via a
 * dedicated wrapper with z-30, so the label is never occluded by the
 * Mac window's shadow / accent halos / sparkles.
 *
 * Other behavior unchanged: 3.5s auto-rotate, 700ms crossfade, hover
 * pauses, dots indicator clickable for manual nav.
 */

interface Slide {
  src: string;
  /** Caveat handwritten text shown at top-center of the card */
  label: string;
  /** Full sentence for accessibility (alt + dot aria-label) */
  alt: string;
}

const SCREENSHOTS: Slide[] = [
  {
    src: '/screenshots/app/screen-1.jpg',
    label: '一键下载多平台视频',
    alt: '通过 URL 一键下载多平台视频并自动解析,还可画中画观看',
  },
  {
    src: '/screenshots/app/screen-2.jpg',
    label: 'AI 精讲视频内容',
    alt: 'AI 精讲下载的视频,吃透所有内容、连读、短语用法',
  },
  {
    src: '/screenshots/app/screen-3.jpg',
    label: '划词进自己的词汇本',
    alt: '划词收藏到自己的词汇本',
  },
  {
    src: '/screenshots/app/screen-4.jpg',
    label: '云端语料库 多端同步',
    alt: '云同步语料库,多端可看,还有公共语料',
  },
  {
    src: '/screenshots/app/screen-5.jpg',
    label: '角色扮演练对话',
    alt: '角色扮演,替换视频中的人物与 AI 进行对话练习',
  },
  {
    src: '/screenshots/app/screen-6.jpg',
    label: 'AI 助手自动调工具',
    alt: 'AI 助手可以自动调用工具,如搜索 YouTube 视频并下载',
  },
  {
    src: '/screenshots/app/screen-7.jpg',
    label: '内置工具 一句话总结',
    alt: '内置大量工具,让 AI 辅助用户执行更多操作,如总结视频内容、上网搜索视频',
  },
];

const ROTATE_MS = 3500;
const FADE_MS = 700;

export function SubtitleMockup() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % SCREENSHOTS.length);
    }, ROTATE_MS);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <div className="relative mx-auto w-full max-w-[860px]">
      {/* Outer dark gradient card */}
      <div
        className="relative overflow-hidden rounded-3xl px-6 py-10 sm:px-10 sm:py-14"
        style={{
          background:
            'linear-gradient(135deg, #0e1422 0%, #141a2e 45%, #0a1230 100%)',
          boxShadow:
            '0 40px 120px -20px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.06)',
        }}
      >
        {/* Accent-blue glow halo top-right */}
        <div
          aria-hidden="true"
          className="absolute -right-28 -top-28 h-80 w-80 rounded-full bg-accent/25 blur-3xl"
        />
        {/* Amber glow halo bottom-left */}
        <div
          aria-hidden="true"
          className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-amber-400/12 blur-3xl"
        />

        {/* Mac window */}
        <div
          className="relative mx-auto mt-6 max-w-[680px] overflow-hidden rounded-xl sm:-rotate-[1deg]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          style={{
            boxShadow:
              '0 25px 70px -10px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08)',
          }}
        >
          {/* Title bar — dark macOS-style */}
          <div className="flex items-center gap-1.5 border-b border-white/[0.06] bg-[#1c1c1e] px-4 py-2.5">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
            <span className="ml-3 flex-1 text-center font-mono text-[11px] text-white/40">
              whatSub
            </span>
          </div>

          {/* Screenshot carousel */}
          <div className="relative aspect-video bg-[--bg]">
            {SCREENSHOTS.map((s, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={s.src}
                src={s.src}
                alt={s.alt}
                loading={i === 0 ? 'eager' : 'lazy'}
                className="absolute inset-0 h-full w-full object-cover"
                style={{
                  opacity: i === idx ? 1 : 0,
                  transition: `opacity ${FADE_MS}ms ease-in-out`,
                }}
              />
            ))}
          </div>

          {/* Dots indicator + manual nav */}
          <div className="flex items-center justify-center gap-1.5 border-t border-white/[0.06] bg-[#1c1c1e] py-3">
            {SCREENSHOTS.map((s, i) => (
              <button
                key={s.src}
                type="button"
                onClick={() => setIdx(i)}
                aria-label={`显示截图 ${i + 1}: ${s.label}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === idx
                    ? 'w-7 bg-accent'
                    : 'w-1.5 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Caveat handwritten labels — all stacked at TOP CENTER of the
            card, on the highest layer (z-30) so they're never occluded
            by the Mac window's shadow / accent halos. The Mac window
            renders BEFORE this block so DOM order also keeps labels on
            top regardless of z-index quirks. */}
        <div className="pointer-events-none absolute inset-x-0 top-4 z-30 flex justify-center sm:top-6">
          <div className="relative h-[40px] sm:h-[48px]">
            {SCREENSHOTS.map((s, i) => (
              <div
                key={`label-${s.src}`}
                aria-hidden="true"
                className="absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap font-display text-2xl font-bold text-accent sm:text-3xl"
                style={{
                  opacity: i === idx ? 1 : 0,
                  transition: `opacity ${FADE_MS}ms ease-in-out`,
                  textShadow: '0 2px 16px rgba(59,155,255,0.45)',
                }}
              >
                {s.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
