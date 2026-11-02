import { monthEn, monthZh } from '../domain/date';
import type { DayAlmanac } from '../domain/types';

export function AlmanacHeader({ almanac }: { almanac: DayAlmanac }) {
  const dayWord = almanac.isToday ? '今日' : '当日';

  return (
    <header className="almanac-header">
      <h1 className="brand">AI 老黄历</h1>
      <div className="year-row">
        <span className="year">{almanac.gregorian.year}</span>
        <span className="month-en">{monthEn(almanac.dateKey)}</span>
        <span className="month-zh">{monthZh(almanac.dateKey)}</span>
      </div>
      <div className="hero">
        <div className="vertical left">
          {dayWord}值神　{almanac.deity.name}
        </div>
        <div className="vertical right">
          冲　{almanac.clash.name}　煞　{almanac.taboo.name}
        </div>
        <div className="big-day">{almanac.gregorian.day}</div>
        {almanac.hijri && (
          <div className="hijri">
            <div className="hijri-latin">{almanac.hijri.latin}</div>
          </div>
        )}
      </div>
      <div className="lunar-line">
        <span>{almanac.lunar.text}</span>
        <span>
          公历 {almanac.gregorian.month} 月 {almanac.gregorian.day} 日
        </span>
        <span>{almanac.weekdayZh}</span>
        <span className="weekday-en">{almanac.weekdayEn}</span>
      </div>
    </header>
  );
}
