import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { CloudSaveBar } from './CloudSaveBar';
import { IconDashboard, IconProfile, IconAssets, IconFeedback } from './PixelIcons';

type NavItem = {
  to: string;
  label: string;
  Icon: typeof IconDashboard;
  isActive: (pathname: string) => boolean;
};

const nav: NavItem[] = [
  {
    to: '/dashboard',
    label: 'FIRE 看板',
    Icon: IconDashboard,
    isActive: (p) => p === '/dashboard',
  },
  {
    to: '/finance/assets',
    label: '财务数据设置',
    Icon: IconAssets,
    isActive: (p) => p.startsWith('/finance'),
  },
  {
    to: '/settings',
    label: 'FIRE 计划设置',
    Icon: IconProfile,
    isActive: (p) => p === '/settings',
  },
  {
    to: '/feedback',
    label: '反馈与建议',
    Icon: IconFeedback,
    isActive: (p) => p === '/feedback',
  },
];

export function Layout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="app-shell">
      <button
        type="button"
        className={mobileOpen ? 'sidebar-backdrop sidebar-backdrop--visible' : 'sidebar-backdrop'}
        aria-label="关闭菜单"
        onClick={closeMobile}
      />
      <aside
        id="app-sidebar"
        className={mobileOpen ? 'sidebar sidebar--open' : 'sidebar'}
        aria-label="侧栏导航"
      >
        <div className="sidebar-inner">
          <Link to="/dashboard" className="sidebar-brand" onClick={closeMobile}>
            <span className="sidebar-brand-mark" aria-hidden>
              ◆
            </span>
            <span className="sidebar-brand-text">FIRE 规划助手</span>
          </Link>
          <nav id="app-sidebar-nav" className="sidebar-nav" aria-label="主导航">
            {nav.map(({ to, label, Icon, isActive }) => {
              const active = isActive(location.pathname);
              return (
                <Link
                  key={to}
                  to={to}
                  state={to === '/feedback' ? { from: location.pathname } : undefined}
                  className={active ? 'sidebar-link sidebar-link--active' : 'sidebar-link'}
                  aria-current={active ? 'page' : undefined}
                  onClick={closeMobile}
                >
                  <Icon className="sidebar-link-icon" aria-hidden />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="sidebar-account">
            <CloudSaveBar />
          </div>
        </div>
      </aside>

      <div className="shell-inset">
        <header className="shell-header">
          <button
            type="button"
            className="shell-menu-btn"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-controls="app-sidebar"
            aria-label={mobileOpen ? '关闭菜单' : '打开菜单'}
          >
            <span className="shell-menu-icon" aria-hidden>
              <span />
              <span />
              <span />
            </span>
          </button>
          <span className="shell-header-title">FIRE 规划助手</span>
        </header>
        <main className="main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
