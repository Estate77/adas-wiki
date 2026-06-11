import { Link } from 'react-router-dom';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';

function formatTime(ts: number) {
  const d = new Date(ts);
  const now = Date.now();
  const diff = now - ts;
  if (diff < 60_000) return '刚刚';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分钟前`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小时前`;
  if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)} 天前`;
  return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
}

export default function HistoryTab() {
  const conversations = useChatStore((s) => s.conversations);
  const selectConv    = useChatStore((s) => s.selectConversation);
  const user          = useAuthStore((s) => s.user);
  const isLoggedIn    = !!user;

  // 按 updatedAt 倒序（最近活动优先）
  const sorted = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);

  // 概览统计
  const total = conversations.length;
  const totalMsgs = conversations.reduce((s, c) => s + (c.messageCount ?? 0), 0);
  const last24h = conversations.filter(
    (c) => Date.now() - c.updatedAt < 86_400_000,
  ).length;

  return (
    <div className="space-y-5">
      {/* 顶部统计 */}
      <div className="grid sm:grid-cols-3 gap-3">
        <Stat label="总会话"    value={total}      unit="个"  />
        <Stat label="累计消息"  value={totalMsgs}  unit="条"  />
        <Stat label="近 24 小时" value={last24h}    unit="次"  />
      </div>

      {!isLoggedIn && sorted.length > 0 && (
        <div className="glass-panel p-4 flex items-center gap-3 border-amber-400/30">
          <span className="text-amber-300 text-lg">⚠️</span>
          <div className="flex-1 text-sm text-ink-300">
            当前历史仅保存在本地浏览器，<Link to="/login" className="text-neon-300 hover:underline">登录</Link> 后可同步到云端、多端访问
          </div>
        </div>
      )}

      {/* 会话列表 */}
      {sorted.length === 0 ? (
        <div className="glass-panel p-10 text-center">
          <div className="text-3xl">📜</div>
          <p className="mt-3 text-sm text-ink-400">还没有任何对话记录</p>
          <Link to="/qna" className="mt-4 inline-block btn-primary text-sm">去提问</Link>
        </div>
      ) : (
        <div className="glass-panel divide-y divide-ink-800/80">
          {sorted.map((c) => (
            <Link
              key={c.id}
              to="/qna"
              onClick={() => selectConv(c.id)}
              className="flex items-center gap-3 px-5 py-4 hover:bg-ink-800/40 transition-colors group"
            >
              <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-neon-400" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-ink-100 truncate group-hover:text-neon-200 transition-colors">
                  {c.title}
                </div>
                {c.preview && (
                  <div className="mt-0.5 text-xs text-ink-500 truncate">{c.preview}</div>
                )}
              </div>
              <div className="text-right shrink-0">
                <div className="text-[11px] text-ink-400">{formatTime(c.updatedAt)}</div>
                <div className="text-[10px] text-ink-500 font-mono mt-0.5">
                  {c.messageCount ?? 0} 条
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="glass-panel p-4">
      <div className="text-[11px] text-ink-500 tracking-widest">{label}</div>
      <div className="mt-1.5 flex items-baseline gap-1">
        <span className="text-2xl font-semibold font-mono text-white">{value}</span>
        <span className="text-xs text-ink-400">{unit}</span>
      </div>
    </div>
  );
}
