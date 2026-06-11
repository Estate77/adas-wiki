import { useState, useRef, useEffect, forwardRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

type Mode = 'login' | 'register';

interface Props {
  initialMode?: Mode;
}

export default function AuthForm({ initialMode = 'login' }: Props) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail]       = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [error, setError]       = useState<string | null>(null);

  const login    = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const loading  = useAuthStore((s) => s.loading);
  const navigate = useNavigate();

  const firstInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { firstInputRef.current?.focus(); }, [mode]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'register') {
      if (password !== confirm) return setError('两次输入的密码不一致');
      if (username.trim().length < 2) return setError('用户名至少 2 个字符');
    }
    if (password.length < 6) return setError('密码至少 6 位');

    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await register(email.trim(), username.trim(), password);
      }
      navigate('/profile');
    } catch (e) {
      setError((e as Error).message || '操作失败，请重试');
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      {/* 背景 */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(56,189,248,0.18), transparent 60%),' +
              'radial-gradient(ellipse 50% 40% at 80% 80%, rgba(129,140,248,0.16), transparent 60%),' +
              'linear-gradient(180deg, #020617 0%, #0F172A 60%, #020617 100%)',
          }}
        />
        <div className="absolute inset-0 bg-grid-dark bg-grid mask-fade-b opacity-40" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-neon-400 to-indigo-500 shadow-glow-sm" />
            <span className="text-lg font-semibold">智驾百科</span>
          </Link>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight">
            {mode === 'login' ? '欢迎回来' : '创建你的账号'}
          </h1>
          <p className="mt-2 text-sm text-ink-400">
            {mode === 'login' ? '登录后开启 AI 问答 + 学习进度同步' : '加入智驾百科，记录每一份成长'}
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="glass-panel p-7 space-y-5"
        >
          {/* Tab 切换 */}
          <div className="flex p-1 rounded-full bg-ink-900/80 border border-ink-800">
            {(['login', 'register'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(null); }}
                className={`flex-1 text-sm py-2 rounded-full transition-all
                            ${mode === m
                              ? 'bg-neon-400 text-ink-950 font-medium shadow-glow-sm'
                              : 'text-ink-300 hover:text-white'}`}
              >
                {m === 'login' ? '登录' : '注册'}
              </button>
            ))}
          </div>

          <Field
            ref={firstInputRef}
            label="邮箱"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            autoComplete="email"
          />

          {mode === 'register' && (
            <Field
              label="用户名"
              value={username}
              onChange={setUsername}
              placeholder="2~24 个字符"
              autoComplete="username"
            />
          )}

          <Field
            label="密码"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="至少 6 位"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />

          {mode === 'register' && (
            <Field
              label="确认密码"
              type="password"
              value={confirm}
              onChange={setConfirm}
              placeholder="再次输入密码"
              autoComplete="new-password"
            />
          )}

          {error && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 animate-fade-up">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-ink-900/30 border-t-ink-900 rounded-full animate-spin" />
            ) : mode === 'login' ? '登录' : '创建账号'}
          </button>

          {mode === 'login' && (
            <p className="text-xs text-center text-ink-500">
              还没有账号？
              <button
                type="button"
                onClick={() => setMode('register')}
                className="ml-1 text-neon-300 hover:text-neon-200"
              >
                立即注册
              </button>
            </p>
          )}
        </form>

        {/* 演示账号提示 */}
        {mode === 'login' && (
          <div className="mt-4 px-4 py-3 rounded-xl border border-ink-800 bg-ink-900/40 text-xs text-ink-400">
            <div className="font-medium text-ink-200 mb-1">💡 演示账号</div>
            <div>邮箱 <code className="text-neon-300">demo@adas.wiki</code> · 密码 <code className="text-neon-300">demo1234</code></div>
            <div>邮箱 <code className="text-neon-300">admin@adas.wiki</code> · 密码 <code className="text-neon-300">admin123</code></div>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== 输入框 =====
interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}

const Field = forwardRef<HTMLInputElement, FieldProps>(
  ({ label, value, onChange, type = 'text', placeholder, autoComplete }, ref) => (
    <label className="block">
      <span className="text-xs text-ink-300 tracking-widest">{label}</span>
      <input
        ref={ref}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl
                   bg-ink-950/80 border border-ink-700
                   text-ink-50 placeholder:text-ink-500
                   focus:border-neon-400 focus:shadow-glow-sm
                   outline-none transition-all text-sm"
      />
    </label>
  ),
);
Field.displayName = 'Field';
