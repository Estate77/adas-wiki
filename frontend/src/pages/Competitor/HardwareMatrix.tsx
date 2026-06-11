interface SensorRow {
  vendor: string;
  tone: 'cyan' | 'red' | 'amber' | 'blue' | 'violet' | 'emerald';
  cam:    number;  // 摄像头数
  radar:  number;  // 毫米波
  lidar:  number;  // 激光雷达
  ultra:  number;  // 超声波
  socs:   string;  // 主控 SoC
  tops:   number;  // 算力 TOPS
}

const ROWS: SensorRow[] = [
  { vendor: '特斯拉 FSD',     tone: 'red',     cam: 8, radar: 0, lidar: 0, ultra: 12, socs: 'HW4 (自研)',        tops: 144 },
  { vendor: '小鹏 图灵',     tone: 'cyan',    cam: 11, radar: 5, lidar: 2, ultra: 12, socs: '图灵 (自研)',     tops: 750 },
  { vendor: '华为 ADS 4.0',  tone: 'amber',   cam: 11, radar: 6, lidar: 3, ultra: 12, socs: 'MDC 810 / 610',  tops: 400 },
  { vendor: '蔚来 NAD',      tone: 'blue',    cam: 11, radar: 5, lidar: 1, ultra: 12, socs: 'Orin-X ×4',     tops: 1016 },
  { vendor: '理想 AD Max',   tone: 'violet',  cam: 11, radar: 1, lidar: 1, ultra: 12, socs: 'Thor / Orin',   tops: 508 },
  { vendor: '比亚迪 天神之眼 A', tone: 'emerald', cam: 11, radar: 5, lidar: 1, ultra: 12, socs: 'Orin',         tops: 254 },
];

const TONE: Record<SensorRow['tone'], string> = {
  cyan:    'bg-cyan-500/15 text-cyan-200',
  red:     'bg-red-500/15 text-red-200',
  amber:   'bg-amber-500/15 text-amber-200',
  blue:    'bg-blue-500/15 text-blue-200',
  violet:  'bg-violet-500/15 text-violet-200',
  emerald: 'bg-emerald-500/15 text-emerald-200',
};

const DOT: Record<SensorRow['tone'], string> = {
  cyan:    'bg-cyan-400', red: 'bg-red-400', amber: 'bg-amber-400',
  blue:    'bg-blue-400', violet: 'bg-violet-400', emerald: 'bg-emerald-400',
};

export default function HardwareMatrix() {
  const maxTops = Math.max(...ROWS.map((r) => r.tops));

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 overflow-x-auto">
        <h3 className="text-lg font-semibold mb-4">车端硬件配置对比</h3>
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="text-xs text-ink-500 tracking-widest border-b border-ink-800">
              <th className="text-left py-2 px-2">方案</th>
              <th className="text-right py-2 px-2">摄像头</th>
              <th className="text-right py-2 px-2">毫米波</th>
              <th className="text-right py-2 px-2">LiDAR</th>
              <th className="text-right py-2 px-2">超声波</th>
              <th className="text-left py-2 px-2">主控 SoC</th>
              <th className="text-right py-2 px-2">算力 (TOPS)</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.vendor} className="border-b border-ink-800/40 last:border-0">
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${DOT[r.tone]}`} />
                    <span className="font-medium">{r.vendor}</span>
                  </div>
                </td>
                <td className="py-3 px-2 text-right font-mono">{r.cam}</td>
                <td className="py-3 px-2 text-right font-mono">{r.radar}</td>
                <td className="py-3 px-2 text-right font-mono">{r.lidar}</td>
                <td className="py-3 px-2 text-right font-mono">{r.ultra}</td>
                <td className="py-3 px-2">{r.socs}</td>
                <td className="py-3 px-2 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="font-mono">{r.tops}</span>
                    <div className="w-16 h-1.5 rounded-full bg-ink-800 overflow-hidden">
                      <div className="h-full bg-neon-400" style={{ width: `${(r.tops / maxTops) * 100}%` }} />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass-panel p-6">
          <h3 className="text-base font-semibold text-neon-300">📊 趋势观察</h3>
          <ul className="mt-3 space-y-2 text-sm text-ink-300">
            <li>· 主流方案：<b>11V + 5R + 1~3 LiDAR + 12U</b> 已成 L2+ 标配</li>
            <li>· 算力军备：Thor / 图灵 / 自研芯片把上限抬到 1000+ TOPS</li>
            <li>· 纯视觉分歧：Tesla 仍坚持 0 LiDAR，国内厂商保留 1~3 颗</li>
            <li>· 4D 成像雷达开始替代传统 3D 毫米波</li>
          </ul>
        </div>
        <div className="glass-panel p-6">
          <h3 className="text-base font-semibold text-amber-300">⚖️ 利弊权衡</h3>
          <ul className="mt-3 space-y-2 text-sm text-ink-300">
            <li>· <b>多 LiDAR</b>：感知冗余好，但 BOM 成本 +2000~5000 元</li>
            <li>· <b>纯视觉</b>：成本低，数据规模大，但雨雾夜表现弱</li>
            <li>· <b>高算力</b>：支持端到端大模型，但散热 / 功耗是工程难题</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
