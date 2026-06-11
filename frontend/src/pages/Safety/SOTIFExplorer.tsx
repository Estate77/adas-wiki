import { useState } from 'react';

interface Zone {
  id:     1 | 2 | 3 | 4;
  name:   string;
  desc:   string;
  color:  'red' | 'amber' | 'cyan' | 'emerald';
  bar:    number;        // 0~100
}

const ZONES: Zone[] = [
  { id: 1, name: '已知安全',     color: 'emerald', bar: 100, desc: '场景已被充分训练 + 仿真覆盖 + 实地测试，系统可安全运行' },
  { id: 2, name: '已知不安全',   color: 'red',     bar: 0,   desc: '场景已被识别为危险 → 系统应主动降级或拒绝执行' },
  { id: 3, name: '未知未知',     color: 'amber',   bar: 0,   desc: '未训练过的长尾场景，潜在风险最高，是 SOTIF 工作重点' },
  { id: 4, name: '已知未知',     color: 'cyan',    bar: 50,  desc: '已识别但未完全解决，通过 HMI 提示 / ODD 限缩降低风险' },
];

const TRIGGERS = [
  { t: '传感器退化',     d: '雨雾、眩光、镜头脏污 → 摄像头置信度 < 0.6' },
  { t: 'AI 误识别',       d: '把白色货车识别为天空（Tesla 2016 致命事故）' },
  { t: '训练分布外 (OOD)', d: '婚礼车队 / 农用车 / 异形目标' },
  { t: '对抗样本',         d: '贴纸欺骗车道线识别（学术研究热点）' },
  { t: '人机交互',         d: '驾驶员在提示 6s 内未响应' },
  { t: '多智能体博弈',     d: '对方车辆违规 → 防御性驾驶不足' },
  { t: '地图失配',         d: 'HD Map 过期 / 临时改道' },
  { t: '感知延迟',         d: '端到端时延 > 100ms 导致控制失效' },
];

const SOTIF_FLOW = [
  { step: 1, name: '触发条件识别', desc: '通过 HARA / STPA / FMEA-St 方法学识别触发条件', tool: 'STAMP / STPA' },
  { step: 2, name: '区域划分',     desc: '将触发条件分配到 SOTIF 4 个区域',             tool: 'Zone Mapping' },
  { step: 3, name: '验证策略',     desc: '封闭场地 + 仿真 + 影子模式三重验证',           tool: 'MiL/SiL/HiL' },
  { step: 4, name: '区域降级',     desc: '从区域 3 → 2 → 1，逐步降低剩余风险',           tool: 'Arg. 论据' },
  { step: 5, name: '释放评估',     desc: '通过 SOTIF 释放评审 + 认证机构签字',           tool: 'Audit' },
];

export default function SOTIFExplorer() {
  const [active, setActive] = useState<Zone['id']>(3);

  return (
    <div className="space-y-6">
      {/* SOTIF 介绍 */}
      <div className="glass-panel p-6">
        <h3 className="text-lg font-semibold">预期功能安全 SOTIF · ISO 21448</h3>
        <p className="text-sm text-ink-400 mt-1">
          SOTIF（Safety Of The Intended Functionality）解决的是"系统按设计工作，但因 AI/环境/交互仍可能造成危害"的问题。
          与 ISO 26262 形成"功能安全 + 预期安全"双轨认证体系，2024 年起欧盟 AI Act 强制要求。
        </p>

        <div className="mt-4 grid sm:grid-cols-3 gap-3 text-xs">
          {[
            { t: '覆盖场景', d: 'AI 触发条件 / 环境 / 人机交互', c: 'cyan' },
            { t: '认证标准', d: 'ISO 21448 (2022 版)',           c: 'amber' },
            { t: '强制范围', d: 'EU AI Act + 中国出海车型',      c: 'pink' },
          ].map((x) => (
            <div key={x.t} className={`rounded-xl border p-3 bg-${x.c}-500/5 border-${x.c}-500/30`}>
              <div className={`font-semibold text-${x.c}-300`}>{x.t}</div>
              <p className="mt-1 text-ink-300">{x.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 4 区图 */}
      <div className="glass-panel p-6">
        <h3 className="text-base font-semibold text-neon-300">📊 SOTIF 4 区分布（点击查看详情）</h3>
        <p className="text-sm text-ink-400 mt-1">SOTIF 的核心是"区域降级"：将场景从"未知未知"区逐步推进到"已知安全"区。</p>

        <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {ZONES.map((z) => (
            <button
              key={z.id}
              onClick={() => setActive(z.id)}
              className={`text-left rounded-2xl border p-4 transition-colors
                          ${active === z.id
                            ? `border-${z.color}-400 bg-${z.color}-500/10`
                            : 'border-ink-800 bg-ink-900/40 hover:border-ink-600'}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-ink-400">区域 {z.id}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full
                  ${z.color === 'emerald' ? 'bg-emerald-500/15 text-emerald-200' :
                    z.color === 'cyan'    ? 'bg-cyan-500/15 text-cyan-200' :
                    z.color === 'amber'   ? 'bg-amber-500/15 text-amber-200' :
                                            'bg-red-500/15 text-red-200'}`}>
                  {z.id === 1 ? '安全' : z.id === 2 ? '危险' : z.id === 3 ? '高风险' : '待验证'}
                </span>
              </div>
              <div className="mt-2 text-sm font-semibold text-ink-100">{z.name}</div>
              <div className="mt-2 h-1.5 rounded-full bg-ink-800 overflow-hidden">
                <div
                  className={`h-full ${z.color === 'emerald' ? 'bg-emerald-400' :
                                    z.color === 'cyan'    ? 'bg-cyan-400' :
                                    z.color === 'amber'   ? 'bg-amber-400' :
                                                            'bg-red-400'}`}
                  style={{ width: `${z.bar}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-ink-400">{z.desc}</p>
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-ink-800 p-4 bg-ink-900/40 text-xs text-ink-300">
          <b>当前聚焦区域 {active}：</b>
          {active === 1 && ' 工作重点：从 Zone 1 提取数据增强 Zone 2/3/4 的训练集。'}
          {active === 2 && ' 工作重点：把 Zone 2 移出 ODD 范围（限缩场景），避免危险触发。'}
          {active === 3 && ' 工作重点：HARA / STPA + 数据闭环 + 影子模式，把"未知"转为"已知"。'}
          {active === 4 && ' 工作重点：HMI 提示 / 限速 / 跟车时距延长，把风险降到可接受水平。'}
        </div>
      </div>

      {/* 触发条件列表 */}
      <div className="glass-panel p-6">
        <h3 className="text-base font-semibold text-amber-300">⚠️ 高频 SOTIF 触发条件</h3>
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {TRIGGERS.map((t) => (
            <div key={t.t} className="rounded-xl border border-ink-800 p-3.5 bg-ink-900/40">
              <div className="text-sm font-semibold text-neon-300">{t.t}</div>
              <p className="mt-1 text-[11px] text-ink-400">{t.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SOTIF 工作流 */}
      <div className="glass-panel p-6">
        <h3 className="text-base font-semibold text-violet-300">🔄 SOTIF 5 步工作流</h3>
        <ol className="mt-4 grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {SOTIF_FLOW.map((s) => (
            <li key={s.step} className="rounded-xl border border-ink-800 p-3.5 bg-ink-900/40">
              <div className="text-xs font-mono text-neon-300">Step {s.step}</div>
              <div className="mt-1 text-sm font-semibold text-ink-100">{s.name}</div>
              <p className="mt-1 text-[11px] text-ink-400">{s.desc}</p>
              <div className="mt-1.5 text-[10px] text-cyan-300 font-mono">{s.tool}</div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
