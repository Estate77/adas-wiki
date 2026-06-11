import { useState, useMemo } from 'react';
import clsx from 'clsx';
import { useLearningStore, type PrepItem } from '@/store/learningStore';

const CATEGORY_META: Record<PrepItem['category'], { label: string; color: string }> = {
  TECH:    { label: '技术',  color: '#38BDF8' },
  PRODUCT: { label: '产品',  color: '#A78BFA' },
  TEST:    { label: '测试',  color: '#F87171' },
  SAFETY:  { label: '安全',  color: '#34D399' },
  GENERAL: { label: '通用',  color: '#FBBF24' },
};

const STATUS_META: Record<PrepItem['status'], { label: string; ring: string; bg: string }> = {
  TODO:        { label: '待办',    ring: 'ring-ink-700',  bg: 'bg-ink-900/60' },
  IN_PROGRESS: { label: '进行中', ring: 'ring-amber-400', bg: 'bg-amber-400/5' },
  DONE:        { label: '已完成', ring: 'ring-emerald-400', bg: 'bg-emerald-400/5' },
};

const FILTERS: { key: 'ALL' | PrepItem['status']; label: string }[] = [
  { key: 'ALL',         label: '全部' },
  { key: 'TODO',        label: '待办' },
  { key: 'IN_PROGRESS', label: '进行中' },
  { key: 'DONE',        label: '已完成' },
];

export default function PrepListTab() {
  const prepList       = useLearningStore((s) => s.prepList);
  const toggleStatus   = useLearningStore((s) => s.togglePrepStatus);
  const removePrep     = useLearningStore((s) => s.removePrep);
  const addPrep        = useLearningStore((s) => s.addPrep);
  const clearDone      = useLearningStore((s) => s.clearDone);

  const [filter, setFilter] = useState<'ALL' | PrepItem['status']>('ALL');
  const [newTitle, setNewTitle] = useState('');
  const [newCat, setNewCat] = useState<PrepItem['category']>('TECH');

  const list = useMemo(() => {
    const arr = filter === 'ALL' ? prepList : prepList.filter((p) => p.status === filter);
    // 待办 / 进行中 排前，已完成 排后
    return [...arr].sort((a, b) => {
      const order = { TODO: 0, IN_PROGRESS: 1, DONE: 2 } as const;
      return order[a.status] - order[b.status] || b.updatedAt - a.updatedAt;
    });
  }, [prepList, filter]);

  const stats = useMemo(() => {
    const total = prepList.length;
    const done  = prepList.filter((p) => p.status === 'DONE').length;
    const doing = prepList.filter((p) => p.status === 'IN_PROGRESS').length;
    return { total, done, doing, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
  }, [prepList]);

  const onAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const t = newTitle.trim();
    if (!t) return;
    addPrep({ category: newCat, title: t, status: 'TODO' });
    setNewTitle('');
  };

  return (
    <div className="space-y-5">
      {/* 顶部进度概览 */}
      <div className="glass-panel p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-semibold">面试准备进度</h3>
            <p className="text-xs text-ink-500 mt-0.5">
              已完成 <b className="text-emerald-300">{stats.done}</b> /
              进行中 <b className="text-amber-300">{stats.doing}</b> /
              总计 <b className="text-ink-200">{stats.total}</b>
            </p>
          </div>
          <div className="text-3xl font-mono font-semibold text-white">{stats.percent}<span className="text-base text-ink-400">%</span></div>
        </div>
        <div className="h-2 rounded-full bg-ink-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-neon-400 transition-all"
            style={{ width: `${stats.percent}%` }}
          />
        </div>

        {stats.done > 0 && (
          <button
            onClick={() => {
              if (confirm(`清空 ${stats.done} 个已完成项？`)) clearDone();
            }}
            className="mt-3 text-xs text-ink-500 hover:text-red-300 transition-colors"
          >
            清理已完成 →
          </button>
        )}
      </div>

      {/* 新增条目 */}
      <form onSubmit={onAdd} className="glass-panel p-4 flex flex-col sm:flex-row gap-2">
        <select
          value={newCat}
          onChange={(e) => setNewCat(e.target.value as PrepItem['category'])}
          className="bg-ink-900/60 border border-ink-800 rounded-full px-3 py-1.5 text-sm
                     text-ink-100 outline-none focus:border-neon-400/50 transition-colors"
        >
          {(Object.keys(CATEGORY_META) as PrepItem['category'][]).map((c) => (
            <option key={c} value={c}>{CATEGORY_META[c].label}</option>
          ))}
        </select>
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="例如：解释 BEV 与端到端的关系…"
          className="flex-1 bg-ink-900/60 border border-ink-800 rounded-full px-4 py-1.5 text-sm
                     text-ink-50 placeholder:text-ink-500 outline-none
                     focus:border-neon-400/50 transition-colors"
        />
        <button
          type="submit"
          disabled={!newTitle.trim()}
          className="btn-primary text-sm disabled:opacity-30"
        >
          + 添加
        </button>
      </form>

      {/* 筛选 */}
      <div className="flex gap-1 p-1 rounded-full bg-ink-900/80 border border-ink-800 w-fit">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={clsx(
              'text-xs px-3 py-1.5 rounded-full transition-all',
              filter === f.key
                ? 'bg-neon-400 text-ink-950 font-medium'
                : 'text-ink-300 hover:text-white',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 列表 */}
      {list.length === 0 ? (
        <div className="glass-panel p-10 text-center">
          <div className="text-3xl">📋</div>
          <p className="mt-3 text-sm text-ink-400">没有匹配的清单项</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {list.map((p) => (
            <PrepRow
              key={p.id}
              item={p}
              onToggle={() => toggleStatus(p.id)}
              onRemove={() => removePrep(p.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function PrepRow({ item, onToggle, onRemove }: {
  item: PrepItem;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const cat = CATEGORY_META[item.category];
  const st  = STATUS_META[item.status];

  return (
    <li
      className={clsx(
        'group flex items-center gap-3 px-4 py-3 rounded-xl border transition-all',
        'ring-1 ring-inset',
        st.bg, st.ring,
        item.status === 'DONE' && 'opacity-70',
      )}
    >
      <button
        onClick={onToggle}
        className={clsx(
          'shrink-0 w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center',
          item.status === 'DONE'
            ? 'bg-emerald-400 border-emerald-400 text-ink-950'
            : item.status === 'IN_PROGRESS'
              ? 'border-amber-400 text-amber-400'
              : 'border-ink-600 text-transparent hover:border-ink-400',
        )}
        title="切换状态"
      >
        {item.status === 'DONE' && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {item.status === 'IN_PROGRESS' && (
          <span className="block w-1.5 h-1.5 rounded-full bg-amber-400" />
        )}
      </button>

      <span
        className="shrink-0 text-[10px] px-2 py-0.5 rounded-full font-mono tracking-widest"
        style={{ background: `${cat.color}20`, color: cat.color }}
      >
        {cat.label}
      </span>

      <span
        className={clsx(
          'flex-1 text-sm leading-relaxed',
          item.status === 'DONE' ? 'text-ink-400 line-through' : 'text-ink-100',
        )}
      >
        {item.title}
      </span>

      <span
        className={clsx(
          'shrink-0 text-[10px] px-2 py-0.5 rounded-full font-mono tracking-widest',
          item.status === 'DONE' && 'bg-emerald-400/20 text-emerald-300',
          item.status === 'IN_PROGRESS' && 'bg-amber-400/20 text-amber-300',
          item.status === 'TODO' && 'bg-ink-800 text-ink-500',
        )}
      >
        {st.label}
      </span>

      <button
        onClick={onRemove}
        className="shrink-0 p-1 rounded text-ink-500 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100"
        title="删除"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14" strokeLinecap="round" />
        </svg>
      </button>
    </li>
  );
}
