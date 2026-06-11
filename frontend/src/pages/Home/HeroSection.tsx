import { Link } from 'react-router-dom';
import { useMouseParallax, useScrollProgress } from '@/hooks/useParallax';
import { useTypewriter } from '@/hooks/useTypewriter';
import { SLOGAN } from '@/constants';

/**
 * 首页 Hero：视差滚动背景 + 打字机标语 + 鼠标视差浮动元素
 */
export default function HeroSection() {
  const scroll = useScrollProgress(1);
  const mouse  = useMouseParallax();
  const { text: typed, done } = useTypewriter(SLOGAN, 55);

  return (
    <section className="relative isolate overflow-hidden min-h-[100svh] flex items-center">
      {/* 背景层：径向渐变 + 网格 + 光晕 */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(56,189,248,0.20), transparent 60%),' +
              'radial-gradient(ellipse 60% 50% at 80% 100%, rgba(129,140,248,0.18), transparent 60%),' +
              'linear-gradient(180deg, #020617 0%, #0F172A 50%, #020617 100%)',
          }}
        />
        {/* 网格层：视差 0.6 速度，循环漂移 */}
        <div
          className="absolute inset-0 bg-grid-dark bg-grid animate-grid mask-fade-b opacity-50"
          style={{ transform: `translate3d(${mouse.x * 8}px, ${scroll * 60}px, 0)` }}
        />
        {/* 顶部光晕 */}
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[80rem] h-[40rem] rounded-full
                     bg-gradient-to-b from-neon-400/20 to-transparent blur-3xl"
          style={{ transform: `translate(-50%, ${scroll * -80}px)` }}
        />
      </div>

      {/* 浮动装饰元素（鼠标视差） */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div
          className="absolute top-[18%] left-[8%] w-2 h-2 rounded-full bg-neon-400 animate-float"
          style={{ transform: `translate3d(${mouse.x * 20}px, ${mouse.y * 20 + scroll * 30}px, 0)` }}
        />
        <div
          className="absolute top-[28%] right-[12%] w-3 h-3 rounded-full bg-indigo-400/80 animate-float [animation-delay:1.2s]"
          style={{ transform: `translate3d(${mouse.x * -30}px, ${mouse.y * 30 + scroll * 50}px, 0)` }}
        />
        <div
          className="absolute bottom-[24%] left-[18%] w-1.5 h-1.5 rounded-full bg-pink-400 animate-float [animation-delay:0.6s]"
          style={{ transform: `translate3d(${mouse.x * 25}px, ${mouse.y * -15 + scroll * -20}px, 0)` }}
        />
        <div
          className="absolute bottom-[30%] right-[22%] w-2 h-2 rounded-full bg-emerald-400 animate-float [animation-delay:2s]"
          style={{ transform: `translate3d(${mouse.x * -18}px, ${mouse.y * 22 + scroll * 40}px, 0)` }}
        />
      </div>

      {/* 主内容 */}
      <div className="relative max-w-7xl mx-auto px-5 lg:px-8 w-full py-28 lg:py-40">
        <div
          className="max-w-4xl"
          style={{ transform: `translate3d(0, ${scroll * -40}px, 0)` }}
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs
                           border border-neon-400/30 bg-neon-400/5 text-neon-300
                           animate-fade-up">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-400 animate-pulse" />
            ADAS Knowledge Graph · 2026
          </span>

          <h1 className="mt-6 text-display text-white">
            <span className="block">用最简单的方式，</span>
            <span className="block text-gradient">看懂最硬核的智能驾驶</span>
          </h1>

          {/* 打字机区域 */}
          <p className="mt-6 text-base sm:text-lg text-ink-200/90 leading-relaxed-pro max-w-2xl h-7">
            <span>{typed}</span>
            <span
              className={`inline-block w-[2px] h-5 align-middle bg-neon-400 ml-1 ${
                done ? 'animate-caret' : 'animate-caret'
              }`}
            />
          </p>

          <p className="mt-4 text-ink-400 leading-relaxed-pro max-w-2xl">
            从激光雷达到规控算法，从 UN-R157 到 ISO 26262。
            我们用通俗语言、可视化图谱与 AI 问答，
            为你搭建一个从零到一的全景式智驾知识库。
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/qna" className="btn-primary">
              开始 AI 问答
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link to="/graph" className="btn-ghost">浏览全景图谱</Link>
            <Link to="/interview" className="btn-ghost">进入面试题库</Link>
          </div>

          {/* 数据展示条 */}
          <div className="mt-16 grid grid-cols-3 max-w-lg gap-6 text-center sm:text-left">
            {[
              { num: '1,200+', label: '知识条目' },
              { num: '6',      label: '能力维度' },
              { num: '24/7',   label: 'AI 答疑' },
            ].map((it) => (
              <div key={it.label} className="border-l border-ink-800 first:border-l-0 pl-5 first:pl-0 sm:border-l sm:first:border-l-0">
                <div className="text-2xl font-semibold text-white">{it.num}</div>
                <div className="text-xs text-ink-400 mt-1 tracking-widest">{it.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 向下滚动提示 */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-ink-500 text-xs tracking-widest"
        style={{ opacity: 1 - scroll * 2 }}
      >
        <span className="block w-px h-8 mx-auto bg-gradient-to-b from-ink-500 to-transparent animate-float" />
        SCROLL
      </div>
    </section>
  );
}
