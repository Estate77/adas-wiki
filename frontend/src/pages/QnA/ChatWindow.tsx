import { useEffect, useRef, useState } from 'react';
import MessageBubble from './MessageBubble';
import { useChatStore, useCurrentMessages } from '@/store/chatStore';

/**
 * 聊天主区域：消息列表 + 自动滚动
 */
export default function ChatWindow() {
  const messages = useCurrentMessages();
  const send     = useChatStore((s) => s.sendMessage);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const regen    = useChatStore((s) => s.regenerateLast);
  const stop     = useChatStore((s) => s.stopStream);
  const currentId = useChatStore((s) => s.currentId);

  const scrollRef   = useRef<HTMLDivElement>(null);
  const bottomRef   = useRef<HTMLDivElement>(null);
  /** 由 useEffect 触发的滚动需要被 onScroll 忽略，否则会死循环 */
  const programmaticScrollRef = useRef(false);
  const [autoScroll, setAutoScroll] = useState(true);

  // 自动滚动到底部 —— 不再依赖 autoScroll 状态，避免循环
  useEffect(() => {
    const el = scrollRef.current;
    const bottom = bottomRef.current;
    if (!el || !bottom) return;

    programmaticScrollRef.current = true;
    // 使用 'auto' 而非 'smooth'：smooth 滚动过程会触发多个 scroll 事件
    // 引发 onScroll 反复 setState 进入死循环
    bottom.scrollIntoView({ behavior: 'auto', block: 'end' });
    // 解锁延时：根据内容长度自适应，但保证至少 1 帧
    const unlock = window.setTimeout(() => {
      programmaticScrollRef.current = false;
    }, 50);
    return () => window.clearTimeout(unlock);
  }, [messages, currentId]);

  // 监听用户向上滚动：暂停自动滚动
  const onScroll = () => {
    if (programmaticScrollRef.current) return; // ★ 关键：忽略程序化滚动
    const el = scrollRef.current;
    if (!el) return;
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setAutoScroll(distanceToBottom < 80);
  };

  if (!currentId) {
    return <EmptyState onPick={(q) => send(q)} />;
  }

  return (
    <div
      ref={scrollRef}
      onScroll={onScroll}
      className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 sm:py-8"
    >
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            message={m}
            onPickFollowup={(q) => send(q)}
          />
        ))}

        {/* 重新生成 / 停止 按钮：仅在最后一条是助手时显示 */}
        {messages.length > 0 &&
          messages[messages.length - 1].role === 'ASSISTANT' && (
          <div className="flex items-center gap-2 pl-11 sm:pl-12">
            {isStreaming ? (
              <button
                onClick={stop}
                className="text-xs text-ink-400 hover:text-red-300 px-3 py-1.5 rounded-full
                           border border-ink-800 hover:border-red-400/40 transition-colors flex items-center gap-1.5"
              >
                <span className="block w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                停止生成
              </button>
            ) : (
              <button
                onClick={() => regen()}
                className="text-xs text-ink-400 hover:text-neon-300 px-3 py-1.5 rounded-full
                           border border-ink-800 hover:border-neon-400/40 transition-colors flex items-center gap-1.5"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                重新生成
              </button>
            )}
            <span className="text-[11px] text-ink-600">回答由大模型生成，可能存在错误</span>
          </div>
        )}

        <div ref={bottomRef} className="h-2" />
      </div>

      {/* 回到最新：固定在右下角 */}
      {!autoScroll && (
        <button
          onClick={() => {
            programmaticScrollRef.current = true;
            setAutoScroll(true);
            bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
            window.setTimeout(() => { programmaticScrollRef.current = false; }, 500);
          }}
          className="sticky bottom-3 left-full -translate-x-full ml-3
                     px-3 py-1.5 rounded-full bg-neon-400 text-ink-950 text-xs
                     shadow-glow-md hover:bg-neon-300 transition-colors flex items-center gap-1.5
                     w-fit"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          回到最新
        </button>
      )}
    </div>
  );
}

// ============== 空状态 ==============
function EmptyState({ onPick }: { onPick: (q: string) => void }) {
  const tips = [
    { icon: '🛡', title: '安全与合规', desc: 'UN-R157、ISO 26262、SOTIF 等专题解读' },
    { icon: '🧠', title: '端到端智驾',  desc: '从模块化到端到端，架构演进与技术挑战' },
    { icon: '🛰', title: '感知融合',    desc: '激光雷达、毫米波、摄像头的融合策略' },
    { icon: '🎯', title: '规划控制',    desc: '经典控制 vs 学习型规划的最新进展' },
  ];
  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12">
      <div className="max-w-2xl w-full text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-400 to-indigo-500
                        flex items-center justify-center shadow-glow-md animate-float">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#020617" strokeWidth="2.2">
            <path d="M21 12a8 8 0 1 1-3.2-6.4L21 4l-1 4-3.5.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 12h8M8 9h5" strokeLinecap="round" />
          </svg>
        </div>
        <h2 className="mt-6 text-2xl sm:text-3xl font-semibold tracking-tight">
          开启你的第一次智驾问答
        </h2>
        <p className="mt-3 text-ink-400 leading-relaxed-pro">
          选择下方话题开始，或直接在下方输入你的问题。
        </p>

        <div className="mt-8 grid sm:grid-cols-2 gap-3">
          {tips.map((t) => (
            <button
              key={t.title}
              onClick={() => onPick(`请介绍${t.title}相关的核心知识`)}
              className="text-left p-4 rounded-xl border border-ink-800 bg-ink-900/40
                         hover:border-neon-400/50 hover:bg-neon-400/5 transition-all group"
            >
              <div className="text-2xl">{t.icon}</div>
              <div className="mt-2 font-medium text-ink-100 group-hover:text-neon-200 transition-colors">
                {t.title}
              </div>
              <div className="text-xs text-ink-400 mt-1">{t.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
