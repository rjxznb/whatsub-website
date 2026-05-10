'use client';

import { useEffect, useRef, useState } from 'react';

const DEMOS = [
  { caption: '导入 → 本地转录' },
  { caption: '双语字幕 + 黄底高亮' },
  { caption: '词汇本沉淀' },
  { caption: '字幕导出 / 编辑' },
];

const SLOPE_OFFSET = 20;

function lineCoords(progress: number): { leftY: number; rightY: number } {
  const total = 100 + SLOPE_OFFSET;
  return {
    leftY: 100 - progress * total,
    rightY: 100 + SLOPE_OFFSET - progress * total,
  };
}

function clipPathFor(progress: number): string {
  const { leftY, rightY } = lineCoords(progress);
  return `polygon(0% ${leftY}%, 100% ${rightY}%, 100% 100%, 0% 100%)`;
}

export function DemoDiagonal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState<number[]>(() =>
    DEMOS.map((_, i) => (i === 0 ? 1 : 0)),
  );
  const [vp, setVp] = useState({ w: 0, h: 0 });

  useEffect(() => {
    let rafId = 0;
    const update = () => {
      rafId = 0;
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      setVp({ w: vw, h: vh });
      const scrolled = -rect.top;
      const next = DEMOS.map((_, i) => {
        if (i === 0) return 1;
        const start = (i - 1) * vh;
        const p = (scrolled - start) / vh;
        return Math.max(0, Math.min(1, p));
      });
      setProgress(next);
    };
    const onScroll = () => {
      if (rafId === 0) rafId = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const activeIndex = (() => {
    for (let i = DEMOS.length - 1; i >= 0; i--) {
      if ((progress[i] ?? 0) > 0.01) return i;
    }
    return 0;
  })();

  const activeBeamP = (() => {
    for (let i = 1; i < DEMOS.length; i++) {
      const p = progress[i] ?? 0;
      if (p > 0 && p < 1) return p;
    }
    return null;
  })();

  const showHint = (progress[1] ?? 0) < 0.05;

  return (
    <section
      ref={containerRef}
      id="demo"
      className="relative bg-bg"
      style={{ height: `${DEMOS.length * 100}vh` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {DEMOS.map((demo, i) => {
          const p = progress[i] ?? 0;
          return (
            <div
              key={demo.caption}
              className="absolute inset-0"
              style={{
                zIndex: i,
                clipPath: i === 0 ? 'none' : clipPathFor(p),
                willChange: i === 0 ? 'auto' : 'clip-path',
              }}
            >
              <DemoSlot demo={demo} index={i} />
            </div>
          );
        })}

        {activeBeamP !== null && vp.w > 0 ? (
          <BeamLine progress={activeBeamP} vw={vp.w} vh={vp.h} />
        ) : null}

        <div
          className="pointer-events-none absolute bottom-8 left-1/2 z-50 -translate-x-1/2 font-mono text-xs uppercase tracking-[0.25em] text-[--ink-muted] transition-opacity duration-500"
          style={{ opacity: showHint ? 1 : 0 }}
        >
          ↓ 滑动看更多
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-6 right-6 z-50 font-mono text-[10px] tracking-[0.2em] text-[--ink-faint]"
        >
          {String(activeIndex + 1).padStart(2, '0')} / {String(DEMOS.length).padStart(2, '0')}
        </div>
      </div>
    </section>
  );
}

function BeamLine({
  progress,
  vw,
  vh,
}: {
  progress: number;
  vw: number;
  vh: number;
}) {
  const { leftY, rightY } = lineCoords(progress);
  const x1 = 0;
  const y1 = (vh * leftY) / 100;
  const x2 = vw;
  const y2 = (vh * rightY) / 100;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angleDeg = Math.atan2(dy, dx) * (180 / Math.PI);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute z-40"
      style={{
        left: x1,
        top: y1,
        width: length,
        height: 5,
        marginTop: -2.5,
        background: 'rgba(255, 255, 255, 0.75)',
        transformOrigin: '0 50%',
        transform: `rotate(${angleDeg}deg)`,
        boxShadow:
          '0 0 46px rgba(255,255,255,1), 0 0 52px rgba(255,255,255,1), 0 0 45px rgba(255,255,255,0.7), 0 0 50px rgba(255,255,255,0.5)',
        willChange: 'transform, top',
      }}
    />
  );
}

function DemoSlot({
  demo,
  index,
}: {
  demo: { caption: string };
  index: number;
}) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-bg">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at 30% 30%, rgba(59,155,255,0.12) 0%, transparent 60%), radial-gradient(ellipse at 70% 70%, rgba(255,255,255,0.04) 0%, transparent 50%), linear-gradient(135deg, #0a0a0c 0%, #141418 100%)',
        }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
        <span className="mb-6 font-mono text-xs uppercase tracking-[0.25em] text-[--ink-faint]">
          demo placeholder · {String(index + 1).padStart(2, '0')}
        </span>
        <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-5xl lg:text-6xl">
          {demo.caption}
        </h2>
      </div>
    </div>
  );
}
