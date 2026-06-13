import { useEffect, useState } from 'react';
import { knowledgeService, type KnowledgeListItem, type Dimension } from '@/services/knowledge.service';

const DIM_LABEL: Record<Dimension, { label: string; cls: string }> = {
  TECH_UNDERSTANDING:        { label: '技术',   cls: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' },
  PRODUCT_DEFINITION:        { label: '产品',   cls: 'bg-pink-500/15 text-pink-300 border-pink-500/30' },
  SAFETY_COMPLIANCE:         { label: '安全',   cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  USER_EXPERIENCE:           { label: '体验',   cls: 'bg-violet-500/15 text-violet-300 border-violet-500/30' },
  BUSINESS_COMPETITION:      { label: '行业',   cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  SCENARIO_SYSTEM_THINKING:  { label: '场景',   cls: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' },
};

const FALLBACK_ITEMS: KnowledgeListItem[] = [
  {
    id: 'fallback-lidar',
    title: '激光雷达为什么仍是高阶智驾的关键安全冗余？',
    summary: '从夜间感知、异形障碍物识别到多传感器冗余，梳理 LiDAR 在 L2+/L3 方案中的真实价值与成本权衡。',
    dimension: 'TECH_UNDERSTANDING',
    tags: ['LiDAR', '感知融合', '安全冗余'],
    viewCount: 1280,
    updatedAt: '2026-06-11T00:00:00.000Z',
  },
  {
    id: 'fallback-bev',
    title: 'BEV 与 Occupancy：端到端智驾为什么绕不开统一空间表征？',
    summary: '解释多相机特征如何投影到俯视空间，以及 Occupancy 在未知障碍物处理上的优势。',
    dimension: 'TECH_UNDERSTANDING',
    tags: ['BEV', 'Occupancy', '端到端'],
    viewCount: 962,
    updatedAt: '2026-06-10T00:00:00.000Z',
  },
  {
    id: 'fallback-sotif',
    title: 'ISO 26262 与 SOTIF 的边界到底怎么划分？',
    summary: '从系统故障与性能局限两条主线理解功能安全与预期功能安全的差异和配合关系。',
    dimension: 'SAFETY_COMPLIANCE',
    tags: ['ISO 26262', 'SOTIF', '功能安全'],
    viewCount: 845,
    updatedAt: '2026-06-09T00:00:00.000Z',
  },
  {
    id: 'fallback-product',
    title: '城市 NOA 的产品定义，应该先看能力还是先看 ODD？',
    summary: '围绕目标用户、使用频次、风险场景和成本约束，拆解智驾功能定义的优先级。',
    dimension: 'PRODUCT_DEFINITION',
    tags: ['城市NOA', 'ODD', '产品定义'],
    viewCount: 731,
    updatedAt: '2026-06-08T00:00:00.000Z',
  },
  {
    id: 'fallback-competition',
    title: '2026 智驾竞争，拼的是硬件堆料还是数据闭环？',
    summary: '对比头部玩家在传感器、算力、算法迭代和用户体验上的路线差异。',
    dimension: 'BUSINESS_COMPETITION',
    tags: ['竞品分析', '数据闭环', '商业化'],
    viewCount: 688,
    updatedAt: '2026-06-07T00:00:00.000Z',
  },
];

function fmtDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
}

export default function HotNewsSection() {
  const [items, setItems] = useState<KnowledgeListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    knowledgeService
      .list({ pageSize: 6 })
      .then((res) => alive && setItems(res.items))
      .catch(() => alive && setItems(FALLBACK_ITEMS))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-5 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="text-xs font-medium text-neon-300 tracking-[0.25em] mb-2">INSIGHTS</div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">热门 · 智驾知识速览</h2>
          </div>
        </div>
        <div className="text-center text-ink-400 py-12">
          <span className="inline-block w-5 h-5 border-2 border-ink-600 border-t-neon-400 rounded-full animate-spin mr-2" />
          正在拉取最新知识…
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-5 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="text-xs font-medium text-neon-300 tracking-[0.25em] mb-2">INSIGHTS</div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">热门 · 智驾知识速览</h2>
          </div>
        </div>
        <div className="glass-panel p-10 text-center">
          <div className="text-3xl mb-3">🗂</div>
          <p className="text-ink-300 text-sm">暂未加载到在线知识，稍后可接入后端内容源。</p>
        </div>
      </section>
    );
  }

  const featured = items[0];
  const rest = items.slice(1, 5);
  const featuredStyle = DIM_LABEL[featured.dimension] ?? DIM_LABEL.TECH_UNDERSTANDING;

  return (
    <section className="max-w-7xl mx-auto px-5 lg:px-8 py-16">
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="text-xs font-medium text-neon-300 tracking-[0.25em] mb-2">INSIGHTS</div>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">热门 · 智驾知识速览</h2>
        </div>
        <a href="/graph" className="text-sm text-ink-400 hover:text-neon-300">查看全部 →</a>
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* 头条 */}
        <article className="lg:col-span-3 group glass-panel p-6 lg:p-8 hover:border-neon-400/40 transition-colors">
          <div className="flex items-center gap-2 mb-4">
            <span className={`text-[10px] px-2 py-0.5 rounded-full border tracking-widest ${featuredStyle.cls}`}>
              {featuredStyle.label}
            </span>
            <span className="text-xs text-ink-500">{fmtDate(featured.updatedAt)}</span>
            <span className="text-xs text-neon-300">👁 {featured.viewCount}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-semibold leading-snug group-hover:text-neon-200 transition-colors">
            {featured.title}
          </h3>
          <p className="mt-3 text-ink-300 text-sm leading-relaxed line-clamp-3">
            {featured.summary ?? '暂无摘要，点击查看完整内容。'}
          </p>
          <div className="mt-5 flex items-center justify-between">
            <div className="flex flex-wrap gap-1.5">
              {featured.tags.slice(0, 3).map((t) => (
                <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-ink-800 text-ink-300">
                  #{t}
                </span>
              ))}
            </div>
            <a href={`/graph?kb=${featured.id}`} className="text-xs text-neon-300 hover:text-neon-200">阅读全文 →</a>
          </div>
        </article>

        {/* 列表 */}
        <div className="lg:col-span-2 space-y-3">
          {rest.map((n) => {
            const s = DIM_LABEL[n.dimension] ?? DIM_LABEL.TECH_UNDERSTANDING;
            return (
              <a
                key={n.id}
                href={`/graph?kb=${n.id}`}
                className="block glass-panel p-4 hover:border-ink-600 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${s.cls}`}>
                    {s.label}
                  </span>
                  <span className="text-[11px] text-ink-500">{fmtDate(n.updatedAt)}</span>
                  <span className="text-[11px] text-neon-300 ml-auto">👁 {n.viewCount}</span>
                </div>
                <h4 className="text-sm font-medium leading-snug line-clamp-2">{n.title}</h4>
                {n.summary && (
                  <p className="mt-1.5 text-xs text-ink-400 line-clamp-2">{n.summary}</p>
                )}
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
