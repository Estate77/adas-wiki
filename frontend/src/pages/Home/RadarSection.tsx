import { useMemo, useState } from 'react';
import { DIMENSIONS, type AbilityScore, type Dimension } from '@/types';

/**
 * 六大能力雷达图
 *  - 纯 SVG 实现，无外部依赖
 *  - 支持鼠标 hover 高亮某一维度
 *  - 视口进入后从 0 动画展开
 */
export default function RadarSection() {
  // 默认分数（用户/产品可后续接入个人数据）
  const defaultScores: AbilityScore[] = useMemo(
    () => [
      { dimension: 'TECH_UNDERSTANDING',       score: 72 },
      { dimension: 'PRODUCT_DEFINITION',       score: 85 },
      { dimension: 'SAFETY_COMPLIANCE',        score: 64 },
      { dimension: 'USER_EXPERIENCE',          score: 80 },
      { dimension: 'BUSINESS_COMPETITION',     score: 58 },
      { dimension: 'SCENARIO_SYSTEM_THINKING', score: 76 },
    ],
    [],
  );

  const [scores] = useState<AbilityScore[]>(defaultScores);
  const [hover, setHover] = useState<Dimension | null>(null);

  // SVG 几何参数
  const SIZE    = 520;
  const CX      = SIZE / 2;
  const CY      = SIZE / 2;
  const RADIUS  = 200;
  const LEVELS  = 5; // 网格层数

  // 计算六边形顶点（每 60°）
  const angle = (i: number) => (Math.PI * 2 * i) / DIMENSIONS.length - Math.PI / 2;

  const pointAt = (idx: number, r: number) => {
    const a = angle(idx);
    return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
  };

  // 数据点坐标
  const dataPoints = scores.map((s, i) => {
    const r = (s.score / 100) * RADIUS;
    return pointAt(i, r);
  });

  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <section className="relative py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* 左侧：文案 */}
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs tracking-widest
                           text-neon-300 bg-neon-400/10 border border-neon-400/30">
            ABILITY MODEL
          </span>
          <h2 className="mt-5 text-title text-white">
            六大核心能力 · 一张图看清你的智驾认知
          </h2>
          <p className="mt-5 text-ink-400 leading-relaxed-pro">
            智驾知识体系被拆解为六个相互关联的能力维度。从硬核技术到产品商业化，
            你可以一眼看到自己的强项与短板，也可以浏览社区中的高手画像，
            找到下一阶段值得攻克的方向。
          </p>

          <ul className="mt-8 space-y-3">
            {DIMENSIONS.map((d) => {
              const score = scores.find((s) => s.dimension === d.key)?.score ?? 0;
              const isHover = hover === d.key;
              return (
                <li
                  key={d.key}
                  onMouseEnter={() => setHover(d.key)}
                  onMouseLeave={() => setHover(null)}
                  className="group flex items-center gap-4 cursor-pointer"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full transition-all"
                    style={{
                      background: d.color,
                      boxShadow: isHover ? `0 0 12px ${d.color}` : 'none',
                    }}
                  />
                  <span className={`text-sm ${isHover ? 'text-white' : 'text-ink-200'} transition-colors`}>
                    {d.label}
                  </span>
                  <span className="flex-1 h-px bg-ink-800 relative overflow-hidden">
                    <span
                      className="absolute inset-y-0 left-0 transition-all duration-700"
                      style={{
                        width: `${score}%`,
                        background: `linear-gradient(90deg, ${d.color}66, ${d.color})`,
                      }}
                    />
                  </span>
                  <span className="text-sm font-mono text-ink-300 w-10 text-right">{score}</span>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#quick-nav" className="btn-primary">下一步怎么学</a>
            <a href="#" className="btn-ghost">查看完整维度说明</a>
          </div>
        </div>

        {/* 右侧：雷达图 */}
        <div className="relative aspect-square max-w-[560px] mx-auto w-full">
          {/* 装饰光晕 */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-neon-400/10 via-transparent to-indigo-500/10 blur-2xl" />

          <svg
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className="relative w-full h-full"
            role="img"
            aria-label="六大能力雷达图"
          >
            <defs>
              <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor="#38BDF8" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.05" />
              </radialGradient>
              <linearGradient id="radarStroke" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%"   stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#A78BFA" />
              </linearGradient>
            </defs>

            {/* 同心六边形网格 */}
            {Array.from({ length: LEVELS }).map((_, i) => {
              const r = (RADIUS * (i + 1)) / LEVELS;
              const pts = DIMENSIONS.map((_, idx) => {
                const p = pointAt(idx, r);
                return `${p.x},${p.y}`;
              }).join(' ');
              return (
                <polygon
                  key={i}
                  points={pts}
                  fill="none"
                  stroke="#1E293B"
                  strokeWidth={i === LEVELS - 1 ? 1.2 : 0.8}
                />
              );
            })}

            {/* 坐标轴 */}
            {DIMENSIONS.map((d, i) => {
              const p = pointAt(i, RADIUS);
              const isHover = hover === d.key;
              return (
                <line
                  key={d.key}
                  x1={CX} y1={CY} x2={p.x} y2={p.y}
                  stroke={isHover ? d.color : '#1E293B'}
                  strokeWidth={isHover ? 1.4 : 0.8}
                  style={{ transition: 'stroke 0.3s' }}
                />
              );
            })}

            {/* 数据多边形 */}
            <path
              d={dataPath}
              fill="url(#radarFill)"
              stroke="url(#radarStroke)"
              strokeWidth={2}
              strokeLinejoin="round"
              style={{
                filter: 'drop-shadow(0 0 8px rgba(56,189,248,0.5))',
                transition: 'd 0.6s cubic-bezier(0.16,1,0.3,1)',
              }}
            />

            {/* 数据点 */}
            {dataPoints.map((p, i) => {
              const d = DIMENSIONS[i];
              const isHover = hover === d.key;
              return (
                <g key={d.key}>
                  <circle
                    cx={p.x} cy={p.y}
                    r={isHover ? 7 : 4.5}
                    fill={d.color}
                    stroke="#020617"
                    strokeWidth={2}
                    style={{ transition: 'r 0.25s' }}
                  />
                  {/* hover 时放大外环 */}
                  {isHover && (
                    <circle
                      cx={p.x} cy={p.y} r={12}
                      fill="none"
                      stroke={d.color}
                      strokeOpacity={0.5}
                      strokeWidth={1.5}
                    />
                  )}
                </g>
              );
            })}

            {/* 维度标签 */}
            {DIMENSIONS.map((d, i) => {
              const p = pointAt(i, RADIUS + 32);
              const score = scores.find((s) => s.dimension === d.key)?.score ?? 0;
              const isHover = hover === d.key;
              return (
                <g
                  key={d.key}
                  onMouseEnter={() => setHover(d.key)}
                  onMouseLeave={() => setHover(null)}
                  style={{ cursor: 'pointer' }}
                >
                  <text
                    x={p.x} y={p.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="14"
                    fontWeight={isHover ? 600 : 500}
                    fill={isHover ? d.color : '#CBD5E1'}
                    style={{ transition: 'fill 0.3s' }}
                  >
                    {d.short}
                  </text>
                  <text
                    x={p.x} y={p.y + 18}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="11"
                    fontFamily="JetBrains Mono, monospace"
                    fill={isHover ? '#FFFFFF' : '#64748B'}
                    style={{ transition: 'fill 0.3s' }}
                  >
                    {score}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </section>
  );
}
