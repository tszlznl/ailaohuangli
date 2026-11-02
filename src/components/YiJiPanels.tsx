import type { DayAlmanac } from '../domain/types';

export function YiJiPanels({ almanac }: { almanac: DayAlmanac }) {
  return (
    <section className="yi-ji-grid" aria-label="宜忌">
      <article className="yi-ji-panel yi">
        <div className="yi-ji-char">宜</div>
        <div>
          <div className="yi-ji-model">{almanac.yi.headline}</div>
          <div className="yi-ji-items">
            {almanac.yi.items.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </article>
      <article className="yi-ji-panel ji">
        <div className="yi-ji-char">忌</div>
        <div>
          <div className="yi-ji-model">{almanac.ji.headline}</div>
          <div className="yi-ji-items">
            {almanac.ji.items.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </article>
    </section>
  );
}
