import { Link, Outlet, useLocation } from 'react-router-dom';
import { DataFileManager } from './DataFileManager';
import { IconDashboard, IconProfile, IconAssets, IconIncome } from './PixelIcons';

const nav = [
  { to: '/dashboard', label: 'FIRE 看板', Icon: IconDashboard },
  { to: '/profile', label: '个人与参数', Icon: IconProfile },
  { to: '/assets', label: '资产与负债', Icon: IconAssets },
  { to: '/income', label: '收入与支出', Icon: IconIncome },
];

export function Layout() {
  const location = useLocation();
  return (
    <div className="layout">
      <header className="header">
        <h1 className="logo">FIRE 规划助手</h1>
        <nav className="nav">
          {nav.map(({ to, label, Icon }) => (
            <Link
              key={to}
              to={to}
              className={location.pathname === to ? 'nav-link active' : 'nav-link'}
              aria-current={location.pathname === to ? 'page' : undefined}
            >
              <Icon />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </header>
      <main className="main">
        <DataFileManager />
        <Outlet />
      </main>
    </div>
  );
}
