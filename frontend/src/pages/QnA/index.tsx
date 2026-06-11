import { useEffect, useState } from 'react';
import SessionList from './SessionList';
import ChatWindow  from './ChatWindow';
import InputBox    from './InputBox';
import { useChatStore } from '@/store/chatStore';

export default function QnAPage() {
  const bootstrap = useChatStore((s) => s.bootstrap);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  return (
    <div className="relative h-[calc(100vh-4rem)] flex">
      {/* 移动端遮罩 */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-ink-950/60 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 左侧会话列表 */}
      <div
        className={`
          fixed lg:static inset-y-16 lg:inset-y-0 left-0 z-40
          w-72 lg:w-80 shrink-0
          transform transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <SessionList />
      </div>

      {/* 主对话区 */}
      <div className="flex-1 flex flex-col min-w-0 bg-ink-950/40">
        {/* 顶部工具栏（紧凑） */}
        <div className="h-9 border-b border-ink-800/80 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1 -ml-1 text-ink-300 hover:text-white"
              aria-label="打开会话列表"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>
            <span className="text-[12px] text-ink-300">功能问答</span>
            <span className="text-[9px] text-neon-400 px-1.5 py-px rounded
                             border border-neon-400/30 bg-neon-400/5 font-mono">
              AI · RAG
            </span>
          </div>

          <div className="flex items-center gap-3 text-[10px] text-ink-500">
            <span className="hidden sm:inline">支持 Markdown / 代码 / 引用溯源</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              在线
            </span>
          </div>
        </div>

        <ChatWindow />
        <InputBox />
      </div>
    </div>
  );
}
