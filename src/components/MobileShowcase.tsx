'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Subtitles,
  Library,
  Share2,
  BookMarked,
  Monitor,
  Cloud,
  Smartphone,
  ChevronDown,
} from 'lucide-react';
import { AppleLogo } from '@/components/Icons';
import { useReveal } from '@/hooks/useReveal';
import { LINKS } from '@/lib/constants';
import { PlatformsDropdown } from './PlatformsDropdown';

// Hero / CTA buttons — App Store is now live (2026-06-10), so the
// primary slot is a real download link to apps.apple.com. The
// secondary button still links to the desktop / plugin pages as a
// cross-promo. Shape and sizing match the homepage and /plugin so a
// reader scanning across pages perceives one button language.
const BTN_PRIMARY =
  'inline-flex h-12 items-center gap-2.5 rounded-lg bg-white px-7 text-sm font-semibold text-bg transition-transform hover:-translate-y-px';
const BTN_SECONDARY =
  'inline-flex h-12 items-center gap-2.5 rounded-lg border border-[--hairline-strong] bg-white/[0.04] px-7 text-sm font-semibold text-ink transition-transform hover:-translate-y-px';

// Feature media: portrait phone box by default; landscape 16:9 box when
// `landscape` (e.g. the desktop↔phone sync clip is recorded landscape, so the
// portrait box would crop it badly). Renders the screen-recording when `video`
// is set, else a placeholder (mirrors PluginShowcase's <Media>).
function PhoneMedia({
  video,
  poster,
  label,
  landscape,
}: {
  video?: string;
  poster?: string;
  label: string;
  landscape?: boolean;
}) {
  // Soft blue glow + 1px white hairline — lifts the clip off the dark page and
  // makes the screen edge crisper. Brand accent (#3B9BFF) at low opacity.
  const halo =
    'shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_0_80px_-20px_rgba(59,155,255,0.35)]';
  const wrap = landscape
    ? `mx-auto w-full max-w-[480px] overflow-hidden rounded bg-[--bg-elev] ${halo}`
    : `mx-auto w-full max-w-[260px] overflow-hidden rounded bg-[--bg-elev] ${halo}`;
  const ratio = landscape ? '16 / 9' : '9 / 19';
  if (!video) {
    return (
      <div className={wrap} style={{ aspectRatio: ratio }}>
        <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
          <span className="font-mono text-[10px] tracking-[0.1em] text-[--ink-faint]">
            演示占位
          </span>
          <span className="text-sm text-[--ink-muted]">{label}</span>
        </div>
      </div>
    );
  }
  return (
    <div className={wrap} style={{ aspectRatio: ratio }}>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        src={video}
        poster={poster}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        className="block h-full w-full object-cover"
      />
    </div>
  );
}

interface Feature {
  Icon: typeof Subtitles;
  kicker: string;
  title: string;
  body: string;
  note?: string;
  mediaLabel: string;
  video?: string;
  poster?: string;
  landscape?: boolean;
}

// 4 parts: ① 导入 + 双语精读(合并) → ② 词汇本 → ③ 多端同步语料库 → ④ 云端同步视频. Drop each
// clip at the `video` path below (public/videos/m1.mp4 … m4.mp4); until then a placeholder shows.
const FEATURES: Feature[] = [
  {
    Icon: Share2,
    kicker: '任意平台导入 · 双语精读',
    title: '看到好视频，分享进来逐句读',
    body: '从 YouTube、Bilibili、Safari… 任意 app 把链接分享进 whatSub：能抓字幕的当场解析，没字幕或非 YouTube 的交给桌面端跑 yt-dlp + whisper 转写，成片免 VPN 同步回手机。然后逐句精读——英文在上、中文在下，AI 标重点词、当前句高亮、点句跳转，横屏全屏还支持画中画。',
    mediaLabel: '分享导入 → 逐句双语精读',
    video: '/videos/m1.mp4',
    poster: '/videos/m1.jpg',
  },
  {
    Icon: BookMarked,
    kicker: '词汇本 · 离线词典 + AI',
    title: '长按字幕，任意词收进词汇本',
    body: '精读时长按任意一段字幕，在弹出的收藏卡里挑词——不限 AI 高亮词，句中任意单词或短语都能加进这条视频的词汇本；离线英汉词典即点即查、带音标，想深挖再用你自己的 AI 一键翻译讲解。删视频时词汇还能迁移保留。',
    mediaLabel: '选词收藏 · 音标 + 离线释义 + AI',
    video: '/videos/m2.mp4',
    poster: '/videos/m2.jpg',
  },
  {
    Icon: Library,
    kicker: '多端同步 · 语料库',
    title: '一处划词，三端随身查',
    body: '语料库主要靠浏览器插件积累——在网页 / 视频里划词收藏，短语连同释义、例句出处一起进库。桌面端、手机端用同一账号登录即多端同步：手机上随时翻阅、按标签筛选，点 ▶ 跳回出处重听，再用单词卡（英→中、带音标发音）查漏补缺。',
    note: '划词收藏在浏览器插件里完成；手机端侧重随身查阅与复习。',
    mediaLabel: '插件划词 → 多端同步语料库',
    video: '/videos/m3.mp4',
    poster: '/videos/m3.jpg',
    landscape: true,   // new part3 recording is 1920×1080 (plugin/desktop view)
  },
  {
    Icon: Cloud,
    kicker: '云端同步 · 桌面 ↔ 手机',
    title: '一端同步上云，两端都能看',
    body: '桌面端把解析好的视频同步上云，手机用同一邮箱登录，云端 library 立刻出现——同一个视频不用再导第二遍，桌面、手机随处接着看，国内走自托管 CDN 免 VPN 秒开。',
    mediaLabel: '桌面同步上云 → 手机同账号即看',
    video: '/videos/m4.mp4',
    poster: '/videos/m4.jpg',
    landscape: true,
  },
];

const STEPS: { Icon: typeof Monitor; title: string; body: string }[] = [
  {
    Icon: Monitor,
    title: '桌面端解析并同步',
    body: '在桌面客户端解析好一个视频，点同步上云——只传字幕和元数据，不传视频文件。',
  },
  {
    Icon: Cloud,
    title: '手机用同一邮箱登录',
    body: '用同一个邮箱在 app 里登录，云端 library 和语料库立刻同步过来。',
  },
  {
    Icon: Smartphone,
    title: '随时随地看与复习',
    body: '通勤、睡前掏出手机就能跟读字幕、刷语料库；遇到新链接也能直接分享进来。',
  },
];

const SCENARIOS: { title: string; body: string }[] = [
  {
    title: '通勤路上',
    body: '地铁上掏出手机跟读一段双语字幕，免 VPN 不卡顿。',
  },
  {
    title: '睡前躺着',
    body: '横屏全屏看视频，重点词标黄，点一下就有释义。',
  },
  {
    title: '碎片时间',
    body: '排队时刷几条语料库短语，例句一点跳回原视频重听。',
  },
];

const FAQ: { q: string; a: string }[] = [
  {
    q: '在国内看视频要梯子吗？',
    a: '同步过的视频走我们自己的国内 CDN，免 VPN 秒开。少数没有自托管视频的条目会回退到 YouTube 内嵌，那种才需要梯子。',
  },
  {
    q: '要单独付费吗？',
    a: '不用。移动端是消费端，和桌面端共用同一个账号与授权——你在桌面端同步的内容，手机上同邮箱登录就能看。',
  },
  {
    q: '怎么和桌面端、插件打通？',
    a: '三端用同一个邮箱登录即可。桌面端解析并同步的视频、你在各端攒的语料库，都会自动出现在手机上。',
  },
  {
    q: '支持安卓吗？',
    a: '目前先做 iOS（iPhone / iPad，iOS 16+）。安卓在评估中。',
  },
  {
    q: '现在怎么获取？',
    a: '已在 App Store 上线（中国区，搜索「whatSub」或点页面顶部「App Store」按钮直达）。下载后用注册过桌面端的同一邮箱登录，云端 library 与语料库即刻同步。',
  },
];

const NAV_LINKS = [
  { id: 'features', label: '功能' },
  { id: 'how', label: '怎么用起来' },
  { id: 'faq', label: '常见问题' },
];

export function MobileShowcase() {
  const ref = useReveal<HTMLDivElement>();

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div ref={ref} className="text-ink">
      {/* ── page nav ── */}
      <nav
        className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06]"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(30px) saturate(180%)',
          WebkitBackdropFilter: 'blur(30px) saturate(180%)',
        }}
      >
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6 sm:px-10 lg:px-16">
          <Link href="/" className="flex items-center" aria-label="whatSub 首页">
            <img
              src="/whatsub-wordmark.png"
              alt="whatSub"
              className="block h-9 w-auto mix-blend-screen"
            />
          </Link>
          <div className="flex items-center gap-7">
            <ul className="hidden items-center gap-7 text-sm text-[--ink-soft] md:flex">
              {NAV_LINKS.map((l) => (
                <li key={l.id}>
                  <button
                    onClick={() => scrollTo(l.id)}
                    className="transition-colors duration-300 hover:text-ink"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
              <li>
                <PlatformsDropdown />
              </li>
            </ul>
            <a
              href={LINKS.iosAppStore}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
              style={{ boxShadow: '0 0 0 1px rgba(59,155,255,0.4), 0 0 24px var(--accent-glow)' }}
            >
              <AppleLogo className="h-4 w-4" />
              App Store
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero (signature kept identical to the homepage; mobile-specific copy) ── */}
      <section className="relative overflow-hidden px-6 pt-32 pb-20 sm:px-10 lg:px-16 lg:pt-44 lg:pb-28">
        <div className="mx-auto max-w-[1100px] text-center">
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

          <p className="reveal reveal-delay-1 mx-auto mb-10 max-w-[620px] text-[clamp(13px,1.5vw,16px)] leading-[1.6] text-[--ink-muted]">
            移动端版 · 桌面端解析的视频和语料库随身看、随身复习，国内免 VPN 秒开
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

          <p className="reveal reveal-delay-3 mx-auto mt-6 max-w-[520px] text-xs text-[--ink-faint]">
            同一邮箱登录桌面 / 浏览器插件 / iOS 三端,语料库和云端视频自动同步。
          </p>
        </div>
      </section>

      {/* ── Feature rows (alternating) — each part is a screen-recording clip ── */}
      <section id="features" className="scroll-mt-20 px-6 py-10 sm:px-10 lg:px-16">
        <div className="mx-auto flex max-w-[1100px] flex-col gap-20 sm:gap-28">
          {FEATURES.map((f, i) => {
            const flip = i % 2 === 1;
            return (
              <div
                key={f.title}
                className={`reveal flex flex-col gap-8 lg:items-center lg:gap-14 ${
                  flip ? 'lg:flex-row-reverse' : 'lg:flex-row'
                }`}
              >
                <div className="flex-1">
                  <div className="mb-3 inline-flex items-center gap-2 text-xs font-medium text-[--ink-muted]">
                    <f.Icon className="h-4 w-4 text-[--ink-soft]" strokeWidth={1.75} />
                    {f.kicker}
                  </div>
                  <h3 className="mb-4 font-sans text-2xl font-medium text-ink sm:text-3xl lg:text-4xl">
                    {f.title}
                  </h3>
                  <p className="max-w-[480px] text-[15px] leading-[1.7] text-[--ink-soft]">
                    {f.body}
                  </p>
                  {f.note && (
                    <p className="mt-3 max-w-[480px] text-[13px] leading-[1.6] text-[--ink-muted]">
                      {f.note}
                    </p>
                  )}
                </div>
                <div className="flex-1">
                  <PhoneMedia video={f.video} poster={f.poster} label={f.mediaLabel} landscape={f.landscape} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── How it works (consume-side: desktop → cloud → phone) ── */}
      <section id="how" className="scroll-mt-20 px-6 py-24 sm:px-10 sm:py-32 lg:px-16">
        <div className="mx-auto max-w-[1100px]">
          <h2 className="reveal mb-3 text-center font-sans text-3xl font-medium sm:text-4xl">
            怎么用起来
          </h2>
          <p className="reveal reveal-delay-1 mx-auto mb-14 max-w-[520px] text-center text-sm text-[--ink-muted]">
            移动端是消费端：桌面端解析，手机上随时看。
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <div
                key={s.title}
                className={`reveal reveal-delay-${i + 1} flex flex-col rounded bg-[--bg-elev] p-6 sm:p-7`}
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded bg-white/[0.05]">
                    <s.Icon className="h-4 w-4 text-[--ink-soft]" strokeWidth={1.75} />
                  </div>
                  <div className="text-sm font-medium text-[--ink-muted]">第 {i + 1} 步</div>
                </div>
                <h3 className="mb-2 text-lg font-medium text-ink">{s.title}</h3>
                <p className="text-sm leading-relaxed text-[--ink-muted]">{s.body}</p>
              </div>
            ))}
          </div>
          <p className="reveal mx-auto mt-8 max-w-[560px] text-center text-sm leading-relaxed text-[--ink-muted]">
            三端共享同一个云端语料库，串成一个闭环 ——{' '}
            <Link href="/platforms" className="text-ink underline-offset-4 transition-colors duration-300 hover:text-accent">
              看它们如何协作
            </Link>
            。
          </p>
        </div>
      </section>

      {/* ── Scenarios ── */}
      <section className="px-6 pb-24 sm:px-10 sm:pb-32 lg:px-16">
        <div className="mx-auto max-w-[1100px]">
          <h2 className="reveal mb-12 text-center font-sans text-3xl font-medium sm:text-4xl">
            你会这样用它
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {SCENARIOS.map((s, i) => (
              <div
                key={s.title}
                className={`reveal reveal-delay-${i + 1} rounded bg-[--bg-elev] p-7`}
              >
                <h3 className="mb-2 text-lg font-medium text-ink">{s.title}</h3>
                <p className="text-sm leading-relaxed text-[--ink-muted]">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ (accordion) ── */}
      <section id="faq" className="scroll-mt-20 px-6 pb-24 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-[820px]">
          <h2 className="reveal mb-10 text-center font-sans text-3xl font-medium sm:text-4xl">
            常见问题
          </h2>
          <div className="reveal divide-y divide-[--hairline] overflow-hidden rounded bg-[--bg-elev]">
            {FAQ.map((item) => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="border-t border-[--hairline] px-6 py-24 text-center sm:px-10 lg:px-16">
        <div className="mx-auto max-w-[700px]">
          <h2 className="reveal mb-5 font-sans text-3xl font-medium sm:text-4xl">
            随身的那一块屏幕，也交给 whatSub
          </h2>
          <p className="reveal reveal-delay-1 mx-auto mb-9 max-w-[480px] text-[--ink-soft]">
            同一个邮箱在桌面 / 浏览器插件 / iOS 三端登录，云端视频和语料库自动同步——通勤、睡前、排队的碎片时间也能接着学。
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
            <Link href="/plugin" className={BTN_SECONDARY}>
              了解浏览器插件
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors duration-300 hover:bg-white/[0.03]"
        aria-expanded={open}
      >
        <span className="text-[15px] font-medium text-ink">{q}</span>
        <ChevronDown
          className="h-4 w-4 shrink-0 text-[--ink-muted] transition-transform"
          style={{ transform: open ? 'rotate(180deg)' : 'none' }}
          strokeWidth={2}
        />
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm leading-relaxed text-[--ink-muted]">{a}</div>
      )}
    </div>
  );
}
