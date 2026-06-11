import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const QUICK_TAGS = [
  { label: 'NOA 与 LCC 区别？',      q: '请解释高速 NOA 与普通 LCC 的核心差异' },
  { label: 'BEV+Transformer 原理',  q: '请通俗解释 BEV+Transformer 在感知中的作用' },
  { label: 'ODD 运行设计域',        q: '什么是 ODD？它如何影响功能安全？' },
  { label: '接管责任如何划分？',    q: 'L2 辅助驾驶下的事故责任如何划分？' },
];

export default function QuickAskSection() {
  const [q, setQ] = useState('');
  const nav = useNavigate();
  const submit = (text: string) => {
    const v = (text || q).trim();
    if (!v) return;
    nav(`/qna?q=${encodeURIComponent(v)}`);
  };

  return (
    <section className="max-w-7xl mx-auto px-5 lg:px-8 py-16">
      <div className="grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <div className="text-xs font-medium text-neon-300 tracking-[0.25em] mb-2">QUICK ASK</div>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            把任何智驾问题交给 AI
          </h2>
          <p className="mt-3 text-ink-400 text-sm max-w-md">
            基于六大维度（技术 / 产品 / 安全 / 体验 / 商业 / 场景）结构化作答，并附引用与延伸阅读。
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {QUICK_TAGS.map((t) => (
              <button
                key={t.label}
                onClick={() => submit(t.q)}
                className="px-3 py-1.5 text-xs rounded-full
                           border border-ink-700 bg-ink-900/60 text-ink-200
                           hover:border-neon-400/60 hover:text-neon-200 transition-colors"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); submit(q); }}
          className="relative glass-panel p-2 flex items-center"
        >
          <span className="pl-3 pr-2 text-neon-400">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="例如：城市 NOA 和高速 NOA 的 OOD 边界差异？"
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-ink-500 py-3"
          />
          <button type="submit" className="btn-primary text-sm">提问</button>
        </form>
      </div>
    </section>
  );
}
