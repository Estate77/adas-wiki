import { Link } from 'react-router-dom';
import { APP_EN_NAME, APP_NAME, NAV_ITEMS } from '@/constants';

export default function Footer() {
  return (
    <footer className="border-t border-ink-800/80 bg-ink-950">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-12 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <span className="block w-7 h-7 rounded-lg bg-gradient-to-br from-neon-400 to-indigo-500" />
            <span className="text-base font-semibold">{APP_NAME}</span>
            <span className="text-xs text-neon-400">{APP_EN_NAME}</span>
          </div>
          <p className="mt-4 text-sm text-ink-400 leading-relaxed-pro max-w-md">
            面向零基础用户的智能驾驶知识服务平台。我们用通俗语言解构最硬核的技术，
            帮助你建立从感知、规控到产品商业化的完整认知。
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-ink-100">产品</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-400">
            {NAV_ITEMS.slice(0, 4).map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="hover:text-neon-300 transition-colors">{n.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-ink-100">更多</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-400">
            {NAV_ITEMS.slice(4).map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="hover:text-neon-300 transition-colors">{n.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-ink-800/80">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-ink-400">
          <span>© 2026 {APP_NAME} · ADAS-Wiki. All rights reserved.</span>
          <span className="font-mono">Built with React 19 + TailwindCSS</span>
        </div>
      </div>
    </footer>
  );
}
