import { useState } from 'react';

interface Node {
  id:    string;
  title: string;
  desc:  string;
  items: string[];
  x:     number;     // 0~100 (%)
  y:     number;
  accent: 'cyan' | 'violet' | 'amber' | 'emerald' | 'pink' | 'red';
  /** 知识点介绍 */
  kpIntro: string;
  /** 关键技术指标 */
  kpMetrics: { label: string; value: string }[];
  /** 行业代表玩家 */
  kpPlayers: string[];
  /** 趋势判断 */
  kpTrend: string;
}

const NODES: Node[] = [
  { id: 'human',  x: 8,  y: 18, accent: 'cyan',
    title: '人（Human）',     desc: '驾驶员 / 乘客 / 远程操作员',
    items: ['驾驶员状态监测 DSM', 'DMS 摄像头 + 方向盘握力', '接管机制 HMI', '远程 5G 云代驾'],
    kpIntro: '人是智驾系统的"最高决策层"，也是法律责任主体。L2 阶段驾驶员仍是责任主体，L3 阶段 ODD 内系统承担主责，L4 阶段系统全权接管。围绕"人"的设计核心是：DMS 监测 + 多模态接管 HMI + 注意力校准。',
    kpMetrics: [
      { label: 'DMS 检出率', value: '≥ 99%' },
      { label: '接管时间',   value: '≤ 10s' },
      { label: '接管成功率', value: '> 95%' },
    ],
    kpPlayers: ['Smart Eye', 'Seeing Machines', '地平线', '商汤', '中科创达'],
    kpTrend: '从单目 DMS 走向多模态融合（视觉 + 脑电/握力/心率），L3+ 强制配置。' },
  { id: 'road',   x: 8,  y: 78, accent: 'amber',
    title: '路（Road）',      desc: '物理基础设施 + 数字孪生',
    items: ['V2X 通信（RSU）', '高精地图 HD Map', '智能信号灯', '车道级定位 RTK'],
    kpIntro: '路端是智驾的"数字孪生底座"，通过 RSU、智能信号灯、毫米波雷达等设备把盲区信息推送给车端。V2X 在雨雪雾、强逆光等单车感知退化场景作用巨大。',
    kpMetrics: [
      { label: 'RSU 部署',   value: '10万+ 套' },
      { label: 'C-V2X 渗透', value: '< 5%' },
      { label: 'RTK 精度',   value: '± 2cm' },
    ],
    kpPlayers: ['华为', '千方科技', '万集科技', '高新兴', '百度 ACE'],
    kpTrend: '车路云一体化（V2X）写入国家战略，2025~2027 试点城市从 20 扩至 100+。' },
  { id: 'cloud',  x: 88, y: 18, accent: 'violet',
    title: '云（Cloud）',     desc: '训练 / 仿真 / 数据闭环',
    items: ['大模型训练集群', '数据闭环 Pipeline', '影子模式 Shadow Mode', '仿真回放'],
    kpIntro: '云端是智驾系统的"上限决定者"：训练算力 + 数据闭环 + 仿真回放构成数据飞轮。头部玩家（Tesla / 华为 / 小鹏）每年采集数 PB 级真实路测数据。',
    kpMetrics: [
      { label: '训练算力',  value: 'EFlops 级' },
      { label: '数据规模',  value: '10+ PB/年' },
      { label: '仿真里程',  value: '百亿公里/年' },
    ],
    kpPlayers: ['Tesla Dojo', '华为云', '阿里云', '火山引擎', '百度云'],
    kpTrend: '世界模型 + 合成数据 + 自动标注，2025 后降低 90% 人工标注成本。' },
  { id: 'infra',  x: 88, y: 78, accent: 'emerald',
    title: '基础设施',       desc: '路端 + 云端协同',
    items: ['5G / C-V2X', '边缘计算 MEC', '时空同步', '数据合规'],
    kpIntro: '通信与计算基础设施是车路云协同的"神经系统"：5G 提供低时延通道、MEC 在路侧完成实时决策、时空同步保证多端坐标一致。',
    kpMetrics: [
      { label: '5G 时延',  value: '< 10ms' },
      { label: 'MEC 覆盖', value: '主流城市' },
      { label: '时钟同步', value: 'μs 级' },
    ],
    kpPlayers: ['中国移动', '中国电信', '华为 MEC', '中兴', '浪潮'],
    kpTrend: '5G-A 通感一体（ISAC）使基站具备雷达能力，反哺车端感知。' },
  { id: 'car',    x: 48, y: 48, accent: 'pink',
    title: '车（Vehicle）',  desc: '感知 → 融合 → 决策 → 控制',
    items: ['域控制器 SoC', '传感器套件', '线控底盘', 'SOA 软件架构'],
    kpIntro: '车端是智驾系统的"执行主体"，从 ECU → 域控 → 中央计算 + 区域控制器的架构演进已经发生。L2+ 城市 NOA 普遍搭载 200~500 TOPS 算力。',
    kpMetrics: [
      { label: 'SoC 算力',  value: '500 TOPS+' },
      { label: '线控响应',  value: '< 50ms' },
      { label: '功耗',      value: '< 100W' },
    ],
    kpPlayers: ['英伟达 Orin/Thor', '华为 MDC', '地平线 J6', '特斯拉 HW4', '黑芝麻 A2000'],
    kpTrend: '中央计算 + 区域控制器（CCU + ZCU）架构，2025 量产元年。' },
];

const ACCENT = {
  cyan:    { ring: 'ring-cyan-400/40',    bg: 'bg-cyan-500/10',    text: 'text-cyan-200',    dot: 'bg-cyan-400' },
  violet:  { ring: 'ring-violet-400/40',  bg: 'bg-violet-500/10',  text: 'text-violet-200',  dot: 'bg-violet-400' },
  amber:   { ring: 'ring-amber-400/40',   bg: 'bg-amber-500/10',   text: 'text-amber-200',   dot: 'bg-amber-400' },
  emerald: { ring: 'ring-emerald-400/40', bg: 'bg-emerald-500/10', text: 'text-emerald-200', dot: 'bg-emerald-400' },
  pink:    { ring: 'ring-pink-400/40',    bg: 'bg-pink-500/10',    text: 'text-pink-200',    dot: 'bg-pink-400' },
  red:     { ring: 'ring-red-400/40',     bg: 'bg-red-500/10',     text: 'text-red-200',     dot: 'bg-red-400' },
};

const EDGES: [string, string, string][] = [
  ['human', 'car',  'HMI / 接管'],
  ['car',   'road', '感知路况'],
  ['road',  'cloud', 'V2X 数据'],
  ['cloud', 'car',  'OTA / 影子模式'],
  ['infra', 'car',  '低时延通信'],
  ['infra', 'road', '边缘部署'],
];

export default function SystemArchitecture() {
  const [selected, setSelected] = useState<string>('car');
  const n = NODES.find((x) => x.id === selected)!;
  const a = ACCENT[n.accent];

  return (
    <div className="space-y-5">
      {/* 主视图：可视图 + 知识详情（左右分布） */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* 左侧：可视图（缩小） */}
        <div className="lg:col-span-2 glass-panel p-4">
          <h3 className="text-sm font-semibold text-ink-100">人-车-路-云 协同架构</h3>
          <p className="text-[11px] text-ink-400 mt-0.5">点击节点查看知识点</p>

          <div className="relative w-full aspect-square sm:aspect-[5/4] bg-ink-950/50 rounded-xl border border-ink-800 overflow-hidden mt-3">
            <div className="absolute inset-0 bg-grid-dark bg-grid opacity-30" />
            <div className="absolute inset-0 mask-fade-b" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full
                            bg-gradient-radial from-neon-400/30 to-transparent blur-2xl" />

            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              {EDGES.map(([a1, b1]) => {
                const n1 = NODES.find((x) => x.id === a1)!;
                const n2 = NODES.find((x) => x.id === b1)!;
                return (
                  <g key={a1 + b1}>
                    <line x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y}
                          stroke="rgba(56,189,248,0.25)" strokeWidth="0.25" strokeDasharray="1,1" />
                  </g>
                );
              })}
            </svg>

            {NODES.map((nd) => {
              const ad = ACCENT[nd.accent];
              const isActive = selected === nd.id;
              return (
                <button
                  key={nd.id}
                  onClick={() => setSelected(nd.id)}
                  style={{ left: `${nd.x}%`, top: `${nd.y}%`, transform: 'translate(-50%, -50%)' }}
                  className={`absolute w-20 sm:w-24 rounded-lg p-1.5 text-left
                              border ${isActive ? `border-neon-400 ring-2 ${ad.ring}` : 'border-ink-700 hover:border-ink-500'}
                              bg-ink-900/80 backdrop-blur transition-all`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${ad.dot} mb-1`} />
                  <div className={`text-[11px] font-semibold ${ad.text} leading-tight`}>{nd.title}</div>
                </button>
              );
            })}

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <div className="text-[8px] tracking-[0.3em] text-neon-300">ADAS</div>
              <div className="text-[11px] font-semibold">智驾</div>
            </div>
          </div>

          {/* 子模块列表（紧凑） */}
          <div className="mt-3 grid grid-cols-2 gap-1.5">
            {n.items.map((it) => (
              <div key={it} className="flex items-start gap-1.5 text-[11px] text-ink-300 px-1">
                <span className={`mt-1 w-1 h-1 rounded-full ${a.dot} shrink-0`} />
                {it}
              </div>
            ))}
          </div>
        </div>

        {/* 右侧：知识点介绍 */}
        <div className="lg:col-span-3 space-y-3">
          <div className="glass-panel p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-2.5 h-2.5 rounded-full ${a.dot}`} />
              <h3 className={`text-base font-semibold ${a.text}`}>{n.title}</h3>
              <span className="ml-auto text-[10px] text-ink-500 font-mono">{n.id.toUpperCase()}</span>
            </div>
            <p className="text-[13px] text-ink-300 leading-relaxed">{n.kpIntro}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 关键指标 */}
            <div className="glass-panel p-4">
              <div className="text-[10px] text-ink-500 tracking-widest mb-2">关键指标</div>
              <ul className="space-y-1.5">
                {n.kpMetrics.map((m) => (
                  <li key={m.label} className="flex justify-between items-baseline text-[12px]">
                    <span className="text-ink-400">{m.label}</span>
                    <span className={`font-mono ${a.text}`}>{m.value}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 行业玩家 */}
            <div className="glass-panel p-4">
              <div className="text-[10px] text-ink-500 tracking-widest mb-2">行业玩家</div>
              <div className="flex flex-wrap gap-1.5">
                {n.kpPlayers.map((p) => (
                  <span key={p} className={`text-[11px] px-1.5 py-0.5 rounded ${a.bg} ${a.text} border border-current/20`}>
                    {p}
                  </span>
                ))}
              </div>
            </div>

            {/* 趋势判断 */}
            <div className="glass-panel p-4">
              <div className="text-[10px] text-ink-500 tracking-widest mb-2">趋势判断</div>
              <p className="text-[12px] text-ink-300 leading-relaxed">{n.kpTrend}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 关键洞察（更紧凑） */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { t: '车端 ≠ 全部', d: '2025 年量产方案向"车端主导 + 云端增强"演化，云端数据闭环决定上限。' },
          { t: '路侧是杠杆', d: 'V2X + 智能路侧可显著降低车端感知压力，是 Robotaxi 落地的关键基础设施。' },
          { t: '人因常被忽视', d: '接管交互、信任校准、注意力监测是 L2/L3 商业化的最大隐性门槛。' },
        ].map((c) => (
          <div key={c.t} className="glass-panel p-4">
            <h4 className="text-xs font-semibold text-neon-300">{c.t}</h4>
            <p className="mt-1.5 text-[12px] text-ink-300 leading-relaxed">{c.d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
