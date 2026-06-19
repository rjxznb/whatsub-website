'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Monitor, Puzzle, Smartphone, LayoutGrid, GraduationCap } from 'lucide-react';

// Platform dropdown entries. `href` navigates; `soon` renders disabled.
interface PlatformItem {
  label: string;
  desc: string;
  href?: string;
  Icon: typeof Monitor;
  soon?: boolean;
}

const PLATFORMS: PlatformItem[] = [
  { label: '概览', desc: '所有端能力一览', href: '/platforms', Icon: LayoutGrid },
  { label: '最佳实践', desc: '三端配合,把英语学透', href: '/platforms#best-practices', Icon: GraduationCap },
  { label: '桌面客户端', desc: '视频解析 · 字幕分析 · 词汇本', href: '/', Icon: Monitor },
  { label: '浏览器插件', desc: 'YouTube 双语字幕 · 划词收藏', href: '/plugin', Icon: Puzzle },
  { label: '移动端', desc: 'iOS · 随身看 + 复习', href: '/mobile', Icon: Smartphone },
];

/** Shared "平台与集成" dropdown used by the homepage Nav and the
 *  /plugin page nav. Click-toggle so it works identically on desktop
 *  and mobile (hover-open didn't translate to touch — that was the
 *  reason mobile previously got a flat /platforms link instead of the
 *  full panel). Pointerdown listener attaches only while open and
 *  closes the panel on any tap/click outside the container; Link
 *  clicks inside the panel also close it so navigation feels right. */
export function PlatformsDropdown() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Outside-tap to close — attached only while open so we don't pay
  // the listener cost on every page during normal scroll/idle.
  useEffect(() => {
    if (!open) return;
    const onDocPointer = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', onDocPointer);
    return () => document.removeEventListener('pointerdown', onDocPointer);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button — pill-shaped ghost button on mobile (matches
          the look of the existing /platforms ghost link it replaced),
          plain inline text + chevron on md+ (matches the sibling nav
          links above it in the desktop nav). */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 items-center gap-1 rounded-lg border border-white/15 px-3 text-xs text-[--ink-soft] transition-colors hover:border-white/30 hover:text-ink md:h-auto md:rounded-none md:border-0 md:p-0 md:text-sm"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        平台与集成
        <ChevronDown
          className="h-3.5 w-3.5 transition-transform"
          style={{ transform: open ? 'rotate(180deg)' : 'none' }}
          strokeWidth={2}
        />
      </button>
      {open && (
        <div className="absolute right-0 top-full pt-3" role="menu">
          <div
            className="w-72 overflow-hidden rounded-xl border border-[--hairline] p-1.5 shadow-2xl"
            style={{
              backgroundColor: 'rgba(15, 15, 18, 0.97)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            {PLATFORMS.map((p) =>
              p.href ? (
                <Link
                  key={p.label}
                  href={p.href}
                  onClick={() => setOpen(false)}
                  role="menuitem"
                  className="flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/[0.06]"
                >
                  <p.Icon className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={2} />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-ink">{p.label}</span>
                    <span className="block text-xs text-[--ink-muted]">{p.desc}</span>
                  </span>
                </Link>
              ) : (
                <div
                  key={p.label}
                  className="flex items-start gap-3 rounded-lg px-3 py-2.5 opacity-60"
                >
                  <p.Icon className="mt-0.5 h-4 w-4 shrink-0 text-[--ink-faint]" strokeWidth={2} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-sm font-medium text-[--ink-soft]">
                      {p.label}
                      <span className="rounded-full bg-white/[0.08] px-1.5 py-0.5 text-[10px] text-[--ink-muted]">
                        敬请期待
                      </span>
                    </span>
                    <span className="block text-xs text-[--ink-faint]">{p.desc}</span>
                  </span>
                </div>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}
