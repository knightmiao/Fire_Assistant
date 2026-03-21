import { Link, Outlet, useLocation } from 'react-router-dom';
import { IconDashboard, IconProfile, IconAssets } from './PixelIcons';

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
    label: '财务数据',
    Icon: IconAssets,
    isActive: (p) => p.startsWith('/finance'),
  },
  {
    to: '/settings',
    label: 'FIRE 计划设置',
    Icon: IconProfile,
    isActive: (p) => p === '/settings',
  },
];

export function Layout() {
  const location = useLocation();
  return (
    <div className="layout">
      <header className="header">
        <h1 className="logo">FIRE 规划助手</h1>
        <nav className="nav" aria-label="主导航">
          {nav.map(({ to, label, Icon, isActive }) => {
            const active = isActive(location.pathname);
            return (
              <Link
                key={to}
                to={to}
                className={active ? 'nav-link active' : 'nav-link'}
                aria-current={active ? 'page' : undefined}
              >
                <Icon />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
