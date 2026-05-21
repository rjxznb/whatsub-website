'use client';

import { ArrowDownToLine, Github, Puzzle } from 'lucide-react';
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

        {/* Companion browser extension — secondary download below the */}
        {/* two desktop-client tiles. Primary CTA goes through the license */}
        {/* backend (/download/plugin 302s to the latest GitHub release zip */}
        {/* via the GitHub API). Backup link points directly at the GitHub */}
        {/* /releases/latest page so users can recover even if both the */}
        {/* backend AND the GitHub API are unreachable. */}
        <div className="reveal reveal-delay-3 mt-4 flex flex-col rounded-xl border border-[--hairline] bg-[--bg-elev] p-8 md:flex-row md:items-center md:justify-between">
          <div className="mb-6 flex items-start gap-3 md:mb-0">
            <Puzzle className="mt-0.5 h-7 w-7 text-[--ink-soft]" strokeWidth={1.5} />
            <div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold leading-tight text-ink">
                  配套浏览器插件
                </h3>
                {/* Free-to-use signal — the plugin is gratis; only the */}
                {/* desktop client + corpus access are license-gated. */}
                <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">
                  免费
                </span>
              </div>
              <p className="mt-1 text-sm text-[--ink-muted]">
                完全免费 · Chrome / Edge 扩展 · YouTube 双语字幕 + 任意网页划词收藏
              </p>
              <a
                href={LINKS.githubPluginReleases}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-2 font-mono text-xs text-[--ink-faint] transition-colors hover:text-[--ink-muted]"
              >
                <Github className="h-3.5 w-3.5" strokeWidth={1.5} /> GitHub 备用下载
              </a>
            </div>
          </div>
          <a
            href="/download/plugin"
            className="inline-flex h-12 items-center justify-center gap-2.5 whitespace-nowrap rounded-lg bg-white px-6 text-sm font-semibold text-bg transition-transform hover:-translate-y-px"
          >
            <ArrowDownToLine className="h-4 w-4" strokeWidth={2.5} />
            下载插件
          </a>
        </div>
      </div>
    </section>
  );
}
