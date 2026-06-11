import { Link } from 'react-router-dom';
import type { QuickNavItem } from '@/types';

const NAV: QuickNavItem[] = [
  {
    title: '功能问答',
    desc: 'AI 对话式智驾知识问答，支持流式输出与追问推荐。',
    to: '/qna',
    accent: 'from-neon-400/30 to-neon-400/0',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 12a8 8 0 1 1-3.2-6.4L21 4l-1 4-3.5.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 12h8M8 9h5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: '全景图谱',
    desc: '交互式节点图，覆盖感知、规控、座舱等核心模块。',
    to: '/graph',
    accent: 'from-indigo-400/30 to-indigo-400/0',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="6"  cy="6"  r="2.5" />
        <circle cx="18" cy="6"  r="2.5" />
        <circle cx="6"  cy="18" r="2.5" />
        <circle cx="18" cy="18" r="2.5" />
        <circle cx="12" cy="12" r="2.5" />
        <path d="M8 7l3 4M16 7l-3 4M8 17l3-4M16 17l-3-4" />
      </svg>
    ),
  },
  {
    title: '面试题库',
    desc: '按岗位/难度/知识点多维筛选，含参考答案与延伸阅读。',
    to: '/interview',
    accent: 'from-pink-400/30 to-pink-400/0',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="4" width="18" height="14" rx="2" />
        <path d="M8 21h8M12 18v3" strokeLinecap="round" />
        <path d="M7 9h10M7 13h6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: '场景模拟器',
    desc: '左侧参数 + 右侧动画 + 底部产品/算法双视角点评。',
    to: '/simulator',
    accent: 'from-emerald-400/30 to-emerald-400/0',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 12h3l2-5 4 10 3-7 2 2h4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: '安全与合规',
    desc: 'UN-R157、国内法规、功能安全 ISO 26262 等专题。',
    to: '/safety',
    accent: 'from-amber-400/30 to-amber-400/0',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3l8 3v6c0 4.5-3.4 8.4-8 9-4.6-.6-8-4.5-8-9V6l8-3z" strokeLinejoin="round" />
        <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: '竞品拆解',
    desc: '特斯拉 / 小鹏 / 华为 / 蔚来等方案横向对比。',
    to: '/competitor',
    accent: 'from-fuchsia-400/30 to-fuchsia-400/0',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 20h16M6 20V8l6-4 6 4v12" strokeLinejoin="round" />
        <path d="M9 12h6M9 16h6" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function QuickNav() {
  return (
    <section id="quick-nav" className="relative py-24 lg:py-32">
      {/* 顶部装饰 */}
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-ink-800 to-transparent" />

      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="flex items-end justify-between flex-wrap gap-6">
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-xs tracking-widest
                             text-neon-300 bg-neon-400/10 border border-neon-400/30">
              QUICK START
            </span>
            <h2 className="mt-5 text-title text-white">从你最感兴趣的地方开始</h2>
          </div>
          <p className="text-ink-400 max-w-md text-sm leading-relaxed-pro">
            六个核心入口，覆盖「问·看·练·演·知·比」全流程。
            鼠标悬停查看预览，点击直达对应模块。
          </p>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group relative overflow-hidden glass-panel p-6
                         transition-all duration-500
                         hover:-translate-y-1 hover:border-neon-400/40 hover:shadow-glow-sm"
            >
              {/* 渐变光斑 */}
              <div
                className={`absolute -top-12 -right-12 w-40 h-40 rounded-full
                            bg-gradient-to-br ${item.accent} blur-2xl
                            opacity-50 group-hover:opacity-100 transition-opacity duration-500`}
              />

              <div className="relative">
                <div className="w-11 h-11 rounded-xl border border-ink-700 bg-ink-900
                                flex items-center justify-center text-neon-300
                                group-hover:text-white group-hover:border-neon-400/60
                                transition-colors">
                  <span className="w-5 h-5 block">{item.icon}</span>
                </div>

                <h3 className="mt-5 text-lg font-semibold text-white flex items-center gap-2">
                  {item.title}
                  <svg
                    width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2"
                    className="text-ink-500 -translate-x-1 opacity-0
                               group-hover:translate-x-0 group-hover:opacity-100
                               group-hover:text-neon-300 transition-all duration-300"
                  >
                    <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </h3>
                <p className="mt-2 text-sm text-ink-400 leading-relaxed-pro">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
