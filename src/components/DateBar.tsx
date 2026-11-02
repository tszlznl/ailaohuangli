import { MAX_DATE, MIN_DATE, addDays, isTodayKey, todayKey, weekdayZh } from '../domain/date';

interface DateBarProps {
  dateKey: string;
  onChange: (next: string) => void;
}

export function DateBar({ dateKey, onChange }: DateBarProps) {
  const atMin = dateKey === MIN_DATE;
  const atMax = dateKey === MAX_DATE;

  return (
    <>
      <div className="date-bar">
        <button type="button" aria-label="前一天" onClick={() => onChange(addDays(dateKey, -1))} disabled={atMin}>
          ‹
        </button>
        <span className="date-label">
          {dateKey.replaceAll('-', '.')} {weekdayZh(dateKey).replace('星期', '周')}
        </span>
        <button type="button" aria-label="后一天" onClick={() => onChange(addDays(dateKey, 1))} disabled={atMax}>
          ›
        </button>
        <label className="date-input">
          <span className="sr-only">选择日期</span>
          <input
            type="date"
            min={MIN_DATE}
            max={MAX_DATE}
            value={dateKey}
            onChange={(event) => {
              // 日期分段未填完或清空时，原生 date input 会给出空串；此时不应跳转。
              const next = event.target.value;
              if (!next) return;
              onChange(next);
            }}
          />
        </label>
        <button
          type="button"
          className="text-button"
          onClick={() => onChange(todayKey())}
          disabled={isTodayKey(dateKey)}
        >
          回今日
        </button>
      </div>
      {(atMin || atMax) && (
        <p className="date-hint" role="status">
          日期范围为 1901–2099
        </p>
      )}
    </>
  );
}
