import { useState } from 'react';

interface Step {
  id:      number;
  title:   string;
  time:    string;       // 模拟时间
  speed:   number;       // km/h
  acc:     number;       // m/s²
  events:  string[];
  state:   'CRUISE' | 'LANE_CHANGE' | 'TAKEOVER_REQ' | 'EMERGENCY' | 'OFF';
  risk:    'low' | 'mid' | 'high';
}

const STEPS: Step[] = [
  { id: 1, title: '起始巡航', time: '00:00', speed: 105, acc: 0,   state: 'CRUISE',  risk: 'low',
    events: ['自车位于车道中央', '前车距离 80m', 'LDW / LKA 正常'] },
  { id: 2, title: '前车减速', time: '00:08', speed: 95,  acc: -1.2, state: 'CRUISE', risk: 'low',
    events: ['前车速度降至 80km/h', 'ACC 主动跟随', '保持 2.0s 时距'] },
  { id: 3, title: '相邻车道空旷', time: '00:15', speed: 95,  acc: 0,  state: 'LANE_CHANGE', risk: 'mid',
    events: ['系统发起变道评估', '左后车距 60m', '请求变道', '驾驶员确认通过'] },
  { id: 4, title: '施工占道预警', time: '00:25', speed: 80,  acc: -2, state: 'TAKEOVER_REQ', risk: 'high',
    events: ['前方 150m 检测到施工锥桶', 'ODD 越界风险升高', '系统提示接管', 'HMI 警示 + 语音 + 触觉'] },
  { id: 5, title: '退出 ODD', time: '00:32', speed: 60,  acc: -3, state: 'OFF', risk: 'high',
    events: ['驾驶员未在 6s 内响应', '系统进入 MRM', '减速至 40km/h', '双闪 + 鸣笛'] },
];

const STATE_TONE: Record<Step['state'], string> = {
  CRUISE:       'bg-cyan-500/15 text-cyan-200 border-cyan-500/30',
  LANE_CHANGE:  'bg-violet-500/15 text-violet-200 border-violet-500/30',
  TAKEOVER_REQ: 'bg-amber-500/15 text-amber-200 border-amber-500/30',
  EMERGENCY:    'bg-red-500/15 text-red-200 border-red-500/30',
  OFF:          'bg-slate-500/15 text-slate-200 border-slate-500/30',
};

const STATE_LABEL: Record<Step['state'], string> = {
  CRUISE: '巡航', LANE_CHANGE: '变道中', TAKEOVER_REQ: '请求接管', EMERGENCY: '紧急制动', OFF: '退出',
};

export default function HighwayNoa() {
  const [idx, setIdx] = useState(0);
  const s = STEPS[idx];

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-6">
      {/* 场景示意 */}
      <div className="glass-panel p-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">高速 NOA · 接近施工区</h3>
            <p className="text-sm text-ink-400 mt-1">模拟一段 35 秒的连续事件流，包含巡航 / 变道 / 接管请求 / MRM 兜底</p>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full border ${STATE_TONE[s.state]}`}>
            当前：{STATE_LABEL[s.state]}
          </span>
        </div>

        {/* 简易 top-down 场景图 */}
        <ScenarioMap step={s} />

        {/* 时间轴 */}
        <ol className="space-y-2">
          {STEPS.map((st, i) => (
            <li key={st.id}>
              <button
                onClick={() => setIdx(i)}
                className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border transition-colors
                            ${i === idx
                              ? 'border-neon-400 bg-neon-400/5'
                              : 'border-ink-800 hover:border-ink-600'}`}
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono
                                  ${i === idx ? 'bg-neon-400 text-ink-950' : 'bg-ink-800 text-ink-300'}`}>
                  {st.id}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{st.title}</div>
                  <div className="text-[11px] text-ink-500 mt-0.5 truncate">{st.events.join(' · ')}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] text-ink-500">{st.time}</div>
                  <div className="text-xs font-mono text-ink-200">{st.speed}km/h</div>
                </div>
              </button>
            </li>
          ))}
        </ol>
      </div>

      {/* 侧栏：参数 + 分析 */}
      <aside className="space-y-4">
        <div className="glass-panel p-5">
          <h4 className="text-sm font-semibold text-neon-300 mb-3">当前状态</h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <Stat label="速度" value={`${s.speed}`} unit="km/h" />
            <Stat label="加速度" value={`${s.acc}`} unit="m/s²" />
            <Stat label="状态" value={STATE_LABEL[s.state]} />
            <Stat label="风险" value={s.risk === 'low' ? '低' : s.risk === 'mid' ? '中' : '高'}
                  tone={s.risk === 'high' ? 'red' : s.risk === 'mid' ? 'amber' : 'emerald'} />
          </div>
        </div>

        <div className="glass-panel p-5">
          <h4 className="text-sm font-semibold text-amber-300 mb-3">⚠️ 系统视角</h4>
          <ul className="space-y-2 text-xs text-ink-300">
            {s.events.map((e) => (
              <li key={e} className="flex gap-1.5">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-amber-400 shrink-0" />
                {e}
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-panel p-5">
          <h4 className="text-sm font-semibold text-violet-300 mb-3">🧠 思考题</h4>
          <ul className="space-y-2 text-xs text-ink-300">
            <li>· ODD 越界后，<b>10s</b> 内应如何降级？</li>
            <li>· MRM（最小风险策略）触发条件？</li>
            <li>· 该场景 ODD 应如何重新定义？</li>
          </ul>
        </div>
      </aside>

      {/* 全宽：关注点 + 问题解析 */}
      <div className="lg:col-span-2 grid lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6">
          <h4 className="text-sm font-semibold text-amber-300 mb-3">🎯 工程关注点</h4>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { l: 'ODD 越界检测',     d: '施工区距离 / 锥桶识别 / 车道线丢失三重判断', n: 'high' },
              { l: 'MRM 触发时序',     d: '减速梯度、危险灯、HMI 同步',                    n: 'high' },
              { l: '驾驶员接管准备度', d: 'DMS 检测 + 双手 + 视线 + 心率多模态',          n: 'high' },
              { l: '系统降级平顺性',   d: '避免急刹引发后车追尾',                          n: 'mid'  },
              { l: '决策可解释性',     d: '为什么选 MRM 而不是立即退出',                  n: 'mid'  },
              { l: '事故后 DSSAD',     d: '事件前后 30s 完整留痕',                         n: 'mid'  },
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
              { q: 'AEB 触发条件 vs MRM 触发条件是什么？',
                a: 'AEB 用于"即将发生碰撞"（TTC < 1.5s）；MRM 用于"系统不能继续执行动态驾驶任务"（ODD 越界 + 驾驶员无响应）。' },
              { q: '为什么 MRM 不直接靠边停车？',
                a: '高速场景下靠边需要横跨车道，反而可能引发侧向碰撞；MRM 选择"减速 + 危险灯 + 鸣笛"是更保守的策略。' },
              { q: 'ODD 越界后系统能维持多久？',
                a: '一般预留 6~10s 响应时间；超过则进入 MRM。具体取决于法规（UN-R157 规定 10s）和车企设计余量。' },
              { q: '如果驾驶员在 5s 内接管，是否能继续 NOA？',
                a: '可以，但需要重新校准 DMS（确保驾驶员已恢复注意力），并对当前 ODD 重新评估。' },
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

function Stat({ label, value, unit, tone = 'cyan' }: { label: string; value: string | number; unit?: string; tone?: 'cyan' | 'red' | 'amber' | 'emerald' }) {
  const TONE: Record<string, string> = {
    cyan: 'text-cyan-300', red: 'text-red-300', amber: 'text-amber-300', emerald: 'text-emerald-300',
  };
  return (
    <div>
      <div className="text-ink-500">{label}</div>
      <div className={`mt-0.5 font-mono ${TONE[tone]}`}>
        {value}{unit && <span className="text-ink-400 text-[10px] ml-0.5">{unit}</span>}
      </div>
    </div>
  );
}

function ScenarioMap({ step }: { step: Step }) {
  return (
    <div className="relative w-full aspect-[16/7] rounded-2xl bg-ink-950/70 border border-ink-800 overflow-hidden">
      <div className="absolute inset-0 bg-grid-dark bg-grid opacity-30" />
      {/* 道路 */}
      <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-20 bg-ink-900/60">
        <div className="absolute inset-y-0 left-0 right-0 flex items-center">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex-1 h-0.5 mx-3 bg-ink-700" />
          ))}
        </div>
      </div>
      {/* 自车 */}
      <div className="absolute" style={{ left: `${10 + step.id * 8}%`, top: '50%', transform: 'translate(-50%, -50%)' }}>
        <div className="w-14 h-7 rounded-md bg-gradient-to-br from-neon-400 to-indigo-500 shadow-glow-sm" />
        <div className="mt-1 text-center text-[10px] font-mono text-neon-200">{step.speed}km/h</div>
      </div>
      {/* 前车 */}
      {step.id >= 2 && (
        <div className="absolute" style={{ left: `${20 + step.id * 8}%`, top: '50%', transform: 'translate(-50%, -50%)' }}>
          <div className="w-12 h-6 rounded-md bg-ink-600" />
        </div>
      )}
      {/* 变道目标车 */}
      {step.state === 'LANE_CHANGE' && (
        <div className="absolute" style={{ left: `${30}%`, top: '20%', transform: 'translate(-50%, -50%)' }}>
          <div className="w-12 h-6 rounded-md bg-amber-700/60" />
        </div>
      )}
      {/* 施工锥桶 */}
      {step.id >= 4 && (
        <>
          <div className="absolute" style={{ left: '70%', top: '50%', transform: 'translate(-50%, -50%)' }}>
            <div className="text-2xl">🚧</div>
          </div>
          <div className="absolute" style={{ left: '70%', top: '20%', transform: 'translate(-50%, -50%)' }}>
            <div className="w-12 h-6 rounded-md bg-amber-700/60" />
          </div>
        </>
      )}

      <div className="absolute top-2 left-3 text-[10px] text-ink-500">ODD: 高速 / 白天 / 良好天气</div>
      <div className="absolute top-2 right-3 text-[10px] text-ink-500">T+{step.time}</div>
    </div>
  );
}
