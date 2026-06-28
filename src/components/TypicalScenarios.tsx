'use client';

import { Clapperboard, MessageCircle, NotebookPen, Popcorn, Quote } from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';

/**
 * "他们这样用 whatSub" — social-proof-by-scenario section. Sits AFTER
 * CombinedPricing (so the price has been seen) and BEFORE FAQ (so the
 * scenarios warm the buyer up to read the remaining concerns). Designed
 * to give the conversion lift of a testimonial wall while staying
 * honest:
 *
 *  - NO real names, NO photos, NO made-up initials that masquerade as
 *    real people
 *  - Attribution slot at card bottom carries the persona CATEGORY
 *    (刷剧党 / 内容创作者 / 口语练习者 / 备考党) + an explicit
 *    "典型场景" tag, so a reader who looks carefully understands this
 *    is a representative use case, not "User X said this"
 *  - Scenario text describes specific, real product behavior (yt-dlp
 *    multi-platform import, AI 标黄, SRT 导出, 角色扮演 voice, 划词收藏,
 *    云端语料库) — every claim maps to a feature whatSub actually ships
 *
 * The 4 scenarios are paired 1:1 with the 4 personas from
 * AudiencePersonas above, so a visitor who self-identified with a
 * persona earlier sees how that exact persona uses the product here.
 *
 * Layout: 2x2 on lg+, 1-col on mobile — more airy than the 4-col
 * persona grid so the longer scenario text breathes. Quote icon at
 * top-left of each card for visual rhythm.
 */

interface Scenario {
  Icon: typeof Popcorn;
  persona: string;
  text: string;
}

const SCENARIOS: Scenario[] = [
  {
    Icon: Popcorn,
    persona: '刷剧党',
    text: '每天通勤地铁 30 分钟,从无脑刷剧变成顺手攒生词。看完一集 SUITS,把 5 个律师场景的地道短语收进语料库。半年下来,词汇本攒了 800+ 条,大部分都听得懂、记得住。',
  },
  {
    Icon: Clapperboard,
    persona: '内容创作者',
    text: '做英语教学视频时最头疼字幕环节——以前要么靠 yt-dlp 命令行,要么靠剪映自动字幕(错得离谱)。现在 whatSub 桌面端一键解析 + AI 标重点,导出 SRT 直接拖进 PR,后期省一半时间。',
  },
  {
    Icon: MessageCircle,
    persona: '口语练习者',
    text: '想练真实场景对话却找不到对手。挑《The Office》里 Michael 那段经典演讲抠出来,用角色扮演跟 AI 反复练。两周下来,语调和停顿都对得上了,实战开口不再卡壳。',
  },
  {
    Icon: NotebookPen,
    persona: '考研 / 雅思 / 托福备考',
    text: '雅思冲 7.5,听力是短板。以前刷 YouTube 看 BBC 6 Minute English,听完就忘。现在每集 AI 精讲 + 划词收藏,一个月攒了 200+ 高频学术表达,听力 part 4 不再慌。',
  },
];

export function TypicalScenarios() {
  const ref = useReveal<HTMLElement>();

  return (
    <section
      ref={ref}
      id="typical-scenarios"
      className="bg-[--bg-soft] px-6 py-24 sm:px-10 sm:py-32 lg:px-16"
    >
      <div className="mx-auto max-w-[1200px]">
        <h2
          className="reveal mb-3 max-w-[900px] font-bold leading-[1.05] tracking-[-0.01em] text-ink"
          style={{ fontSize: 'clamp(30px, 6.5vw, 64px)' }}
        >
          他们<span className="text-accent">这样用</span> whatSub
        </h2>
        <p className="reveal reveal-delay-1 mb-14 max-w-[680px] text-base text-[--ink-soft]">
          4 类用户最典型的使用场景 —— 看看哪一种最像你日常想做的事。
        </p>

        <div className="reveal reveal-delay-2 grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
          {SCENARIOS.map((s) => (
            <div
              key={s.persona}
              className="flex flex-col rounded-2xl border border-[--hairline] bg-[--bg-elev] p-8 transition-colors hover:border-white/[0.14]"
            >
              <Quote
                className="mb-4 h-5 w-5 text-accent/70"
                strokeWidth={2}
                aria-hidden="true"
              />
              <p className="mb-7 flex-1 text-[15px] leading-[1.7] text-[--ink-soft]">
                {s.text}
              </p>
              <div className="flex items-center gap-3 border-t border-[--hairline] pt-5">
                <s.Icon
                  className="h-5 w-5 shrink-0 text-accent"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <div className="flex flex-1 flex-wrap items-center gap-x-2">
                  <span className="text-sm font-semibold text-ink">
                    {s.persona}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[--ink-faint]">
                    · 典型场景
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
