import { isTodayKey } from './date';
import { jitter } from './hash';
import { clamp } from './math';
import { BRANCHES, BRANCH_BASE, getActivity } from './pools';
import { RULESET_VERSION } from './version';
import type { HourCell, HourVerdict, PickDayReading } from './types';

function hourLabel(hour: HourCell): string {
  return hour.branch === '子' ? '夜半' : `${hour.branch}时`;
}

export function generatePickDay(dateKey: string, activityId: string): PickDayReading {
  const activity = getActivity(activityId);
  const dayWord = isTodayKey(dateKey) ? '今日' : '当日';

  const cells = BRANCHES.map((branch, index) => {
    const score = clamp(
      Math.round(
        activity.weights[index] * 20 +
          jitter(
            `${RULESET_VERSION}|${dateKey}|pick:${activity.id}|branch:${branch.branch}`,
            -8,
            8,
          ),
      ),
      0,
      100,
    );
    return { ...branch, score };
  });

  const ranked = [...cells].sort((a, b) => b.score - a.score);
  const verdictByBranch = new Map<string, HourVerdict>();
  ranked.forEach((cell, index) => {
    const verdict: HourVerdict =
      index < 3 ? '吉' : index >= ranked.length - 5 ? '凶' : '平';
    verdictByBranch.set(cell.branch, verdict);
  });

  const hours: HourCell[] = cells.map((cell) => {
    const verdict = verdictByBranch.get(cell.branch)!;
    return {
      ...cell,
      verdict,
      advice: `${BRANCH_BASE[cell.branch]}；${activity.actions[verdict]}`,
    };
  });

  const best = [...hours]
    .filter((hour) => hour.verdict === '吉')
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);
  const worst = [...hours]
    .filter((hour) => hour.verdict === '凶')
    .sort((a, b) => a.score - b.score)
    .slice(0, 2);

  return {
    dateKey,
    activity: { id: activity.id, label: activity.label },
    best,
    worst,
    hours,
    summary: `${dayWord}最宜${best.map(hourLabel).join('、')}；大忌${worst.map(hourLabel).join('、')}。`,
    yi: [...activity.yi],
    ji: [...activity.ji],
  };
}
