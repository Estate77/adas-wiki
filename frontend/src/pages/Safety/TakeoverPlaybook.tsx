interface Phase {
  stage:  string;
  title:  string;
  duration: string;
  action: string;
  ui:     string[];
  tone:   'cyan' | 'amber' | 'red' | 'violet';
}

const PHASES: Phase[] = [
  { stage: 'P0', tone: 'cyan', title: '正常运行', duration: '0~10s 风险窗口',
    action: '正常 L2 / L3 辅助驾驶',
    ui: ['仪表 NOA 状态显示', '车道线蓝色高亮', '无主动提示'] },
  { stage: 'P1', tone: 'amber', title: '风险预警', duration: 'T-10s',
    action: '检测到接管风险，渐进提示',
    ui: ['仪表黄色「请接管」', '语音：「请立即接管车辆」', 'HMI 闪烁 + 触觉反馈'] },
  { stage: 'P2', tone: 'red', title: '紧急接管', duration: 'T-4s',
    action: '风险逼近，强提示 + 主动减速',
    ui: ['红色接管警告', '双闪自动开启', '制动预填充 30%', '鸣笛提示'] },
  { stage: 'P3', tone: 'violet', title: 'MRM 最小风险策略', duration: 'T+0',
    action: '驾驶员未响应，进入 MRM',
    ui: ['自动靠边停车', '打开双闪', '远端报警', 'DSSAD 记录全链路'] },
];

const TONE: Record<Phase['tone'], string> = {
  cyan:   'border-cyan-500/40 bg-cyan-500/10 text-cyan-200',
  amber:  'border-amber-500/40 bg-amber-500/10 text-amber-200',
  red:    'border-red-500/40 bg-red-500/10 text-red-200',
  violet: 'border-violet-500/40 bg-violet-500/10 text-violet-200',
};

export default function TakeoverPlaybook() {
  return (
    <div className="space-y-6">
      <div className="glass-panel p-6">
        <h3 className="text-lg font-semibold">接管机制：4 阶段渐进式设计</h3>
        <p className="text-sm text-ink-400 mt-1">从 P0 正常运行到 P3 MRM 兜底，每一阶段都有明确动作 + HMI 反馈。</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-4">
        {PHASES.map((p) => (
          <div key={p.stage} className={`rounded-2xl border p-5 ${TONE[p.tone]}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono">{p.stage}</span>
              <span className="text-[10px] text-ink-400">{p.duration}</span>
            </div>
            <h4 className="mt-2 text-base font-semibold">{p.title}</h4>
            <p className="mt-1.5 text-xs text-ink-300">{p.action}</p>
            <ul className="mt-3 space-y-1 text-xs text-ink-200">
              {p.ui.map((u) => (
                <li key={u} className="flex gap-1.5">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-current shrink-0" />
                  {u}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* 提示音与视觉标准 */}
      <div className="glass-panel p-6">
        <h3 className="text-base font-semibold text-neon-300">📐 HMI 多模态提示设计原则</h3>
        <ul className="mt-3 grid sm:grid-cols-2 gap-3 text-sm text-ink-300">
          <li>· <b>视觉</b>：仪表 / HUD + AR-HUD 同步显示，避免驾驶员视线偏离</li>
          <li>· <b>听觉</b>：分级提示音 + 语音命令，确保盲操有效</li>
          <li>· <b>触觉</b>：方向盘振动 / 安全带收紧作为「最后提醒」</li>
          <li>· <b>时序</b>：渐进式（视觉 → 听觉 → 触觉）不抢驾驶员注意力</li>
        </ul>
      </div>
    </div>
  );
}
