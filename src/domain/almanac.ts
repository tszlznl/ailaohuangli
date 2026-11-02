import { dayNumber, isTodayKey, isWeekendKey, monthOf, weekdayEn, weekdayZh, yearOf } from './date';
import { fnv1a, pickOne, shuffle } from './hash';
import { clamp } from './math';
import { getElement, readLunar } from './lunar';
import { MODELS } from './models';
import {
  APHORISMS,
  CLASHES,
  DEITIES,
  FORTUNE_LABELS,
  JI_BY_TRAIT,
  JI_DAILY,
  TABOOS,
  YI_BY_TRAIT,
  YI_DAILY,
} from './pools';
import { scoreModel, TRAIT_ORDER } from './scoring';
import { RULESET_VERSION } from './version';
import type { DayAlmanac, Model, TraitKey } from './types';

function unique(items: string[]): string[] {
  return [...new Set(items)];
}

function rankedTraits(model: Model, direction: 'top' | 'low', count: number): TraitKey[] {
  return [...TRAIT_ORDER]
    .sort((a, b) =>
      direction === 'top' ? model.traits[b] - model.traits[a] : model.traits[a] - model.traits[b],
    )
    .slice(0, count);
}

function buildWords(seed: string, modelTerms: readonly string[], daily: readonly string[]): string[] {
  const count = 3 + (fnv1a(`${seed}|count`) % 4);
  return unique([...modelTerms, ...shuffle(`${seed}|pool`, daily)]).slice(0, count);
}

function buildYi(dateKey: string, best: Model): { headline: string; items: string[] } {
  const modelTerms = rankedTraits(best, 'top', 2).map((trait) => YI_BY_TRAIT[trait][0]);
  return {
    headline: `主推 ${best.name}`,
    items: buildWords(`${RULESET_VERSION}|${dateKey}|yi`, modelTerms, YI_DAILY),
  };
}

function buildJi(dateKey: string, worst: Model): { headline: string; items: string[] } {
  const modelTerms = rankedTraits(worst, 'low', 2).map((trait) => JI_BY_TRAIT[trait][0]);
  return {
    headline: `避用 ${worst.name}`,
    items: buildWords(`${RULESET_VERSION}|${dateKey}|ji`, modelTerms, JI_DAILY),
  };
}

function buildFortunes(dateKey: string, tianShenType: string): DayAlmanac['fortunes'] {
  const auspicious = tianShenType === '黄道';
  const bias = (key: string): number => {
    if (key === 'prompt' || key === 'debug') return auspicious ? 1 : -1;
    if (key === 'hallucination') return auspicious ? -1 : 1;
    return 0;
  };
  return FORTUNE_LABELS.map((definition) => {
    const raw = 1 + (fnv1a(`${RULESET_VERSION}|${dateKey}|fortunes|${definition.key}`) % 5);
    const stars = clamp(raw + bias(definition.key), 1, 5);
    return {
      key: definition.key,
      label: definition.label,
      stars,
      note: definition.notes[stars - 1],
    };
  });
}

export function generateAlmanac(dateKey: string): DayAlmanac {
  const lunar = readLunar(dateKey);
  const scored = MODELS.map((model) => ({ model, ...scoreModel(model, dateKey) }));
  const best = [...scored].sort((a, b) => b.overall - a.overall)[0];
  const worst = [...scored].sort((a, b) => a.overall - b.overall)[0];
  const element = getElement(lunar.naYin);
  const weekend = isWeekendKey(dateKey);

  return {
    dateKey,
    isToday: isTodayKey(dateKey),
    isWeekend: weekend,
    theme: weekend ? 'red' : 'green',
    weekdayZh: weekdayZh(dateKey),
    weekdayEn: weekdayEn(dateKey),
    gregorian: { year: yearOf(dateKey), month: monthOf(dateKey), day: dayNumber(dateKey) },
    lunar: {
      yearGanZhi: lunar.yearGanZhi,
      month: lunar.monthInChinese,
      day: lunar.dayInChinese,
      text: `农历${lunar.yearGanZhi}年　${lunar.monthInChinese}月${lunar.dayInChinese}`,
    },
    hijri: lunar.hijri,
    deity: pickOne(`${RULESET_VERSION}|${dateKey}|deity`, DEITIES),
    element,
    clash: pickOne(`${RULESET_VERSION}|${dateKey}|clash`, CLASHES),
    taboo: pickOne(`${RULESET_VERSION}|${dateKey}|taboo`, TABOOS),
    yi: buildYi(dateKey, best.model),
    ji: buildJi(dateKey, worst.model),
    fortunes: buildFortunes(dateKey, lunar.tianShenType),
    aphorism: pickOne(`${RULESET_VERSION}|${dateKey}|aphorism`, APHORISMS),
  };
}
