'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  PlayCircle,
  Subtitles,
  Library,
  Share2,
  Monitor,
  Cloud,
  Smartphone,
  ChevronDown,
} from 'lucide-react';
import { AppleLogo } from '@/components/Icons';
import { useReveal } from '@/hooks/useReveal';
import { PlatformsDropdown } from './PlatformsDropdown';

// Secondary button kept consistent with the homepage / plugin buttons. There
// is no public download yet (App Store pending), so the hero leads with a
// status pill instead of a primary download CTA.
const BTN_SECONDARY =
  'inline-flex h-12 items-center gap-2.5 rounded-lg border border-[--hairline-strong] bg-white/[0.04] px-7 text-sm font-semibold text-ink transition-transform hover:-translate-y-px';

// Portrait phone placeholder — swap for a real screenshot/clip later without
// touching layout. No gradient (Tesla-minimal); the real asset carries weight.
function PhoneMedia({ label }: { label: string }) {
  return (
    <div
      className="mx-auto w-full max-w-[260px] overflow-hidden rounded bg-[--bg-elev]"
      style={{ aspectRatio: '9 / 19' }}
    >
      <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
        <span className="font-mono text-[10px] tracking-[0.1em] text-[--ink-faint]">
          演示占位
        </span>
        <span className="text-sm text-[--ink-muted]">{label}</span>
      </div>
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
}

const FEATURES: Feature[] = [
  {
    Icon: PlayCircle,
    kicker: '自托管视频 · 免 VPN',
    title: '不用梯子，也能秒开',
    body: '同步过的视频走我们自己的国内 CDN，原生播放器秒开、随意拖动进度；横屏自动全屏，视频上叠中英双语字幕，一键开关 CC。',
    note: '少数没有自托管视频的条目，会自动回退到 YouTube 内嵌播放。',
    mediaLabel: '横屏全屏播放 + 视频上双语字幕',
  },
  {
    Icon: Subtitles,
    kicker: '双语字幕跟读',
    title: '一句一句，跟着读',
    body: '英文在上、中文在下，AI 把重点词标黄。字幕跟随播放自动滚动、当前句高亮；点黄词弹出释义和音标，想深究再跳到短语详情。',
    mediaLabel: '字幕跟读 · 当前句高亮',
  },
  {
    Icon: Library,
    kicker: '语料库随身查',
    title: '攒下的词，躺着也能复习',
    body: '公共 + 个人语料库随身翻，按标签多选筛选。每条短语都带例句出处，点 ▶ 直接跳回视频那一秒重听。',
    mediaLabel: '语料库 · 标签筛选 + 例句秒跳',
  },
  {
    Icon: Share2,
    kicker: '分享 / 链接导入',
    title: '看到好视频，分享给它',
    body: '从 YouTube、Safari 直接分享链接进 whatSub。能抓字幕的当场解析；没字幕或非 YouTube 的链接，自动推回桌面跑流水线，成片再同步回手机——免 VPN 看。',
    mediaLabel: '分享导入 · 导入队列状态',
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
    a: 'App Store 即将上线。上线前可以先用桌面客户端 + 浏览器插件，数据都会同步，等 app 上架后无缝衔接。',
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
    <div ref={ref} className="bg-bg text-ink">
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
            <span className="inline-flex h-9 items-center gap-2 rounded-lg bg-white/[0.06] px-4 text-sm font-medium text-[--ink-soft]">
              <AppleLogo className="h-4 w-4" />
              即将上线
            </span>
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
            <span className="inline-flex h-12 items-center gap-2.5 rounded-lg bg-white/[0.06] px-7 text-sm font-medium text-[--ink-soft]">
              <AppleLogo className="h-[18px] w-[18px]" />
              App Store 即将上线
            </span>
            <Link href="/" className={BTN_SECONDARY}>
              先用桌面客户端
            </Link>
          </div>

          <p className="reveal reveal-delay-3 mx-auto mt-6 max-w-[520px] text-xs text-[--ink-faint]">
            上线前可先用桌面客户端 + 浏览器插件，数据互通，app 上架后无缝衔接。
          </p>
        </div>
      </section>

      {/* ── Feature rows (alternating) ── */}
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
                  <PhoneMedia label={f.mediaLabel} />
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
            iOS app 即将上线 App Store。现在先用桌面客户端 + 浏览器插件攒内容，上架后同邮箱登录即可同步。
          </p>
          <div className="reveal reveal-delay-2 flex flex-wrap items-center justify-center gap-3">
            <span className="inline-flex h-12 items-center gap-2.5 rounded-lg bg-white/[0.06] px-7 text-sm font-medium text-[--ink-soft]">
              <AppleLogo className="h-[18px] w-[18px]" />
              App Store 即将上线
            </span>
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
