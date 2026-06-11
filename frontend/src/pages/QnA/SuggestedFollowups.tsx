interface Props {
  items: string[];
  onPick: (q: string) => void;
}

/** 追问推荐：每次回答后自动生成的 3 个延伸问题 */
export default function SuggestedFollowups({ items, onPick }: Props) {
  return (
    <div className="mt-5">
      <div className="flex items-center gap-2 text-[11px] text-ink-500 tracking-widest mb-2.5">
        <span className="block w-3 h-px bg-gradient-to-r from-neon-400 to-transparent" />
        追问推荐
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((q, i) => (
          <button
            key={i}
            onClick={() => onPick(q)}
            className="group text-left text-xs sm:text-sm
                       px-3.5 py-2 rounded-xl border border-ink-800 bg-ink-900/40
                       text-ink-200 hover:text-neon-200
                       hover:border-neon-400/50 hover:bg-neon-400/5
                       transition-all flex items-center gap-2"
          >
            <span className="text-neon-400 font-mono text-[10px]">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span>{q}</span>
            <svg
              width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
            >
              <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}
