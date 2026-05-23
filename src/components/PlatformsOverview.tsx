'use client';

import Link from 'next/link';
import {
  Monitor,
  Puzzle,
  Smartphone,
  ArrowRight,
  ArrowDown,
  Database,
  Telescope,
  Waves,
  RotateCcw,
  Lightbulb,
} from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';
import { PlatformsDropdown } from './PlatformsDropdown';

const NAV_LINKS = [
  { id: 'scenarios', label: '按场景选' },
  { id: 'best-practices', label: '最佳实践' },
  { id: 'capabilities', label: '各端能力' },
];

interface Platform {
  Icon: typeof Monitor;
  name: string;
  bestFor: string;
  features: string[];
  cta?: { label: string; href: string; external?: boolean };
  soon?: boolean;
}

const PLATFORMS: Platform[] = [
  {
    Icon: Monitor,
    name: '桌面客户端',
    bestFor: '系统性地把一个视频学透',
    features: ['YouTube 视频下载 + 解析', '整片字幕分析 + AI 标黄', '词汇本 / 语料库管理', '本地离线可用'],
    cta: { label: '下载客户端', href: '/' },
  },
  {
    Icon: Puzzle,
    name: '浏览器插件',
    bestFor: '边刷 YouTube / 读网页边随手学',
    features: ['YouTube 整片双语字幕', 'AI 重点标黄 + 悬浮释义', '任意网页划词收藏', '导出 SRT 字幕'],
    cta: { label: '了解插件', href: '/plugin' },
  },
  {
    Icon: Smartphone,
    name: '移动端',
    bestFor: '通勤碎片时间复习',
    features: ['随身翻看个人语料库', '云端同步,手机也能复习', 'iOS / Android'],
    soon: true,
  },
];

interface Scenario {
  scene: string;
  picks: string[];
  why: string;
}

const SCENARIOS: Scenario[] = [
  {
    scene: '想把一个视频逐句学透、记笔记',
    picks: ['桌面客户端'],
    why: '整片字幕分析 + 词汇本,功能最全,适合坐下来精学',
  },
  {
    scene: '平时刷 YouTube 顺手学英语',
    picks: ['浏览器插件'],
    why: '不打断观看,即时双语字幕 + AI 标黄,看到哪学到哪',
  },
  {
    scene: '读英文网页 / 外刊遇到生词',
    picks: ['浏览器插件'],
    why: '任意网页划词,自动抓上下文,一键收藏',
  },
  {
    scene: '随时翻看、整理收藏的词',
    picks: ['桌面客户端', '浏览器插件'],
    why: '桌面词汇本 + 插件弹窗都能查看个人语料库',
  },
  {
    scene: '通勤、排队等碎片时间复习',
    picks: ['移动端'],
    why: '手机随身翻,云端同步(即将上线)',
  },
];

export function PlatformsOverview() {
  const ref = useReveal<HTMLDivElement>();

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div ref={ref} className="bg-bg text-ink">
      {/* page nav: logo home + section anchors + platforms dropdown */}
      <nav
        className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.08]"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(30px) saturate(180%)',
          WebkitBackdropFilter: 'blur(30px) saturate(180%)',
        }}
      >
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6 sm:px-10 lg:px-16">
          <Link href="/" className="flex items-center" aria-label="whatSub 首页">
            <img src="/whatsub-wordmark.png" alt="whatSub" className="block h-9 w-auto mix-blend-screen" />
          </Link>
          <div className="flex items-center gap-7">
            <ul className="hidden items-center gap-7 text-sm text-[--ink-soft] md:flex">
              {NAV_LINKS.map((l) => (
                <li key={l.id}>
                  <button
                    onClick={() => scrollTo(l.id)}
                    className="transition-colors hover:text-ink"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
              <li>
                <PlatformsDropdown />
              </li>
            </ul>
            <Link href="/" className="text-sm text-[--ink-soft] transition-colors hover:text-ink">
              ← 返回首页
            </Link>
          </div>
        </div>
      </nav>

      {/* Compact page header — no marketing hero, just the title + framing line */}
      <header className="px-6 pt-28 pb-10 sm:px-10 lg:px-16 lg:pt-36">
        <div className="mx-auto max-w-[1100px]">
          <h1 className="reveal mb-4 font-sans text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            平台与集成
          </h1>
          <p className="reveal reveal-delay-1 max-w-[640px] text-[15px] leading-[1.7] text-[--ink-soft]">
            whatSub 现有桌面客户端、浏览器插件两个入口(移动端即将上线),它们共享同一个云端语料库。下面按场景帮你选,并说明它们怎么串在一起。
          </p>
        </div>
      </header>

      {/* ── 场景 → 平台 ── */}
      <section id="scenarios" className="scroll-mt-20 px-6 py-10 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-[1100px]">
          <h2 className="reveal mb-6 text-2xl font-bold tracking-tight sm:text-3xl">按场景选</h2>
          <div className="reveal overflow-hidden rounded-xl border border-[--hairline]">
            {SCENARIOS.map((s, i) => (
              <div
                key={s.scene}
                className={`flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-6 ${
                  i > 0 ? 'border-t border-[--hairline]' : ''
                }`}
              >
                <div className="flex-1 text-[15px] font-medium text-ink">{s.scene}</div>
                <div className="flex shrink-0 flex-wrap gap-2 sm:w-44">
                  {s.picks.map((p) => (
                    <span
                      key={p}
                      className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent"
                    >
                      {p}
                    </span>
                  ))}
                </div>
                <div className="flex-1 text-sm leading-relaxed text-[--ink-muted] sm:max-w-[340px]">
                  {s.why}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 它们如何协作 (relationship) ── */}
      <section className="px-6 py-16 sm:px-10 sm:py-24 lg:px-16">
        <div className="mx-auto max-w-[1100px]">
          <h2 className="reveal mb-3 text-2xl font-bold tracking-tight sm:text-3xl">它们如何串在一起</h2>
          <p className="reveal reveal-delay-1 mb-12 max-w-[640px] text-[15px] leading-[1.7] text-[--ink-soft]">
            三个入口分工不同,但都读写<strong className="text-ink">同一个云端个人语料库</strong>——这是把它们连起来的纽带。你在任何一端划词收藏,换到别的端打开立刻能看到。
          </p>

          {/* hub-and-spoke: three surfaces feed into the shared corpus */}
          <div className="reveal reveal-delay-2 rounded-xl border border-[--hairline] bg-[--bg-elev] px-6 py-10 sm:px-10">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <HubNode Icon={Monitor} title="桌面客户端" role="精学 · 解析视频" />
              <HubNode Icon={Puzzle} title="浏览器插件" role="随手捕捉 · 划词收藏" />
              <HubNode Icon={Smartphone} title="移动端" role="随时复习(即将)" />
            </div>

            <div className="my-5 flex items-center justify-center text-[--ink-faint]">
              <ArrowDown className="h-5 w-5" strokeWidth={2} />
            </div>

            <div className="mx-auto flex max-w-md items-center justify-center gap-3 rounded-xl border border-accent/40 bg-accent/10 px-6 py-5">
              <Database className="h-6 w-6 shrink-0 text-accent" strokeWidth={2} />
              <div>
                <div className="text-base font-semibold text-ink">云端个人语料库</div>
                <div className="text-xs text-[--ink-muted]">一处划词,处处可见 · 多端实时同步</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 最佳实践:三端配合学英语 ── */}
      <section id="best-practices" className="scroll-mt-20 px-6 py-16 sm:px-10 sm:py-24 lg:px-16">
        <div className="mx-auto max-w-[1100px]">
          <h2 className="reveal mb-3 text-2xl font-bold tracking-tight sm:text-3xl">最佳实践:怎么配合,把英语学透</h2>
          <p className="reveal reveal-delay-1 mb-12 max-w-[640px] text-[15px] leading-[1.7] text-[--ink-soft]">
            三个端各有所长。把它们按"精学 → 泛刷 → 复习"串起来,既有深度又有量,生词还能反复回炉。
          </p>

          <div className="reveal reveal-delay-1 grid grid-cols-1 gap-4 md:grid-cols-3">
            <PracticeStep
              Icon={Telescope}
              n="精学"
              tool="桌面客户端"
              body="挑一个你真感兴趣的视频,用客户端整片分析:逐句过双语 + AI 标黄,把重点词存进词汇本。一次学透一个。"
            />
            <PracticeStep
              Icon={Waves}
              n="泛刷"
              tool="浏览器插件"
              body="日常刷 YouTube、读外刊不必开客户端。插件即时双语 + 随手划词,靠数量把词汇铺开,看到哪学到哪。"
            />
            <PracticeStep
              Icon={RotateCcw}
              n="复习"
              tool="多端同步"
              body="精学、泛刷收的词都进同一个云端语料库。碎片时间用插件弹窗随时翻看,移动端上线后还能在手机上随身复习;从 YouTube 划的词点时间戳跳回原句重听。"
            />
          </div>

          {/* 小技巧 */}
          <div className="reveal reveal-delay-2 mt-6 rounded-xl border border-[--hairline] bg-[--bg-elev] p-6">
            <div className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-ink">
              <Lightbulb className="h-4 w-4 text-accent" strokeWidth={2} />
              几个让效率翻倍的小技巧
            </div>
            <ul className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
              {[
                'AI 标黄只标真正的重点词,别贪多 —— 一句记 1-2 个最划算。',
                '划词时让 AI 补全释义,并打上场景标签(如 dining / job),复习时按标签筛。',
                '遇到看不懂的长句,直接点 AI 重译,比逐词查更快抓住意思。',
                '同一个账号在客户端 + 插件登录,语料库自动打通,不用手动导。',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2 text-sm leading-relaxed text-[--ink-soft]">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── 平台详情卡 (reference) ── */}
      <section id="capabilities" className="scroll-mt-20 px-6 pb-24 sm:px-10 sm:pb-32 lg:px-16">
        <div className="mx-auto max-w-[1100px]">
          <h2 className="reveal mb-6 text-2xl font-bold tracking-tight sm:text-3xl">各端能力</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {PLATFORMS.map((p, i) => (
              <div
                key={p.name}
                className={`reveal reveal-delay-${(i % 2) + 1} flex flex-col rounded-xl border border-[--hairline] bg-[--bg-elev] p-7`}
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15">
                    <p.Icon className="h-5 w-5 text-accent" strokeWidth={2} />
                  </div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-ink">{p.name}</h3>
                    {p.soon && (
                      <span className="rounded-full bg-white/[0.08] px-2 py-0.5 text-[10px] text-[--ink-muted]">
                        敬请期待
                      </span>
                    )}
                  </div>
                </div>
                <p className="mb-4 text-sm text-[--ink-muted]">
                  最适合:<span className="text-[--ink-soft]">{p.bestFor}</span>
                </p>
                <ul className="mb-6 flex-1 space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-[--ink-soft]">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                      {f}
                    </li>
                  ))}
                </ul>
                {p.cta ? (
                  p.cta.external ? (
                    <a
                      href={p.cta.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-colors hover:text-ink"
                    >
                      {p.cta.label} <ArrowRight className="h-4 w-4" strokeWidth={2} />
                    </a>
                  ) : (
                    <Link
                      href={p.cta.href}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-colors hover:text-ink"
                    >
                      {p.cta.label} <ArrowRight className="h-4 w-4" strokeWidth={2} />
                    </Link>
                  )
                ) : (
                  <span className="text-sm text-[--ink-faint]">开发中,敬请期待</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function HubNode({
  Icon,
  title,
  role,
}: {
  Icon: typeof Monitor;
  title: string;
  role: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-[--hairline] bg-bg px-4 py-5 text-center">
      <Icon className="h-6 w-6 text-[--ink-soft]" strokeWidth={1.75} />
      <div className="text-sm font-semibold text-ink">{title}</div>
      <div className="text-xs text-[--ink-muted]">{role}</div>
    </div>
  );
}

function PracticeStep({
  Icon,
  n,
  tool,
  body,
}: {
  Icon: typeof Monitor;
  n: string;
  tool: string;
  body: string;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-[--hairline] bg-[--bg-elev] p-6">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15">
          <Icon className="h-4 w-4 text-accent" strokeWidth={2} />
        </div>
        <div>
          <div className="text-base font-bold text-ink">{n}</div>
          <div className="text-xs text-accent">{tool}</div>
        </div>
      </div>
      <p className="text-sm leading-relaxed text-[--ink-muted]">{body}</p>
    </div>
  );
}
