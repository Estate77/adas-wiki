import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { useLearningStore, type Favorite, type FavoriteKind } from '@/store/learningStore';
import { DIMENSIONS } from '@/types';

const KIND_LABEL: Record<FavoriteKind, { label: string; tone: string }> = {
  QNA:        { label: '问答',     tone: 'border-neon-400/40 text-neon-200' },
  KNOWLEDGE:  { label: '知识',     tone: 'border-indigo-400/40 text-indigo-200' },
  INTERVIEW:  { label: '面试',     tone: 'border-amber-400/40 text-amber-200' },
  SCENARIO:   { label: '场景',     tone: 'border-pink-400/40 text-pink-200' },
  COMPETITOR: { label: '竞品',     tone: 'border-emerald-400/40 text-emerald-200' },
};

const KIND_FILTERS: { key: 'ALL' | FavoriteKind; label: string }[] = [
  { key: 'ALL',        label: '全部' },
  { key: 'QNA',        label: '问答' },
  { key: 'KNOWLEDGE',  label: '知识' },
  { key: 'INTERVIEW',  label: '面试' },
  { key: 'SCENARIO',   label: '场景' },
  { key: 'COMPETITOR', label: '竞品' },
];

function formatTime(ts: number) {
  return new Date(ts).toLocaleString('zh-CN', { dateStyle: 'short', timeStyle: 'short' });
}

const DIM_MAP = Object.fromEntries(DIMENSIONS.map((d) => [d.key, d]));

export default function FavoritesTab() {
  const favorites    = useLearningStore((s) => s.favorites);
  const removeFav    = useLearningStore((s) => s.removeFavorite);
  const [kind, setKind] = useState<'ALL' | FavoriteKind>('ALL');
  const [query, setQuery] = useState('');

  const list = useMemo(() => {
    return favorites
      .filter((f) => kind === 'ALL' || f.kind === kind)
      .filter((f) => !query || f.title.includes(query) || (f.snippet ?? '').includes(query));
  }, [favorites, kind, query]);

  return (
    <div className="space-y-4">
      {/* 顶部：筛选 + 搜索 */}
      <div className="glass-panel p-4 flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="flex gap-1 p-1 rounded-full bg-ink-900/80 border border-ink-800 flex-wrap">
          {KIND_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setKind(f.key)}
              className={clsx(
                'text-xs px-3 py-1.5 rounded-full transition-all',
                kind === f.key
                  ? 'bg-neon-400 text-ink-950 font-medium'
                  : 'text-ink-300 hover:text-white',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex-1">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索收藏标题或摘要…"
            className="w-full bg-ink-900/60 border border-ink-800 rounded-full px-4 py-1.5 text-sm
                       text-ink-50 placeholder:text-ink-500 outline-none
                       focus:border-neon-400/50 transition-colors"
          />
        </div>
      </div>

      {/* 列表 */}
      {list.length === 0 ? (
        <div className="glass-panel p-10 text-center">
          <div className="text-3xl">⭐</div>
          <p className="mt-3 text-sm text-ink-400">
            {favorites.length === 0 ? '还没有任何收藏' : '没有匹配的收藏'}
          </p>
          <p className="mt-2 text-xs text-ink-500">
            在问答 / 图谱 / 竞品等页面点击「收藏」按钮，内容会同步到这里
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {list.map((f) => (
            <FavoriteCard key={f.id} fav={f} onRemove={() => removeFav(f.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function FavoriteCard({ fav, onRemove }: { fav: Favorite; onRemove: () => void }) {
  const meta = KIND_LABEL[fav.kind];
  const dim = fav.dimension ? DIM_MAP[fav.dimension as keyof typeof DIM_MAP] : null;

  return (
    <div className="glass-panel p-4 group hover:border-neon-400/40 transition-colors flex flex-col">
      <div className="flex items-start gap-2 mb-1.5">
        <span className={`text-[10px] px-2 py-0.5 rounded-full border tracking-widest ${meta.tone}`}>
          {meta.label}
        </span>
        {dim && (
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-mono tracking-widest"
            style={{ background: `${dim.color}20`, color: dim.color }}
          >
            {dim.short}
          </span>
        )}
        <button
          onClick={onRemove}
          className="ml-auto p-1 rounded text-ink-500 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100"
          title="取消收藏"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <Link to={fav.href} className="block flex-1">
        <h4 className="text-sm font-medium text-ink-100 line-clamp-2 group-hover:text-neon-200 transition-colors">
          {fav.title}
        </h4>
        {fav.snippet && (
          <p className="mt-1.5 text-xs text-ink-400 line-clamp-2 leading-relaxed">
            {fav.snippet}
          </p>
        )}
      </Link>

      <div className="mt-3 pt-2.5 border-t border-ink-800/80 flex items-center justify-between text-[10px] text-ink-500">
        <span>{formatTime(fav.createdAt)}</span>
        <Link
          to={fav.href}
          className="text-neon-400 hover:text-neon-300 flex items-center gap-1"
        >
          查看 <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </Link>
      </div>
    </div>
  );
}
