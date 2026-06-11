interface Model {
  vendor: string;
  tone:   'cyan' | 'red' | 'amber' | 'blue' | 'violet' | 'emerald';
  price:  string;        // 订阅价或买断价
  bundle: string;        // 捆绑策略
  rev:    string;        // 营收模式
  upside: string;        // 增长点
}

const MODELS: Model[] = [
  { vendor: '特斯拉', tone: 'red', price: 'FSD 一次性 6.4 万 / 订阅 ¥699/月',
    bundle: '完全独立产品线，与保险 / 充电解耦', rev: '买断 + 订阅组合', upside: 'Robotaxi 网络后抽佣' },
  { vendor: '小鹏',   tone: 'cyan', price: '5.6 万终身 / 订阅 ¥2 万 / 年',
    bundle: '随车标配基础 L2，XNGP 高阶付费',     rev: '买断 + 订阅',         upside: '智能驾驶保险合作' },
  { vendor: '华为',   tone: 'amber', price: 'ADS 高阶包 1.8 万（一次性）',
    bundle: '智驾 + 座舱打包销售',                  rev: '一次性 + 车型配置',   upside: 'Tier-1 供应商收入' },
  { vendor: '蔚来',   tone: 'blue', price: 'NAD 完整包 3.8 万（一次性）',
    bundle: 'NIO Day 限免 + 老车主回馈',            rev: '一次性为主',         upside: '订阅 + 服务化' },
  { vendor: '理想',   tone: 'violet', price: 'AD Max 标配于 30 万+ 车型',
    bundle: '高端车型捆绑销售',                      rev: '随车销售',           upside: '智驾保险 + 出行服务' },
  { vendor: '比亚迪', tone: 'emerald', price: '天神之眼 A 选配 ¥2 万 / B 标配',
    bundle: '下探到 7~15 万级车型',                  rev: '车型配置分级',       upside: '规模化数据反哺' },
];

const DOT: Record<Model['tone'], string> = {
  cyan: 'bg-cyan-400', red: 'bg-red-400', amber: 'bg-amber-400',
  blue: 'bg-blue-400', violet: 'bg-violet-400', emerald: 'bg-emerald-400',
};

export default function BusinessModel() {
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        {MODELS.map((m) => (
          <div key={m.vendor} className="glass-panel p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-2.5 h-2.5 rounded-full ${DOT[m.tone]}`} />
              <h3 className="text-base font-semibold">{m.vendor}</h3>
            </div>
            <p className="text-sm text-neon-200">{m.price}</p>
            <dl className="mt-3 space-y-2 text-xs text-ink-300">
              <div>
                <dt className="text-ink-500">捆绑策略</dt>
                <dd className="text-ink-200 mt-0.5">{m.bundle}</dd>
              </div>
              <div>
                <dt className="text-ink-500">营收模式</dt>
                <dd className="text-ink-200 mt-0.5">{m.rev}</dd>
              </div>
              <div>
                <dt className="text-ink-500">增长点</dt>
                <dd className="text-emerald-200 mt-0.5">{m.upside}</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>

      {/* 商业模式进化图谱 */}
      <div className="glass-panel p-6">
        <h3 className="text-base font-semibold text-neon-300">📈 商业模式演进路线</h3>
        <ol className="mt-4 grid sm:grid-cols-4 gap-3">
          {[
            { t: '硬件销售', d: '随车销售，标配或选配' },
            { t: '订阅服务', d: '月费 / 年费，按需解锁' },
            { t: '保险 / 数据', d: 'UBI 保险 + 数据服务' },
            { t: 'Robotaxi', d: '运营分成 + 网络效应' },
          ].map((s, i) => (
            <li key={s.t} className="relative rounded-xl border border-ink-800 p-3.5 bg-ink-900/40">
              <div className="text-xs text-neon-300 font-mono">阶段 {i + 1}</div>
              <div className="mt-1 text-sm font-semibold">{s.t}</div>
              <p className="mt-1 text-xs text-ink-400">{s.d}</p>
              {i < 3 && (
                <span className="hidden sm:block absolute -right-2 top-1/2 -translate-y-1/2 text-ink-600">→</span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
