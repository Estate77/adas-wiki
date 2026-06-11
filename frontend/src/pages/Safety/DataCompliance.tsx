interface Domain {
  id:      string;
  icon:    string;
  title:   string;
  std:     string[];
  scope:   string;
  requirement: string;
  penalty: string;
  tone:    'cyan' | 'violet' | 'emerald' | 'amber' | 'pink' | 'red';
}

const DOMAINS: Domain[] = [
  { id: 'funcsafe', icon: '🛡️', title: '功能安全', tone: 'cyan',
    std: ['ISO 26262 (3rd 2024)', 'ASIL A~D', 'V 模型'],
    scope: 'OEM / Tier1 / 芯片厂',
    requirement: '定义 ASIL 等级 → FMEA/FTA → 软硬件安全机制 → 测试覆盖率 MC/DC ≥ 100%',
    penalty: '车型无法上市 + 召回 + 信誉损失' },

  { id: 'sotif', icon: '🤖', title: '预期功能安全', tone: 'amber',
    std: ['ISO 21448 (2022)', 'EU AI Act'],
    scope: 'AI 感知 / 规控算法',
    requirement: '触发条件识别 → 4 区分布 → 区域降级 → SOTIF 释放论据',
    penalty: 'EU 禁售 + AI Act 罚则 ≤ 7% 营收' },

  { id: 'cybersec', icon: '🔐', title: '网络安全', tone: 'violet',
    std: ['UN-R155 CSMS', 'ISO/SAE 21434', 'TARA'],
    scope: '全生命周期 + 供应链',
    requirement: 'TARA 威胁分析 → 安全机制 → 渗透测试 → 漏洞响应 ≤ 90 天',
    penalty: '车型禁售 + 罚款 + 召回' },

  { id: 'ota', icon: '📡', title: 'OTA / 软件更新', tone: 'pink',
    std: ['UN-R156 SUMS', '中国准入条例'],
    scope: 'OEM OTA 平台 + Tier1',
    requirement: '软件更新不影响安全性能 + 完整版本管理 + 回滚机制',
    penalty: 'OTA 违规可被处罚款 + 撤销资质' },

  { id: 'data', icon: '🗂️', title: '数据合规', tone: 'emerald',
    std: ['个保法 PIPL', '数据安全法 DSL', 'GDPR', '汽车数据安全规定'],
    scope: 'OEM + 数据合作方 + 云服务商',
    requirement: '数据分类分级 + 单独同意 + 数据脱敏 + 出境安全评估',
    penalty: '罚款 ≤ 5000 万或上年营收 5%' },

  { id: 'map', icon: '🗺️', title: '高精地图 / 测绘', tone: 'amber',
    std: ['测绘法', '导航电子地图资质', '甲级 / 乙级'],
    scope: '地图厂商 + OEM + 智驾 Tier1',
    requirement: '甲级测绘资质 + 坐标偏转 + 数据本地化 + 涉密审查',
    penalty: '资质吊销 + 涉密责任' },

  { id: 'ethics', icon: '🧭', title: 'AI 伦理', tone: 'pink',
    std: ['EU AI Act 高风险类', '中国 AI 伦理审查', 'OECD AI 原则'],
    scope: 'OEM + AI 算法厂商 + 云服务商',
    requirement: '可解释性 + 公平性 + 透明度 + 人类监督',
    penalty: 'EU AI Act 罚则 ≤ 7% 营收' },

  { id: 'privacy', icon: '👤', title: '隐私保护', tone: 'cyan',
    std: ['PIPL 个保法', 'GDPR', '车内人脸单独同意'],
    scope: 'OEM + DMS 厂商 + 车机 OS',
    requirement: '隐私设计（Privacy by Design）+ 最小化 + 单独同意 + 撤回机制',
    penalty: '罚款 ≤ 5000 万或上年营收 5%' },
];

const CHECK_LIST = [
  { area: '数据采集',   item: '是否取得单独同意（车内人脸/指纹）' },
  { area: '数据存储',   item: '是否分级分类 + 脱敏存储 + 加密传输' },
  { area: '数据使用',   item: '训练数据是否涉及个人信息' },
  { area: '数据共享',   item: '是否签订数据共享协议 + 安全评估' },
  { area: '数据出境',   item: '是否完成安全评估 / 标准合同备案' },
  { area: 'OTA 升级',   item: '是否通过 SUMS 认证 + 完整性校验' },
  { area: '事故留痕',   item: 'DSSAD 是否保存 ≥ 6 个月事件数据' },
  { area: '伦理审查',   item: 'AI 决策是否可解释 + 是否保留人类否决权' },
];

const TONE: Record<Domain['tone'], string> = {
  cyan:    'border-cyan-500/30 bg-cyan-500/5',
  amber:   'border-amber-500/30 bg-amber-500/5',
  violet:  'border-violet-500/30 bg-violet-500/5',
  emerald: 'border-emerald-500/30 bg-emerald-500/5',
  pink:    'border-pink-500/30 bg-pink-500/5',
  red:     'border-red-500/30 bg-red-500/5',
};

export default function DataCompliance() {
  return (
    <div className="space-y-6">
      {/* 介绍 */}
      <div className="glass-panel p-6">
        <h3 className="text-lg font-semibold">数据合规 × 网络安全 × AI 伦理</h3>
        <p className="text-sm text-ink-400 mt-1">
          智驾系统的合规框架正从"单一功能安全"向"功能安全 + 网安 + 数据 + AI 伦理"四象限演进。2024 年起欧盟 AI Act、中国《汽车数据安全管理规定》联合生效，形成"全球最严"的双轨监管。
        </p>
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {[
            { t: '功能安全', d: 'ISO 26262 / SOTIF',  c: 'cyan' },
            { t: '网络安全', d: 'R155 / 21434',        c: 'violet' },
            { t: '数据合规', d: 'PIPL / GDPR / 数据三法', c: 'emerald' },
            { t: 'AI 伦理',  d: 'EU AI Act / OECD',     c: 'amber' },
          ].map((x) => (
            <div key={x.t} className={`rounded-xl border p-3 bg-${x.c}-500/5 border-${x.c}-500/30`}>
              <div className={`font-semibold text-${x.c}-300`}>{x.t}</div>
              <p className="mt-1 text-ink-300">{x.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 8 大合规域 */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {DOMAINS.map((d) => (
          <div key={d.id} className={`rounded-2xl border p-4 ${TONE[d.tone]}`}>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{d.icon}</span>
              <div className="text-sm font-semibold text-ink-100">{d.title}</div>
            </div>
            <div className="mt-3 space-y-1.5 text-[11px]">
              <div>
                <div className="text-ink-400">法规 / 标准</div>
                <div className="text-ink-200 mt-0.5 font-mono">{d.std.join(' / ')}</div>
              </div>
              <div>
                <div className="text-ink-400">适用对象</div>
                <div className="text-ink-200 mt-0.5">{d.scope}</div>
              </div>
              <div>
                <div className="text-ink-400">核心要求</div>
                <div className="text-ink-200 mt-0.5 leading-relaxed">{d.requirement}</div>
              </div>
              <div>
                <div className="text-ink-400">罚则</div>
                <div className="text-red-300 mt-0.5">{d.penalty}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 8 大数据合规清单 */}
      <div className="glass-panel p-6">
        <h3 className="text-base font-semibold text-cyan-300">📋 8 大数据合规自检清单</h3>
        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          {CHECK_LIST.map((c, i) => (
            <div key={i} className="rounded-xl border border-ink-800 p-3 bg-ink-900/40 flex items-start gap-3">
              <span className="text-[10px] font-mono text-ink-400 mt-0.5 shrink-0">{(i + 1).toString().padStart(2, '0')}</span>
              <div>
                <div className="text-sm font-semibold text-neon-300">{c.area}</div>
                <p className="mt-0.5 text-xs text-ink-300">{c.item}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 责任主体 / 出海策略 */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass-panel p-6">
          <h3 className="text-base font-semibold text-emerald-300">🏢 各方责任主体</h3>
          <ul className="mt-3 space-y-2 text-sm text-ink-300">
            <li>· <b>OEM 整车厂</b>：最终责任 + 合规主体 + 数据控制者</li>
            <li>· <b>Tier1 供应商</b>：合同义务 + 零部件级安全 + 数据处理协议</li>
            <li>· <b>云服务商</b>：数据保护 + 跨境传输 + 安全评估</li>
            <li>· <b>地图厂商</b>：测绘资质 + 坐标偏转 + 数据本地化</li>
            <li>· <b>OTA 平台</b>：SUMS 体系 + 版本管理 + 回滚机制</li>
            <li>· <b>AI 算法厂商</b>：可解释性 + 训练数据治理 + 模型审计</li>
          </ul>
        </div>
        <div className="glass-panel p-6">
          <h3 className="text-base font-semibold text-violet-300">🌍 出海合规策略</h3>
          <ul className="mt-3 space-y-2 text-sm text-ink-300">
            <li>· <b>欧盟</b>：GDPR + AI Act + UN-R155/R156 铁三角</li>
            <li>· <b>美国</b>：CCPA + NHTSA 自愿 + 州法（CA/AZ/FL）</li>
            <li>· <b>日本</b>：APPI + 道路交通法 + UN-R155 等同</li>
            <li>· <b>东南亚</b>：泰国 / 新加坡 / 印尼差异化策略</li>
            <li>· <b>中东</b>：UAE / 沙特逐步接受 UN 法规</li>
            <li>· <b>认证机构</b>：TÜV / SGS / DNV / UTAC 选 1~2 家长期合作</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
