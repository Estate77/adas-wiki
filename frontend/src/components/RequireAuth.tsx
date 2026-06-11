import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface Props {
  children: ReactNode;
}

/** 路由守卫：未登录则跳转 /login，登录后回跳原页面 */
export default function RequireAuth({ children }: Props) {
  const user     = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const location = useLocation();

  if (!hydrated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-ink-500 text-sm">
        <span className="inline-block w-4 h-4 border-2 border-ink-600 border-t-neon-400 rounded-full animate-spin mr-2" />
        正在验证身份…
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return <>{children}</>;
}
