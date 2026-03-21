import { NavLink, Outlet } from 'react-router-dom';

export function FinanceLayout() {
  return (
    <div className="finance-layout">
      <nav className="sub-nav" aria-label="财务数据子页">
        <NavLink
          to="/finance/assets"
          className={({ isActive }) => (isActive ? 'sub-nav-link active' : 'sub-nav-link')}
        >
          资产与负债
        </NavLink>
        <NavLink
          to="/finance/income"
          className={({ isActive }) => (isActive ? 'sub-nav-link active' : 'sub-nav-link')}
        >
          收入与支出
        </NavLink>
      </nav>
      <Outlet />
    </div>
  );
}
