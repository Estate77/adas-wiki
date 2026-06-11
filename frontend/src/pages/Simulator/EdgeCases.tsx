import { useState } from 'react';

interface Scenario {
  id:        string;
  title:     string;
  icon:      string;
  category:  'cut-in' | 'night' | 'service' | 'special';
  /** 场景描述 */
  desc:      string;
  /** 关键时间线 */
  timeline:  { t: string; evt: string; systemAct: string }[];
  /** 关注点：工程师视角下要盯死的指标 */
  watch:     { label: string; desc: string; level: 'high' | 'mid' | 'low' }[];
  /** 问题解析：决策树 */
  decisions: { q: string; a: string; reason: string }[];
  /** 相关产品事件 */
  cases:     { org: string; detail: string; year: string }[];
}

const SCENARIOS: Scenario[] = [
  {
    id: 'cutin', title: '鬼探头 · 侧向两轮车/行人抢出', icon: '🚸', category: 'cut-in',
    desc: '遮挡物（停车/大车/绿化带）后突然出现行人 / 两轮车 / 儿童 / 动物，业内俗称"鬼探头"。是 AEB / 城市 NOA 公认的高频难点。',
    timeline: [
      { t: 'T-0.3s', evt: '侧向目标未进入 AEB 感知范围',  systemAct: '感知正常' },
      { t: 'T-0.0s', evt: '目标从遮挡后露出',              systemAct: 'BBox 出现 → 触发 AEB 评估' },
      { t: 'T+0.1s', evt: 'TTC < 1.5s 触发 AEB 全力制动',  systemAct: '请求制动 1.0g' },
      { t: 'T+0.4s', evt: '若仍碰撞 → 触发气囊预点爆',     systemAct: '进入 Crash Imminent Brake' },
      { t: 'T+0.8s', evt: '事故后 DSSAD 记录事件',         systemAct: '写入黑匣子' },
    ],
    watch: [
      { label: '遮挡感知盲区',     desc: '侧视 180° 覆盖、地面反射识别',     level: 'high' },
      { label: '目标分类准确率',   desc: '儿童/外卖两轮车/小动物/快递车',     level: 'high' },
      { label: 'TTC 测算时延',     desc: '从相机触发到制动请求端到端 < 100ms', level: 'high' },
      { label: 'AEB 误触发率',     desc: '误触会引发后车追尾',                level: 'mid'  },
    ],
    decisions: [
      { q: '为什么 0.3s 内无法提前识别？',  a: '遮挡物理上无法解决，只能在 T-0 之前增加 V2X / 摄像头冗余', reason: '单车感知存在物理极限' },
      { q: 'AEB 该全力制动还是渐进？',      a: '全力制动（1.0g）+ 同步点爆预紧安全带',                  reason: 'TTC < 1.5s 已无更优解' },
      { q: '如何在不增加误触的前提下提升敏感度？', a: '多模态融合 + 速度场景分级（儿童区 vs 高速）',         reason: '统一阈值无法兼顾多场景' },
    ],
    cases: [
      { org: '特斯拉',     detail: 'FSD Beta 在多个城市路口遭遇外卖两轮车鬼探头，已多次 OTA 优化',     year: '2024' },
      { org: '小鹏 XNGP', detail: '增加激光雷达侧向补盲 + 儿童目标专项训练集',                       year: '2024' },
      { org: '华为 ADS 3.0', detail: 'GOD 网络（通用障碍物识别）将"未知物体"也纳入风险评估',           year: '2024' },
    ],
  },
  {
    id: 'night', title: '夜间 · 无路灯/对向眩光', icon: '🌃', category: 'night',
    desc: '夜间场景是感知"最弱"时段：可见光摄像头近乎失效，远光眩光、雨雾水汽又会进一步降低能见度。',
    timeline: [
      { t: 'T0',     evt: '车辆驶入无路灯路段',           systemAct: '感知系统降级到雷达+激光雷达主导' },
      { t: 'T+5s',   evt: '对向车开远光 → 短时眩光',       systemAct: '前视 HDR 触发 / 速度建议降至 60km/h' },
      { t: 'T+12s',  evt: '出隧道 → 内外光照差 > 100000lux', systemAct: '瞳孔适应期约 2s，系统同步减速' },
      { t: 'T+30s',  evt: '识别到路边故障车+警示牌',       systemAct: '主动偏置 + 警示 HMI' },
      { t: 'T+45s',  evt: '重新驶入良好照明路段',         systemAct: '感知系统权重回归视觉主导' },
    ],
    watch: [
      { label: '近红外/热成像',         desc: '夜间无路灯场景的核心传感器', level: 'high' },
      { label: '眩光恢复时间',         desc: 'HDR 相机出隧道适应 < 2s',    level: 'high' },
      { label: '激光雷达角分辨率',     desc: '决定远距离小目标识别',         level: 'mid'  },
      { label: '多传感器权重动态切换', desc: '白天/夜间的融合策略要可配',   level: 'high' },
    ],
    decisions: [
      { q: '夜间应不应该完全依赖激光雷达？', a: '不可以：雨雾天激光雷达也退化，必须保留毫米波雷达', reason: '单传感器永远不够' },
      { q: '眩光期间是否应减速？',           a: '建议降至 50~60km/h 直至瞳孔适应',                reason: '人驾也需适应期' },
      { q: '夜间 NOA 是否要限制 ODD？',     a: '建议：城区 ODD 排除 22:00~6:00 无路灯路段',         reason: '降低风险 + 减少事故' },
    ],
    cases: [
      { org: 'Waymo',       detail: '凤凰城夜间运营依赖 5x 激光雷达 + 摄像头多模态融合',        year: '2024' },
      { org: '奔驰 L3',     detail: '夜间 130km/h DRIVE PILOT 德国高速已商用',                year: '2024' },
      { org: '蔚来 NOP+',   detail: '增加红外热成像补盲夜间感知，2025 量产',                  year: '2025' },
    ],
  },
  {
    id: 'service', title: '高速服务区 · 出入口博弈', icon: '🛣️', category: 'service',
    desc: '高速服务区入口并线距离短、车流交织复杂；出口需识别 ETC / 人工车道 / 错过的出口。NOA 进入服务区是当前公认痛点。',
    timeline: [
      { t: 'T-2km',  evt: '系统提示前方服务区',           systemAct: 'HMI 询问是否进入' },
      { t: 'T-500m', evt: '驾驶员确认进入 → NOA 准备',    systemAct: '降速至 80km/h' },
      { t: 'T-100m', evt: '进入匝道 → 切换到 Pilot',      systemAct: 'IMU + HD Map 双重定位' },
      { t: 'T-30m',  evt: '服务区内部低速巡航',           systemAct: '限速 20km/h + 360° AVM' },
      { t: 'T0',     evt: '寻找车位 → 自动泊车',          systemAct: '切换 APA 模式' },
    ],
    watch: [
      { label: '匝道识别准确率',     desc: 'VSLAM 兜底避免定位漂移', level: 'high' },
      { label: '并线时机决策',       desc: '200m 内并入主干道极易失败', level: 'high' },
      { label: '服务区地图覆盖',     desc: 'HD Map 覆盖率 < 60% 是关键瓶颈', level: 'high' },
      { label: '内部低速感知',       desc: '20km/h 以下儿童/购物车', level: 'mid'  },
    ],
    decisions: [
      { q: '服务区是否要由 NOA 全自动接管？', a: '不建议：现阶段可作为"辅助驾驶"功能，驾驶员需保持监督', reason: '服务区场景长尾太多' },
      { q: '错过了出口怎么办？',               a: '系统应继续沿当前车道行驶 + 提示"已错过出口"',  reason: 'NOA 不能违章倒车' },
      { q: '如何降低并线失败率？',             a: '增大感知距离 + 强化意图预测 + 必要时降级到 LCC', reason: '保守策略优于冒险' },
    ],
    cases: [
      { org: '小鹏 XNGP', detail: '高速服务区 NOA 已开通 600+ 站，但接管率仍 > 30%',    year: '2024' },
      { org: '理想 AD Max', detail: '进入服务区时强制 LCC 模式，驾驶员接管服务区内',     year: '2024' },
      { org: '华为 ADS 3.0', detail: '部分服务区支持"车位到车位"，从起点车位直达目的地车位', year: '2025' },
    ],
  },
  {
    id: 'special', title: '特殊场景 · 异形车/动物/施工', icon: '⚠️', category: 'special',
    desc: '动物穿越、异形车辆（农用车/婚礼车队/三轮）、临时施工、大型掉落物是 ODD 长尾问题。',
    timeline: [
      { t: 'T-1.0s', evt: '系统检测到前方异形目标', systemAct: '分类置信度 0.6 → 触发 AEB 评估' },
      { t: 'T-0.5s', evt: 'TTC 计算 < 2.0s',          systemAct: '建议车道偏移 + 减速' },
      { t: 'T-0.0s', evt: '若无可用空间 → 全力制动', systemAct: '记录失败 case 回灌仿真' },
      { t: 'T+0.5s', evt: '目标静止/移出 → 系统复位', systemAct: '恢复巡航' },
    ],
    watch: [
      { label: '异形目标分类',     desc: '农用车 / 马车 / 婚礼车队需专项训练集', level: 'high' },
      { label: '动物目标识别',     desc: '猫/狗/牛/羊体型差异极大',                level: 'high' },
      { label: '车道偏移空间',     desc: '相邻车道占用时无法横向规避',             level: 'mid'  },
      { label: '误识别漏识别',     desc: '训练集分布外 OOD 检测是核心难题',         level: 'high' },
    ],
    decisions: [
      { q: '异形目标分类失败时怎么办？', a: '降级处理：宁可制动也不漏检', reason: '保守策略 + 误触可 OTA 优化' },
      { q: '动物横穿是否要主动偏置？',   a: '建议：高速场景优先制动，城区可考虑避让', reason: '取决于速度和距离' },
      { q: '这类 case 如何系统化解决？', a: '影子模式收集 → 仿真回灌 → 模型迭代', reason: '数据闭环是根本解法' },
    ],
    cases: [
      { org: '特斯拉 FSD',  detail: '撞白色货车侧翻事故 → 优化侧翻车姿态识别',   year: '历史' },
      { org: 'Waymo',       detail: '凤凰城多次遭遇骆驼穿越沙漠公路',         year: '2024' },
      { org: '中国头部 OEM', detail: '数据闭环：异形车 case 库已达 50 万+ 段',   year: '2024' },
    ],
  },
];

const CATEGORY_LABEL: Record<Scenario['category'], string> = {
  'cut-in':   '鬼探头',
  'night':    '夜间场景',
  'service':  '服务区',
  'special':  '异形/动物',
};

export default function EdgeCases() {
  const [active, setActive] = useState(SCENARIOS[0].id);
  const s = SCENARIOS.find((x) => x.id === active)!;

  return (
    <div className="grid lg:grid-cols-[280px_1fr] gap-6">
      <aside className="space-y-2">
        {SCENARIOS.map((x) => (
          <button
            key={x.id}
            onClick={() => setActive(x.id)}
            className={`w-full text-left p-4 rounded-xl border transition-colors
                        ${x.id === active
                          ? 'border-neon-400 bg-neon-400/5'
                          : 'border-ink-800 hover:border-ink-600 bg-ink-900/40'}`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{x.icon}</span>
              <span className="text-sm font-semibold">{CATEGORY_LABEL[x.category]}</span>
            </div>
            <p className="mt-1 text-xs text-ink-400 line-clamp-2">{x.title}</p>
          </button>
        ))}
      </aside>

      <article className="space-y-5">
        <div className="glass-panel p-6">
          <h3 className="text-lg font-semibold">{s.icon} {s.title}</h3>
          <p className="mt-2 text-sm text-ink-300 leading-relaxed">{s.desc}</p>
        </div>

        {/* 关键时间线 */}
        <div className="glass-panel p-6">
          <h4 className="text-sm font-semibold text-cyan-300 mb-3">⏱️ 关键时间线</h4>
          <ol className="space-y-2">
            {s.timeline.map((t) => (
              <li key={t.t} className="grid grid-cols-[80px_1fr] gap-3 text-xs">
                <span className="font-mono text-neon-300 shrink-0">{t.t}</span>
                <div>
                  <div className="text-ink-200">{t.evt}</div>
                  <div className="text-ink-500 text-[11px]">→ {t.systemAct}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* 关注点 */}
        <div className="glass-panel p-6">
          <h4 className="text-sm font-semibold text-amber-300 mb-3">🎯 工程关注点</h4>
          <div className="grid sm:grid-cols-2 gap-3">
            {s.watch.map((w) => (
              <div key={w.label} className="rounded-xl border border-ink-800 p-3.5 bg-ink-900/40">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-ink-200">{w.label}</div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full border
                    ${w.level === 'high' ? 'border-red-500/40 text-red-200 bg-red-500/10' :
                      w.level === 'mid'  ? 'border-amber-500/40 text-amber-200 bg-amber-500/10' :
                                            'border-emerald-500/40 text-emerald-200 bg-emerald-500/10'}`}>
                    {w.level === 'high' ? '高' : w.level === 'mid' ? '中' : '低'}
                  </span>
                </div>
                <p className="mt-1.5 text-[11px] text-ink-400">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 问题解析 */}
        <div className="glass-panel p-6">
          <h4 className="text-sm font-semibold text-violet-300 mb-3">🧠 决策树 · 问题解析</h4>
          <div className="space-y-3">
            {s.decisions.map((d, i) => (
              <div key={i} className="rounded-xl border border-ink-800 p-3.5 bg-ink-900/40">
                <div className="text-sm font-semibold text-ink-200">Q{i + 1}. {d.q}</div>
                <div className="mt-1.5 text-sm text-emerald-200">A. {d.a}</div>
                <p className="mt-1 text-[11px] text-ink-500">{d.reason}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 行业案例 */}
        <div className="glass-panel p-6">
          <h4 className="text-sm font-semibold text-pink-300 mb-3">🏢 行业相关案例</h4>
          <div className="space-y-2">
            {s.cases.map((c, i) => (
              <div key={i} className="flex items-start gap-3 text-xs">
                <span className="text-[10px] font-mono text-ink-400 shrink-0 mt-0.5">{c.year}</span>
                <div className="flex-1">
                  <span className="font-semibold text-neon-200">{c.org}</span>
                  <span className="text-ink-400 ml-2">{c.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}
