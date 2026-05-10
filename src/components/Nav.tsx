'use client';
import { LINKS } from '@/lib/constants';

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
        <a
          href="#top"
          className="relative flex items-center"
          aria-label="whatSub"
        >
          {/* White light glow behind the wordmark */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute"
            style={{
              inset: '-14px -10px',
              background:
                'radial-gradient(ellipse at center, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.18) 45%, transparent 75%)',
              filter: 'blur(10px)',
            }}
          />
          <img
            src="/whatsub-wordmark.png"
            alt="whatSub"
            className="relative block h-9 w-auto"
            style={{ mixBlendMode: 'screen' }}
          />
        </a>
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
          </ul>
          <a
            href={LINKS.xhsStore}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center rounded-lg bg-accent px-4 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
            style={{ boxShadow: '0 0 0 1px rgba(59,155,255,0.4), 0 0 24px var(--accent-glow)' }}
          >
            购买授权
          </a>
        </div>
      </div>
    </nav>
  );
}
