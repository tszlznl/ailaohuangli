import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlmanacHeader } from '../components/AlmanacHeader';
import { DateBar } from '../components/DateBar';
import { FateGrid } from '../components/FateGrid';
import { FortuneGrid } from '../components/FortuneGrid';
import { YiJiPanels } from '../components/YiJiPanels';
import { generateAlmanac } from '../domain/almanac';
import { normalizeDateKey } from '../domain/date';

export function HomePage() {
  const [params, setParams] = useSearchParams();
  const dateKey = normalizeDateKey(params.get('date'));
  const almanac = useMemo(() => generateAlmanac(dateKey), [dateKey]);
  const dayWord = almanac.isToday ? '今日' : '当日';

  const setDate = (next: string) => {
    const nextParams = new URLSearchParams(params);
    nextParams.set('date', normalizeDateKey(next));
    setParams(nextParams, { replace: true });
  };

  return (
    <article className="home">
      <DateBar dateKey={dateKey} onChange={setDate} />
      <AlmanacHeader almanac={almanac} />
      <FateGrid almanac={almanac} />
      <YiJiPanels almanac={almanac} />
      <FortuneGrid fortunes={almanac.fortunes} />
      <div className="aphorism">
        {dayWord}吉语：{almanac.aphorism}
      </div>
      <div className="cta-row">
        <Link className="primary-button" to={`/query?date=${dateKey}`}>
          查询模型{dayWord}宜忌
        </Link>
      </div>
    </article>
  );
}
