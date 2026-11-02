import type { HourCell } from '../domain/types';

export function HourGrid({ hours }: { hours: HourCell[] }) {
  return (
    <section className="hour-grid" aria-label="十二时辰">
      {hours.map((hour) => (
        <article
          className="hour-cell"
          data-testid="hour-cell"
          data-verdict={hour.verdict}
          key={hour.branch}
          aria-label={`${hour.branch}时 ${hour.time}，${hour.verdict}，${hour.advice}`}
        >
          <strong className="hour-branch">{hour.branch}</strong>
          <span className="hour-verdict">{hour.verdict}</span>
          <span className="hour-time">{hour.time}</span>
          <p className="hour-advice">{hour.advice}</p>
        </article>
      ))}
    </section>
  );
}
