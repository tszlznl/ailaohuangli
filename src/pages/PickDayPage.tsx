import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { DateBar } from '../components/DateBar';
import { HourGrid } from '../components/HourGrid';
import { normalizeDateKey } from '../domain/date';
import { ACTIVITIES } from '../domain/pools';
import { generatePickDay } from '../domain/pickDay';
import type { HourCell } from '../domain/types';

function hourLabel(hour: HourCell): string {
  return hour.branch === '子' ? '夜半' : `${hour.branch}时`;
}

export function PickDayPage() {
  const [params, setParams] = useSearchParams();
  const dateKey = normalizeDateKey(params.get('date'));
  const rawActivity = params.get('activity');
  const activityId = ACTIVITIES.some((activity) => activity.id === rawActivity) ? rawActivity! : 'release';
  const reading = useMemo(() => generatePickDay(dateKey, activityId), [dateKey, activityId]);

  const setDate = (next: string) => {
    const nextParams = new URLSearchParams(params);
    nextParams.set('date', normalizeDateKey(next));
    setParams(nextParams, { replace: true });
  };

  const setActivity = (next: string) => {
    const nextParams = new URLSearchParams(params);
    nextParams.set('activity', next);
    setParams(nextParams, { replace: true });
  };

  return (
    <section className="pick-page">
      <DateBar dateKey={dateKey} onChange={setDate} />
      <header className="page-head">
        <Link to={`/?date=${dateKey}`}>返回首页</Link>
        <h1>择日</h1>
        <span>{dateKey}</span>
      </header>
      <div className="activity-section">
        <h2>想做的事</h2>
        <div className="activity-chips">
          {ACTIVITIES.map((activity) => (
            <button
              type="button"
              key={activity.id}
              className={activity.id === activityId ? 'chip active' : 'chip'}
              aria-pressed={activity.id === activityId}
              onClick={() => setActivity(activity.id)}
            >
              {activity.label}
            </button>
          ))}
        </div>
      </div>
      <div className="pick-result" aria-live="polite">
        <div className="pick-overview">
          <article>
            <h3>最宜</h3>
            {reading.best.map((hour) => (
              <div key={hour.branch}>
                {hourLabel(hour)}　{hour.time}
              </div>
            ))}
          </article>
          <article>
            <h3>大忌</h3>
            {reading.worst.map((hour) => (
              <div key={hour.branch}>
                {hourLabel(hour)}　{hour.time}
              </div>
            ))}
          </article>
        </div>
        <HourGrid hours={reading.hours} />
        <p className="pick-summary">{reading.summary}</p>
        <div className="pick-checklist">
          <p>宜：{reading.yi.join('、')}。</p>
          <p>忌：{reading.ji.join('、')}。</p>
        </div>
      </div>
    </section>
  );
}
