import clsx from 'clsx';
import type { ReactNode } from 'react';

interface Item<V extends string = string> {
  value: V;
  label: ReactNode;
  icon?: ReactNode;
  count?: number | string;
  disabled?: boolean;
}

interface Props<V extends string = string> {
  items: Item<V>[];
  value: V;
  onChange: (v: V) => void;
  /** 尺寸 */
  size?: 'sm' | 'md';
  /** 主题色 */
  tone?: 'neon' | 'cyan' | 'violet' | 'emerald' | 'amber';
  /** 容器类名 */
  className?: string;
  /** 是否填充整宽（均分宽度） */
  block?: boolean;
}

const TONE: Record<NonNullable<Props['tone']>, { active: string; idle: string }> = {
  neon:    { active: 'bg-ink-900 text-neon-300 shadow-[inset_0_0_0_1px_rgba(0,229,255,0.45)]', idle: 'text-ink-400 hover:text-ink-200' },
  cyan:    { active: 'bg-ink-900 text-cyan-200 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.45)]', idle: 'text-ink-400 hover:text-ink-200' },
  violet:  { active: 'bg-ink-900 text-violet-200 shadow-[inset_0_0_0_1px_rgba(167,139,250,0.45)]', idle: 'text-ink-400 hover:text-ink-200' },
  emerald: { active: 'bg-ink-900 text-emerald-200 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.45)]', idle: 'text-ink-400 hover:text-ink-200' },
  amber:   { active: 'bg-ink-900 text-amber-200 shadow-[inset_0_0_0_1px_rgba(251,191,36,0.45)]', idle: 'text-ink-400 hover:text-ink-200' },
};

/**
 * Segmented Control —— 容器内"分页式"切换器
 * 与 Tabs 的区别：
 * - Tabs 用于一级内容切换，指示器在底部 + 占据全宽
 * - Segmented 用于二级筛选/视图切换，自适应每个 item 宽度
 */
export default function Segmented<V extends string = string>({
  items,
  value,
  onChange,
  size = 'sm',
  tone = 'neon',
  className,
  block,
}: Props<V>) {
  const t = TONE[tone];
  return (
    <div
      className={clsx(
        'inline-flex items-center gap-0.5 p-0.5 rounded-full',
        'bg-ink-900/80 border border-ink-800/80',
        block && 'flex w-full',
        className,
      )}
    >
      {items.map((it) => {
        const active = it.value === value;
        return (
          <button
            key={it.value}
            onClick={() => !it.disabled && onChange(it.value)}
            disabled={it.disabled}
            className={clsx(
              'inline-flex items-center justify-center gap-1.5 rounded-full',
              'transition-all duration-200',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              size === 'sm' ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-sm',
              block && 'flex-1',
              active ? t.active : t.idle,
            )}
          >
            {it.icon && <span className="leading-none">{it.icon}</span>}
            <span className="leading-none">{it.label}</span>
            {it.count !== undefined && (
              <span className={clsx(
                'px-1.5 py-0.5 text-[10px] rounded-full font-mono leading-none',
                active ? 'bg-ink-800 text-ink-100' : 'bg-ink-800/60 text-ink-400',
              )}>
                {it.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
