import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import MainLayout  from '@/layouts/MainLayout';
import HomePage    from '@/pages/Home';
import QnAPage     from '@/pages/QnA';
import GraphPage   from '@/pages/Graph';
import InterviewPage from '@/pages/Interview';
import SimulatorPage from '@/pages/Simulator';
import SafetyPage    from '@/pages/Safety';
import CompetitorPage from '@/pages/Competitor';
import RequireAuth from '@/components/RequireAuth';
import LoginPage    from '@/pages/Auth/Login';
import RegisterPage from '@/pages/Auth/Register';
import ProfilePage  from '@/pages/Profile';
import { useAuthStore } from '@/store/authStore';

// 顶层：应用启动时执行一次 bootstrap（恢复登录态）
function Bootstrap() {
  const bootstrap = useAuthStore((s) => s.bootstrap);
  useEffect(() => { bootstrap(); }, [bootstrap]);
  return null;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <>
        <Bootstrap />
        <MainLayout />
      </>
    ),
    children: [
      { index: true,        element: <HomePage /> },
      { path: 'qna',        element: <QnAPage /> },
      { path: 'graph',      element: <GraphPage /> },
      { path: 'interview',  element: <InterviewPage /> },
      { path: 'simulator',  element: <SimulatorPage /> },
      { path: 'safety',     element: <SafetyPage /> },
      { path: 'competitor', element: <CompetitorPage /> },

      // 鉴权
      { path: 'login',     element: <LoginPage /> },
      { path: 'register',  element: <RegisterPage /> },
      {
        path: 'profile',
        element: (
          <RequireAuth>
            <ProfilePage />
          </RequireAuth>
        ),
      },

      // 兜底：未匹配路由 → 首页
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

export { router };
