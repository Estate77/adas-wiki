import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { dashboardService, type OverviewData, type MockExamRecord } from '@/services/dashboard.service';
import { DIMENSIONS } from '@/types';

const POSITION_LABEL: Record<string, string> = {
  PRODUCT_MANAGER:    '产品经理',
  ALGO_ENGINEER:      '算法工程师',
  PERCEPTION_ENGINEER:'感知工程师',
  PLANNING_ENGINEER:  '规划控制',
  TEST_ENGINEER:      '测试工程师',
  SAFETY_ENGINEER:    '安全工程师',
  SALES_SOLUTION:     '销售/解决方案',
  OTHER:              '其他',
};

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const d = await dashboardService.overview();
        setData(d);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-5 lg:px-8 py-20 text-center text-ink-400">
        <span className="inline-block w-5 h-5 border-2 border-ink-600 border-t-neon-400 rounded-full animate-spin mr-2" />
        正在加载仪表盘…
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-20 text-center">
        <h2 className="text-2xl font-semibold text-red-300">加载失败</h2>
        <p className="mt-3 text-ink-400">{error}</p>
        <p className="mt-2 text-sm text-ink-500">
          提示：请确认已登录；当前纯前端 Demo 模式下，个人数据保存在本地浏览器。
        </p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-6xl mx-auto px-5 lg:px-8 py-6 lg:py-8 space-y-6">
      {/* 用户信息（紧凑） */}
      <header className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
        <Avatar name={user?.username || 'U'} url={user?.avatar ?? undefined} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-semibold tracking-tight">{user?.username}</h1>
            <RoleBadge role={user?.role} />
          </div>
          <p className="text-sm text-ink-400 mt-0.5">
            {user?.email}
            {user?.bio && <span className="ml-2 text-ink-500">· {user.bio}</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/qna" className="btn-primary text-sm">开始提问</Link>
          <Link to="/interview" className="btn-ghost text-sm">模拟面试</Link>
        </div>
      </header>

      {/* 核心数据卡 */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard label="累计提问"     value={data.totalQuestions}   unit="次" accent="from-neon-400/30" />
        <StatCard label="已掌握知识点" value={data.masteredCount}    unit="个" accent="from-indigo-400/30" />
        <StatCard label="模拟面试次数" value={data.mockExamCount}    unit="次" accent="from-pink-400/30" />
        <StatCard label="平均面试得分" value={data.averageScore}     unit="分" accent="from-emerald-400/30" />
      </section>

      {/* 维度掌握 + 得分趋势 */}
      <section className="grid lg:grid-cols-2 gap-4">
        <DimensionRadar data={data} />
        <MockScoreTrend data={data.recentMockExams} />
      </section>

      {/* 最近面试记录 */}
      <section className="glass-panel p-5">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-base font-semibold">最近模拟面试</h3>
          <Link to="/interview" className="text-xs text-neon-300 hover:text-neon-200">查看全部 →</Link>
        </div>
        {data.recentMockExams.length === 0 ? (
          <p className="text-sm text-ink-500 text-center py-8">暂无记录，去模拟面试试试吧</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-ink-500 tracking-widest border-b border-ink-800">
                  <th className="py-2 px-2 font-medium">时间</th>
                  <th className="py-2 px-2 font-medium">岗位</th>
                  <th className="py-2 px-2 font-medium text-right">得分</th>
                </tr>
              </thead>
              <tbody>
                {[...data.recentMockExams].reverse().map((r) => (
                  <tr key={r.id} className="border-b border-ink-800/50 last:border-0">
                    <td className="py-2.5 px-2 text-ink-300">
                      {new Date(r.createdAt).toLocaleString('zh-CN', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="py-2.5 px-2 text-ink-200">
                      {POSITION_LABEL[r.position] ?? r.position}
                    </td>
                    <td className="py-2.5 px-2 text-right">
                      <span className={`font-mono font-semibold ${r.score >= 80 ? 'text-emerald-300' : r.score >= 60 ? 'text-neon-300' : 'text-amber-300'}`}>
                        {r.score}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

// ============== 组件 ==============
function Avatar({ name, url }: { name: string; url?: string }) {
  return (
    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden
                    bg-gradient-to-br from-neon-400 to-indigo-500
                    flex items-center justify-center text-2xl sm:text-3xl font-semibold text-ink-950
                    shadow-glow-sm">
      {url
        ? <img src={url} alt={name} className="w-full h-full object-cover" />
        : name.slice(0, 1).toUpperCase()}
    </div>
  );
}

function RoleBadge({ role }: { role?: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    USER:   { label: '用户',     cls: 'border-ink-700 text-ink-300' },
    EXPERT: { label: '专家',     cls: 'border-amber-400/50 text-amber-300' },
    ADMIN:  { label: '管理员',   cls: 'border-neon-400/50 text-neon-300' },
  };
  const m = map[role ?? 'USER'] ?? map.USER;
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border tracking-widest ${m.cls}`}>
      {m.label}
    </span>
  );
}

function StatCard({ label, value, unit, accent }: { label: string; value: number; unit: string; accent: string }) {
  return (
    <div className="relative overflow-hidden glass-panel p-5">
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${accent} to-transparent blur-2xl opacity-50`} />
      <div className="relative">
        <div className="text-xs text-ink-400 tracking-widest">{label}</div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-3xl font-semibold font-mono text-white">{value}</span>
          <span className="text-sm text-ink-400">{unit}</span>
        </div>
      </div>
    </div>
  );
}

function DimensionRadar({ data }: { data: OverviewData }) {
  const SIZE = 320, CX = SIZE / 2, CY = SIZE / 2, RADIUS = 110, LEVELS = 4;
  const angle = (i: number) => (Math.PI * 2 * i) / DIMENSIONS.length - Math.PI / 2;
  const pointAt = (idx: number, r: number) => ({
    x: CX + r * Math.cos(angle(idx)),
    y: CY + r * Math.sin(angle(idx)),
  });

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">能力维度掌握</h3>
        <span className="text-xs text-ink-500">{data.masteredCount} / {Object.values(data.dimensionTotal).reduce((s, n) => s + n, 0)} 已掌握</span>
      </div>

      <div className="relative aspect-square max-w-[320px] mx-auto">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full h-full">
          {Array.from({ length: LEVELS }).map((_, i) => {
            const r = (RADIUS * (i + 1)) / LEVELS;
            const pts = DIMENSIONS.map((_, idx) => {
              const p = pointAt(idx, r);
              return `${p.x},${p.y}`;
            }).join(' ');
            return <polygon key={i} points={pts} fill="none" stroke="#1E293B" strokeWidth="0.8" />;
          })}

          {DIMENSIONS.map((d, i) => {
            const p = pointAt(i, RADIUS);
            return <line key={d.key} x1={CX} y1={CY} x2={p.x} y2={p.y} stroke="#1E293B" strokeWidth="0.8" />;
          })}

          {/* 数据多边形 */}
          {(() => {
            const pts = DIMENSIONS.map((d, i) => {
              const total = data.dimensionTotal[d.key] ?? 0;
              const mastered = data.dimensionMastered[d.key] ?? 0;
              const ratio = total === 0 ? 0 : mastered / total;
              const p = pointAt(i, RADIUS * ratio);
              return `${p.x},${p.y}`;
            }).join(' ');
            return (
              <polygon
                points={pts}
                fill="rgba(56,189,248,0.2)"
                stroke="#38BDF8"
                strokeWidth="2"
                style={{ filter: 'drop-shadow(0 0 6px rgba(56,189,248,0.5))' }}
              />
            );
          })()}

          {/* 标签 */}
          {DIMENSIONS.map((d, i) => {
            const p = pointAt(i, RADIUS + 26);
            const total = data.dimensionTotal[d.key] ?? 0;
            const mastered = data.dimensionMastered[d.key] ?? 0;
            return (
              <g key={d.key}>
                <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
                      fontSize="11" fontWeight="500" fill="#CBD5E1">
                  {d.short}
                </text>
                <text x={p.x} y={p.y + 14} textAnchor="middle" dominantBaseline="middle"
                      fontSize="9" fontFamily="monospace" fill="#64748B">
                  {mastered}/{total}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function MockScoreTrend({ data }: { data: MockExamRecord[] }) {
  if (data.length === 0) {
    return (
      <div className="glass-panel p-6 flex items-center justify-center">
        <div className="text-center py-10">
          <div className="text-3xl">📈</div>
          <p className="mt-3 text-sm text-ink-400">完成第一次模拟面试后，<br />这里会展示你的得分趋势</p>
        </div>
      </div>
    );
  }

  const W = 480, H = 220, P = 32;
  const maxY = 100, minY = 0;
  const stepX = (W - P * 2) / Math.max(1, data.length - 1);

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">面试得分趋势</h3>
        <span className="text-xs text-ink-500">最近 {data.length} 次</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {/* Y 轴网格 */}
        {[0, 25, 50, 75, 100].map((v) => {
          const y = P + (H - P * 2) * (1 - v / 100);
          return (
            <g key={v}>
              <line x1={P} y1={y} x2={W - P} y2={y} stroke="#1E293B" strokeWidth="0.6" />
              <text x={P - 6} y={y + 3} textAnchor="end" fontSize="9" fill="#64748B">{v}</text>
            </g>
          );
        })}

        {/* 折线 */}
        {data.length > 1 && (
          <polyline
            fill="none"
            stroke="#38BDF8"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            style={{ filter: 'drop-shadow(0 0 4px rgba(56,189,248,0.6))' }}
            points={data.map((d, i) => {
              const x = P + i * stepX;
              const y = P + (H - P * 2) * (1 - d.score / 100);
              return `${x},${y}`;
            }).join(' ')}
          />
        )}

        {/* 数据点 */}
        {data.map((d, i) => {
          const x = P + i * stepX;
          const y = P + (H - P * 2) * (1 - d.score / 100);
          return (
            <g key={d.id}>
              <circle cx={x} cy={y} r="4" fill="#020617" stroke="#38BDF8" strokeWidth="2" />
              <text x={x} y={y - 8} textAnchor="middle" fontSize="9" fill="#CBD5E1" fontFamily="monospace">
                {d.score}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
