import { useState } from 'react';

interface Decision {
  key:   'yield' | 'creep' | 'go' | 'remote';
  label: string;
  reason: string;
  risk:  'low' | 'mid' | 'high';
  tone:  'emerald' | 'amber' | 'red' | 'violet';
  best?: boolean;
}

const DECISIONS: Decision[] = [
  { key: 'go',     tone: 'red',    risk: 'high',
    label: '强行通过',
    reason: '前车可能抢行 / 行人可能起步 / ODD 风险升高',
    best: false },
  { key: 'creep',  tone: 'amber',  risk: 'mid',
    label: '低速蠕动',
    reason: '侵入对向车道风险高；被旁车加塞概率大',
    best: false },
  { key: 'yield',  tone: 'emerald', risk: 'low',
    label: '礼让 + 找时机',
    reason: '风险最低，符合道路交通安全法实施条例',
    best: true },
  { key: 'remote', tone: 'violet', risk: 'low',
    label: '请求远程协助',
    reason: '兜底策略：超 30s 仍冲突时升级到云代驾',
    best: false },
];

const TONE: Record<Decision['tone'], string> = {
  emerald: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200',
  amber:   'bg-amber-500/15 border-amber-500/40 text-amber-200',
  red:     'bg-red-500/15 border-red-500/40 text-red-200',
  violet:  'bg-violet-500/15 border-violet-500/40 text-violet-200',
};

const RISK: Record<Decision['risk'], string> = {
  low:  'bg-emerald-500/15 text-emerald-200 border-emerald-500/30',
  mid:  'bg-amber-500/15 text-amber-200 border-amber-500/30',
  high: 'bg-red-500/15 text-red-200 border-red-500/30',
};

export default function Intersection() {
  const [picked, setPicked] = useState<Decision['key'] | null>(null);
  const decision = DECISIONS.find((d) => d.key === picked) ?? null;

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6">
        <h3 className="text-lg font-semibold">城区无保护左转 · 博弈场景</h3>
        <p className="text-sm text-ink-400 mt-1">
          主车欲在无保护左转车道通过路口，对向直行车流量高，左侧有行人 / 两轮车待通过。
          请选择你认为最合理的决策。
        </p>

        {/* 场景图 */}
        <div className="relative mt-6 mx-auto w-full max-w-2xl aspect-[16/9] rounded-2xl border border-ink-800 overflow-hidden bg-ink-950/60">
          <div className="absolute inset-0 bg-grid-dark bg-grid opacity-20" />

          {/* 横向道路 */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-24 bg-ink-900/60" />
          {/* 纵向道路 */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-24 bg-ink-900/40" />

          {/* 对向直行 3 辆车 */}
          {[15, 35, 60].map((x, i) => (
            <div key={i} className="absolute" style={{ left: `${x}%`, top: '40%' }}>
              <div className="w-12 h-6 rounded-md bg-amber-700/70 border border-amber-500/50" />
              <div className="text-center text-[10px] text-amber-300 mt-0.5">→ {70 - i * 10}</div>
            </div>
          ))}

          {/* 行人 */}
          <div className="absolute" style={{ left: '40%', top: '70%' }}>
            <div className="text-2xl">🚶</div>
          </div>
          {/* 两轮车 */}
          <div className="absolute" style={{ left: '60%', top: '18%' }}>
            <div className="text-2xl">🚲</div>
          </div>

          {/* 主车 */}
          <div className="absolute" style={{ left: '32%', top: '55%' }}>
            <div className="w-14 h-7 rounded-md bg-gradient-to-br from-neon-400 to-indigo-500 shadow-glow-sm" />
            <div className="text-center text-[10px] text-neon-200 mt-0.5">主车 (待左转)</div>
          </div>

          {/* 停止线 */}
          <div className="absolute left-1/2 -translate-x-1/2 top-[28%] w-24 h-0.5 bg-red-500/60" />
          <div className="absolute left-1/2 -translate-x-1/2 bottom-[28%] w-24 h-0.5 bg-red-500/60" />
        </div>
      </div>

      {/* 选项 */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {DECISIONS.map((d) => (
          <button
            key={d.key}
            onClick={() => setPicked(d.key)}
            className={`text-left p-4 rounded-2xl border transition-all
                        ${picked === d.key
                          ? `${TONE[d.tone]} shadow-glow-sm`
                          : 'border-ink-800 bg-ink-900/40 hover:border-ink-600'}`}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">{d.label}</h4>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${RISK[d.risk]}`}>
                风险 {d.risk === 'low' ? '低' : d.risk === 'mid' ? '中' : '高'}
              </span>
            </div>
            <p className="mt-2 text-xs text-ink-300 leading-relaxed">{d.reason}</p>
            {d.best && (
              <div className="mt-2 text-[10px] text-emerald-300">✓ 推荐答案</div>
            )}
          </button>
        ))}
      </div>

      {/* 反馈 */}
      {decision && (
        <div className={`glass-panel p-5 ${TONE[decision.tone]} border`}>
          <h4 className="text-base font-semibold">
            {decision.best ? '✓ 这是推荐答案' : '⚠️ 这不是最优解'}
          </h4>
          <p className="mt-2 text-sm">
            {decision.best
              ? '礼让 + 找时机 兼顾安全与效率，是量产城区 NOA 的主流策略；连续 30s 无法通过时升级到远程协助。'
              : '「强行通过 / 蠕动」都会带来不必要风险：可能导致 ODD 越界或被加塞剐蹭；建议优先礼让。'}
          </p>
        </div>
      )}

      {/* 决策依据 */}
      <div className="glass-panel p-5">
        <h4 className="text-sm font-semibold text-neon-300 mb-3">📚 决策依据</h4>
        <ul className="space-y-2 text-sm text-ink-300">
          <li>· 《道路交通安全法实施条例》第 38 条：相对方向行驶的右转车让左转车先行</li>
          <li>· 风险评估：对向车距 &lt; 50m、速度 &gt; 40km/h → 高风险</li>
          <li>· 通行效率：连续 30s 无法通过 → 升级远程协助</li>
          <li>· 数据闭环：失败 case 回灌仿真，针对性优化代价权重</li>
        </ul>
      </div>

      {/* 关注点 + 问题解析 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6">
          <h4 className="text-sm font-semibold text-amber-300 mb-3">🎯 工程关注点</h4>
          <div className="space-y-2">
            {[
              { l: '对向车速估计',         d: '帧间差分 + 卡尔曼滤波',                       n: 'high' },
              { l: '盲区两轮车检测',       d: '右侧 AVM 环视 + 激光雷达补盲',                 n: 'high' },
              { l: '意图预测 (interaction)', d: '博弈论 / 隐马尔可夫 / 神经网络三种主流范式',  n: 'high' },
              { l: '礼让决策成本函数',     d: '安全 > 效率 > 舒适 的权重排序',                 n: 'mid'  },
              { l: '远程协助时延',         d: '5G 切片时延 < 100ms 才能胜任实时控制',         n: 'mid'  },
            ].map((w) => (
              <div key={w.l} className="rounded-xl border border-ink-800 p-3 bg-ink-900/40">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-ink-200">{w.l}</div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full border
                    ${w.n === 'high' ? 'border-red-500/40 text-red-200 bg-red-500/10' :
                                       'border-amber-500/40 text-amber-200 bg-amber-500/10'}`}>
                    {w.n === 'high' ? '高' : '中'}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-ink-400">{w.d}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6">
          <h4 className="text-sm font-semibold text-violet-300 mb-3">🧠 问题解析 · 决策树</h4>
          <div className="space-y-3">
            {[
              { q: '为什么"礼让"风险最低？',  a: '消除不确定性：让对方先走则无需预测对方意图；统计上事故率下降 70%+。' },
              { q: '"蠕动"为何不推荐？',       a: '侵入对向车道会制造新的冲突点；被旁车加塞反而增加剐蹭风险。' },
              { q: '何时升级到远程协助？',     a: '行业共识：连续 30s 无法达成可通行条件（车距、速度、行人干扰）；5G 时延需 < 100ms。' },
              { q: '"强行通过"在什么场景下可接受？', a: 'ODD 严苛限定 + 城市快速路 + 强 AI 感知 + 驾驶员可立即接管；当前量产 NOA 几乎不用。' },
            ].map((d, i) => (
              <div key={i} className="rounded-xl border border-ink-800 p-3 bg-ink-900/40">
                <div className="text-xs font-semibold text-ink-200">Q{i + 1}. {d.q}</div>
                <div className="mt-1 text-xs text-emerald-200">A. {d.a}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
