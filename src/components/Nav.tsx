'use client';

import { PlatformsDropdown } from './PlatformsDropdown';

type NavLink = { id: string; label: string };

const DEFAULT_LINKS: NavLink[] = [
  { id: 'demo', label: '功能' },
  { id: 'download', label: '下载' },
  { id: 'pricing', label: '定价' },
  { id: 'faq', label: 'FAQ' },
];

export function Nav({ links = DEFAULT_LINKS }: { links?: NavLink[] }) {
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <nav
      className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.08]"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(30px) saturate(180%)',
        WebkitBackdropFilter: 'blur(30px) saturate(180%)',
      }}
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6 sm:px-10 lg:px-16">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="relative flex items-center"
          aria-label="whatSub 首页"
        >
          {/* White light glow behind the wordmark — concentrated near the
              wordmark center, fades out before reaching the edges */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute"
            style={{
              inset: '-2px -2px',
              background:
                'radial-gradient(ellipse at center, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.06) 30%, transparent 55%)',
              filter: 'blur(4px)',
            }}
          />
          {/* wordmark PNG has a baked-in BLACK background (no alpha in
              the source). mix-blend-mode: screen makes black pixels
              transparent (screen(0, x) = x), so only the white "what"
              + blue "Sub" letterforms render — the glow span behind
              shows through where the black was. */}
          <img
            src="/whatsub-wordmark.png"
            alt="whatSub"
            className="relative block h-9 w-auto mix-blend-screen"
          />
        </button>
        <div className="flex items-center gap-7">
          <ul className="hidden md:flex items-center gap-7 text-sm text-[--ink-soft]">
            {links.map((l) => (
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
          <button
            type="button"
            onClick={() => scrollTo('pricing')}
            className="inline-flex h-9 items-center rounded-lg bg-accent px-4 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
            style={{ boxShadow: '0 0 0 1px rgba(59,155,255,0.4), 0 0 24px var(--accent-glow)' }}
          >
            购买授权
          </button>
        </div>
      </div>
    </nav>
  );
}
