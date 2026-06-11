import { useRef, useState, useEffect, type KeyboardEvent } from 'react';
import clsx from 'clsx';
import { useChatStore } from '@/store/chatStore';
import { DIMENSIONS } from '@/types';
import type { Dimension } from '@/types';

const QUICK_PROMPTS = [
  '激光雷达原理？',
  'BEV 与 Occupancy 区别？',
  '端到端是未来吗？',
  'ISO 26262 vs SOTIF？',
];

export default function InputBox() {
  const isStreaming = useChatStore((s) => s.isStreaming);
  const send        = useChatStore((s) => s.sendMessage);
  const stop        = useChatStore((s) => s.stopStream);

  const [value, setValue] = useState('');
  const [focusDim, setFocusDim] = useState<Dimension | null>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  // 自动伸缩高度
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
  }, [value]);

  const onSend = async () => {
    const v = value.trim();
    if (!v || isStreaming) return;

    const finalContent = focusDim
      ? `${v}\n\n（请从"${DIMENSIONS.find((d) => d.key === focusDim)?.label}"维度重点展开）`
      : v;

    setValue('');
    setFocusDim(null);
    requestAnimationFrame(() => taRef.current?.focus());
    await send(finalContent);
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="border-t border-ink-800/80 bg-ink-950/60 backdrop-blur-xl">
      {/* 维度筛选 chips（单行、紧凑） */}
      <div className="px-4 sm:px-6 pt-1.5 flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] text-ink-500 tracking-widest mr-0.5">视角</span>
        <button
          onClick={() => setFocusDim(null)}
          className={clsx(
            'text-[10px] px-2 py-0.5 rounded-full border transition-all',
            focusDim === null
              ? 'border-neon-400/60 text-neon-200 bg-neon-400/10'
              : 'border-ink-800 text-ink-400 hover:border-ink-600',
          )}
        >
          综合
        </button>
        {DIMENSIONS.map((d) => {
          const active = focusDim === d.key;
          return (
            <button
              key={d.key}
              onClick={() => setFocusDim(active ? null : d.key)}
              className={clsx(
                'text-[10px] px-2 py-0.5 rounded-full border transition-all flex items-center gap-1',
                active
                  ? 'border-transparent text-ink-950 font-medium'
                  : 'border-ink-800 text-ink-400 hover:border-ink-600',
              )}
              style={active ? { background: d.color, boxShadow: `0 0 10px ${d.color}55` } : undefined}
              title={`从「${d.label}」维度展开`}
            >
              <span
                className="w-1 h-1 rounded-full"
                style={{ background: active ? '#020617' : d.color }}
              />
              {d.short}
            </button>
          );
        })}
      </div>

      {/* 快捷提示（仅在 input 为空时显示） */}
      {!value && (
        <div className="px-4 sm:px-6 pt-1.5 flex flex-wrap gap-1.5">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => setValue(p)}
              className="text-[11px] px-2.5 py-0.5 rounded-full border border-ink-800
                         text-ink-300 hover:border-neon-400/50 hover:text-neon-200
                         hover:bg-neon-400/5 transition-all"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      <div className="p-3 sm:p-3.5">
        <div
          className={clsx(
            'relative flex items-end gap-2 max-w-4xl mx-auto',
            'rounded-xl border bg-ink-900/80 backdrop-blur',
            'transition-colors',
            isStreaming
              ? 'border-ink-800 opacity-90'
              : 'border-ink-700 focus-within:border-neon-400/60 focus-within:shadow-glow-sm',
          )}
        >
          <textarea
            ref={taRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKey}
            disabled={isStreaming}
            rows={1}
            placeholder={
              isStreaming
                ? '正在生成…'
                : focusDim
                  ? `从「${DIMENSIONS.find((d) => d.key === focusDim)?.label}」展开…`
                  : '问点关于智驾的任何问题…'
            }
            className="flex-1 resize-none bg-transparent text-ink-50 placeholder:text-ink-500
                       px-3.5 py-2.5 text-[13px] leading-relaxed outline-none
                       max-h-[160px] disabled:opacity-60"
          />

          {isStreaming ? (
            <button
              onClick={stop}
              className="m-1.5 p-2 rounded-lg bg-ink-800 text-ink-100 hover:bg-red-500/20 hover:text-red-300 transition-colors"
              title="停止生成"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            </button>
          ) : (
            <button
              onClick={onSend}
              disabled={!value.trim()}
              className="m-1.5 p-2 rounded-lg bg-neon-400 text-ink-950
                         hover:bg-neon-300 disabled:opacity-30 disabled:cursor-not-allowed
                         transition-all"
              title="发送 (Enter)"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
