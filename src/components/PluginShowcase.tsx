'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Subtitles,
  MousePointerClick,
  Library,
  Download as DownloadIcon,
  ChevronDown,
  KeyRound,
} from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';
import { PlatformsDropdown } from './PlatformsDropdown';

const PLUGIN_DOWNLOAD = '/download/plugin';

// Hero / CTA buttons — kept identical to the homepage (HeroSlim) buttons so
// both pages share one button component: white primary + outlined secondary.
const BTN_PRIMARY =
  'inline-flex h-12 items-center gap-2.5 rounded-lg bg-white px-7 text-sm font-semibold text-bg transition-transform hover:-translate-y-px';
const BTN_SECONDARY =
  'inline-flex h-12 items-center gap-2.5 rounded-lg border border-[--hairline-strong] bg-white/[0.04] px-7 text-sm font-semibold text-ink transition-transform hover:-translate-y-px';

// Flat placeholder standing in for real screenshots/GIFs until they're
// recorded; swap <MediaPlaceholder> for a <video>/<img> later. No gradient —
// once real imagery lands it carries the visual weight (Tesla-style).
function MediaPlaceholder({
  label,
  aspect = '16 / 10',
}: {
  label: string;
  aspect?: string;
}) {
  return (
    <div
      className="relative w-full overflow-hidden rounded bg-[--bg-elev]"
      style={{ aspectRatio: aspect }}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
        <span className="font-mono text-[10px] tracking-[0.1em] text-[--ink-faint]">
          演示占位
        </span>
        <span className="text-sm text-[--ink-muted]">{label}</span>
      </div>
    </div>
  );
}

// Feature demo: autoplay/loop/muted clip (same pattern as the homepage
// DemoDiagonal), falling back to the placeholder if no video is set.
function FeatureMedia({
  video,
  poster,
  label,
}: {
  video?: string;
  poster?: string;
  label: string;
}) {
  if (!video) return <MediaPlaceholder label={label} />;
  return (
    <div className="overflow-hidden rounded bg-[--bg-elev]">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        src={video}
        poster={poster}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        className="block h-auto w-full"
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
}

const FEATURES: Feature[] = [
  {
    Icon: Subtitles,
    kicker: '双语字幕 · AI 标黄',
    title: '看懂每一句台词',
    body: 'cc 一开，整片中英双语字幕即刻铺满——侧栏跟读自动滚动居中，底部浮层可随手拖。AI 把重点词自动标黄，鼠标悬停就有中文释义和用法笔记。',
    note: '机器翻译别扭？点「AI 重译」，让你配的大模型整片重翻、覆盖原译。',
    mediaLabel: 'YouTube 侧栏双语字幕 + 标黄悬浮卡',
    video: '/videos/p1.mp4',
    poster: '/videos/p1.jpg',
  },
  {
    Icon: MousePointerClick,
    kicker: '划词收藏',
    title: '看到生词，划一下就收下',
    body: '任意网页选中文字即弹收藏框，自动抓取所在的整句上下文。可手填，也能让 AI 补全释义、打标签，一键存进你的私人语料库。',
    mediaLabel: '网页划词 → 收藏对话框',
    video: '/videos/p2.mp4',
    poster: '/videos/p2.jpg',
  },
  {
    Icon: Library,
    kicker: '多端同步语料库',
    title: '划下的词，到哪都能复习',
    body: '收藏自动同步到云端个人语料库——插件弹窗、桌面客户端、网页端随时打开「我的语料库」复习。从 YouTube 划的词还带时间戳，点一下直接跳回视频那一秒重听。',
    mediaLabel: '我的语料库页 · 时间戳秒跳',
    video: '/videos/p3.mp4',
    poster: '/videos/p3.jpg',
  },
];

const FAQ: { q: string; a: string }[] = [
  {
    q: '双语字幕要花钱吗？',
    a: '不要。默认走 Microsoft 免费匿名翻译，零配置零成本。只有 AI 标黄 / AI 查词 / AI 重译 这几个用大模型的功能，才需要你自己配一个 API Key。',
  },
  {
    q: '不配大模型 Key 能用吗？',
    a: '能。双语字幕、底部双语、划词收藏（手填释义）都完全免费。想让 AI 自动标黄重点词、自动补全释义时，再配 Key 不迟。',
  },
  {
    q: '支持哪些大模型？',
    a: 'OpenAI 兼容（DeepSeek / Kimi / Qwen / 硅基流动 等）、Claude、Gemini 都行。新手推荐 DeepSeek，便宜又够用。',
  },
  {
    q: '我的 API Key 安全吗？',
    a: 'Key 只存在你本地浏览器（chrome.storage），调用时由你的浏览器直接请求大模型厂商，不经过我们的服务器。',
  },
  {
    q: '怎么更新到新版？',
    a: '上架 Chrome 应用商店 / Edge 加载项后，新版本由浏览器自动更新，你无需任何手动操作。',
  },
  {
    q: '收藏的词存在哪？能删吗？',
    a: '存在云端的个人语料库（需邮箱登录），多端同步。想清空可以在设置页点「清空我的语料库」一键删除。',
  },
];

const SETUP_STEPS = [
  {
    title: '从商店安装',
    lines: [
      'Chrome 用户打开 Chrome 应用商店、Edge 用户打开 Edge 加载项，搜索「whatSub」。',
      '点「添加至 Chrome」（Edge 为「获取」），在弹窗里确认「添加扩展」。',
      '装好后浏览器工具栏出现 whatsub 图标即可；之后新版本由商店自动更新，无需手动操作。',
    ],
  },
  {
    title: '配置大模型 API Key',
    lines: [
      '双语字幕本身免费（走微软翻译）；AI 标黄 / AI 查词 / AI 重译 需要你自己的大模型 Key。',
      '先拿一个 Key：DeepSeek（platform.deepseek.com，便宜推荐）/ Kimi、Qwen 等 OpenAI 兼容平台 / Claude（console.anthropic.com）/ Gemini（aistudio.google.com）。',
      '点工具栏 whatsub 图标 →「填写大模型 API」（或在 YouTube 播放器的 whatsub 菜单里点同名项）→ 选厂商、填 Base URL + API Key + Model → 点「保存」。',
      '点「测试连接」，看到「✓ 连接成功」就配好了。',
    ],
    tip: '新手最省事：厂商选「OpenAI 兼容」，Base URL 填 https://api.deepseek.com/v1，Model 填 deepseek-chat。',
  },
  {
    title: '打开 YouTube 视频，开启字幕',
    lines: [
      '随便打开一个带字幕的视频，点播放器的 CC 按钮。',
      '右侧出现整片中英双语侧栏，底部出现可拖动的双语浮层。',
      '点 whatsub 紫色「AI 标黄」，重点词自动标黄，鼠标悬停看释义；翻译别扭就点绿色「AI 重译」。',
    ],
  },
  {
    title: '在任意网页划词收藏',
    lines: [
      '选中网页（或字幕）上的文字，弹出收藏框，自动带上所在的整句上下文。',
      '可手填释义，或点「AI 查词」补全 + 打标签，一键存进个人语料库。',
    ],
  },
  {
    title: '随时复习，多端同步',
    lines: [
      '收藏自动进云端个人语料库；点插件图标弹窗即可翻看「我的语料库」。',
      '从 YouTube 划的词带时间戳，点一下跳回视频那一秒重听；桌面客户端登录同一账号看到同一份语料。',
    ],
  },
];

const SCENARIOS = [
  {
    title: '刷 YouTube 学英语',
    body: '边看边读双语字幕，重点词标黄即点即记，看完一个视频顺手攒一批生词。',
  },
  {
    title: '读英文外刊 / 文档',
    body: '任意网页划词收藏，上下文自动带上，告别"查完就忘"。',
  },
  {
    title: '考前刷语料库',
    body: '所有收藏多端同步，通勤路上掏出手机也能复习你亲手攒的素材。',
  },
];

const NAV_LINKS = [
  { id: 'features', label: '功能' },
  { id: 'quickstart', label: '快速开始' },
  { id: 'faq', label: '常见问题' },
];

export function PluginShowcase() {
  const ref = useReveal<HTMLDivElement>();

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div ref={ref} className="text-ink">
      {/* ── page nav: logo home + section anchors + download CTA ── */}
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
              href={PLUGIN_DOWNLOAD}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
              style={{ boxShadow: '0 0 0 1px rgba(59,155,255,0.4), 0 0 24px var(--accent-glow)' }}
            >
              <DownloadIcon className="h-4 w-4" strokeWidth={2.5} />
              下载插件
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero (signature kept identical to the homepage; buttons follow the new system) ── */}
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
            浏览器插件版 · YouTube 双语字幕 + AI 重点标黄 + 跨网页划词收藏，自动同步进你的私人语料库
          </p>

          <div className="reveal reveal-delay-2 flex flex-wrap items-center justify-center gap-3">
            <a href={PLUGIN_DOWNLOAD} className={BTN_PRIMARY}>
              <DownloadIcon className="h-4 w-4" strokeWidth={2} />
              下载插件
            </a>
            <Link href="/" className={BTN_SECONDARY}>
              看桌面客户端
            </Link>
          </div>
        </div>
      </section>

      {/* ── Feature rows (alternating) ── */}
      <section
        id="features"
        className="scroll-mt-20 px-6 py-10 sm:px-10 lg:px-16"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at 30% 30%, rgba(59,155,255,0.12) 0%, transparent 60%), radial-gradient(ellipse at 70% 70%, rgba(255,255,255,0.04) 0%, transparent 50%), linear-gradient(135deg, #0a0a0c 0%, #141418 100%)',
        }}
      >
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
                  <FeatureMedia video={f.video} poster={f.poster} label={f.mediaLabel} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Quick start (numbered, detailed, incl. API key setup) ── */}
      <section id="quickstart" className="scroll-mt-20 px-6 py-24 sm:px-10 sm:py-32 lg:px-16">
        <div className="mx-auto max-w-[820px]">
          <h2 className="reveal mb-3 text-center font-sans text-3xl font-medium sm:text-4xl">
            快速开始
          </h2>
          <p className="reveal reveal-delay-1 mx-auto mb-14 max-w-[520px] text-center text-sm text-[--ink-muted]">
            从安装到第一次划词收藏,五步搞定。
          </p>
          <ol className="flex flex-col gap-10">
            {SETUP_STEPS.map((s, i) => (
              <li key={s.title} className="reveal flex gap-4 sm:gap-6">
                {/* number badge + connector line down to the next step */}
                <div className="flex flex-col items-center">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-sm font-medium text-[--ink-soft]">
                    {i + 1}
                  </div>
                  {i < SETUP_STEPS.length - 1 && (
                    <div className="mt-1 w-px flex-1 bg-[--hairline]" />
                  )}
                </div>
                <div className="flex-1 pb-2">
                  <h3 className="mb-3 flex items-center gap-2 text-lg font-medium text-ink">
                    {s.title}
                    {s.title.includes('API Key') && (
                      <KeyRound className="h-4 w-4 text-[--ink-soft]" strokeWidth={1.75} />
                    )}
                  </h3>
                  <ul className="space-y-2">
                    {s.lines.map((line, li) => (
                      <li
                        key={li}
                        className="flex items-start gap-2.5 text-sm leading-relaxed text-[--ink-soft]"
                      >
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[--ink-faint]" />
                        {line}
                      </li>
                    ))}
                  </ul>
                  {s.tip && (
                    <div className="mt-3 rounded bg-white/[0.04] px-3 py-2 text-xs leading-relaxed text-[--ink-soft]">
                      <span className="font-medium text-ink">提示 </span>
                      {s.tip}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
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
            装上它,从看懂这一句开始
          </h2>
          <p className="reveal reveal-delay-1 mx-auto mb-9 max-w-[480px] text-[--ink-soft]">
            免费使用核心功能,配一个你自己的大模型 key 即可解锁 AI 标黄 / 重译。
          </p>
          <div className="reveal reveal-delay-2 flex flex-wrap items-center justify-center gap-3">
            <a href={PLUGIN_DOWNLOAD} className={BTN_PRIMARY}>
              <DownloadIcon className="h-4 w-4" strokeWidth={2} />
              下载插件
            </a>
            <Link href="/" className={BTN_SECONDARY}>
              了解桌面客户端
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
