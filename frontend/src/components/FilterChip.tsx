import clsx from 'clsx';
import type { ReactNode } from 'react';

interface Props {
  /** 是否为选中态 */
  active: boolean;
  /** 点击回调 */
  onClick: () => void;
  /** 标签内容 */
  children: ReactNode;
  /** 可选 tone：neon | cyan | violet | emerald | amber */
  tone?: 'neon' | 'cyan' | 'violet' | 'emerald' | 'amber';
  /** 可选图标 */
  icon?: ReactNode;
  /** 可选计数 */
  count?: number | string;
  /** 是否禁用 */
  disabled?: boolean;
}

const TONE: Record<NonNullable<Props['tone']>, { active: string; idle: string; count: string }> = {
  neon:    { active: 'bg-neon-400 text-ink-950 border-neon-400 shadow-glow-sm',         idle: 'border-ink-700 text-ink-300 hover:border-ink-500', count: 'bg-ink-800 text-ink-300' },
  cyan:    { active: 'bg-cyan-400 text-ink-950 border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.4)]', idle: 'border-ink-700 text-ink-300 hover:border-cyan-500/50', count: 'bg-cyan-400/15 text-cyan-200' },
  violet:  { active: 'bg-violet-400 text-ink-950 border-violet-400 shadow-[0_0_12px_rgba(167,139,250,0.4)]', idle: 'border-ink-700 text-ink-300 hover:border-violet-500/50', count: 'bg-violet-400/15 text-violet-200' },
  emerald: { active: 'bg-emerald-400 text-ink-950 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]', idle: 'border-ink-700 text-ink-300 hover:border-emerald-500/50', count: 'bg-emerald-400/15 text-emerald-200' },
  amber:   { active: 'bg-amber-400 text-ink-950 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.4)]', idle: 'border-ink-700 text-ink-300 hover:border-amber-500/50', count: 'bg-amber-400/15 text-amber-200' },
};

/**
 * 通用筛选 chip —— 选中态使用 tone 主色 + 光晕，与主题色一致
 */
export default function FilterChip({
  active,
  onClick,
  children,
  tone = 'neon',
  icon,
  count,
  disabled,
}: Props) {
  const t = TONE[tone];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border',
        'transition-all duration-200 whitespace-nowrap',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        active ? t.active : t.idle,
      )}
    >
      {icon && <span className="text-[11px] leading-none">{icon}</span>}
      <span className="leading-none">{children}</span>
      {count !== undefined && (
        <span className={clsx(
          'ml-0.5 px-1.5 py-0.5 text-[10px] rounded-full font-mono leading-none',
          active ? 'bg-ink-950/30 text-ink-50' : t.count,
        )}>
          {count}
        </span>
      )}
    </button>
  );
}
