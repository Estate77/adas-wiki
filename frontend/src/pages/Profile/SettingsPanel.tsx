import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth.service';

type Tab = 'profile' | 'password';

export default function SettingsPanel() {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);

  const [tab, setTab] = useState<Tab>('profile');
  const [username, setUsername] = useState(user?.username ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  // 修改密码
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirm, setConfirm] = useState('');

  const onSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (username.trim().length < 2) return setMsg({ kind: 'err', text: '用户名至少 2 个字符' });
    setSaving(true);
    try {
      await updateProfile({ username: username.trim(), bio: bio.trim() || null });
      setMsg({ kind: 'ok', text: '已保存' });
    } catch (e) {
      setMsg({ kind: 'err', text: (e as Error).message });
    } finally {
      setSaving(false);
    }
  };

  const onChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (newPwd.length < 6) return setMsg({ kind: 'err', text: '新密码至少 6 位' });
    if (newPwd !== confirm)  return setMsg({ kind: 'err', text: '两次新密码不一致' });
    setSaving(true);
    try {
      await authService.changePassword({ oldPassword: oldPwd, newPassword: newPwd });
      setMsg({ kind: 'ok', text: '密码已更新，下次登录请使用新密码' });
      setOldPwd(''); setNewPwd(''); setConfirm('');
    } catch (e) {
      setMsg({ kind: 'err', text: (e as Error).message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="glass-panel p-6">
      <div className="flex items-center gap-1 p-1 rounded-full bg-ink-900/80 border border-ink-800 w-fit mb-5">
        {(['profile', 'password'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setMsg(null); }}
            className={`px-4 py-1.5 text-sm rounded-full transition-all
                        ${tab === t ? 'bg-neon-400 text-ink-950 font-medium' : 'text-ink-300 hover:text-white'}`}
          >
            {t === 'profile' ? '基本资料' : '修改密码'}
          </button>
        ))}
      </div>

      {msg && (
        <div className={`mb-4 text-xs px-3 py-2 rounded-lg border animate-fade-up
                         ${msg.kind === 'ok'
                           ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30'
                           : 'text-red-300 bg-red-500/10 border-red-500/30'}`}>
          {msg.text}
        </div>
      )}

      {tab === 'profile' ? (
        <form onSubmit={onSaveProfile} className="space-y-4 max-w-md">
          <div>
            <label className="text-xs text-ink-400 tracking-widest">邮箱</label>
            <input value={user?.email} disabled className="input mt-1" />
          </div>
          <div>
            <label className="text-xs text-ink-400 tracking-widest">用户名</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} className="input mt-1" />
          </div>
          <div>
            <label className="text-xs text-ink-400 tracking-widest">个人简介</label>
            <textarea
              value={bio ?? ''}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={200}
              placeholder="一句话介绍自己（≤200 字）"
              className="input mt-1 resize-none"
            />
          </div>
          <button type="submit" disabled={saving} className="btn-primary text-sm">
            {saving ? '保存中…' : '保存修改'}
          </button>
        </form>
      ) : (
        <form onSubmit={onChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="text-xs text-ink-400 tracking-widest">当前密码</label>
            <input type="password" value={oldPwd} onChange={(e) => setOldPwd(e.target.value)} className="input mt-1" required />
          </div>
          <div>
            <label className="text-xs text-ink-400 tracking-widest">新密码（≥ 6 位）</label>
            <input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} className="input mt-1" required />
          </div>
          <div>
            <label className="text-xs text-ink-400 tracking-widest">确认新密码</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="input mt-1" required />
          </div>
          <button type="submit" disabled={saving} className="btn-primary text-sm">
            {saving ? '提交中…' : '更新密码'}
          </button>
        </form>
      )}

      <style>{`
        .input {
          width: 100%;
          padding: 0.625rem 0.875rem;
          border-radius: 0.75rem;
          background: rgba(2,6,23,0.7);
          border: 1px solid rgb(51 65 85);
          color: #F8FAFC;
          font-size: 0.875rem;
          outline: none;
        }
        .input:focus { border-color: #38BDF8; box-shadow: 0 0 0 3px rgba(56,189,248,0.15); }
        .input:disabled { color: #94A3B8; }
      `}</style>
    </section>
  );
}
