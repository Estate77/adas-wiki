interface Path {
  vendor: string;
  tone:   'cyan' | 'red' | 'amber' | 'blue' | 'violet' | 'emerald';
  label:  string;
  steps:  string[];
  core:   string;
}

const PATHS: Path[] = [
  { vendor: '特斯拉', tone: 'red', label: 'BEV → Occupancy → E2E',
    steps: ['BEV 感知（多相机融合）', 'Occupancy Network', '端到端 One Model', 'VLM 接管（规划层）'],
    core: '依赖数据规模 + 算力自研 + 影子模式闭环' },
  { vendor: '小鹏',   tone: 'cyan', label: 'XNet 2.0 + 图灵芯片',
    steps: ['BEV + Transformer 感知', 'XPlanner 规控大模型', 'XBrain 端到端', 'VLM 长尾接管'],
    core: '云端大模型 + 车端轻量化部署' },
  { vendor: '华为',   tone: 'amber', label: 'GOD / RCR 网络',
    steps: ['GOD 2.0 (General Obstacle Detection)', 'RCR 2.0 (Road Cognition & Reasoning)', '端到端规划', 'CAS 3.0 主动安全'],
    core: '多传感器融合 + 道路拓扑推理' },
  { vendor: '蔚来',   tone: 'blue', label: 'NADArch + World Model',
    steps: ['BEV + 多任务感知', '强化学习规划', '世界模型训练', '主动安全 NAD Safety'],
    core: '换电 + 智驾联动 + 高端体验' },
  { vendor: '理想',   tone: 'violet', label: 'AD Max E2E',
    steps: ['端到端感知 + 规划', 'VLM 介入', 'MindGPT 车端助理', 'AEB 自动紧急转向'],
    core: '家庭场景优先 + VLM 长尾' },
  { vendor: '比亚迪', tone: 'emerald', label: '天神之眼 A / B / C',
    steps: ['基线 L2 辅助驾驶', '进阶 NOA', '端到端高阶方案', '阶梯式覆盖 7~30 万车型'],
    core: '规模化下沉 + 自研芯片' },
];

const TONE: Record<Path['tone'], string> = {
  cyan:    'border-cyan-500/40',
  red:     'border-red-500/40',
  amber:   'border-amber-500/40',
  blue:    'border-blue-500/40',
  violet:  'border-violet-500/40',
  emerald: 'border-emerald-500/40',
};

const DOT: Record<Path['tone'], string> = {
  cyan: 'bg-cyan-400', red: 'bg-red-400', amber: 'bg-amber-400',
  blue: 'bg-blue-400', violet: 'bg-violet-400', emerald: 'bg-emerald-400',
};

export default function AlgorithmPath() {
  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-4">
        {PATHS.map((p) => (
          <div key={p.vendor} className={`glass-panel p-5 border-l-4 ${TONE[p.tone]}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-2.5 h-2.5 rounded-full ${DOT[p.tone]}`} />
              <h3 className="text-base font-semibold">{p.vendor}</h3>
              <span className="ml-auto text-xs text-ink-400">{p.label}</span>
            </div>

            {/* 演进图 */}
            <ol className="mt-3 space-y-2">
              {p.steps.map((s, i) => (
                <li key={s} className="flex items-center gap-2 text-sm text-ink-200">
                  <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono
                                    ${i === p.steps.length - 1 ? 'bg-neon-400 text-ink-950' : 'bg-ink-800 text-ink-300'}`}>
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>

            <div className="mt-3 pt-3 border-t border-ink-800 text-xs text-ink-400">
              核心策略：<b className="text-ink-200">{p.core}</b>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-panel p-6">
        <h3 className="text-base font-semibold text-neon-300">🔍 共识与分歧</h3>
        <div className="mt-3 grid sm:grid-cols-2 gap-3 text-sm text-ink-300">
          <div>
            <div className="text-cyan-300 text-xs mb-1">行业共识</div>
            <p>· BEV + Transformer 统一感知<br/>· 端到端是 2025 后量产主旋律<br/>· 算力军备竞赛白热化</p>
          </div>
          <div>
            <div className="text-amber-300 text-xs mb-1">关键分歧</div>
            <p>· 纯视觉 vs 多传感器融合<br/>· 自研芯片 vs 外购 SoC<br/>· 高精地图 vs 无图方案</p>
          </div>
        </div>
      </div>
    </div>
  );
}
