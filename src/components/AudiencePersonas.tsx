'use client';

import { GraduationCap, Mic, Tv, Video } from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';

/**
 * "哪些人适合用" — audience-persona section that sits between
 * DemoDiagonal (the "what does it do") and Download / CombinedPricing
 * (the "buy it") so a visitor can self-identify before being asked to
 * commit. 4 personas cover the spectrum of English-video learners:
 *
 *   1. 刷剧党       — entertainment-driven casual learner
 *   2. 内容创作者    — professional / utility user (script + clip work)
 *   3. 口语练习者    — skill-focused (uses the AI voice feature added
 *                     in screen-8 of the SubtitleMockup carousel)
 *   4. 备考党       — goal-driven (考研 / 雅思 / 托福 listening)
 *
 * Each card carries: lucide icon (accent blue), persona name (xl ink
 * font-semibold), 1-2 sentence description (ink-soft), and a small
 * monospace "use moment" hairline-separated below (ink-faint) — gives
 * the card weight without being verbose. Hover lifts the card 1px +
 * brightens the border, a tiny tactile cue.
 *
 * Background bg-soft so the section sits as an alternating rhythm
 * between Download (bg-bg) above and below in the page flow.
 */

interface Persona {
  Icon: typeof Tv;
  title: string;
  desc: string;
  moment: string;
}

const PERSONAS: Persona[] = [
  {
    Icon: Tv,
    title: '刷剧党',
    desc: '追美剧、刷 YouTube / B 站时,把地道英语顺手学下来',
    moment: '通勤 30 分钟一集 SUITS · 看完顺手攒 5 个短语',
  },
  {
    Icon: Video,
    title: '内容创作者',
    desc: '剪辑时找素材、批量提取字幕、复用经典片段做二创',
    moment: '一键导出双语 SRT · 二创不再卡在字幕环节',
  },
  {
    Icon: Mic,
    title: '口语练习者',
    desc: '配合 AI 实时语音对话,跟着视频角色练真实场景',
    moment: '挑一段 TED · 跟读 + 角色扮演到自己也能这么说',
  },
  {
    Icon: GraduationCap,
    title: '考研 / 雅思 / 托福备考',
    desc: '听力素材即查即记,长期积累地道表达和高频用法',
    moment: '外刊视频拆成短语本 · 一周攒 100+ 高频表达',
  },
];

export function AudiencePersonas() {
  const ref = useReveal<HTMLElement>();

  return (
    <section
      ref={ref}
      id="for-you"
      className="bg-[--bg-soft] px-6 py-24 sm:px-10 sm:py-32 lg:px-16"
    >
      <div className="mx-auto max-w-[1200px]">
        <h2
          className="reveal mb-3 max-w-[900px] font-bold leading-[1.05] tracking-[-0.01em] text-ink"
          style={{ fontSize: 'clamp(30px, 6.5vw, 64px)' }}
        >
          哪些人适合用
        </h2>
        <p className="reveal reveal-delay-1 mb-14 max-w-[640px] text-base text-[--ink-soft]">
          英语视频学习场景里最常见的 4 类人 —— 看看自己在不在其中。
        </p>

        <div className="reveal reveal-delay-2 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PERSONAS.map((p) => (
            <div
              key={p.title}
              className="flex flex-col rounded-xl border border-[--hairline] bg-[--bg-elev] p-7 transition-all duration-200 hover:-translate-y-1 hover:border-white/[0.14]"
            >
              <p.Icon className="mb-5 h-7 w-7 text-accent" strokeWidth={1.75} />
              <h3 className="mb-2 text-xl font-semibold leading-tight text-ink">
                {p.title}
              </h3>
              <p className="mb-5 flex-1 text-sm leading-relaxed text-[--ink-soft]">
                {p.desc}
              </p>
              <p className="border-t border-[--hairline] pt-4 font-mono text-xs leading-relaxed text-[--ink-faint]">
                {p.moment}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
