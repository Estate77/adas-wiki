import { useState } from 'react';

interface Sensor {
  id:      string;
  name:    string;
  range:   number;     // m
  fov:     number;     // °
  price:   number;     // 0~3
  weather: number;     // 0~3
  night:   number;     // 0~3
  blurb:   string;
  /** 知识点介绍 */
  kpIntro: string;
  /** 典型供应商 */
  kpVendors: string[];
  /** 关键参数 */
  kpSpecs: { label: string; value: string }[];
  /** 行业趋势 */
  kpTrend: string;
  /** 适用场景 */
  kpScenes: string[];
}

const SENSORS: Sensor[] = [
  { id: 'cam-front', name: '前视摄像头 ×2', range: 200, fov: 120, price: 1, weather: 1, night: 1,
    blurb: '行业主力，2MP/8MP；Tesla、华为、小鹏均采用多目方案。',
    kpIntro: '前视摄像头是感知的"主眼睛"，承担车道线、车辆、行人、交通标志的检测任务。8MP 高清摄像头是 2025 主流，配合 BEV 范式实现像素级深度估计。',
    kpSpecs: [
      { label: '分辨率', value: '2~8MP' },
      { label: '帧率',   value: '30~60fps' },
      { label: '视场',   value: '120°' },
    ],
    kpVendors: ['舜宇', '欧菲光', '丘钛', 'LG Innotek', 'Sony'],
    kpTrend: '从 2MP → 8MP → 12MP 升级；HDR 动态范围 140dB+；纯视觉派与多模态派路线分化。',
    kpScenes: ['车道线保持 LKA', '前车检测', '交通标志识别 TSR', '红绿灯检测'] },
  { id: 'cam-surround', name: '环视摄像头 ×4', range: 30, fov: 190, price: 1, weather: 1, night: 1,
    blurb: '泊车 / 低速场景必备，与超声波雷达融合可省去角雷达。',
    kpIntro: '环视摄像头主要服务于泊车与低速场景，4 路鱼眼 + 算法拼接实现 360° 鸟瞰图；高端车型向"透明底盘"演进。',
    kpSpecs: [
      { label: '数量',     value: '4~6 颗' },
      { label: '拼接',     value: '< 50ms' },
      { label: '畸变',     value: '< 5%' },
    ],
    kpVendors: ['舜宇', '欧菲光', '德赛西威', '纵目'],
    kpTrend: '从泊车辅助向"记忆泊车 HPA / 代客泊车 AVP"演进，2025 L2+ 标配。',
    kpScenes: ['自动泊车 APA', '记忆泊车 HPA', '代客泊车 AVP', '低速 360°'] },
  { id: 'radar-front', name: '前向毫米波雷达', range: 250, fov: 60, price: 1, weather: 3, night: 3,
    blurb: 'AEB / ACC 主力传感器；4D 成像雷达开始替代传统 3D。',
    kpIntro: '毫米波雷达是 ACC/AEB 不可替代的"安全底线"，77GHz 频段是主流。4D 成像雷达增加俯仰维度，输出点云密度提升 10x。',
    kpSpecs: [
      { label: '频段',   value: '77GHz' },
      { label: '量程',   value: '250m' },
      { label: '角分辨率', value: '1° (4D)' },
    ],
    kpVendors: ['大陆 ARS540', '博世', 'Veoneer', '华为', '纵目', '森思泰克'],
    kpTrend: '3D → 4D 成像雷达过渡，2025 国产 4D 雷达成本下探到 1500 元区间。',
    kpScenes: ['AEB 自动紧急制动', 'ACC 自适应巡航', '前向碰撞预警 FCW'] },
  { id: 'radar-corner', name: '角雷达 ×4', range: 100, fov: 150, price: 1, weather: 3, night: 3,
    blurb: '覆盖侧向 / 后向目标，补齐摄像头盲区。',
    kpIntro: '角雷达（前/后角各 2）用于变道辅助、后方来车预警，弥补摄像头的侧后方盲区。',
    kpSpecs: [
      { label: '频段', value: '77GHz' },
      { label: '量程', value: '100m' },
      { label: '视场', value: '150°' },
    ],
    kpVendors: ['大陆', 'Veoneer', '华为', '纵目', '森思泰克'],
    kpTrend: '向"前向 4D + 角雷达"协同演进，角雷达 4D 化降本进行中。',
    kpScenes: ['变道辅助 LCA', '盲区监测 BSD', '后方来车预警 RCTA'] },
  { id: 'lidar', name: '激光雷达 LiDAR', range: 250, fov: 120, price: 3, weather: 2, night: 3,
    blurb: '高端车型 1~3 颗，可生成稠密 3D 点云。',
    kpIntro: 'LiDAR 是高阶智驾的关键冗余传感器，ToF 测距原理输出 3D 点云。905nm 成本低 / 1550nm 安全性高但贵。2024 年单颗成本从 10 万元 → 千元级。',
    kpSpecs: [
      { label: '线数',  value: '128~300' },
      { label: '点频',  value: '1.5M pts/s' },
      { label: '测距',  value: '250m' },
    ],
    kpVendors: ['禾赛 AT128/AT512', '速腾 M1', '图达通 Robin', '华为', 'Livox'],
    kpTrend: '纯固态 + 905nm + 车规级 ASIC；2025 主流量产车搭载 1~3 颗。',
    kpScenes: ['城市 NOA', '夜间感知', '异形障碍物', '施工锥桶识别'] },
  { id: 'usonic', name: '超声波雷达 ×12', range: 5, fov: 120, price: 1, weather: 2, night: 3,
    blurb: '泊车 / 近距离感知；几乎所有车型标配。',
    kpIntro: '超声波雷达是泊车场景的"短兵相接"，探测距离 5m 内，几乎全行业标配；与环视摄像头融合形成自动泊车方案。',
    kpSpecs: [
      { label: '数量', value: '8~12 颗' },
      { label: '频率', value: '40~58kHz' },
      { label: '精度', value: '± 1cm' },
    ],
    kpVendors: ['博世', '法雷奥', '同致电子', '航盛'],
    kpTrend: '与视觉融合，向"记忆泊车 / 代客泊车"演进；2025 L2 标配 12 颗。',
    kpScenes: ['泊车测距', '低速近距离感知', '开门预警 DOW'] },
  { id: 'gnss', name: 'IMU + GNSS+RTK', range: 0, fov: 0, price: 2, weather: 3, night: 3,
    blurb: '厘米级定位 + 航位推算，是城市 NOA 鲁棒性的关键。',
    kpIntro: 'RTK 差分定位可达厘米级，IMU 惯性导航在 GNSS 失锁时（如隧道、高楼）维持位姿；二者融合是城市 NOA 鲁棒性的关键。',
    kpSpecs: [
      { label: '水平精度', value: '± 2cm (RTK)' },
      { label: '更新率',   value: '100Hz' },
      { label: '航位推算', value: '> 1min' },
    ],
    kpVendors: ['导远电子', '华测导航', '中海达', 'u-blox', 'Trimble'],
    kpTrend: '从"RTK + IMU"向"RTK + IMU + 视觉定位"三模融合，2025 城市 NOA 标配。',
    kpScenes: ['车道级定位', '隧道定位', '高楼峡谷', '立交桥'] },
  { id: 'dms', name: '驾驶员摄像头', range: 1, fov: 90, price: 1, weather: 3, night: 2,
    blurb: 'DMS 必备：疲劳、分心、接管能力评估。',
    kpIntro: 'DMS 通过红外 + 视觉融合监测驾驶员疲劳、分神、打电话、未系安全带等状态；L2+ 强制配置。',
    kpSpecs: [
      { label: '检出率', value: '≥ 99%' },
      { label: '帧率',   value: '30fps' },
      { label: '响应时延', value: '< 200ms' },
    ],
    kpVendors: ['Smart Eye', 'Seeing Machines', '地平线', '商汤', '中科创达'],
    kpTrend: '多模态融合（视觉 + 脑电/握力/心率），向"情感识别"演进；L3+ 必备。',
    kpScenes: ['疲劳监测', '分神检测', '接管能力评估', 'DMS HMI 联动'] },
];

function Bar({ value, max = 3, color = 'bg-neon-400' }: { value: number; max?: number; color?: string }) {
  return (
    <div className="flex-1 h-1.5 rounded-full bg-ink-800 overflow-hidden">
      <div className={`h-full ${color}`} style={{ width: `${(value / max) * 100}%` }} />
    </div>
  );
}

export default function SensorTopology() {
  const [active, setActive] = useState(4);
  const s = SENSORS[active];

  return (
    <div className="space-y-5">
      {/* 顶部：可视图 + 当前传感器详情（左右分布） */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* 左侧：360° 拓扑图（缩小） */}
        <div className="lg:col-span-2 glass-panel p-4">
          <h3 className="text-sm font-semibold">车端传感器 360° 拓扑</h3>
          <p className="text-[11px] text-ink-400 mt-0.5">L2+ 城市 NOA 典型配置</p>

          <div className="relative mt-3 mx-auto w-full max-w-xs aspect-square">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <rect x="60" y="80" width="80" height="50" rx="8"
                    fill="rgba(56,189,248,0.08)" stroke="#38BDF8" strokeWidth="0.8" />
              <line x1="100" y1="80" x2="100" y2="130" stroke="#1E293B" strokeWidth="0.5" />
              <line x1="60" y1="105" x2="140" y2="105" stroke="#1E293B" strokeWidth="0.5" />

              <Sector cx={100} cy={95} r={70} a1={200} a2={340} fill="rgba(56,189,248,0.12)" />
              <Sector cx={100} cy={95} r={55} a1={260} a2={280} fill="rgba(244,114,182,0.18)" />
              <Sector cx={65} cy={105} r={30} a1={160} a2={200} fill="rgba(251,191,36,0.15)" />
              <Sector cx={135} cy={105} r={30} a1={340} a2={20} fill="rgba(251,191,36,0.15)" />
              <Sector cx={100} cy={125} r={20} a1={60} a2={120} fill="rgba(167,139,250,0.18)" />

              <circle cx={100} cy={88} r="2.5" fill="#22D3EE" />
              <circle cx={66} cy={92} r="2" fill="#22D3EE" />
              <circle cx={134} cy={92} r="2" fill="#22D3EE" />
              <circle cx={66} cy={102} r="2" fill="#22D3EE" />
              <circle cx={134} cy={102} r="2" fill="#22D3EE" />
              <circle cx={100} cy={92} r="3" fill="#F472B6" />
              <circle cx={75} cy={105} r="2" fill="#FBBF24" />
              <circle cx={125} cy={105} r="2" fill="#FBBF24" />
              <circle cx={60} cy={105} r="2" fill="#FBBF24" />
              <circle cx={140} cy={105} r="2" fill="#FBBF24" />
              <circle cx={100} cy={108} r="2" fill="#A78BFA" />
            </svg>

            <div className="absolute top-1 left-1 text-[9px] text-cyan-300">前视摄像头 / LiDAR</div>
            <div className="absolute top-1 right-1 text-[9px] text-pink-300">LiDAR FOV</div>
            <div className="absolute bottom-1 left-1 text-[9px] text-amber-300">角雷达</div>
            <div className="absolute bottom-1 right-1 text-[9px] text-violet-300">DMS</div>
          </div>

          <div className="mt-3 text-[10px] text-ink-500 font-mono text-center">
            11V + 5R + 1~3 LiDAR + 12U + IMU/RTK + DMS
          </div>
        </div>

        {/* 右侧：当前传感器详情 */}
        <div className="lg:col-span-3 space-y-3">
          <div className="glass-panel p-5">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-base font-semibold text-neon-300">{s.name}</h3>
              <span className="ml-auto text-[10px] text-ink-500 font-mono">{s.id}</span>
            </div>
            <p className="text-[13px] text-ink-300 leading-relaxed">{s.kpIntro}</p>

            <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
              <div>
                <div className="text-ink-500 mb-1">成本</div>
                <Bar value={s.price} color="bg-amber-400" />
              </div>
              <div>
                <div className="text-ink-500 mb-1">恶劣天气</div>
                <Bar value={s.weather} color="bg-cyan-400" />
              </div>
              <div>
                <div className="text-ink-500 mb-1">夜间表现</div>
                <Bar value={s.night} color="bg-indigo-400" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="glass-panel p-4">
              <div className="text-[10px] text-ink-500 tracking-widest mb-2">关键参数</div>
              <ul className="space-y-1.5">
                {s.kpSpecs.map((sp) => (
                  <li key={sp.label} className="flex justify-between text-[12px]">
                    <span className="text-ink-400">{sp.label}</span>
                    <span className="font-mono text-ink-200">{sp.value}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-panel p-4">
              <div className="text-[10px] text-ink-500 tracking-widest mb-2">典型供应商</div>
              <div className="flex flex-wrap gap-1.5">
                {s.kpVendors.map((v) => (
                  <span key={v} className="text-[11px] px-1.5 py-0.5 rounded bg-ink-800 text-ink-200">
                    {v}
                  </span>
                ))}
              </div>
            </div>

            <div className="glass-panel p-4 sm:col-span-2">
              <div className="text-[10px] text-ink-500 tracking-widest mb-2">行业趋势</div>
              <p className="text-[12px] text-ink-300 leading-relaxed">{s.kpTrend}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {s.kpScenes.map((sc) => (
                  <span key={sc} className="text-[10px] px-1.5 py-0.5 rounded bg-neon-400/10 text-neon-300 border border-neon-400/20">
                    {sc}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 传感器清单（更紧凑的表格风格） */}
      <div className="glass-panel p-4">
        <h3 className="text-sm font-semibold mb-3">主流传感器清单</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {SENSORS.map((x, i) => (
            <button
              key={x.id}
              onClick={() => setActive(i)}
              className={`text-left p-3 rounded-xl border transition-all
                          ${i === active
                            ? 'border-neon-400 bg-neon-400/5'
                            : 'border-ink-800 hover:border-ink-600 bg-ink-900/40'}`}
            >
              <div className="text-[12px] font-medium leading-tight">{x.name}</div>
              <p className="mt-1.5 text-[10px] text-ink-400 line-clamp-2 leading-relaxed">{x.blurb}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Sector({ cx, cy, r, a1, a2, fill }:
  { cx: number; cy: number; r: number; a1: number; a2: number; fill: string }) {
  const toXY = (a: number) => [cx + r * Math.cos((a * Math.PI) / 180), cy + r * Math.sin((a * Math.PI) / 180)] as const;
  const [x1, y1] = toXY(a1);
  const [x2, y2] = toXY(a2);
  const large = (a2 - a1) % 360 > 180 ? 1 : 0;
  return <path d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`} fill={fill} />;
}
