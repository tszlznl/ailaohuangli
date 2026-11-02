export type Verdict = '宜' | '平' | '忌';
export type HourVerdict = '吉' | '平' | '凶';
export type ModelStatus = 'ga' | 'preview';
export type Theme = 'green' | 'red';
export type TraitKey =
  | 'reasoning'
  | 'coding'
  | 'writing'
  | 'research'
  | 'speed'
  | 'value'
  | 'multimodal';
export type CategoryKey = 'code' | 'writing' | 'translation' | 'research';

export interface Traits {
  reasoning: number;
  coding: number;
  writing: number;
  research: number;
  speed: number;
  value: number;
  multimodal: number;
}

export interface Model {
  id: string;
  name: string;
  vendor: string;
  vendorKey: string;
  positioning: string;
  status: ModelStatus;
  traits: Traits;
}

export interface CategoryScore {
  key: CategoryKey;
  label: string;
  score: number;
  verdict: Verdict;
}

export interface ModelScore {
  categories: CategoryScore[];
  overall: number;
}

export interface LunarSnapshot {
  yearGanZhi: string;
  monthInChinese: string;
  dayInChinese: string;
  naYin: string;
  tianShenType: string;
  chongDesc: string;
  sha: string;
  hijri: { latin: string } | null;
}

export interface DayAlmanac {
  dateKey: string;
  isToday: boolean;
  isWeekend: boolean;
  theme: Theme;
  weekdayZh: string;
  weekdayEn: string;
  gregorian: { year: number; month: number; day: number };
  lunar: { yearGanZhi: string; month: string; day: string; text: string };
  hijri: { latin: string } | null;
  deity: { name: string; counsel: string };
  element: { name: string; suffix: string };
  clash: { name: string; counsel: string };
  taboo: { name: string; counsel: string };
  yi: { headline: string; items: string[] };
  ji: { headline: string; items: string[] };
  fortunes: Array<{ key: string; label: string; stars: number; note: string }>;
  aphorism: string;
}

export interface ModelReading {
  dateKey: string;
  model: Model;
  overall: { score: number; verdict: Verdict };
  categories: CategoryScore[];
  topTrait: TraitKey;
  lowTrait: TraitKey;
  judgment: string;
  verdictText: string;
  alternatives: Array<{ model: Model; score: number; reason: string }>;
}

export interface HourCell {
  branch: string;
  alias: string;
  time: string;
  score: number;
  verdict: HourVerdict;
  advice: string;
}

export interface PickDayReading {
  dateKey: string;
  activity: { id: string; label: string };
  best: HourCell[];
  worst: HourCell[];
  hours: HourCell[];
  summary: string;
  yi: string[];
  ji: string[];
}
