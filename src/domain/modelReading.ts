import { isTodayKey } from './date';
import { fnv1a } from './hash';
import { DEFAULT_MODEL_ID, MODELS, getModelById } from './models';
import {
  getBestCategory,
  getLowTrait,
  getTopTrait,
  scoreModel,
  TRAIT_LABELS,
  verdictForScore,
} from './scoring';
import { RULESET_VERSION } from './version';
import type { CategoryScore, ModelReading, Verdict } from './types';

function pickJudgment(
  dateKey: string,
  modelId: string,
  verdict: Verdict,
  topTrait: string,
  lowTrait: string,
  bestLabel: string,
  modelName: string,
  alternativeName: string,
): string {
  const dayWord = isTodayKey(dateKey) ? '今日' : '当日';
  const templates: Record<Verdict, string[]> = {
    宜: [
      `${topTrait}正利，宜攻难活。先列计划，再动手。`,
      `锋刃正利，宜做${bestLabel}。留好回滚，再加速。`,
      `${dayWord}手顺，宜把最难的一段交给 ${modelName}。`,
    ],
    平: [
      '不疾不徐，宜做熟活。新领域先小试。',
      '中平之日，宜整理、宜补测试、宜复盘。',
      `${lowTrait}稍弱，重要判断请自己复核。`,
    ],
    忌: [
      `${lowTrait}未稳，凡事须自行核对。`,
      `${dayWord}不宜硬攻，宜拆小、宜求证、宜早收。`,
      `锋芒不显，改用${alternativeName}或明日再试。`,
    ],
  };
  const index = fnv1a(`${RULESET_VERSION}|${dateKey}|model:${modelId}|judgment`) % 3;
  return templates[verdict][index];
}

export function generateModelReading(dateKey: string, modelId: string): ModelReading {
  const model = getModelById(modelId) ?? getModelById(DEFAULT_MODEL_ID);
  if (!model) throw new Error('Default model is missing');

  const scored = scoreModel(model, dateKey);
  const verdict = verdictForScore(scored.overall);
  const topTrait = getTopTrait(model);
  const lowTrait = getLowTrait(model);
  const bestCategory = getBestCategory(scored.categories);
  const yiCategories = [...scored.categories]
    .filter((category) => category.verdict === '宜')
    .sort((a, b) => b.score - a.score);
  const topYiCategory = yiCategories[0] ?? bestCategory;

  const alternatives = MODELS.filter((candidate) => candidate.id !== model.id)
    .map((candidate) => ({ model: candidate, ...scoreModel(candidate, dateKey) }))
    .sort((a, b) => b.overall - a.overall)
    .slice(0, 3)
    .map((candidate) => {
      const category = getBestCategory(candidate.categories);
      return {
        model: candidate.model,
        score: candidate.overall,
        reason: `${category.verdict} · ${category.label}`,
      };
    });

  const dayWord = isTodayKey(dateKey) ? '今日' : '当日';
  const verdictText =
    verdict === '宜'
      ? `${dayWord}可用，宜做${topYiCategory.label}`
      : verdict === '平'
        ? '可用，但宜守不宜攻'
        : `${dayWord}不宜，改日再试`;

  return {
    dateKey,
    model,
    overall: { score: scored.overall, verdict },
    categories: scored.categories as CategoryScore[],
    topTrait,
    lowTrait,
    judgment: pickJudgment(
      dateKey,
      model.id,
      verdict,
      TRAIT_LABELS[topTrait],
      TRAIT_LABELS[lowTrait],
      bestCategory.label,
      model.name,
      alternatives[0].model.name,
    ),
    verdictText,
    alternatives,
  };
}
