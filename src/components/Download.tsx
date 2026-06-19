'use client';

import { ArrowDownToLine, Chrome, Github, Puzzle } from 'lucide-react';
import { AppleLogo, WindowsLogo } from '@/components/Icons';
import { useLatestVersion } from '@/hooks/useLatestVersion';
import { useReveal } from '@/hooks/useReveal';
import { LINKS } from '@/lib/constants';

const PLATFORMS = [
  {
    key: 'windows-x86_64' as const,
    label: 'Windows',
    href: '/download/win',
    Icon: WindowsLogo,
    // Suffix in the GitHub release asset name. Full asset filename is
    // built as `whatsub_<version>_<suffix>` to match the release artifact
    // naming convention (see https://github.com/rjxznb/whatsub-releases/releases).
    githubAssetSuffix: 'x64-setup.exe',
  },
  {
    key: 'darwin-aarch64' as const,
    label: 'macOS',
    href: '/download/mac',
    Icon: AppleLogo,
    githubAssetSuffix: 'aarch64.dmg',
  },
];

// "现已支持" — the other endpoints whatSub already runs on outside the
// desktop client. Each card is one click → external store. Used to be a
// single "配套浏览器插件" tile with two store buttons; replaced with
// this 3-card grid once iOS shipped (2026-06-10) so the section now
// communicates "desktop + iOS + two browser stores, all live" instead
// of just "browser extension as an add-on". Card icons mix custom
// AppleLogo with lucide Chrome / Puzzle so the row carries some visual
// variety while staying consistent in size.
const NOW_AVAILABLE = [
  {
    label: 'App Store',
    sub: 'iPhone & iPad',
    Icon: AppleLogo,
    href: LINKS.iosAppStore,
  },
  {
    label: 'Edge 加载项',
    sub: '浏览器扩展',
    Icon: Puzzle,
    href: LINKS.edgeAddonStore,
  },
  {
    label: 'Chrome 应用商店',
    sub: '浏览器扩展',
    Icon: Chrome,
    href: LINKS.chromeAddonStore,
  },
];

function buildGithubAssetUrl(version: string | null, suffix: string): string {
  if (!version) return LINKS.githubReleases;
  return `${LINKS.githubReleases}/download/v${version}/whatsub_${version}_${suffix}`;
}

function fmtPubDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function Download() {
  const latest = useLatestVersion();
  const ref = useReveal<HTMLElement>();

  const versionLine =
    latest?.version
      ? `当前最新版本 v${latest.version}${latest.pubDate ? ` · 发布于 ${fmtPubDate(latest.pubDate)}` : ''}`
      : '正在获取最新版本…';

  return (
    <section
      ref={ref}
      id="download"
      className="bg-bg px-6 py-24 sm:px-10 sm:py-32 lg:px-16"
    >
      <div className="mx-auto max-w-[1200px]">
        <h2
          className="reveal mb-3 max-w-[900px] font-bold leading-[1.05] tracking-[-0.01em] text-ink"
          style={{ fontSize: 'clamp(30px, 6.5vw, 72px)' }}
        >
          下载 <span className="text-accent">whatSub</span>
        </h2>
        <p className="reveal reveal-delay-1 mb-12 font-mono text-sm tracking-[0.02em] text-[--ink-muted]">
          {versionLine}
        </p>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {PLATFORMS.map((p, i) => (
            <div
              key={p.key}
              className={`reveal reveal-delay-${i + 1} flex flex-col rounded-xl border border-[--hairline] bg-[--bg-elev] p-8`}
            >
              <div className="mb-6 flex items-center gap-3">
                <p.Icon
                  className={`text-[--ink-soft] ${
                    p.Icon === WindowsLogo ? 'h-[18px] w-[18px]' : 'h-7 w-7'
                  }`}
                />
                <h3 className="text-3xl font-bold leading-tight text-ink">
                  {p.label}
                </h3>
              </div>
              <a
                href={p.href}
                className="mb-4 inline-flex h-12 items-center justify-center gap-2.5 rounded-lg bg-white text-sm font-semibold text-bg transition-transform hover:-translate-y-px"
              >
                <ArrowDownToLine className="h-4 w-4" strokeWidth={2.5} />
                下载 v{latest?.version ?? '0.1.26'}
              </a>
              <a
                href={buildGithubAssetUrl(latest?.version ?? null, p.githubAssetSuffix)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 font-mono text-xs text-[--ink-faint] transition-colors hover:text-[--ink-muted]"
              >
                <Github className="h-3.5 w-3.5" strokeWidth={1.5} /> GitHub 备用下载
              </a>
            </div>
          ))}
        </div>

        {/* ── 现已支持 ── desktop client 之外的端 (iOS app + 两个浏览器
            扩展商店)。每张卡是一个外链,整张卡可点 → 对应商店。视觉
            轻于上面的 Windows / macOS 主下载磁贴(更小的标题、卡内不
            放下载按钮、只用 hover 提示可交互),让"下载 whatSub"仍是
            section 的焦点,这里只是补充信息层。 */}
        <div className="reveal reveal-delay-3 mt-16 border-t border-[--hairline] pt-12">
          <h3 className="mb-2 text-lg font-semibold text-ink sm:text-xl">
            现已支持
          </h3>
          <p className="mb-8 text-sm text-[--ink-muted]">
            桌面客户端之外,这些平台也已上线 · 同邮箱登录,语料库和云端视频自动互通
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {NOW_AVAILABLE.map((p) => (
              <a
                key={p.label}
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center justify-center rounded-xl border border-[--hairline] bg-[--bg-elev] px-6 py-10 transition-all hover:-translate-y-px hover:border-white/20"
              >
                <p.Icon className="mb-5 h-7 w-7 text-[--ink-soft] transition-colors group-hover:text-ink" />
                <p className="mb-1.5 text-base font-semibold text-ink">
                  {p.label}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[--ink-faint]">
                  {p.sub}
                </p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
