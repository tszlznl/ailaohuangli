import { Solar } from 'lunar-javascript';
import { parseDateKey } from './date';
import type { LunarSnapshot } from './types';

const HIJRI_MONTHS = [
  'MUHARRAM',
  'SAFAR',
  'RABI AL-AWWAL',
  'RABI AL-THANI',
  'JAMADILAWAL',
  'JAMADILAKHIR',
  'RAJAB',
  'SHABAN',
  'RAMADAN',
  'SHAWWAL',
  'DHU AL-QADAH',
  'DHU AL-HIJJAH',
] as const;

const ELEMENTS = ['金', '木', '水', '火', '土'] as const;

const ELEMENT_SUFFIX: Record<string, string> = {
  金: '算力旺',
  木: '上下文生',
  水: '灵感流',
  火: '并发旺',
  土: '缓存稳',
};

export function getElement(naYin: string): { name: string; suffix: string } {
  const name = [...naYin].find((char) => (ELEMENTS as readonly string[]).includes(char)) ?? '土';
  return { name, suffix: ELEMENT_SUFFIX[name] };
}

function readHijri(date: Date): LunarSnapshot['hijri'] {
  try {
    const numericMonth = Number(
      new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { month: 'numeric' }).format(date),
    );
    const yearParts = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      year: 'numeric',
    }).formatToParts(date);
    const year = yearParts.find((part) => part.type === 'year')?.value ?? '';
    const monthName = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { month: 'long' }).format(date);
    const latinMonth =
      Number.isFinite(numericMonth) && numericMonth >= 1 && numericMonth <= 12
        ? HIJRI_MONTHS[numericMonth - 1]
        : monthName.toUpperCase();
    return { latin: `${latinMonth} ${year}` };
  } catch {
    return null;
  }
}

export function readLunar(dateKey: string): LunarSnapshot {
  const date = parseDateKey(dateKey);
  if (!date) throw new Error(`Invalid date key: ${dateKey}`);
  const lunar = Solar.fromYmd(date.getFullYear(), date.getMonth() + 1, date.getDate()).getLunar();
  return {
    yearGanZhi: lunar.getYearInGanZhi(),
    monthInChinese: lunar.getMonthInChinese(),
    dayInChinese: lunar.getDayInChinese(),
    naYin: lunar.getDayNaYin(),
    tianShenType: lunar.getDayTianShenType(),
    chongDesc: lunar.getDayChongDesc(),
    sha: lunar.getDaySha(),
    hijri: readHijri(date),
  };
}
