import clsx from 'clsx';

interface Props {
  eyebrow?: string;
  title:   string;
  desc?:   string;
  className?: string;
  children?: React.ReactNode;
}

/** 通用页面头部：顶部主标题 + 副标题 + 右侧操作区 */
export default function PageHeader({ eyebrow, title, desc, className, children }: Props) {
  return (
    <div className={clsx('max-w-7xl mx-auto px-5 lg:px-8 pt-10 pb-6', className)}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          {eyebrow && (
            <div className="text-xs font-medium text-neon-300 tracking-[0.25em] mb-2">
              {eyebrow}
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{title}</h1>
          {desc && <p className="mt-2 text-sm text-ink-400 max-w-2xl">{desc}</p>}
        </div>
        {children && <div className="flex flex-wrap gap-2">{children}</div>}
      </div>
    </div>
  );
}
