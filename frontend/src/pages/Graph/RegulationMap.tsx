interface Law {
  id:        string;
  region:    '中国' | '欧盟' | '美国' | '日本' | '国际';
  level:     string;
  name:      string;
  year:      string;
  status:    '已生效' | '试点' | '草案' | '征求意见';
  keypoints: string[];
  /** 知识点介绍 */
  kpIntro: string;
  /** 关键参数 / 数值 */
  kpMetrics: { label: string; value: string }[];
  /** 影响范围 / 行业玩家 */
  kpScope: string[];
  /** 趋势判断 */
  kpTrend: string;
}

const LAWS: Law[] = [
  // ============ 国际标准 ============
  { id: 'r157', region: '国际', level: 'L3+', name: 'UN-R157 ALKS', year: '2021/2024', status: '已生效',
    keypoints: ['欧盟首个 L3 法规', '60km/h 以下自动变道', '强制驾驶员接管能力', '数据记录系统 DSSAD'],
    kpIntro: 'UN-R157 ALKS（Automated Lane Keeping System）是联合国世界车辆法规协调论坛（WP.29）发布的全球首部 L3 级自动车道保持系统法规。2021 年生效限定 60km/h 以下，2024 年通过修订版（Amendment）将速度上限提升至 130km/h，并允许自动变道。',
    kpMetrics: [
      { label: '速度上限',   value: '130 km/h' },
      { label: 'DSSAD 留痕', value: '≥ 6 个月' },
      { label: '成员国落地', value: 'EU + 日韩' },
    ],
    kpScope: ['德国', '日本', '韩国', '奔驰 DRIVE PILOT', '宝马', '本田 Legend'],
    kpTrend: '下一轮修订将允许 L3 城市道路场景，预计 2026~2027 落地。' },

  { id: 'iso26262', region: '国际', level: 'L2~L5', name: 'ISO 26262 (功能安全)', year: '2018/2024', status: '已生效',
    keypoints: ['ASIL 风险等级', 'V 模型开发流程', '硬件 / 软件 / 系统三层', '每两年一次改版'],
    kpIntro: 'ISO 26262 是汽车功能安全的国际通用标准，源自 IEC 61508。2024 年发布第 3 版（2nd edition 2018 → 3rd 2024），新增对 AI/ML、半导体、跨车型平台、工具鉴定的支持。ASIL A~D 四级风险等级是开发与认证的核心语言。',
    kpMetrics: [
      { label: 'ASIL 等级',    value: 'A / B / C / D' },
      { label: 'PMHF 目标',    value: '< 10⁻⁸ /h' },
      { label: '覆盖率要求',   value: 'MC/DC ≥ 100%' },
    ],
    kpScope: ['TÜV / SGS / DNV 认证', 'OEM 整车厂', 'Tier1 供应商', '芯片厂商'],
    kpTrend: '第 3 版强化 AI 安全论据 + SOTIF 衔接，成为出海车型必过门槛。' },

  { id: 'iso21448', region: '国际', level: 'L3+', name: 'ISO 21448 (SOTIF)', year: '2022', status: '已生效',
    keypoints: ['预期功能安全', '关注 AI 触发未知风险', '触发条件 + 区域划分', '与 26262 互补'],
    kpIntro: 'SOTIF（Safety Of The Intended Functionality）解决的是"系统按设计工作，但因 AI/环境/交互仍可能造成危害"的问题。SOTIF 引入"触发条件 + 区域"分析框架，将未知的危险场景逐步降级到已知安全区域。',
    kpMetrics: [
      { label: '区域划分',     value: '4 区（已知/未知）' },
      { label: '剩余风险',     value: '可接受' },
      { label: '验证样本',     value: '亿级' },
    ],
    kpScope: ['感知 AI 厂商', 'AI 芯片厂', '认证机构', '整车厂智驾部门'],
    kpTrend: '与 ISO 26262 第 3 版深度融合，形成"功能安全 + 预期安全"双轨认证。' },

  { id: 'iso21434', region: '国际', level: 'L0~L5', name: 'ISO/SAE 21434 (车辆网络安全)', year: '2021', status: '已生效',
    keypoints: ['全生命周期安全管理', 'TARA 威胁分析', 'CSMS 认证体系', '与 UN-R155 衔接'],
    kpIntro: '21434 是汽车网络安全的国际标准，覆盖概念、开发、生产、运营、退役全生命周期。TARA（Threat Analysis and Risk Assessment）是其核心方法论。2024 年起欧盟 UN-R155 强制要求 CSMS 认证。',
    kpMetrics: [
      { label: 'TARA 阶段',  value: '7 阶段' },
      { label: '风险等级',   value: '5 级' },
      { label: '安全更新',   value: '≤ 90 天' },
    ],
    kpScope: ['OEM 安全部门', 'Tier1', '安全公司', 'OTA 平台'],
    kpTrend: '与 UN-R155/R156 共同构成"网安 + OTA + 准入"三件套，强制化趋势明显。' },

  { id: 'r155', region: '国际', level: 'L0~L5', name: 'UN-R155 / R156 (网安+OTA)', year: '2021/2022', status: '已生效',
    keypoints: ['CSMS 强制认证', 'SUMS 软件更新管理', '影响 2022 年 7 月后新车型', '欧盟 + 日韩 + 英国'],
    kpIntro: 'R155 强制要求 OEM 建立 CSMS（Cyber Security Management System）；R156 强制要求 SUMS（Software Update Management System）。两法规使 OTA 升级从"功能增强"变成"准入门槛"。',
    kpMetrics: [
      { label: '强制车型',  value: '≥ 2022.7 新车' },
      { label: 'OTA 备案',  value: '强制' },
      { label: '执行范围',  value: 'EU + 56 国' },
    ],
    kpScope: ['整车厂', 'OTA 厂商', 'Tier1', '安全供应商'],
    kpTrend: '中国《汽车数据安全管理若干规定》与之呼应，全球形成"网安+OTA"统一标准。' },

  // ============ 中国 ============
  { id: 'cn-test', region: '中国', level: 'L2', name: '《智能网联汽车道路测试与示范应用管理规范》', year: '2021', status: '已生效',
    keypoints: ['地方备案 + 省级互认', '测试车需挂临时号牌', '安全员配置要求'],
    kpIntro: '中国 L2 阶段测试的"母法"，明确测试主体、车辆、驾驶人、第三方机构四类角色；2021 版推动跨省互认，大幅降低重复测试成本。',
    kpMetrics: [
      { label: '互认省份',  value: '30+' },
      { label: '测试里程',  value: '亿公里' },
      { label: '安全员',   value: '≥ 1 人/车' },
    ],
    kpScope: ['北京', '上海', '深圳', '广州', '重庆', '武汉'],
    kpTrend: '向"准入 + 上路"双轨制过渡，逐步取消地方备案制。' },

  { id: 'cn-l3', region: '中国', level: 'L3', name: '《L3/L4 准入和上路试点》', year: '2023/2024', status: '试点',
    keypoints: ['试点城市首批 9 个', '2024 扩至 20 城', '事故责任初步划分', 'ODD 报备制'],
    kpIntro: '工信部 + 公安部 + 住建部 + 交通部四部委 2023 年 11 月联合发布，是 L3 商业化的"破冰"政策；2024 年扩至北京、上海、重庆、深圳、武汉、合肥等 20 城。试点期内事故责任由车企承担，量产前需完成"准入 + 上路"双许可。',
    kpMetrics: [
      { label: '试点城市',  value: '20 城' },
      { label: '车企',      value: '9 家' },
      { label: '事故责任',  value: '车企主体' },
    ],
    kpScope: ['比亚迪', '蔚来', '长安', '广汽', '上汽', '北汽蓝谷', '一汽', '东风', '长城'],
    kpTrend: '2025~2027 完成试点总结 → 国家层面《L3 准入条例》出台。' },

  { id: 'cn-gbt', region: '中国', level: 'L0~L5', name: '《汽车驾驶自动化分级》GB/T 40429-2021', year: '2021', status: '已生效',
    keypoints: ['中国版 0~5 级', '明确 0~2 由系统/驾驶员执行', '与国际 SAE J3016 对齐'],
    kpIntro: '中国首部驾驶自动化分级国标，0~5 级划分与 SAE J3016 一致，但强化了"责任主体"描述——0~2 级责任在驾驶员，3~5 级责任在系统。这一国标是后续所有法规的"术语基础"。',
    kpMetrics: [
      { label: '级别',     value: '0~5' },
      { label: '对齐',     value: 'SAE J3016' },
      { label: '强制',     value: '推荐' },
    ],
    kpScope: ['OEM', '认证机构', '媒体', '研究机构'],
    kpTrend: '与 SAE 同步更新 2025 版，新增"5+ 远程驾驶"等扩展。' },

  { id: 'cn-access', region: '中国', level: 'L3+', name: '《道路机动车辆生产准入许可管理条例（征求意见稿）》', year: '2025', status: '征求意见',
    keypoints: ['OTA 升级需审批', 'L3 准入需安全员配置', '事故回溯数据留存', 'L4 仅限定区域'],
    kpIntro: '2025 年公开征求意见的"准入母法"，首次把 OTA 升级纳入审批制、明确 L3 安全员配置要求、L4 限定区域运营。是 L3+ 商业化的"顶层法律"。',
    kpMetrics: [
      { label: 'OTA 审批',   value: '强制' },
      { label: '数据留存',   value: '≥ 1 年' },
      { label: 'L4 区域',   value: '限定' },
    ],
    kpScope: ['工信部', 'OEM', 'OTA 平台', '数据安全厂商'],
    kpTrend: '预计 2026 年正式发布，与 L3 试点政策形成"上层 + 试点"组合拳。' },

  { id: 'cn-data', region: '中国', level: 'L0~L5', name: '《汽车数据安全管理若干规定》', year: '2021', status: '已生效',
    keypoints: ['车内人脸/指纹属敏感个人信息', '数据出境安全评估', '重要数据分类分级', '高精地图测绘资质'],
    kpIntro: '中国"数据三法"（《网络安全法》《数据安全法》《个人信息保护法》）在汽车行业的落地细则。2022~2024 年陆续配套高精地图测绘资质、数据出境安全评估、车内数据脱敏等技术规范。',
    kpMetrics: [
      { label: '数据出境',  value: '安全评估' },
      { label: '人脸数据',  value: '单独同意' },
      { label: '测绘资质',  value: '甲级/乙级' },
    ],
    kpScope: ['OEM', '地图厂商', '云服务商', '智驾 Tier1'],
    kpTrend: '2025 重点出台"智驾数据脱敏"和"训练数据使用"专项规范。' },

  // ============ 欧盟 ============
  { id: 'eu-gsr2', region: '欧盟', level: 'L0~L2', name: 'GSR 2 (通用安全法规)', year: '2022/2024', status: '已生效',
    keypoints: ['强制 AEB / ISA / ISA', 'DMS 强制装配', '强制 EDR', '强制 DDA 驾驶员分心监测'],
    kpIntro: '欧盟 2019/2144 号法规（GSR 2）针对所有新车强制装配主动安全件，2024 年 7 月起所有新车型必须搭载 AEB、ISA、DMS、EDR、DDA 等配置。是中国"出海车型"最常踩坑的法规。',
    kpMetrics: [
      { label: '强制时间',  value: '2024.7' },
      { label: '强制配置',  value: 'AEB+ISA+DMS+EDR+DDA' },
      { label: '罚则',      value: '禁售' },
    ],
    kpScope: ['欧盟 27 国', '出海中国 OEM', 'Tier1'],
    kpTrend: '下一轮 GSR 3 草案 2026 公开，将增加 L3 自动驾驶数据留存。' },

  { id: 'eu-r157v2', region: '欧盟', level: 'L4', name: 'UN-R157 Amendment (130km/h + 变道)', year: '2024', status: '已生效',
    keypoints: ['速度上限提升至 130km/h', '允许自动变道', '城市道路开放测试'],
    kpIntro: 'R157 修订版（2024 年生效）允许 ALKS 系统在 130km/h 以下自动变道，并首次在 UN 法规体系内开放城市道路测试。奔驰 DRIVE PILOT 是首个通过认证的量产 L3 系统。',
    kpMetrics: [
      { label: '速度',      value: '130 km/h' },
      { label: '变道',      value: '允许' },
      { label: '首认证',    value: '奔驰 DRIVE PILOT' },
    ],
    kpScope: ['奔驰', '宝马', 'Stellantis', '奥迪'],
    kpTrend: '2026 计划纳入 L3 城市 NOA 场景，进一步打开市场空间。' },

  { id: 'eu-euav', region: '欧盟', level: 'L4', name: 'EU AI Act (高风险 AI 法规)', year: '2024', status: '已生效',
    keypoints: ['高风险 AI 强制合规', '透明性 + 可解释性', '训练数据治理', '罚则达年营收 7%'],
    kpIntro: '2024 年 8 月生效的全球首部综合性 AI 法规，将自动驾驶 AI 列为"高风险类"，强制要求训练数据治理、模型可解释、风险评估和持续监测。是全球 AI 治理的"事实标杆"。',
    kpMetrics: [
      { label: '罚则',      value: '≤ 7% 营收' },
      { label: '生效',      value: '2024.8' },
      { label: '过渡期',    value: '24 个月' },
    ],
    kpScope: ['OEM', 'AI 厂商', 'Tier1', '云服务商'],
    kpTrend: '与 ISO 26262 / 21448 / 21434 形成"AI + 安全 + 网安"合规铁三角。' },

  // ============ 美国 ============
  { id: 'us-avstep', region: '美国', level: 'L4', name: 'NHTSA AV STEP', year: '2024', status: '已生效',
    keypoints: ['联邦 + 州两级', '自愿性报告框架', '无强制准入门槛', '加州 / 亚利桑那开放'],
    kpIntro: 'AV STEP 是 NHTSA（美国高速公路安全管理局）2024 年推出的自动驾驶自愿评估计划，替代了 2022 年起暂停的强制预批。核心思路是"联邦定标准 + 州政府发牌"。',
    kpMetrics: [
      { label: '报告门槛',  value: '自愿' },
      { label: '州牌照',    value: 'CA/AZ/TX/FL' },
      { label: '强制项目',  value: '无' },
    ],
    kpScope: ['Waymo', 'Cruise', 'Zoox', '特斯拉', 'Mobileye'],
    kpTrend: '2025~2026 多家 Robotaxi 运营商申请全国牌照，监管节奏会收紧。' },

  { id: 'us-fmcsa', region: '美国', level: 'L4', name: '加州 DMV CPUC 双牌照', year: '持续', status: '已生效',
    keypoints: ['测试牌照 + 部署牌照', 'CA DMV 主管', 'CPUC 监管商业运营', '事故 30s 强制报告'],
    kpIntro: '加州是全球 Robotaxi 的"政策试验场"，需同时申请 DMV 测试牌照和 CPUC 商业运营牌照。2024 年起事故 30 秒强制报告，被业内视为"最透明"的监管框架。',
    kpMetrics: [
      { label: 'DMV 测试',  value: '60+ 公司' },
      { label: 'CPUC 运营', value: '5+ 公司' },
      { label: '事故报告',  value: '30s 强制' },
    ],
    kpScope: ['Waymo', 'Cruise', 'Zoox', '百度', 'AutoX', 'Pony.ai'],
    kpTrend: '亚利桑那 / 德州紧跟加州，2025 出现跨州统一监管共识。' },

  // ============ 日本 ============
  { id: 'jp-l3', region: '日本', level: 'L3', name: '日本《道路交通法》L3 修订', year: '2020/2023', status: '已生效',
    keypoints: ['全球首部允许 L3 量产', '本田 Legend 首个量产', 'L4 限定区域', '国土交通省主导'],
    kpIntro: '2020 年 4 月生效的日本《道路交通法》修订案，是全球首部允许 L3 自动驾驶车辆合法上路的法律。本田 Legend Hybrid EX 是全球首款 L3 量产车型（2021 年 3 月，限量 100 台）。',
    kpMetrics: [
      { label: '首部 L3',  value: '2020.4' },
      { label: '首车型',   value: '本田 Legend' },
      { label: '限速',     value: '50 km/h' },
    ],
    kpScope: ['本田', '丰田', '日产', '铃木', '国土交通省'],
    kpTrend: '2025 推动 L4 在限定区域（机场、社区）商业化运营。' },
];

const STATUS_STYLES: Record<Law['status'], string> = {
  '已生效':     'bg-emerald-500/15 text-emerald-200 border-emerald-500/30',
  '试点':       'bg-cyan-500/15 text-cyan-200 border-cyan-500/30',
  '草案':       'bg-amber-500/15 text-amber-200 border-amber-500/30',
  '征求意见':   'bg-violet-500/15 text-violet-200 border-violet-500/30',
};

const REGION_BADGE: Record<Law['region'], string> = {
  '中国': 'bg-red-500/15 text-red-300 border-red-500/30',
  '欧盟': 'bg-blue-500/15 text-blue-300 border-blue-300/30',
  '美国': 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  '日本': 'bg-pink-500/15 text-pink-300 border-pink-500/30',
  '国际': 'bg-slate-500/15 text-slate-200 border-slate-500/30',
};

export default function RegulationMap() {
  return (
    <div className="space-y-6">
      {/* ============ 知识点总览 ============ */}
      <div className="glass-panel p-6">
        <h3 className="text-lg font-semibold">全球智驾法规体系</h3>
        <p className="text-sm text-ink-400 mt-1">
          中国「准入 + 试点 + 强制」三轨并行；欧盟「联合国法规 + GSR + AI Act」协同；美国「联邦宽松 + 州自定」；日本「道路交通法 + 国土交通省」主导。掌握法规即掌握市场入场券。
        </p>

        <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { t: '功能安全', d: 'ISO 26262 / SOTIF / 21434', c: 'cyan' },
            { t: '网络安全', d: 'UN-R155 / R156 / 21434', c: 'violet' },
            { t: '数据合规', d: '个保法 / 数据三法 / 测绘资质', c: 'emerald' },
            { t: 'AI 治理',  d: 'EU AI Act / 中国算法备案', c: 'amber' },
          ].map((c) => (
            <div key={c.t} className={`rounded-xl border p-3.5 bg-${c.c}-500/5 border-${c.c}-500/30`}>
              <div className={`text-sm font-semibold text-${c.c}-300`}>{c.t}</div>
              <p className="mt-1.5 text-xs text-ink-300">{c.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ============ 法规矩阵 ============ */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {LAWS.map((l) => (
          <div key={l.id} className="glass-panel p-4 hover:border-neon-400/40 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${REGION_BADGE[l.region]}`}>
                {l.region}
              </span>
              <span className="text-[10px] font-mono text-neon-300">{l.level}</span>
              <span className="text-[10px] text-ink-500 ml-auto">{l.year}</span>
            </div>
            <h4 className="text-sm font-semibold leading-snug line-clamp-2">{l.name}</h4>
            <span className={`mt-2 inline-block text-[10px] px-1.5 py-0.5 rounded-full border ${STATUS_STYLES[l.status]}`}>
              {l.status}
            </span>

            <p className="mt-3 text-[11px] text-ink-300 leading-relaxed line-clamp-3">{l.kpIntro}</p>

            <ul className="mt-2 space-y-1">
              {l.keypoints.map((k) => (
                <li key={k} className="flex gap-1.5 text-[11px] text-ink-300">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-neon-400 shrink-0" />
                  {k}
                </li>
              ))}
            </ul>

            <div className="mt-3 pt-3 border-t border-ink-800/60 space-y-2 text-[10px]">
              <div className="flex flex-wrap gap-1.5">
                {l.kpMetrics.map((m) => (
                  <span key={m.label} className="px-1.5 py-0.5 rounded bg-ink-800/60 text-cyan-200 font-mono">
                    {m.label} <span className="text-ink-400">{m.value}</span>
                  </span>
                ))}
              </div>
              <div className="text-ink-500">
                <span className="text-ink-400">影响范围：</span>{l.kpScope.join(' / ')}
              </div>
              <div className="text-amber-300/80 leading-relaxed">
                <span className="text-amber-300">📈 趋势：</span>{l.kpTrend}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ============ ODD 维度 ============ */}
      <div className="glass-panel p-6">
        <h3 className="text-lg font-semibold">ODD（运行设计域）六大维度</h3>
        <p className="text-sm text-ink-400 mt-1">任意 L3+ 功能都必须清晰定义其 ODD，越界即不可用，越界即责任转回驾驶员。</p>

        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { t: '道路类型',     d: '高速 / 快速路 / 城市主路 / 园区 / 停车场' },
            { t: '地理范围',     d: '行政区域 / 测绘合规 / 高精地图覆盖' },
            { t: '速度区间',     d: '0~130km/h 不等；ALKS 扩展至 130' },
            { t: '时间 / 光照',  d: '昼夜 / 雨雪雾 / 隧道内外光照切换' },
            { t: '天气条件',     d: '能见度 / 积水 / 冰雪 / 信号干扰' },
            { t: '其他目标物',   d: '行人 / 两轮车 / 动物 / 施工 / 锥桶' },
          ].map((c) => (
            <div key={c.t} className="rounded-xl border border-ink-800 p-3.5 bg-ink-900/40">
              <div className="text-sm font-semibold text-neon-300">{c.t}</div>
              <p className="mt-1.5 text-xs text-ink-400">{c.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ============ 合规速查 ============ */}
      <div className="glass-panel p-6">
        <h3 className="text-lg font-semibold">出海合规速查（按目的地）</h3>
        <p className="text-sm text-ink-400 mt-1">中国 OEM / Tier1 进入不同市场的"最低准入清单"。</p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-ink-400 border-b border-ink-800">
                <th className="text-left py-2 px-3 font-medium">目的地</th>
                <th className="text-left py-2 px-3 font-medium">功能安全</th>
                <th className="text-left py-2 px-3 font-medium">网安/OTA</th>
                <th className="text-left py-2 px-3 font-medium">数据</th>
                <th className="text-left py-2 px-3 font-medium">L3 准入</th>
              </tr>
            </thead>
            <tbody className="text-ink-200">
              {[
                { dst: '欧盟',   fs: 'ISO 26262 + 21448',  cy: 'R155 + R156',    dt: 'GDPR + AI Act', l3: 'UN-R157' },
                { dst: '美国',   fs: 'ISO 26262 (推荐)',    cy: 'NIST CSF (推荐)', dt: 'CCPA + 州法',   l3: 'AV STEP' },
                { dst: '日本',   fs: 'ISO 26262',          cy: 'R155 等同',       dt: 'APPI',          l3: '道路交通法' },
                { dst: '中国',   fs: 'GB 强制 + 推荐 26262', cy: '等保 2.0 + 三法', dt: '数据三法',      l3: 'L3 试点' },
              ].map((r) => (
                <tr key={r.dst} className="border-b border-ink-800/50 hover:bg-ink-900/40">
                  <td className="py-2 px-3 font-semibold text-neon-200">{r.dst}</td>
                  <td className="py-2 px-3 font-mono text-cyan-200">{r.fs}</td>
                  <td className="py-2 px-3 font-mono text-violet-200">{r.cy}</td>
                  <td className="py-2 px-3 font-mono text-emerald-200">{r.dt}</td>
                  <td className="py-2 px-3 font-mono text-amber-200">{r.l3}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
