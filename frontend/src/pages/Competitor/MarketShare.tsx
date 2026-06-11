interface Share {
  vendor: string;
  tone:   'cyan' | 'red' | 'amber' | 'blue' | 'violet' | 'pink' | 'emerald';
  share:  number;     // 2025 智驾装车份额
  yoY:    number;     // 同比变化
  highlight: string;
  trend:  string;
}

const SHARES: Share[] = [
  { vendor: '比亚迪',   tone: 'emerald', share: 28.4, yoY: +5.2, highlight: '天神之眼 C 全系标配',  trend: '7~10 万级下探优势' },
  { vendor: '特斯拉',   tone: 'red',     share: 12.1, yoY: +1.5, highlight: 'FSD V13 端到端',         trend: '2025 Robotaxi 上线' },
  { vendor: '小鹏',     tone: 'cyan',    share:  9.6, yoY: +2.8, highlight: '城区 NOA 开城最广',      trend: '图灵芯片 + 端到端' },
  { vendor: '华为 (鸿蒙智行)', tone: 'amber', share: 8.4, yoY: +3.6, highlight: 'ADS 4.0 + 192 线激光雷达', trend: 'L3 试点已获批' },
  { vendor: '理想',     tone: 'violet',  share:  6.8, yoY: +1.2, highlight: 'AD Max V13',              trend: '家庭端到端量产' },
  { vendor: '蔚来',     tone: 'blue',    share:  4.2, yoY: +0.8, highlight: 'NADArch + World Model',   trend: '换电 + 智驾协同' },
  { vendor: '其他新势力', tone: 'pink',  share: 13.5, yoY: +2.1, highlight: '小米 / 极氪 / 智己',      trend: '新进入者加速' },
  { vendor: '其他传统', tone: 'cyan',    share: 17.0, yoY: -2.4, highlight: '吉利 / 长安 / 奇瑞',      trend: '跟随策略 + 自研追赶' },
];

const DOT: Record<Share['tone'], string> = {
  cyan: 'bg-cyan-400', red: 'bg-red-400', amber: 'bg-amber-400',
  blue: 'bg-blue-400', violet: 'bg-violet-400', pink: 'bg-pink-400', emerald: 'bg-emerald-400',
};

export default function MarketShare() {
  const max = Math.max(...SHARES.map((s) => s.share));

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6">
        <h3 className="text-lg font-semibold">2025 中国市场智驾装车份额（季度数据）</h3>
        <p className="text-sm text-ink-400 mt-1">
          数据来源：乘联会 + 高工智能汽车 + 终端调研（2025 Q1）。
          头部三家（比亚迪 / 特斯拉 / 小鹏）合计 50%+；新势力增速 100%+。
        </p>

        <div className="mt-6 space-y-3">
          {SHARES.map((s) => (
            <div key={s.vendor} className="rounded-xl border border-ink-800 p-3.5 bg-ink-900/40">
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${DOT[s.tone]}`} />
                <span className="text-sm font-semibold text-ink-100">{s.vendor}</span>
                <span className="ml-auto text-base font-mono text-neon-200">{s.share.toFixed(1)}%</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full border
                  ${s.yoY >= 0
                    ? 'border-emerald-500/30 text-emerald-200 bg-emerald-500/10'
                    : 'border-red-500/30 text-red-200 bg-red-500/10'}`}>
                  {s.yoY >= 0 ? '+' : ''}{s.yoY.toFixed(1)}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-ink-800 overflow-hidden">
                <div
                  className={`h-full ${DOT[s.tone]}`}
                  style={{ width: `${(s.share / max) * 100}%` }}
                />
              </div>
              <div className="mt-2 grid sm:grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-pink-300">✨ 亮点：</span>
                  <span className="text-ink-200">{s.highlight}</span>
                </div>
                <div>
                  <span className="text-cyan-300">📈 趋势：</span>
                  <span className="text-ink-200">{s.trend}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass-panel p-6">
          <h4 className="text-base font-semibold text-cyan-300">🏆 第一梯队 · 头部玩家</h4>
          <ul className="mt-3 space-y-2 text-sm text-ink-300">
            <li>· <b>比亚迪</b>：规模化优势 + 全系标配天神之眼 C</li>
            <li>· <b>特斯拉</b>：端到端标杆 + Robotaxi 即将上线</li>
            <li>· <b>小鹏</b>：城区 NOA 开城 + 图灵自研芯片</li>
            <li>· <b>华为</b>：激光雷达成本控制 + L3 试点</li>
          </ul>
        </div>
        <div className="glass-panel p-6">
          <h4 className="text-base font-semibold text-amber-300">🚀 第二梯队 · 追赶者</h4>
          <ul className="mt-3 space-y-2 text-sm text-ink-300">
            <li>· <b>理想</b>：家庭场景 + 端到端 VLM</li>
            <li>· <b>蔚来</b>：世界模型 + 换电协同</li>
            <li>· <b>小米 SU7</b>：2025 强势进入，30 万+ 智驾标配</li>
            <li>· <b>极氪 / 智己</b>：上汽 + 阿里背景，差异化突围</li>
          </ul>
        </div>
      </div>

      <div className="glass-panel p-6">
        <h4 className="text-base font-semibold text-violet-300">💎 关键洞察</h4>
        <div className="mt-3 grid sm:grid-cols-3 gap-3 text-xs">
          <div className="rounded-xl border border-ink-800 p-3 bg-ink-900/40">
            <div className="text-cyan-300 font-semibold">规模化 &gt; 技术领先</div>
            <p className="mt-1 text-ink-300">比亚迪靠 400+ 万装车量稳居第一，"7 万级标配智驾"重新定义行业门槛。</p>
          </div>
          <div className="rounded-xl border border-ink-800 p-3 bg-ink-900/40">
            <div className="text-amber-300 font-semibold">端到端是分水岭</div>
            <p className="mt-1 text-ink-300">2025 后未量产端到端的车企，技术上已被"二线化"；VLM 接管是 2026 决胜点。</p>
          </div>
          <div className="rounded-xl border border-ink-800 p-3 bg-ink-900/40">
            <div className="text-emerald-300 font-semibold">L3 准入是 2026 关键</div>
            <p className="mt-1 text-ink-300">获 L3 准入试点（华为/奔驰/宝马）的车企将率先进入"准 L3 商业化"赛道。</p>
          </div>
        </div>
      </div>
    </div>
  );
}
