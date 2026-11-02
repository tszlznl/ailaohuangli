import { Outlet, useSearchParams } from 'react-router-dom';
import { isWeekendKey, normalizeDateKey } from '../domain/date';
import { Disclaimer } from './Disclaimer';
import { TopNav } from './TopNav';

export function AppShell() {
  const [params] = useSearchParams();
  const dateKey = normalizeDateKey(params.get('date'));
  const theme = isWeekendKey(dateKey) ? 'theme-red' : 'theme-green';

  return (
    <div className={`app ${theme}`}>
      <div className="shell">
        <TopNav />
        <Outlet />
      </div>
      <Disclaimer />
    </div>
  );
}
