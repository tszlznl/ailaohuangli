import type { DayAlmanac } from '../domain/types';

export function FortuneGrid({ fortunes }: { fortunes: DayAlmanac['fortunes'] }) {
  return (
    <section className="fortune-grid" aria-label="运势">
      {fortunes.map((fortune) => (
        <article className="fortune-cell" key={fortune.key}>
          <div className="fortune-label">{fortune.label}</div>
          <div className="fortune-stars" aria-label={`${fortune.stars} 星`}>
            {'★'.repeat(fortune.stars)}
            {'☆'.repeat(5 - fortune.stars)}
          </div>
          <div className="fortune-note">{fortune.note}</div>
        </article>
      ))}
    </section>
  );
}
