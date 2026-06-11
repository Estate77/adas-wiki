interface Level {
  id:   'L0' | 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
  name: string;
  role: string;        // 谁负责
  when: string;        // 何时介入
  examples: string[];
  tone:  'emerald' | 'cyan' | 'amber' | 'pink' | 'red' | 'violet';
}

const LEVELS: Level[] = [
  { id: 'L0', tone: 'emerald', name: '无自动化',
    role: '驾驶员', when: '全程',
    examples: ['纯人工驾驶', '传统 ABS / ESC 仅作辅助'] },
  { id: 'L1', tone: 'cyan',    name: '驾驶辅助',
    role: '驾驶员', when: '持续监控',
    examples: ['ACC 自适应巡航', 'LKA 车道保持', 'AEB 自动紧急制动'] },
  { id: 'L2', tone: 'amber',   name: '部分自动化',
    role: '驾驶员', when: '持续监控 + 随时接管',
    examples: ['Tesla Autopilot', '高速 NOA', '理想/小鹏/蔚来高速辅助'] },
  { id: 'L3', tone: 'pink',    name: '有条件自动化',
    role: '系统主导，驾驶员作后备', when: 'ODD 内',
    examples: ['奔驰 Drive Pilot (德国高速)', 'Honda Legend', '中国 L3 试点'] },
  { id: 'L4', tone: 'red',     name: '高度自动化',
    role: '系统', when: 'ODD 内全责',
    examples: ['百度萝卜快跑 (限定区域)', 'Waymo (凤凰城)', '园区接驳车'] },
  { id: 'L5', tone: 'violet',  name: '完全自动化',
    role: '系统', when: '任何场景',
    examples: ['目前无量产', '需要解决全场景 ODD 覆盖'] },
];

const TONE: Record<Level['tone'], string> = {
  emerald: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-200',
  cyan:    'border-cyan-500/30 bg-cyan-500/5 text-cyan-200',
  amber:   'border-amber-500/30 bg-amber-500/5 text-amber-200',
  pink:    'border-pink-500/30 bg-pink-500/5 text-pink-200',
  red:     'border-red-500/30 bg-red-500/5 text-red-200',
  violet:  'border-violet-500/30 bg-violet-500/5 text-violet-200',
};

const DOT: Record<Level['tone'], string> = {
  emerald: 'bg-emerald-400', cyan: 'bg-cyan-400', amber: 'bg-amber-400',
  pink:    'bg-pink-400',    red: 'bg-red-400',  violet: 'bg-violet-400',
};

export default function LevelMatrix() {
  return (
    <div className="space-y-6">
      <div className="glass-panel p-6">
        <h3 className="text-lg font-semibold">SAE J3016 × GB/T 40429-2021 双标对照</h3>
        <p className="text-sm text-ink-400 mt-1">一句话区分：<b>L0~L2 驾驶员负主责</b>，<b>L3+ 系统在 ODD 内负主责</b>。</p>

        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {LEVELS.map((l) => (
            <div key={l.id} className={`rounded-2xl border p-5 ${TONE[l.tone]}`}>
              <div className="flex items-center gap-3">
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold bg-ink-900/50`}>
                  {l.id}
                </span>
                <div>
                  <div className="text-base font-semibold">{l.name}</div>
                  <div className="text-[11px] text-ink-400">责任主体：{l.role}</div>
                </div>
              </div>
              <p className="mt-3 text-xs text-ink-300">系统介入条件：<b className="text-ink-100">{l.when}</b></p>
              <ul className="mt-3 space-y-1.5 text-xs text-ink-200">
                {l.examples.map((e) => (
                  <li key={e} className="flex gap-1.5">
                    <span className={`mt-1.5 w-1 h-1 rounded-full ${DOT[l.tone]} shrink-0`} />
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* L2 vs L3 关键差异 */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass-panel p-6">
          <h3 className="text-base font-semibold text-amber-300">⚠️ L2 责任划分（量产主流）</h3>
          <ul className="mt-3 space-y-2 text-sm text-ink-300">
            <li>· 驾驶员负主责，必须持续监控</li>
            <li>· 系统失效 / ODD 越界 / 未及时接管 → 驾驶员担责</li>
            <li>· 事故责任认定：以「驾驶员是否保持合理注意义务」为核心</li>
            <li>· 营销禁用「自动驾驶」「L3」等误导性词汇（中国工信部 2022 通知）</li>
          </ul>
        </div>
        <div className="glass-panel p-6">
          <h3 className="text-base font-semibold text-pink-300">🚨 L3 责任划分（试点）</h3>
          <ul className="mt-3 space-y-2 text-sm text-ink-300">
            <li>· ODD 内系统负主责；ODD 外驾驶员需接管</li>
            <li>· 需配置 DSSAD 数据记录器（事故后用于责任判定）</li>
            <li>· 驾驶员被允许「视线脱离」但需在系统请求时及时接管</li>
            <li>· 试点城市：北京、上海、深圳、武汉、重庆等</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
