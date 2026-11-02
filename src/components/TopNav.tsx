import { Link, NavLink, useSearchParams } from 'react-router-dom';
import { normalizeDateKey } from '../domain/date';

export function TopNav() {
  const [params] = useSearchParams();
  const rawDate = params.get('date');
  // 跨页只保留 date：查询页的 model、择日页的 activity 不跟着跳转。
  const search = rawDate ? `?date=${normalizeDateKey(rawDate)}` : '';

  return (
    <nav className="top-nav" aria-label="主导航">
      <Link className="brand-mark" to={`/${search}`}>
        AI 老黄历
      </Link>
      <div className="nav-links">
        <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to={`/${search}`} end>
          今日
        </NavLink>
        <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to={`/query${search}`}>
          查询
        </NavLink>
        <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to={`/pick${search}`}>
          择日
        </NavLink>
      </div>
    </nav>
  );
}
