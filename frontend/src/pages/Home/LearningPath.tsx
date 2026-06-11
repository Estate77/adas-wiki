import { Link } from 'react-router-dom';

interface Step {
  phase: string;
  title: string;
  desc: string;
  link: { to: string; label: string };
  duration: string;
}

const STEPS: Step[] = [
  { phase: 'Step 01', duration: '1~2 天',
    title: '理解智驾分级与基本概念',
    desc: '从 SAE J3016 L0~L5 入手，区分 ADAS / NOA / FSD / Robotaxi 边界。',
    link: { to: '/safety', label: '查看 L0-L5 详解' } },
  { phase: 'Step 02', duration: '3~5 天',
    title: '建立「人-车-路-云」系统观',
    desc: '看懂车端硬件拓扑、域控制器架构、V2X 与云端数据闭环。',
    link: { to: '/graph', label: '查看全景图谱' } },
  { phase: 'Step 03', duration: '1~2 周',
    title: '掌握感知-融合-规控算法演进',
    desc: '从传统 CV → BEV → 端到端，理解范式迁移背后的驱动力。',
    link: { to: '/graph', label: '查看算法演进' } },
  { phase: 'Step 04', duration: '1 周',
    title: '场景与系统思维训练',
    desc: '通过高速 NOA、城区路口、极端天气等场景题，训练工程权衡能力。',
    link: { to: '/simulator', label: '进入场景模拟器' } },
  { phase: 'Step 05', duration: '持续',
    title: '产品 / 商业 / 竞品分析',
    desc: '对比主流车企方案，理解商业模式、用户体验与监管边界。',
    link: { to: '/competitor', label: '查看竞品拆解' } },
  { phase: 'Step 06', duration: '考前',
    title: '面试真题 + 模拟评测',
    desc: '按岗位刷高频真题，提交模拟面试得分，生成能力成长报告。',
    link: { to: '/interview', label: '查看面试题库' } },
];

export default function LearningPath() {
  return (
    <section className="max-w-7xl mx-auto px-5 lg:px-8 py-16">
      <div className="text-center mb-10">
        <div className="text-xs font-medium text-neon-300 tracking-[0.25em] mb-2">LEARNING PATH</div>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">零基础到入门 · 6 步学习路径</h2>
        <p className="mt-3 text-sm text-ink-400">由浅入深，每一步都对应具体的内容模块</p>
      </div>

      <div className="relative">
        {/* 引导线 */}
        <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-neon-400/50 via-indigo-400/30 to-transparent" />

        <ol className="space-y-8">
          {STEPS.map((s, i) => (
            <li
              key={s.phase}
              className={`relative flex flex-col sm:flex-row gap-5 sm:gap-10
                          ${i % 2 === 0 ? 'sm:items-start' : 'sm:flex-row-reverse sm:items-start'}`}
            >
              {/* 节点 */}
              <span className="absolute left-4 sm:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full
                               bg-gradient-to-br from-neon-400 to-indigo-500 shadow-glow-sm" />

              {/* 留白（保持中心对称） */}
              <div className="hidden sm:block sm:w-1/2" />

              {/* 卡片 */}
              <div className="pl-10 sm:pl-0 sm:w-1/2">
                <div className="glass-panel p-5 hover:border-neon-400/40 transition-colors">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-mono tracking-widest text-neon-300">{s.phase}</span>
                    <span className="text-[10px] text-ink-500">· {s.duration}</span>
                  </div>
                  <h3 className="text-base font-semibold">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-ink-400 leading-relaxed">{s.desc}</p>
                  <Link to={s.link.to} className="mt-3 inline-block text-xs text-neon-300 hover:text-neon-200">
                    {s.link.label} →
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
