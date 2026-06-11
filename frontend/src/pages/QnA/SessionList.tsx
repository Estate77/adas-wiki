import { useState } from 'react';
import clsx from 'clsx';
import { useChatStore } from '@/store/chatStore';

function formatTime(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  const diffDay = Math.floor((now.getTime() - ts) / 86_400_000);
  if (diffDay < 7) return `${diffDay} 天前`;
  return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
}

export default function SessionList() {
  const conversations = useChatStore((s) => s.conversations);
  const currentId     = useChatStore((s) => s.currentId);
  const newConv       = useChatStore((s) => s.newConversation);
  const selectConv    = useChatStore((s) => s.selectConversation);
  const deleteConv    = useChatStore((s) => s.deleteConversation);
  const renameConv    = useChatStore((s) => s.renameConversation);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft]         = useState('');

  const onSubmitRename = (id: string) => {
    const t = draft.trim();
    if (t) renameConv(id, t);
    setEditingId(null);
    setDraft('');
  };

  return (
    <aside className="w-full h-full flex flex-col bg-ink-900/50 border-r border-ink-800/80">
      {/* 顶部：标题 + 新建 */}
      <div className="px-4 py-4 border-b border-ink-800/80">
        <button
          onClick={() => newConv()}
          className="w-full btn-primary text-sm py-2.5"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          新建会话
        </button>
        <div className="mt-3 flex items-center justify-between text-[11px] text-ink-500 tracking-widest">
          <span>共 {conversations.length} 个会话</span>
          <span>本地保存</span>
        </div>
      </div>

      {/* 列表 */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {conversations.length === 0 && (
          <div className="px-4 py-12 text-center text-sm text-ink-500">
            还没有会话<br />点击上方"新建会话"开始
          </div>
        )}

        {conversations.map((c) => {
          const active = c.id === currentId;
          const isEditing = editingId === c.id;

          return (
            <div
              key={c.id}
              onClick={() => !isEditing && selectConv(c.id)}
              className={clsx(
                'group relative px-3 py-2.5 rounded-xl cursor-pointer transition-all',
                active
                  ? 'bg-neon-400/10 text-neon-200 border border-neon-400/30'
                  : 'text-ink-200 hover:bg-ink-800/60 border border-transparent',
              )}
            >
              <div className="flex items-start gap-2">
                <span
                  className={clsx(
                    'mt-1 w-1.5 h-1.5 rounded-full shrink-0',
                    active ? 'bg-neon-400' : 'bg-ink-600 group-hover:bg-ink-400',
                  )}
                />
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <input
                      autoFocus
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onBlur={() => onSubmitRename(c.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') onSubmitRename(c.id);
                        if (e.key === 'Escape') {
                          setEditingId(null);
                          setDraft('');
                        }
                      }}
                      className="w-full bg-ink-950 border border-neon-400/40 rounded px-2 py-0.5 text-sm text-ink-50 outline-none"
                    />
                  ) : (
                    <div className="text-sm font-medium truncate">{c.title}</div>
                  )}
                  <div className="mt-0.5 text-[11px] text-ink-500 truncate">
                    {formatTime(c.updatedAt)}
                    {c.messageCount ? ` · ${c.messageCount} 条` : ''}
                  </div>
                </div>
              </div>

              {/* 操作按钮（hover 出现） */}
              {!isEditing && (
                <div className="absolute right-2 top-2 hidden group-hover:flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(c.id);
                      setDraft(c.title);
                    }}
                    className="p-1 rounded text-ink-400 hover:text-neon-300 hover:bg-ink-900"
                    title="重命名"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 20h9M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`确定删除"${c.title}"？`)) deleteConv(c.id);
                    }}
                    className="p-1 rounded text-ink-400 hover:text-red-400 hover:bg-ink-900"
                    title="删除"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 底部说明 */}
      <div className="px-4 py-3 border-t border-ink-800/80 text-[11px] text-ink-500">
        <p className="leading-relaxed">
          会话数据保存在浏览器本地，<br />
          当前 Demo 不依赖后端或数据库。
        </p>
      </div>
    </aside>
  );
}
