import clsx from 'clsx';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

interface Tab {
  key: string;
  label: string;
  icon?: string;        // 表情或字符
  badge?: number | string;
}

interface Props {
  tabs: Tab[];
  active: string;
  onChange: (key: string) => void;
  className?: string;
}

/**
 * 滚动条吸顶 + 真实 DOM 测量指示器的 Tab 切换器
 *
 * 关键修复（vs 旧版）：
 * 1) 指示器不再按 "100% / length" 等分 —— 旧版在 tab 文本宽度不一时错位（中文/带 badge/带 icon）
 * 2) 改为 ref 测量每个 tab 按钮的真实 offsetLeft / offsetWidth
 * 3) 监听 window resize + 内容变化重算
 * 4) 选中 tab 自动滚动到容器可视区（移动端横滑场景）
 */
export default function Tabs({ tabs, active, onChange, className }: Props) {
  const wrapRef     = useRef<HTMLDivElement>(null);
  const btnRefs     = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false });

  const measure = () => {
    const wrap = wrapRef.current;
    const btn  = btnRefs.current[active];
    if (!wrap || !btn) return;
    const wrapRect = wrap.getBoundingClientRect();
    const btnRect  = btn.getBoundingClientRect();
    setIndicator({
      left:  btnRect.left - wrapRect.left + wrap.scrollLeft,
      width: btnRect.width,
      ready: true,
    });
    // 选中 tab 滚到可视区
    if (btnRect.left < wrapRect.left || btnRect.right > wrapRect.right) {
      btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  // 同步布局：DOM 刚画完就测量，避免闪烁
  useLayoutEffect(() => {
    measure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, tabs]);

  // 监听 resize / 字体加载
  useEffect(() => {
    window.addEventListener('resize', measure);
    if ((document as any).fonts && (document as any).fonts.ready) {
      (document as any).fonts.ready.then(measure);
    }
    return () => window.removeEventListener('resize', measure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={wrapRef}
      className={clsx('relative border-b border-ink-800/80', className)}
    >
      <div className="flex overflow-x-auto no-scrollbar gap-1 px-1">
        {tabs.map((t) => {
          const isActive = active === t.key;
          return (
            <button
              key={t.key}
              ref={(el) => { btnRefs.current[t.key] = el; }}
              onClick={() => onChange(t.key)}
              className={clsx(
                'relative px-4 py-3 text-sm whitespace-nowrap transition-colors duration-200',
                'flex items-center gap-1.5',
                isActive
                  ? 'text-neon-300'
                  : 'text-ink-400 hover:text-ink-200',
              )}
            >
              {t.icon && <span className="text-base leading-none">{t.icon}</span>}
              <span className="leading-none">{t.label}</span>
              {t.badge !== undefined && (
                <span className={clsx(
                  'px-1.5 py-0.5 text-[10px] rounded-full leading-none transition-colors',
                  isActive
                    ? 'bg-neon-400/30 text-neon-200'
                    : 'bg-ink-800 text-ink-300',
                )}>
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {/* 渐变指示器 —— 宽度严格匹配选中 tab */}
      <span
        aria-hidden
        className={clsx(
          'absolute bottom-0 h-[2px] rounded-full',
          'bg-gradient-to-r from-neon-400 via-cyan-300 to-indigo-400',
          'shadow-[0_0_10px_rgba(0,229,255,0.6)]',
          'transition-all duration-300 ease-out',
          indicator.ready ? 'opacity-100' : 'opacity-0',
        )}
        style={{ left: indicator.left, width: indicator.width }}
      />
    </div>
  );
}
