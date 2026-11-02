import { clamp } from './math';
import { jitter } from './hash';
import { RULESET_VERSION } from './version';
import type {
  CategoryKey,
  CategoryScore,
  Model,
  ModelScore,
  TraitKey,
  Verdict,
} from './types';

export interface CategoryDef {
  key: CategoryKey;
  label: string;
  weights: Record<TraitKey, number>;
}

export const CATEGORY_DEFS: readonly CategoryDef[] = [
  {
    key: 'code',
    label: '写代码',
    weights: { reasoning: 0.3, coding: 0.5, writing: 0, research: 0, speed: 0.1, value: 0.1, multimodal: 0 },
  },
  {
    key: 'writing',
    label: '写文章',
    weights: { reasoning: 0.2, coding: 0, writing: 0.5, research: 0.2, speed: 0.1, value: 0, multimodal: 0 },
  },
  {
    key: 'translation',
    label: '翻译',
    weights: { reasoning: 0.2, coding: 0, writing: 0.4, research: 0.3, speed: 0.1, value: 0, multimodal: 0 },
  },
  {
    key: 'research',
    label: '查资料',
    weights: { reasoning: 0.25, coding: 0, writing: 0, research: 0.45, speed: 0.15, value: 0.15, multimodal: 0 },
  },
];

const OVERALL_WEIGHTS: Record<CategoryKey, number> = {
  code: 0.3,
  writing: 0.25,
  translation: 0.2,
  research: 0.25,
};

export const TRAIT_ORDER: readonly TraitKey[] = [
  'reasoning',
  'coding',
  'writing',
  'research',
  'speed',
  'value',
  'multimodal',
];

export const TRAIT_LABELS: Record<TraitKey, string> = {
  reasoning: '推理',
  coding: '编程',
  writing: '写作',
  research: '资料',
  speed: '速度',
  value: '性价比',
  multimodal: '多模态',
};

export function verdictForScore(score: number): Verdict {
  if (score >= 75) return '宜';
  if (score >= 60) return '平';
  return '忌';
}

export function scoreCategory(model: Model, categoryKey: CategoryKey, dateKey: string): number {
  const def = CATEGORY_DEFS.find((item) => item.key === categoryKey);
  if (!def) throw new Error(`Unknown category: ${categoryKey}`);
  const base =
    TRAIT_ORDER.reduce((sum, trait) => sum + model.traits[trait] * def.weights[trait], 0) * 20;
  const luck = jitter(
    `${RULESET_VERSION}|${dateKey}|model:${model.id}|category:${categoryKey}`,
    -6,
    6,
  );
  return clamp(Math.round(base + luck), 0, 100);
}

export function scoreModel(model: Model, dateKey: string): ModelScore {
  const categories: CategoryScore[] = CATEGORY_DEFS.map((def) => {
    const score = scoreCategory(model, def.key, dateKey);
    return { key: def.key, label: def.label, score, verdict: verdictForScore(score) };
  });
  const scores = Object.fromEntries(categories.map((category) => [category.key, category.score])) as Record<
    CategoryKey,
    number
  >;
  const overall = Math.round(
    scores.code * OVERALL_WEIGHTS.code +
      scores.writing * OVERALL_WEIGHTS.writing +
      scores.translation * OVERALL_WEIGHTS.translation +
      scores.research * OVERALL_WEIGHTS.research,
  );
  return { categories, overall };
}

export function getBestCategory(categories: CategoryScore[]): CategoryScore {
  return [...categories].sort((a, b) => b.score - a.score)[0];
}

export function getTopTrait(model: Model): TraitKey {
  return TRAIT_ORDER.reduce((best, trait) =>
    model.traits[trait] > model.traits[best] ? trait : best,
  );
}

export function getLowTrait(model: Model): TraitKey {
  return TRAIT_ORDER.reduce((worst, trait) =>
    model.traits[trait] < model.traits[worst] ? trait : worst,
  );
}
