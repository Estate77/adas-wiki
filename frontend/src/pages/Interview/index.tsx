import { useState, useEffect, useMemo } from 'react';
import PageHeader  from '@/components/PageHeader';
import Tabs        from '@/components/Tabs';
import Segmented   from '@/components/Segmented';
import { interviewService, type Position, type Difficulty, type QuestionListItem, type QuestionDetail } from '@/services/interview.service';

const POSITION_TABS: { key: 'ALL' | Position; label: string }[] = [
  { key: 'ALL',                    label: '全部岗位' },
  { key: 'PRODUCT_MANAGER',        label: '产品经理' },
  { key: 'ALGO_ENGINEER',          label: '算法工程师' },
  { key: 'PERCEPTION_ENGINEER',    label: '感知工程师' },
  { key: 'PLANNING_ENGINEER',      label: '规控工程师' },
  { key: 'TEST_ENGINEER',          label: '测试工程师' },
  { key: 'SAFETY_ENGINEER',        label: '安全工程师' },
  { key: 'SALES_SOLUTION',         label: '销售 / 解决方案' },
];

const DIFFS: Array<{ key: Difficulty; label: string; cls: string }> = [
  { key: 'EASY',   label: '入门', cls: 'bg-emerald-500/15 text-emerald-200 border-emerald-500/30' },
  { key: 'MEDIUM', label: '中等', cls: 'bg-cyan-500/15 text-cyan-200 border-cyan-500/30' },
  { key: 'HARD',   label: '困难', cls: 'bg-amber-500/15 text-amber-200 border-amber-500/30' },
  { key: 'EXPERT', label: '专家', cls: 'bg-red-500/15 text-red-200 border-red-500/30' },
];

const POSITION_LABEL = Object.fromEntries(
  POSITION_TABS.filter((t) => t.key !== 'ALL').map((t) => [t.key, t.label]),
) as Record<Position, string>;

export default function InterviewPage() {
  const [tab, setTab]             = useState<'ALL' | Position>('ALL');
  const [diff, setDiff]           = useState<Difficulty | 'ALL'>('ALL');
  const [keyword, setKeyword]     = useState('');

  const [items, setItems]         = useState<QuestionListItem[]>([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const [activeId, setActiveId]   = useState<string | null>(null);
  const [detail, setDetail]       = useState<QuestionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // 拉列表
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    interviewService
      .list({
        position:   tab === 'ALL' ? undefined : tab,
        difficulty: diff === 'ALL' ? undefined : diff,
        keyword: keyword.trim() || undefined,
        pageSize: 100,
      })
      .then((res) => {
        if (!alive) return;
        setItems(res.items);
        setTotal(res.total);
        if (res.items.length && !res.items.find((q) => q.id === activeId)) {
          setActiveId(res.items[0].id);
        } else if (res.items.length === 0) {
          setActiveId(null);
          setDetail(null);
        }
      })
      .catch((e) => alive && setError((e as Error).message))
      .finally(() => alive && setLoading(false));

    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, diff, keyword]);

  // 拉详情
  useEffect(() => {
    if (!activeId) {
      setDetail(null);
      return;
    }
    let alive = true;
    setDetailLoading(true);
    interviewService
      .detail(activeId)
      .then((d) => alive && setDetail(d))
      .catch(() => alive && setDetail(null))
      .finally(() => alive && setDetailLoading(false));
    return () => { alive = false; };
  }, [activeId]);

  const list = useMemo(() => items, [items]);
  const active = list.find((q) => q.id === activeId) ?? list[0] ?? null;

  return (
    <div>
      <PageHeader
        eyebrow="INTERVIEW PREP"
        title="面试题库"
        desc="按岗位 / 难度 / 知识点反向检索，每题附「考察意图 + 满分回答 + 关键得分点」"
      >
        <div className="text-xs text-ink-400 self-center">
          共 <span className="text-neon-300 font-mono">{total}</span> 道 · 已更新 {items.length}
        </div>
      </PageHeader>

      <div className="sticky top-16 z-30 bg-ink-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <Tabs tabs={POSITION_TABS} active={tab} onChange={(k) => setTab(k as 'ALL' | Position)} />
        </div>
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-3 border-t border-ink-800/60 flex flex-wrap items-center gap-3">
          <Segmented
            tone="neon"
            size="sm"
            value={diff}
            onChange={(v) => setDiff(v as Difficulty | 'ALL')}
            items={[
              { value: 'ALL',          label: '全部难度' },
              ...DIFFS.map((d) => ({ value: d.key, label: d.label })),
            ]}
          />
          <div className="flex-1" />
          <div className="relative">
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索题面 / 标签 / 知识点"
              className="w-56 sm:w-72 pl-8 pr-3 py-1.5 text-sm rounded-full
                         bg-ink-900 border border-ink-700 text-ink-100
                         focus:border-neon-400 outline-none"
            />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                 className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-500">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-5 lg:px-8 py-6">
        {error ? (
          <div className="glass-panel p-10 text-center">
            <h2 className="text-xl font-semibold text-red-300">加载失败</h2>
            <p className="mt-2 text-sm text-ink-400">{error}</p>
            <p className="mt-2 text-xs text-ink-500">
              提示：先启动后端（<code className="text-neon-300">cd backend && npm run dev</code>）
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[320px_1fr] gap-6">
            {/* 题单 */}
            <aside className="space-y-2 lg:max-h-[70vh] lg:overflow-y-auto lg:pr-2">
              {loading && (
                <div className="p-6 text-sm text-ink-400 text-center">
                  <span className="inline-block w-4 h-4 border-2 border-ink-600 border-t-neon-400 rounded-full animate-spin mr-2" />
                  加载题目…
                </div>
              )}
              {!loading && list.map((q) => {
                const d = DIFFS.find((x) => x.key === q.difficulty)!;
                return (
                  <button
                    key={q.id}
                    onClick={() => setActiveId(q.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-colors
                                ${active?.id === q.id
                                  ? 'border-neon-400 bg-neon-400/5'
                                  : 'border-ink-800 hover:border-ink-600 bg-ink-900/40'}`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${d.cls}`}>{d.label}</span>
                      <span className="text-[10px] text-ink-500">
                        {POSITION_LABEL[q.position] ?? q.position}
                      </span>
                    </div>
                    <div className="text-sm font-medium leading-snug line-clamp-2">{q.stem}</div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {q.tags.map((t) => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-ink-800 text-ink-300">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
              {!loading && list.length === 0 && (
                <div className="p-6 text-sm text-ink-500 text-center">未找到匹配的题目</div>
              )}
            </aside>

            {/* 详情 */}
            {detailLoading && active ? (
              <article className="glass-panel p-10 text-center text-ink-400">
                <span className="inline-block w-5 h-5 border-2 border-ink-600 border-t-neon-400 rounded-full animate-spin mr-2" />
                加载详情…
              </article>
            ) : detail ? (
              <article className="glass-panel p-6 lg:p-8 space-y-5">
                <header>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${DIFFS.find((d) => d.key === detail.difficulty)!.cls}`}>
                      {DIFFS.find((d) => d.key === detail.difficulty)!.label}
                    </span>
                    <span className="text-xs text-ink-400">
                      {POSITION_LABEL[detail.position] ?? detail.position}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-semibold leading-tight">{detail.stem}</h2>
                </header>

                <Section title="📌 考察意图" tone="cyan">
                  {detail.intent}
                </Section>

                <Section title="✅ 满分回答模板" tone="emerald">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink-100">
{detail.answer}
                  </pre>
                </Section>

                <Section title="🔗 反向关联知识点" tone="violet">
                  {detail.relatedKB ? (
                    <a href={`/graph?kb=${encodeURIComponent(detail.relatedKB.id)}`}
                       className="flex items-start gap-3 p-3 rounded-lg bg-violet-500/10 border border-violet-500/30 hover:bg-violet-500/20 transition-colors">
                      <span className="text-violet-300 text-lg shrink-0">📘</span>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-violet-200">{detail.relatedKB.title}</div>
                        {detail.relatedKB.summary && (
                          <div className="mt-1 text-xs text-ink-300 line-clamp-2">{detail.relatedKB.summary}</div>
                        )}
                      </div>
                    </a>
                  ) : (
                    <p className="text-sm text-ink-500">暂无关联知识点</p>
                  )}
                </Section>

                <div className="pt-2 flex gap-2 flex-wrap">
                  <button className="btn-primary text-sm">收藏题目</button>
                  <button className="btn-ghost text-sm">开始模拟面试</button>
                  <button className="btn-ghost text-sm">查看相关真题</button>
                </div>
              </article>
            ) : (
              <div className="glass-panel p-10 text-center text-ink-500">
                {loading ? '加载中…' : '请选择左侧题目'}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function Section({ title, children, tone = 'cyan' }: { title: string; children: React.ReactNode; tone?: 'cyan' | 'emerald' | 'amber' | 'violet' }) {
  const TONE: Record<string, string> = {
    cyan:    'text-cyan-300',
    emerald: 'text-emerald-300',
    amber:   'text-amber-300',
    violet:  'text-violet-300',
  };
  return (
    <section>
      <h3 className={`text-sm font-semibold mb-2 ${TONE[tone]}`}>{title}</h3>
      <div className="rounded-xl border border-ink-800 bg-ink-950/40 p-4">{children}</div>
    </section>
  );
}
