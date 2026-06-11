interface Vendor {
  id:      string;
  name:    string;
  brand:   string;
  tone:    'cyan' | 'red' | 'amber' | 'blue' | 'violet' | 'pink' | 'emerald';
  system:  string;
  level:   'L2' | 'L2+' | 'L3 试点' | 'L3 量产' | 'L4 限定';
  cities:  number;
  feature: string;
  pros:    string[];
  cons:    string[];
  best4:   string;
  /** 2025 最新数据 */
  latest: { metric: string; value: string }[];
  /** 亮点与价值 */
  highlight: string;
  valueProp: string;
}

const VENDORS: Vendor[] = [
  { id: 'tesla',  name: '特斯拉', brand: 'Tesla FSD V13', tone: 'red',
    system: 'FSD V13.2 (Supervised)', level: 'L2+', cities: 0,
    feature: 'BEV + Transformer + 端到端 One Model',
    pros: ['全球最大数据规模 (10+ PB)', 'HW4 自研芯片 + 算力优势', '影子模式 + Dojo 训练闭环'],
    cons: ['中国本地化弱', '高精地图未铺设', '纯视觉雨雾夜受限'],
    best4: '极客玩家 / 海外体验用户',
    latest: [
      { metric: '累计里程',     value: '40+ 亿 km' },
      { metric: 'V13 推送城市', value: '美国 + 加拿大' },
      { metric: '端到端参数',   value: '百亿级' },
      { metric: 'Robotaxi',     value: '2025 年内试运营' },
    ],
    highlight: '全球端到端量产第一人',
    valueProp: '用规模化数据 + 自研算力 + 闭环训练把端到端方案推到极致；2025 Robotaxi 上线将打开"硬件 → 服务"的新营收空间。' },

  { id: 'xpeng',  name: '小鹏', brand: 'XNGP 5.5 / 图灵', tone: 'cyan',
    system: 'XNGP 5.5 + 图灵芯片', level: 'L2+', cities: 300,
    feature: '端到端 + VLM 接管 + XBain',
    pros: ['城区 NOA 开城最广 (300+)', '图灵自研芯片 750 TOPS', '本地化体验 + OTA 节奏快'],
    cons: ['重激光雷达 BOM 成本', '数据闭环起步晚', '盈利能力承压'],
    best4: '城区 NOA 重度用户',
    latest: [
      { metric: '开城数量',  value: '300+ 城' },
      { metric: '图灵算力',  value: '750 TOPS' },
      { metric: '智驾里程',  value: '5+ 亿 km' },
      { metric: '海外布局',  value: '欧洲 + 东南亚' },
    ],
    highlight: '城区 NOA 开城王',
    valueProp: '"开城数量 + OTA 节奏 + 自研芯片"组合拳，是中国新势力中"智驾即品牌"的代表；图灵芯片单颗算力对标英伟达 Thor。' },

  { id: 'huawei', name: '华为', brand: '乾崑 ADS 4.0', tone: 'amber',
    system: '乾崑 ADS 4.0 + MDC 810', level: 'L3 试点', cities: 400,
    feature: 'BEV + GOD + RCR + CAS',
    pros: ['激光雷达成本压低 (192 线)', '全国道路覆盖 400+ 城', '与车 BU 强协同'],
    cons: ['供应商定位', '合作车型依赖鸿蒙智行', '与车厂存在博弈'],
    best4: '鸿蒙智行车主 / 高端市场',
    latest: [
      { metric: '覆盖城市',  value: '400+ 城' },
      { metric: '激光雷达',  value: '192 线' },
      { metric: '合作车型',  value: '问界 / 智界 / 享界 / 尊界' },
      { metric: 'L3 准入',  value: '已获试点' },
    ],
    highlight: '国产智驾 Tier-1 王者',
    valueProp: '"激光雷达成本控制 + GOD/RCR 算法 + 全栈式解决方案"打包卖给鸿蒙智行，2025 已获 L3 准入试点，是国产智驾出海的标杆。' },

  { id: 'nio',    name: '蔚来', brand: 'NADArch 2.0', tone: 'blue',
    system: 'NADArch 2.0 + NIO World Model', level: 'L2+', cities: 250,
    feature: 'BEV + World Model + 强化学习',
    pros: ['换电 + 智驾联动', '世界模型自研', 'NOMI 体验独特'],
    cons: ['智驾推进节奏偏慢', '硬件激进成本高', '研发投入压力大'],
    best4: 'NIO 车主 / 高端纯电用户',
    latest: [
      { metric: 'NOP+ 城市',   value: '250+ 城' },
      { metric: '世界模型',    value: '已开源 NWM' },
      { metric: '换电站',      value: '3000+ 站' },
      { metric: '智驾里程',    value: '10+ 亿 km' },
    ],
    highlight: '世界模型 + 服务化体验',
    valueProp: '"换电网络 + 高端服务 + 世界模型自研"形成差异化护城河；2025 NWM 开源向行业输出能力。' },

  { id: 'li',     name: '理想', brand: 'AD Max V13', tone: 'violet',
    system: 'AD Max V13 + 端到端 + VLM', level: 'L2+', cities: 110,
    feature: '端到端 + VLM + AEB 自动转向',
    pros: ['家庭场景理解深', '增程 + 智驾双重标签', 'OTA 节奏快 + 用户口碑好'],
    cons: ['城区 NOA 体验仍处追赶期', '纯视觉方案受质疑', '增程退场风险'],
    best4: '家庭用户 / 增程 SUV',
    latest: [
      { metric: 'AD Max 城市', value: '110+ 城' },
      { metric: 'V13 推送',    value: '2025 Q1' },
      { metric: '端到端模型',  value: 'VLM 双系统' },
      { metric: '智驾里程',    value: '30+ 亿 km' },
    ],
    highlight: '家庭智驾 + 端到端量产',
    valueProp: '"家庭场景语义理解 + 端到端 VLM 双系统"使 AD Max 在家庭出行场景的用户感知最稳；销量放量反哺数据闭环。' },

  { id: 'byd',    name: '比亚迪', brand: '天神之眼 A/B/C', tone: 'emerald',
    system: '天神之眼 (A 高端 / B 中端 / C 普及)', level: 'L2+', cities: 60,
    feature: '阶梯式方案 + 自研芯片',
    pros: ['价格下沉到 7 万级 (天神之眼 C)', '多档位方案铺货', '天神之眼 C 全系标配'],
    cons: ['高端能力建设晚', '算力受限于外购', '算法迭代节奏慢'],
    best4: '普及型家用车用户',
    latest: [
      { metric: '天神之眼 C', value: '全系标配' },
      { metric: '下探价位',  value: '7~10 万' },
      { metric: '高端方案',  value: 'A (仰望) / B (腾势)' },
      { metric: '装车量',    value: '行业第一 (年 400+ 万)' },
    ],
    highlight: '智驾下沉普及之王',
    valueProp: '"装车规模 + 价格梯度 + 自研芯片"把智驾从"奢侈品"变"日用品"；2025 年天神之眼 C 覆盖 7~15 万车型，是"国民智驾"代表。' },

  { id: 'mb',     name: '奔驰', brand: 'DRIVE PILOT L3', tone: 'cyan',
    system: 'DRIVE PILOT (L3 量产)', level: 'L3 量产', cities: 0,
    feature: 'L3 量产先发 + 130km/h ALKS',
    pros: ['全球首个 L3 量产 (德国 + 美国)', '激光雷达 + 高精地图 + 冗余系统', '安全论据完整'],
    cons: ['ODD 限制严苛 (高速/白天/晴天)', '价格高 (选装 5~8 万)', '城市 NOA 进展慢'],
    best4: '高端商务用户 / 海外市场',
    latest: [
      { metric: 'L3 速度',  value: '130 km/h' },
      { metric: 'L3 国家',  value: '德/美/中(试点)' },
      { metric: 'ALKS',     value: 'UN-R157 认证' },
      { metric: '下一代',   value: '城市 NOA 2026' },
    ],
    highlight: 'L3 量产先发',
    valueProp: '"UN-R157 认证 + 量产 + 保险全链路"使奔驰在 L3 商业化上领先；是 L3 法规体系的"事实标杆"和保险模型参考。' },

  { id: 'waymo',  name: 'Waymo', brand: 'Waymo One (L4)', tone: 'red',
    system: 'Waymo Driver (L4 Robotaxi)', level: 'L4 限定', cities: 5,
    feature: 'BEV + 5 LiDAR + 端到端',
    pros: ['全球最大 Robotaxi 网络', '事故率 < 人类驾驶 1/10', '5x LiDAR 多模态冗余'],
    cons: ['限定区域运营', '无法快速扩展', 'L3/L2 量产经验少'],
    best4: '海外 Robotaxi 体验用户',
    latest: [
      { metric: '运营城市',  value: '凤凰城 / 旧金山 / 洛杉矶 / 奥斯汀' },
      { metric: '周订单',    value: '25+ 万单' },
      { metric: '事故率',    value: '< 人类 10%' },
      { metric: '估值',      value: '$45B (2025)' },
    ],
    highlight: '全球 Robotaxi 标杆',
    valueProp: '唯一大规模商业化 L4 Robotaxi，估值 450 亿美元；2025 跨州扩张+ Toyota 合作预示"端到端 + 限定区域"路线的胜利。' },
];

const TONE: Record<Vendor['tone'], string> = {
  cyan:    'border-cyan-500/40 bg-cyan-500/5',
  red:     'border-red-500/40 bg-red-500/5',
  amber:   'border-amber-500/40 bg-amber-500/5',
  blue:    'border-blue-500/40 bg-blue-500/5',
  violet:  'border-violet-500/40 bg-violet-500/5',
  pink:    'border-pink-500/40 bg-pink-500/5',
  emerald: 'border-emerald-500/40 bg-emerald-500/5',
};

const TONE_DOT: Record<Vendor['tone'], string> = {
  cyan: 'bg-cyan-400', red: 'bg-red-400', amber: 'bg-amber-400',
  blue: 'bg-blue-400', violet: 'bg-violet-400', pink: 'bg-pink-400', emerald: 'bg-emerald-400',
};

export default function VendorCards() {
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {VENDORS.map((v) => (
          <div key={v.id} className={`rounded-2xl border p-5 ${TONE[v.tone]} flex flex-col`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-2.5 h-2.5 rounded-full ${TONE_DOT[v.tone]}`} />
              <h3 className="text-base font-semibold">{v.name}</h3>
              <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full border border-ink-700 text-ink-300 font-mono">
                {v.level}
              </span>
            </div>
            <p className="text-sm text-neon-200">{v.brand}</p>
            <p className="mt-1.5 text-xs text-ink-400">{v.system}</p>

            <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <div className="text-ink-500">技术路线</div>
                <div className="text-ink-200 mt-0.5">{v.feature}</div>
              </div>
              <div>
                <div className="text-ink-500">覆盖城市</div>
                <div className="text-ink-200 mt-0.5 font-mono">
                  {v.cities === 0 ? '全球路测' : `${v.cities}+ 城`}
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-[11px]">
              <div>
                <div className="text-emerald-300 mb-1">优势</div>
                <ul className="space-y-1 text-ink-200">
                  {v.pros.map((p) => <li key={p}>· {p}</li>)}
                </ul>
              </div>
              <div>
                <div className="text-amber-300 mb-1">挑战</div>
                <ul className="space-y-1 text-ink-200">
                  {v.cons.map((p) => <li key={p}>· {p}</li>)}
                </ul>
              </div>
            </div>

            {/* 2025 最新数据 */}
            <div className="mt-4 pt-3 border-t border-ink-800/40">
              <div className="text-[10px] text-neon-300 font-mono mb-1.5">📊 2025 最新数据</div>
              <div className="grid grid-cols-2 gap-1.5">
                {v.latest.map((m) => (
                  <div key={m.metric} className="text-[10px]">
                    <div className="text-ink-500">{m.metric}</div>
                    <div className="text-ink-200 font-mono mt-0.5">{m.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-ink-800/50 text-[11px] text-ink-400">
              <div><span className="text-pink-300">✨ 亮点：</span><b className="text-ink-200">{v.highlight}</b></div>
              <p className="mt-1.5 text-ink-300 leading-relaxed">{v.valueProp}</p>
              <div className="mt-2">适合人群：<b className="text-ink-200">{v.best4}</b></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
