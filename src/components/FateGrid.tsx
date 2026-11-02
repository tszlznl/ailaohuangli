import type { DayAlmanac } from '../domain/types';

export function FateGrid({ almanac }: { almanac: DayAlmanac }) {
  const cells = [
    { label: '值神', name: almanac.deity.name, counsel: almanac.deity.counsel },
    {
      label: '五行',
      name: `${almanac.element.name}·${almanac.element.suffix}`,
      counsel: `五行属${almanac.element.name}，${almanac.element.suffix}`,
    },
    { label: '冲', name: almanac.clash.name, counsel: almanac.clash.counsel },
    { label: '煞', name: almanac.taboo.name, counsel: almanac.taboo.counsel },
  ];

  return (
    <section className="fate-grid" aria-label="四柱">
      {cells.map((cell) => (
        <article className="fate-cell" key={cell.label}>
          <div className="fate-label">{cell.label}</div>
          <div className="fate-name">{cell.name}</div>
          <div className="fate-counsel">{cell.counsel}</div>
        </article>
      ))}
    </section>
  );
}
