import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { APP_EN_NAME, APP_NAME, NAV_ITEMS } from '@/constants';
import { useAuthStore } from '@/store/authStore';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen]         = useState(false);   // 移动端
  const [menuOpen, setMenuOpen] = useState(false);   // 用户菜单
  const menuRef = useRef<HTMLDivElement>(null);

  const user    = useAuthStore((s) => s.user);
  const logout  = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // 点击外部关闭用户菜单
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [menuOpen]);

  const onLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <header
      className={clsx(
        'fixed top-0 inset-x-0 z-50 transition-all duration-500',
        scrolled
          ? 'bg-ink-950/70 backdrop-blur-xl border-b border-ink-800/80'
          : 'bg-transparent',
      )}
    >
      <nav className="max-w-7xl mx-auto px-5 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-neon-400 to-indigo-500 flex items-center justify-center shadow-glow-sm">
            <span className="block w-3 h-3 rounded-sm bg-ink-950" />
          </span>
          <span className="text-lg font-semibold tracking-tight">
            {APP_NAME}
            <span className="ml-1.5 text-xs font-normal text-neon-400">{APP_EN_NAME}</span>
          </span>
        </Link>

        {/* 桌面导航 */}
        <ul className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  clsx(
                    'px-3.5 py-2 rounded-full text-sm transition-colors',
                    isActive
                      ? 'text-neon-300 bg-neon-400/10'
                      : 'text-ink-200 hover:text-white hover:bg-ink-800/60',
                  )
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* 桌面右侧 */}
        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full
                           border border-ink-700 hover:border-ink-600
                           bg-ink-900/60 hover:bg-ink-900 transition-colors"
              >
                <span className="w-7 h-7 rounded-full bg-gradient-to-br from-neon-400 to-indigo-500
                                 flex items-center justify-center text-xs font-semibold text-ink-950">
                  {user.username?.slice(0, 1).toUpperCase()}
                </span>
                <span className="text-sm text-ink-100">{user.username}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                     className={clsx('text-ink-400 transition-transform', menuOpen && 'rotate-180')}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 origin-top-right
                                glass-panel p-1.5 shadow-2xl animate-fade-up">
                  <div className="px-3 py-2.5 border-b border-ink-800/60">
                    <div className="text-sm font-medium text-white">{user.username}</div>
                    <div className="text-[11px] text-ink-500 mt-0.5 truncate">{user.email}</div>
                  </div>
                  <MenuItem to="/profile" onClick={() => setMenuOpen(false)} icon="M3 12l2-2 4 4 8-8 4 4" label="个人中心" />
                  <MenuItem to="/qna"      onClick={() => setMenuOpen(false)} icon="M21 11.5a8.5 8.5 0 01-12.6 7.4L3 21l1.5-5.4A8.5 8.5 0 1121 11.5z" label="我的提问" />
                  <div className="my-1 border-t border-ink-800/60" />
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm
                               text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    退出登录
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-ghost text-sm py-2 px-4">登录</Link>
              <Link to="/qna"   className="btn-primary text-sm py-2 px-4">开始提问</Link>
            </>
          )}
        </div>

        {/* 移动端菜单按钮 */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="lg:hidden p-2 -mr-2 text-ink-100"
          aria-label="菜单"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M6 18L18 6" />
            ) : (
              <>
                <path d="M3 6h18" />
                <path d="M3 12h18" />
                <path d="M3 18h18" />
              </>
            )}
          </svg>
        </button>
      </nav>

      {/* 移动端展开面板 */}
      {open && (
        <div className="lg:hidden border-t border-ink-800 bg-ink-950/95 backdrop-blur-xl">
          <ul className="px-5 py-4 space-y-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    clsx(
                      'block px-3 py-2.5 rounded-lg text-sm',
                      isActive
                        ? 'text-neon-300 bg-neon-400/10'
                        : 'text-ink-100 hover:bg-ink-800',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
            <li className="pt-2 flex gap-2">
              {user ? (
                <>
                  <Link to="/profile" onClick={() => setOpen(false)} className="btn-ghost text-sm flex-1">个人中心</Link>
                  <button onClick={() => { onLogout(); setOpen(false); }} className="btn-primary text-sm flex-1">退出</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className="btn-ghost text-sm flex-1">登录</Link>
                  <Link to="/qna"   onClick={() => setOpen(false)} className="btn-primary text-sm flex-1">开始提问</Link>
                </>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}

interface MenuItemProps { to: string; label: string; icon: string; onClick?: () => void; }
function MenuItem({ to, label, icon, onClick }: MenuItemProps) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-2.5 px-3 py-2 text-sm text-ink-100
                 hover:bg-ink-800/70 rounded-lg transition-colors"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
           className="text-ink-400">
        <path d={icon} />
      </svg>
      {label}
    </Link>
  );
}
