import type { Message } from '@/types/chat';
import MarkdownView from './MarkdownView';
import SixDimensionView from './SixDimensionView';
import SuggestedFollowups from './SuggestedFollowups';

interface Props {
  message: Message;
  onPickFollowup?: (q: string) => void;
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}

export default function MessageBubble({ message, onPickFollowup }: Props) {
  const isUser = message.role === 'USER';
  const hasStructured = !!message.structured;

  // 来源标签
  const sourceBadge = (() => {
    if (isUser) return null;
    if (message.source === 'KB')
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded
                         bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          知识库
        </span>
      );
    if (message.source === 'LLM')
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded
                         bg-violet-500/15 text-violet-300 border border-violet-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
          LLM 兜底
        </span>
      );
    if (message.source === 'MOCK')
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded
                         bg-ink-700/60 text-ink-300 border border-ink-600/40">
          <span className="w-1.5 h-1.5 rounded-full bg-ink-400" />
          Mock
        </span>
      );
    return null;
  })();

  return (
    <div className="animate-fade-up">
      <div className={`flex gap-3 sm:gap-4 ${isUser ? 'flex-row-reverse' : ''}`}>
        {/* 头像 */}
        <div
          className={`shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-sm font-semibold
                      ${isUser
                        ? 'bg-ink-700 text-ink-100'
                        : 'bg-gradient-to-br from-neon-400 to-indigo-500 text-ink-950 shadow-glow-sm'}`}
        >
          {isUser ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6l-8-4z" strokeLinejoin="round" />
              <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>

        {/* 内容 */}
        <div className={`flex-1 min-w-0 ${isUser ? 'flex justify-end' : ''}`}>
          {!isUser && sourceBadge && (
            <div className="mb-1.5 flex items-center gap-2 px-1">
              {sourceBadge}
              {message.knowledgeId && (
                <span className="text-[10px] text-ink-500 font-mono">
                  关联 {message.knowledgeId}
                </span>
              )}
            </div>
          )}
          <div
            className={`inline-block max-w-[88%] sm:max-w-[82%]
                        ${isUser
                          ? 'px-4 py-2.5 rounded-2xl rounded-tr-md bg-ink-800 text-ink-50 text-sm leading-relaxed'
                          : 'text-ink-100'}`}
          >
            {isUser ? (
              <div className="whitespace-pre-wrap break-words">{message.content}</div>
            ) : (
              <>
                {/* 结构化答案（六维） */}
                {hasStructured ? (
                  <SixDimensionView
                    answer={message.structured!}
                    streaming={message.isStreaming}
                    fallbackMarkdown={message.content}
                  />
                ) : (
                  <MarkdownView content={message.content} streaming={message.isStreaming} />
                )}

                {/* 引用 */}
                {message.citations && message.citations.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-ink-800/80">
                    <div className="text-[11px] text-ink-500 mb-2 tracking-widest">REFERENCES</div>
                    <ul className="space-y-1.5">
                      {message.citations.map((c, i) => (
                        <li
                          key={i}
                          className="flex gap-2 text-xs text-ink-400 hover:text-neon-300 transition-colors cursor-pointer"
                        >
                          <span className="text-neon-400 font-mono mt-0.5">[{i + 1}]</span>
                          <div>
                            <div className="font-medium text-ink-200">{c.title}</div>
                            <div className="text-ink-500 line-clamp-1">{c.snippet}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 追问推荐 */}
                {!message.isStreaming && message.followups && message.followups.length > 0 && (
                  <SuggestedFollowups
                    items={message.followups}
                    onPick={(q) => onPickFollowup?.(q)}
                  />
                )}
              </>
            )}
          </div>

          {/* 时间戳 */}
          <div className={`mt-1.5 text-[11px] text-ink-500 px-1 ${isUser ? 'text-right' : ''}`}>
            {formatTime(message.createdAt)}
          </div>
        </div>
      </div>
    </div>
  );
}
