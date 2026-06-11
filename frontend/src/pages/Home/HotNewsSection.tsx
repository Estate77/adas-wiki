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

function fmtDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
}

export default function HotNewsSection() {
  const [items, setItems] = useState<KnowledgeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    knowledgeService
      .list({ pageSize: 6 })
      .then((res) => alive && setItems(res.items))
      .catch((e) => alive && setError((e as Error).message))
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

  if (error || items.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-5 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="text-xs font-medium text-neon-300 tracking-[0.25em] mb-2">INSIGHTS</div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">热门 · 智驾知识速览</h2>
          </div>
        </div>
        <div className="glass-panel p-10 text-center">
          <div className="text-3xl mb-3">📡</div>
          <p className="text-ink-300 text-sm">
            {error
              ? `加载失败：${error}`
              : '知识库暂未发布内容，可通过后台或 API 灌入首批知识。'}
          </p>
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
