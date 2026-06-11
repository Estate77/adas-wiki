import { useState } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { DIMENSIONS } from '@/types';
import type { SixDimensionAnswer } from '@/types/chat';
import { useLearningStore } from '@/store/learningStore';
import MarkdownView from './MarkdownView';

interface Props {
  answer: SixDimensionAnswer;
  /** 是否正在流式接收（用于显示骨架/光标） */
  streaming?: boolean;
  /** 兜底全文 Markdown（用于"完整回答"折叠区） */
  fallbackMarkdown?: string;
}

const DIM_MAP = Object.fromEntries(DIMENSIONS.map((d) => [d.key, d]));

/**
 * 六维结构化回答视图：
 * - 顶部 TL;DR 高亮
 * - 6 个维度小卡片（可点击进入"专注模式"展开）
 * - 落地建议 + 延伸阅读
 * - 可选"完整 Markdown 全文"折叠区
 */
export default function SixDimensionView({ answer, streaming, fallbackMarkdown }: Props) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [showFull, setShowFull] = useState(false);
  const [savedHint, setSavedHint] = useState(false);

  const isFavorited    = useLearningStore((s) => s.isFavorited);
  const toggleFavorite = useLearningStore((s) => s.toggleFavorite);

  // 用 TL;DR 作为收藏的稳定去重 key
  const favHref = `qna:tldr:${encodeURIComponent(answer.tldr.slice(0, 80))}`;
  const saved   = isFavorited(favHref);

  const onSave = () => {
    toggleFavorite({
      kind: 'QNA',
      title: answer.tldr.slice(0, 50) + (answer.tldr.length > 50 ? '…' : ''),
      snippet: answer.tldr,
      href: favHref,
    });
    setSavedHint(true);
    setTimeout(() => setSavedHint(false), 1500);
  };

  const active = activeKey
    ? answer.dimensions.find((d) => d.dimension === activeKey)
    : null;

  return (
    <div className="space-y-5">
      {/* TL;DR */}
      <div
        className={clsx(
          'relative overflow-hidden rounded-2xl p-5',
          'bg-gradient-to-br from-neon-400/15 via-indigo-500/10 to-transparent',
          'border border-neon-400/30',
        )}
      >
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-neon-400/20 blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-2 text-[11px] tracking-widest text-neon-300 mb-2.5">
            <span className="inline-block w-3 h-px bg-neon-400" />
            TL;DR · 核心结论
            {streaming && (
              <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-neon-200">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-400 animate-pulse" />
                结构化生成中
              </span>
            )}
            {!streaming && (
              <button
                onClick={onSave}
                className={clsx(
                  'ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full',
                  'text-[10px] transition-all',
                  saved
                    ? 'bg-amber-400/20 text-amber-300'
                    : 'bg-ink-800/60 text-ink-400 hover:text-amber-300 hover:bg-amber-400/10',
                )}
                title={saved ? '已收藏' : '收藏到个人中心'}
              >
                {savedHint ? '✓ 已收藏' : saved ? '★ 已收藏' : '☆ 收藏'}
              </button>
            )}
          </div>
          <p className="text-[15px] leading-relaxed text-ink-50">{answer.tldr}</p>
        </div>
      </div>

      {/* 六维矩阵 */}
      <div>
        <div className="flex items-center gap-2 text-[11px] text-ink-500 tracking-widest mb-3">
          <span className="inline-block w-3 h-px bg-gradient-to-r from-neon-400 to-transparent" />
          六维结构化拆解
          <span className="text-ink-600">· 点击卡片深入阅读</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {DIMENSIONS.map((d) => {
            const insight = answer.dimensions.find((x) => x.dimension === d.key);
            const isActive = activeKey === d.key;
            const conf = insight?.confidence;

            return (
              <button
                key={d.key}
                onClick={() => setActiveKey(isActive ? null : d.key)}
                className={clsx(
                  'group relative text-left p-4 rounded-xl border transition-all',
                  'bg-ink-900/50 backdrop-blur',
                  isActive
                    ? 'border-neon-400/60 shadow-glow-sm'
                    : 'border-ink-800 hover:border-ink-600',
                )}
              >
                {/* 顶部：维度名 + 置信度 */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: d.color, boxShadow: `0 0 8px ${d.color}` }}
                    />
                    <span className="text-xs font-medium text-ink-200">{d.label}</span>
                  </div>
                  {conf !== undefined && (
                    <span className="text-[10px] font-mono text-ink-500">
                      {(conf * 100).toFixed(0)}%
                    </span>
                  )}
                </div>

                {/* 头部结论 */}
                {insight ? (
                  <p className="text-[13px] leading-relaxed text-ink-100 line-clamp-3">
                    {insight.headline}
                  </p>
                ) : (
                  <p className="text-[13px] text-ink-500 italic">
                    {streaming ? '该维度生成中…' : '该维度暂无内容'}
                  </p>
                )}

                {/* 底部：展开提示 */}
                <div className="mt-3 pt-2.5 border-t border-ink-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-ink-500 tracking-widest">
                    {isActive ? '已展开' : '点击展开'}
                  </span>
                  <svg
                    width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    className={clsx(
                      'text-ink-400 transition-transform',
                      isActive ? 'rotate-90 text-neon-300' : 'group-hover:translate-x-0.5',
                    )}
                  >
                    <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 维度详情：专注模式 */}
      {active && (
        <div
          className="rounded-2xl border p-5 sm:p-6 animate-fade-up"
          style={{
            borderColor: `${DIM_MAP[active.dimension].color}55`,
            background: `linear-gradient(180deg, ${DIM_MAP[active.dimension].color}10, transparent)`,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: DIM_MAP[active.dimension].color }}
              />
              <h3 className="text-base font-semibold text-ink-50">
                {DIM_MAP[active.dimension].label}
              </h3>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-mono tracking-widest"
                style={{
                  background: `${DIM_MAP[active.dimension].color}20`,
                  color: DIM_MAP[active.dimension].color,
                }}
              >
                DIMENSION
              </span>
            </div>
            <button
              onClick={() => setActiveKey(null)}
              className="text-xs text-ink-400 hover:text-ink-200"
            >
              收起 ↑
            </button>
          </div>

          <p className="text-[15px] leading-relaxed text-ink-100 font-medium">
            {active.headline}
          </p>
          <p className="mt-3 text-[14px] leading-relaxed text-ink-300 whitespace-pre-wrap">
            {active.detail}
          </p>

          {active.terms && active.terms.length > 0 && (
            <div className="mt-5 pt-4 border-t border-ink-800/80">
              <div className="text-[11px] text-ink-500 tracking-widest mb-2.5">关键名词</div>
              <dl className="grid sm:grid-cols-2 gap-x-5 gap-y-2 text-sm">
                {active.terms.map((t) => (
                  <div key={t.term} className="flex gap-2">
                    <dt className="shrink-0 text-neon-300 font-medium">{t.term}</dt>
                    <dd className="text-ink-300">{t.desc}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      )}

      {/* 落地建议 */}
      {answer.actions.length > 0 && (
        <div className="rounded-2xl border border-ink-800 bg-ink-900/40 p-5">
          <div className="flex items-center gap-2 text-[11px] text-ink-500 tracking-widest mb-3">
            <span className="inline-block w-3 h-px bg-gradient-to-r from-neon-400 to-transparent" />
            落地行动清单
          </div>
          <ol className="space-y-2 text-sm text-ink-200">
            {answer.actions.map((a, i) => (
              <li key={i} className="flex gap-3">
                <span className="shrink-0 w-5 h-5 rounded-md bg-neon-400/15 text-neon-300
                                 text-[11px] font-mono flex items-center justify-center mt-0.5">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="leading-relaxed">{a}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* 延伸阅读 */}
      {answer.related && answer.related.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {answer.related.map((r) => (
            <Link
              key={r.to}
              to={r.to}
              className="text-xs px-3 py-1.5 rounded-full border border-ink-800
                         text-ink-300 hover:text-neon-200 hover:border-neon-400/50
                         hover:bg-neon-400/5 transition-all flex items-center gap-1.5"
            >
              <span>{r.label}</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          ))}
        </div>
      )}

      {/* 完整 Markdown 全文（折叠） */}
      {fallbackMarkdown && fallbackMarkdown.trim() && (
        <div className="border-t border-ink-800/80 pt-4">
          <button
            onClick={() => setShowFull((s) => !s)}
            className="text-xs text-ink-400 hover:text-neon-300 transition-colors flex items-center gap-1.5"
          >
            <svg
              width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              className={clsx('transition-transform', showFull && 'rotate-90')}
            >
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {showFull ? '收起完整回答' : '查看完整 Markdown 回答'}
          </button>
          {showFull && (
            <div className="mt-3 animate-fade-up">
              <MarkdownView content={fallbackMarkdown} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
