'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import {
  Monitor,
  Puzzle,
  Smartphone,
  ArrowRight,
  ArrowDown,
  ArrowUp,
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
    features: ['随身翻看个人语料库', '免 VPN 看视频 · 字幕跟读', 'iPhone / iPad（iOS 16+）'],
    cta: { label: '了解移动端', href: '/mobile' },
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
    why: '手机随身翻,云端同步,免 VPN 秒开',
  },
];

// The cross-device relationship as a closed loop: desktop produces → cloud
// syncs → mobile consumes → mobile pushes links back to the desktop queue →
// (loops). Rendered as the forward path; the return arrow closes it.
const LOOP_STAGES: {
  Icon: typeof Monitor;
  title: string;
  role: string;
  highlight?: boolean;
}[] = [
  { Icon: Monitor, title: '桌面客户端', role: '下载 · 转写 · AI 分析 · 自托管上云' },
  { Icon: Database, title: '云端 library + 语料库', role: '多端实时同步的中枢', highlight: true },
  { Icon: Smartphone, title: '移动端', role: '免 VPN 随身看 · 碎片复习' },
];

export function PlatformsOverview() {
  const ref = useReveal<HTMLDivElement>();

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div ref={ref} className="bg-bg text-ink">
      {/* page nav: logo home + section anchors + platforms dropdown */}
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
            <img src="/whatsub-wordmark.png" alt="whatSub" className="block h-9 w-auto mix-blend-screen" />
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
            <Link href="/" className="text-sm text-[--ink-soft] transition-colors duration-300 hover:text-ink">
              ← 返回首页
            </Link>
          </div>
        </div>
      </nav>

      {/* Compact page header — no marketing hero, just the title + framing line */}
      <header className="px-6 pt-32 pb-14 sm:px-10 lg:px-16 lg:pt-40 lg:pb-16">
        <div className="mx-auto max-w-[1100px]">
          <h1 className="reveal mb-5 font-sans text-4xl font-medium leading-tight text-ink sm:text-5xl">
            平台与集成
          </h1>
          <p className="reveal reveal-delay-1 max-w-[640px] text-[15px] leading-[1.7] text-[--ink-soft]">
            whatSub 现有桌面客户端、浏览器插件、iOS 移动端三个入口,它们共享同一个云端语料库。下面按场景帮你选,并说明它们怎么串在一起。
          </p>
        </div>
      </header>

      {/* ── 场景 → 平台 ── */}
      <section id="scenarios" className="scroll-mt-20 px-6 py-12 sm:px-10 sm:py-16 lg:px-16">
        <div className="mx-auto max-w-[1100px]">
          <h2 className="reveal mb-7 text-2xl font-medium sm:text-3xl">按场景选</h2>
          <div className="reveal overflow-hidden rounded bg-[--bg-elev]">
            {SCENARIOS.map((s, i) => (
              <div
                key={s.scene}
                className={`flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:gap-6 ${
                  i > 0 ? 'border-t border-[--hairline]' : ''
                }`}
              >
                <div className="flex-1 text-[15px] font-medium text-ink">{s.scene}</div>
                <div className="flex shrink-0 flex-wrap gap-2 sm:w-44">
                  {s.picks.map((p) => (
                    <span
                      key={p}
                      className="rounded bg-white/[0.06] px-2.5 py-1 text-xs font-medium text-[--ink-soft]"
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

      {/* ── 它们如何协作 (relationship) — the page's single accent moment ── */}
      <section className="px-6 py-16 sm:px-10 sm:py-24 lg:px-16">
        <div className="mx-auto max-w-[1100px]">
          <h2 className="reveal mb-3 text-2xl font-medium sm:text-3xl">它们如何串成一个闭环</h2>
          <p className="reveal reveal-delay-1 mb-12 max-w-[600px] text-[15px] leading-[1.7] text-[--ink-soft]">
            三端共享同一个云端语料库，彼此串成一个闭环——任意一端的产出，最终都会流回其他端复习。
          </p>

          {/* closed loop: forward path on top (desktop → cloud → mobile), a return
              track underneath that arrows back up into 桌面客户端 to close the rectangle. */}
          <div className="reveal reveal-delay-2 rounded bg-[--bg-elev] px-5 py-8 sm:px-10 sm:py-12">
            {/* forward path: produce → sync → consume */}
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
              {LOOP_STAGES.map((s, i) => (
                <Fragment key={s.title}>
                  <LoopNode Icon={s.Icon} title={s.title} role={s.role} highlight={s.highlight} />
                  {i < LOOP_STAGES.length - 1 && (
                    <div className="flex shrink-0 items-center justify-center text-accent">
                      <ArrowDown className="h-5 w-5 sm:hidden" strokeWidth={2} />
                      <ArrowRight className="hidden h-5 w-5 sm:block" strokeWidth={2} />
                    </div>
                  )}
                </Fragment>
              ))}
            </div>

            {/* return track (desktop): a U that closes 移动端 → 桌面客户端, forming the loop */}
            <div className="relative mt-3 hidden h-12 sm:block">
              <div className="h-full rounded-b border-x border-b border-accent/35" />
              {/* arrowhead closing the loop up into 桌面客户端 (top-left) */}
              <ArrowUp
                className="absolute -left-[9px] -top-2.5 h-[18px] w-[18px] text-accent"
                strokeWidth={2}
              />
              {/* concise return label, sitting on the bottom segment */}
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 whitespace-nowrap bg-[--bg-elev] px-3 text-xs text-[--ink-soft]">
                移动端把链接推回桌面处理，成片再同步回云端
              </span>
            </div>

            {/* return path (mobile): compact, the narrow column can't show the U cleanly */}
            <div className="mt-4 flex items-center justify-center gap-2 sm:hidden">
              <RotateCcw className="h-4 w-4 shrink-0 text-accent" strokeWidth={2} />
              <span className="text-xs text-[--ink-soft]">移动端把链接推回桌面处理，成片再同步回云端</span>
            </div>

            {/* the plugin also feeds the shared corpus */}
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[--ink-muted]">
              <Puzzle className="h-3.5 w-3.5 text-[--ink-soft]" strokeWidth={2} />
              浏览器插件划词收藏，也汇入同一个共享库
            </div>
          </div>
        </div>
      </section>

      {/* ── 最佳实践:三端配合学英语 ── */}
      <section id="best-practices" className="scroll-mt-20 px-6 py-16 sm:px-10 sm:py-24 lg:px-16">
        <div className="mx-auto max-w-[1100px]">
          <h2 className="reveal mb-3 text-2xl font-medium sm:text-3xl">最佳实践:怎么配合,把英语学透</h2>
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
          <div className="reveal reveal-delay-2 mt-6 rounded bg-[--bg-elev] p-6 sm:p-8">
            <div className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-ink">
              <Lightbulb className="h-4 w-4 text-[--ink-soft]" strokeWidth={2} />
              几个让效率翻倍的小技巧
            </div>
            <ul className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
              {[
                'AI 标黄只标真正的重点词,别贪多 —— 一句记 1-2 个最划算。',
                '划词时让 AI 补全释义,并打上场景标签(如 dining / job),复习时按标签筛。',
                '遇到看不懂的长句,直接点 AI 重译,比逐词查更快抓住意思。',
                '同一个账号在客户端 + 插件登录,语料库自动打通,不用手动导。',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-sm leading-relaxed text-[--ink-soft]">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[--ink-faint]" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── 平台详情卡 (reference) ── */}
      <section id="capabilities" className="scroll-mt-20 px-6 pb-28 sm:px-10 sm:pb-36 lg:px-16">
        <div className="mx-auto max-w-[1100px]">
          <h2 className="reveal mb-7 text-2xl font-medium sm:text-3xl">各端能力</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {PLATFORMS.map((p, i) => (
              <div
                key={p.name}
                className={`reveal reveal-delay-${(i % 2) + 1} flex flex-col rounded bg-[--bg-elev] p-7 sm:p-8`}
              >
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-white/[0.05]">
                    <p.Icon className="h-5 w-5 text-[--ink-soft]" strokeWidth={1.75} />
                  </div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-medium text-ink">{p.name}</h3>
                    {p.soon && (
                      <span className="rounded bg-white/[0.08] px-2 py-0.5 text-[10px] text-[--ink-muted]">
                        敬请期待
                      </span>
                    )}
                  </div>
                </div>
                <p className="mb-5 text-sm text-[--ink-muted]">
                  最适合:<span className="text-[--ink-soft]">{p.bestFor}</span>
                </p>
                <ul className="mb-7 flex-1 space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-[--ink-soft]">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[--ink-faint]" />
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
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-ink transition-colors duration-300 hover:text-accent"
                    >
                      {p.cta.label} <ArrowRight className="h-4 w-4" strokeWidth={2} />
                    </a>
                  ) : (
                    <Link
                      href={p.cta.href}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-ink transition-colors duration-300 hover:text-accent"
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

function LoopNode({
  Icon,
  title,
  role,
  highlight,
}: {
  Icon: typeof Monitor;
  title: string;
  role: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex flex-1 flex-col items-center gap-2 rounded px-4 py-5 text-center ${
        highlight ? 'bg-accent/10' : 'bg-white/[0.04]'
      }`}
    >
      <Icon
        className={`h-6 w-6 ${highlight ? 'text-accent' : 'text-[--ink-soft]'}`}
        strokeWidth={1.75}
      />
      <div className="text-sm font-medium text-ink">{title}</div>
      <div className="text-xs leading-snug text-[--ink-muted]">{role}</div>
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
    <div className="flex flex-col rounded bg-[--bg-elev] p-6 sm:p-7">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded bg-white/[0.05]">
          <Icon className="h-4 w-4 text-[--ink-soft]" strokeWidth={1.75} />
        </div>
        <div>
          <div className="text-base font-medium text-ink">{n}</div>
          <div className="text-xs text-[--ink-muted]">{tool}</div>
        </div>
      </div>
      <p className="text-sm leading-relaxed text-[--ink-muted]">{body}</p>
    </div>
  );
}
