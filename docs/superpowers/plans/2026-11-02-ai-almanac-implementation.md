# AI 老黄历交互版 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在仓库根目录交付一个 Vite + React + TypeScript 的 AI 老黄历三页交互版，包含首页、模型查询、择日，规则确定、可静态部署。

**Architecture:** 领域层（`src/domain`）是纯函数：哈希、日期、农历、模型表、映射表、评分、首页/查询/择日生成器。UI 层（`src/components`、`src/pages`）只读 URL 参数并渲染领域结果。路由用 `HashRouter`，日期/模型/事项全部放在 URL 查询参数里，页面不维护全局状态。

**Tech Stack:** React 19.3.1、React Router 7.18.5、TypeScript 5.9.3、Vite 8.3.5、Vitest 5.0.5、Testing Library、`lunar-javascript` 1.7.7。

**Spec:** [2026-11-02-ai-almanac-design.md](../specs/2026-11-02-ai-almanac-design.md)

## Global Constraints

- Node.js 必须 ≥ 22.12（Vite 8 的要求）；本机当前 Node 24，满足。
- 包管理器统一用 `npm`，所有命令在仓库根目录执行。
- 依赖版本锁定为：React 19.3.1、React DOM 19.3.1、React Router DOM 7.18.5、`lunar-javascript` 1.7.7、TypeScript 5.9.3、Vite 8.3.5、`@vitejs/plugin-react` 6.2.0、Vitest 5.0.5、jsdom 30.1.3、Testing Library React 16.3.3、jest-dom 7.0.1、user-event 14.6.8、`@types/react` 19.3.0、`@types/react-dom` 19.3.0、`@types/node` 26.6.6。
- `verbatimModuleSyntax` 已开启：只用于类型的导入必须写 `import type`。
- `src/domain` 内禁止 `Math.random()`、`Date.now()`、网络请求、`localStorage`；所有随机性来自 `hash.ts` 的种子函数。
- 日期键统一为本地时区的 `YYYY-MM-DD`，范围 `1901-01-01` 至 `2099-12-31`；越界钳制。
- `RULESET_VERSION = '2026.11.1'`；改动模型表、映射表、权重、阈值、文案池时必须升版本并更新测试。
- 模型 34 款，事项 5 个；时辰分配固定为 3 吉、4 平、5 凶。
- 模型判定用 `宜/平/忌`；时辰判定用 `吉/平/凶`，两套类型不可混用。
- 页面语言为简体中文；页脚声明必须包含「仅供娱乐，非评测结论」与商标归属、首页忌为相对提醒。
- 运行时外部请求只允许 Google Fonts；断网时系统字体回退，内容仍可读。
- 仓库当前不是 git 仓库。按全局 AGENTS 规则，只有用户明确授权时才执行 `git init` 和 `git commit`；未授权时跳过所有 Commit 步骤，保留工作区变更。

---

### Task 1: 脚手架、工具链与测试环境

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/vite-env.d.ts`
- Create: `src/styles/tokens.css`
- Create: `src/styles/app.css`
- Create: `src/test/setup.ts`
- Create: `src/test/app.test.tsx`
- Create: `src/App.tsx`（Step 4 才创建，先让测试失败）

**Interfaces:**
- Consumes: 无。
- Produces: 可运行的 Vite 项目、`npm run test`/`typecheck`/`build` 脚本、`App` 组件。

- [ ] **Step 1: 创建项目配置与入口文件**

`package.json`：

```json
{
  "name": "ai-laohuangli",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "typecheck": "tsc -b --pretty false",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "lunar-javascript": "1.7.7",
    "react": "19.3.1",
    "react-dom": "19.3.1",
    "react-router-dom": "7.18.5"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "7.0.1",
    "@testing-library/react": "16.3.3",
    "@testing-library/user-event": "14.6.8",
    "@types/node": "26.6.6",
    "@types/react": "19.3.0",
    "@types/react-dom": "19.3.0",
    "@vitejs/plugin-react": "6.2.0",
    "jsdom": "30.1.3",
    "typescript": "5.9.3",
    "vite": "8.3.5",
    "vitest": "5.0.5"
  }
}
```

`tsconfig.json`：

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

`tsconfig.app.json`：

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src"]
}
```

`tsconfig.node.json`：

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2023",
    "lib": ["ES2023"],
    "module": "ESNext",
    "types": ["node"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["vite.config.ts"]
}
```

`vite.config.ts`：

```ts
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: false,
  },
});
```

`index.html`：

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="AI 老黄历：每天给出使用 AI 的宜与忌，仅供娱乐。" />
    <title>AI 老黄历</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Libre+Caslon+Text:wght@400;700&family=Ma+Shan+Zheng&family=Noto+Naskh+Arabic:wght@400;700&family=Noto+Sans+SC:wght@400;500;700;900&family=Noto+Serif+SC:wght@400;700;900&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`src/main.tsx`：

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/tokens.css';
import './styles/app.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

`src/vite-env.d.ts`：

```ts
/// <reference types="vite/client" />
```

`src/styles/tokens.css`：

```css
:root {
  --paper: #faf9f5;
  --ink: #1a1a1a;
  --green: #009640;
  --green-deep: #00742f;
  --red: #c0281c;
  --white: #ffffff;
  --accent: var(--green-deep);
  --accent-strong: var(--green);
  --serif: 'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', SimSun, serif;
  --sans: 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --display: 'Abril Fatface', 'Playfair Display', Didot, 'Bodoni 72', serif;
  --latin: 'Libre Caslon Text', 'Century Schoolbook', 'Times New Roman', serif;
  --brush: 'Ma Shan Zheng', KaiTi, STKaiti, serif;
  --arabic: 'Noto Naskh Arabic', serif;
}

.theme-green {
  --accent: var(--green-deep);
  --accent-strong: var(--green);
}

.theme-red {
  --accent: var(--red);
  --accent-strong: var(--red);
}
```

`src/styles/app.css`（Task 1 先放基础样式，Task 9 再补全）：

```css
* {
  box-sizing: border-box;
}

html,
body,
#root {
  margin: 0;
  min-height: 100%;
}

body {
  background: var(--paper);
  color: var(--ink);
  font-family: var(--sans);
}

button,
input,
select {
  font: inherit;
}

a {
  color: inherit;
}
```

`src/test/setup.ts`：

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 2: 写第一个失败测试**

`src/test/app.test.tsx`：

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from '../App';

describe('App', () => {
  it('renders the brand', () => {
    render(<App />);
    expect(screen.getAllByText('AI 老黄历').length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 3: 安装依赖并确认测试失败**

Run:

```bash
npm install
npm run test -- src/test/app.test.tsx
```

Expected: FAIL，报错找不到 `../App` 或 `App` 未导出。

- [ ] **Step 4: 创建最小 App**

`src/App.tsx`：

```tsx
export function App() {
  return <h1>AI 老黄历</h1>;
}
```

- [ ] **Step 5: 确认测试通过**

Run:

```bash
npm run test -- src/test/app.test.tsx
npm run typecheck
```

Expected: 测试 PASS，类型检查 PASS。

- [ ] **Step 6: 确认构建通过**

Run:

```bash
npm run build
```

Expected: 生成 `dist/`，命令退出码 0。

- [ ] **Step 7: Commit（仅在用户授权 git 时执行）**

```bash
git add package.json package-lock.json tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts index.html src/
git commit -m "chore: scaffold vite react typescript app"
```

---

### Task 2: 哈希、日期与数学工具

**Files:**
- Create: `src/domain/version.ts`
- Create: `src/domain/math.ts`
- Create: `src/domain/hash.ts`
- Create: `src/domain/date.ts`
- Test: `src/test/hash.test.ts`
- Test: `src/test/date.test.ts`

**Interfaces:**
- Consumes: 无。
- Produces:
  - `RULESET_VERSION: string`
  - `clamp(value: number, min: number, max: number): number`
  - `fnv1a(input: string): number`
  - `mulberry32(seed: number): () => number`
  - `random(seed: string | number): number`
  - `jitter(seed: string, min: number, max: number): number`
  - `pickOne<T>(seed: string, items: readonly T[]): T`
  - `shuffle<T>(seed: string, items: readonly T[]): T[]`
  - `MIN_DATE`, `MAX_DATE`, `todayKey()`, `toDateKey(date: Date)`, `parseDateKey(key: string): Date | null`, `normalizeDateKey(raw: string | null): string`, `addDays(key: string, delta: number): string`, `isTodayKey(key: string): boolean`, `isWeekendKey(key: string): boolean`, `weekdayZh(key: string): string`, `weekdayEn(key: string): string`, `monthZh(key: string): string`, `monthEn(key: string): string`, `yearOf(key: string): number`, `monthOf(key: string): number`, `dayNumber(key: string): number`

- [ ] **Step 1: 写失败测试**

`src/test/hash.test.ts`：

```ts
import { describe, expect, it } from 'vitest';
import { fnv1a, jitter, mulberry32, pickOne, random, shuffle } from '../domain/hash';

describe('hash', () => {
  it('is deterministic for the same input', () => {
    expect(fnv1a('2026-11-02|claude-sonnet-5-5')).toBe(fnv1a('2026-11-02|claude-sonnet-5-5'));
  });

  it('changes for different input', () => {
    expect(fnv1a('2026-11-02')).not.toBe(fnv1a('2026-11-03'));
  });

  it('produces numbers in range', () => {
    for (let i = 0; i < 100; i += 1) {
      expect(random(`seed-${i}`)).toBeGreaterThanOrEqual(0);
      expect(random(`seed-${i}`)).toBeLessThan(1);
    }
  });

  it('keeps jitter and shuffle stable', () => {
    expect(jitter('x', -6, 6)).toBe(jitter('x', -6, 6));
    expect(jitter('x', -6, 6)).toBeGreaterThanOrEqual(-6);
    expect(jitter('x', -6, 6)).toBeLessThanOrEqual(6);
    expect(shuffle('x', [1, 2, 3, 4])).toEqual(shuffle('x', [1, 2, 3, 4]));
  });

  it('picks an item from the array', () => {
    expect(['a', 'b', 'c']).toContain(pickOne('seed', ['a', 'b', 'c']));
  });

  it('exposes a deterministic sequence', () => {
    const first = mulberry32(123);
    const second = mulberry32(123);
    expect([first(), first(), first()]).toEqual([second(), second(), second()]);
  });
});
```

`src/test/date.test.ts`：

```ts
import { describe, expect, it, vi } from 'vitest';
import {
  MAX_DATE,
  MIN_DATE,
  addDays,
  isTodayKey,
  isWeekendKey,
  monthEn,
  monthZh,
  normalizeDateKey,
  parseDateKey,
  toDateKey,
  todayKey,
  weekdayEn,
  weekdayZh,
} from '../domain/date';

describe('date', () => {
  it('formats a local date key', () => {
    expect(toDateKey(new Date(2026, 10, 2))).toBe('2026-11-02');
  });

  it('parses valid keys and rejects impossible dates', () => {
    expect(parseDateKey('2026-11-02')).not.toBeNull();
    expect(parseDateKey('2026-02-31')).toBeNull();
    expect(parseDateKey('2026-1-2')).toBeNull();
  });

  it('normalizes missing and out-of-range values', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 2, 12, 0, 0));
    expect(normalizeDateKey(null)).toBe('2026-11-02');
    expect(normalizeDateKey('bad')).toBe('2026-11-02');
    expect(normalizeDateKey('1800-01-01')).toBe(MIN_DATE);
    expect(normalizeDateKey('2200-01-01')).toBe(MAX_DATE);
    vi.useRealTimers();
  });

  it('adds days across month and year boundaries', () => {
    expect(addDays('2026-11-30', 1)).toBe('2026-12-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
  });

  it('knows today and weekends', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 2, 12, 0, 0));
    expect(todayKey()).toBe('2026-11-02');
    expect(isTodayKey('2026-11-02')).toBe(true);
    expect(isTodayKey('2026-11-03')).toBe(false);
    vi.useRealTimers();
    expect(isWeekendKey('2026-11-02')).toBe(false);
    expect(isWeekendKey('2026-11-08')).toBe(true);
  });

  it('formats weekdays and months', () => {
    expect(weekdayZh('2026-11-02')).toBe('星期一');
    expect(weekdayEn('2026-11-02')).toBe('MONDAY');
    expect(monthZh('2026-11-02')).toBe('十一月');
    expect(monthEn('2026-11-02')).toBe('NOVEMBER');
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run:

```bash
npm run test -- src/test/hash.test.ts src/test/date.test.ts
```

Expected: FAIL，模块不存在。

- [ ] **Step 3: 实现工具函数**

`src/domain/version.ts`：

```ts
export const RULESET_VERSION = '2026.11.1';
```

`src/domain/math.ts`：

```ts
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
```

`src/domain/hash.ts`：

```ts
export function fnv1a(input: string): number {
  const bytes = new TextEncoder().encode(input);
  let hash = 0x811c9dc5;
  for (const byte of bytes) {
    hash ^= byte;
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function random(seed: string | number): number {
  return mulberry32(typeof seed === 'number' ? seed : fnv1a(seed))();
}

export function jitter(seed: string, min: number, max: number): number {
  return min + Math.floor(random(seed) * (max - min + 1));
}

export function pickOne<T>(seed: string, items: readonly T[]): T {
  return items[Math.floor(random(seed) * items.length)];
}

export function shuffle<T>(seed: string, items: readonly T[]): T[] {
  const result = [...items];
  const next = mulberry32(fnv1a(seed));
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(next() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
```

`src/domain/date.ts`：

```ts
export const MIN_DATE = '1901-01-01';
export const MAX_DATE = '2099-12-31';

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseDateKey(key: string): Date | null {
  const match = DATE_RE.exec(key);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function normalizeDateKey(raw: string | null): string {
  const parsed = raw ? parseDateKey(raw) : null;
  if (!parsed) return todayKey();
  const key = toDateKey(parsed);
  if (key < MIN_DATE) return MIN_DATE;
  if (key > MAX_DATE) return MAX_DATE;
  return key;
}

export function addDays(key: string, delta: number): string {
  const date = parseDateKey(key) ?? new Date();
  date.setDate(date.getDate() + delta);
  return normalizeDateKey(toDateKey(date));
}

export function isTodayKey(key: string): boolean {
  return key === todayKey();
}

export function isWeekendKey(key: string): boolean {
  const date = parseDateKey(key);
  if (!date) return false;
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function weekdayZh(key: string): string {
  const date = parseDateKey(key) ?? new Date();
  return new Intl.DateTimeFormat('zh-CN', { weekday: 'long' }).format(date);
}

export function weekdayEn(key: string): string {
  const date = parseDateKey(key) ?? new Date();
  return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date).toUpperCase();
}

export function monthZh(key: string): string {
  const date = parseDateKey(key) ?? new Date();
  return new Intl.DateTimeFormat('zh-CN', { month: 'long' }).format(date);
}

export function monthEn(key: string): string {
  const date = parseDateKey(key) ?? new Date();
  return new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date).toUpperCase();
}

export function yearOf(key: string): number {
  return (parseDateKey(key) ?? new Date()).getFullYear();
}

export function monthOf(key: string): number {
  return (parseDateKey(key) ?? new Date()).getMonth() + 1;
}

export function dayNumber(key: string): number {
  return (parseDateKey(key) ?? new Date()).getDate();
}
```

- [ ] **Step 4: 运行测试确认通过**

Run:

```bash
npm run test -- src/test/hash.test.ts src/test/date.test.ts
npm run typecheck
```

Expected: PASS。

- [ ] **Step 5: Commit（仅在用户授权 git 时执行）**

```bash
git add src/domain/version.ts src/domain/math.ts src/domain/hash.ts src/domain/date.ts src/test/hash.test.ts src/test/date.test.ts
git commit -m "feat: add deterministic hash and date utilities"
```

---

### Task 3: 领域类型与 34 款模型清单

**Files:**
- Create: `src/domain/types.ts`
- Create: `src/domain/models.ts`
- Test: `src/test/models.test.ts`

**Interfaces:**
- Consumes: 无。
- Produces:
  - `Verdict`, `HourVerdict`, `ModelStatus`, `Theme`, `TraitKey`, `CategoryKey`
  - `Traits`, `Model`, `CategoryScore`, `ModelScore`, `LunarSnapshot`, `DayAlmanac`, `ModelReading`, `HourCell`, `PickDayReading`
  - `MODELS: readonly Model[]`
  - `VENDOR_GROUPS: readonly { key: string; label: string }[]`
  - `DEFAULT_MODEL_ID: string`
  - `getModelById(id: string): Model | undefined`
  - `getModelGroups(): Array<{ key: string; label: string; models: Model[] }>`

- [ ] **Step 1: 写失败测试**

`src/test/models.test.ts`：

```ts
import { describe, expect, it } from 'vitest';
import { DEFAULT_MODEL_ID, MODELS, getModelById, getModelGroups } from '../domain/models';

describe('models', () => {
  it('contains 34 unique models', () => {
    expect(MODELS).toHaveLength(34);
    expect(new Set(MODELS.map((model) => model.id)).size).toBe(34);
    expect(new Set(MODELS.map((model) => model.name)).size).toBe(34);
  });

  it('has valid traits and statuses', () => {
    for (const model of MODELS) {
      for (const value of Object.values(model.traits)) {
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThanOrEqual(5);
      }
      expect(['ga', 'preview']).toContain(model.status);
    }
  });

  it('resolves the default model', () => {
    expect(getModelById(DEFAULT_MODEL_ID)?.name).toBe('Claude Sonnet 5.5');
    expect(getModelById('missing')).toBeUndefined();
  });

  it('groups models by vendor without empty groups', () => {
    const groups = getModelGroups();
    expect(groups).toHaveLength(18);
    for (const group of groups) {
      expect(group.models.length).toBeGreaterThan(0);
    }
    expect(groups.reduce((sum, group) => sum + group.models.length, 0)).toBe(34);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run:

```bash
npm run test -- src/test/models.test.ts
```

Expected: FAIL，模块不存在。

- [ ] **Step 3: 实现类型**

`src/domain/types.ts`：

```ts
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
  yiTerms: string[];
  jiTerms: string[];
  chongDesc: string;
  sha: string;
  hijri: { latin: string; arabic: string } | null;
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
  hijri: { latin: string; arabic: string } | null;
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
```

- [ ] **Step 4: 实现模型清单**

`src/domain/models.ts`：

```ts
import type { Model } from './types';

export const MODELS = [
  { id: 'claude-fable-5-1', name: 'Claude Fable 5.1', vendor: 'Anthropic', vendorKey: 'anthropic', positioning: '最强推理、长程代理', status: 'ga', traits: { reasoning: 5, coding: 5, writing: 4, research: 5, speed: 2, value: 2, multimodal: 4 } },
  { id: 'claude-opus-5-5', name: 'Claude Opus 5.5', vendor: 'Anthropic', vendorKey: 'anthropic', positioning: '长程编码、知识工作', status: 'ga', traits: { reasoning: 5, coding: 5, writing: 5, research: 4, speed: 3, value: 2, multimodal: 4 } },
  { id: 'claude-sonnet-5-5', name: 'Claude Sonnet 5.5', vendor: 'Anthropic', vendorKey: 'anthropic', positioning: '速度与智能均衡', status: 'ga', traits: { reasoning: 4, coding: 4, writing: 5, research: 4, speed: 4, value: 3, multimodal: 4 } },
  { id: 'claude-haiku-5-5', name: 'Claude Haiku 5.5', vendor: 'Anthropic', vendorKey: 'anthropic', positioning: '高并发、低延迟', status: 'ga', traits: { reasoning: 3, coding: 3, writing: 3, research: 3, speed: 5, value: 5, multimodal: 3 } },
  { id: 'gpt-6-astra', name: 'GPT-6 Astra', vendor: 'OpenAI', vendorKey: 'openai', positioning: '旗舰档（高价）', status: 'ga', traits: { reasoning: 5, coding: 5, writing: 5, research: 5, speed: 2, value: 1, multimodal: 5 } },
  { id: 'gpt-6.1-terra', name: 'GPT-6.1 Terra', vendor: 'OpenAI', vendorKey: 'openai', positioning: '旗舰、视觉推理', status: 'ga', traits: { reasoning: 5, coding: 5, writing: 4, research: 4, speed: 3, value: 2, multimodal: 5 } },
  { id: 'gpt-5.6-sol', name: 'GPT-5.6 Sol', vendor: 'OpenAI', vendorKey: 'openai', positioning: '通用、写作分析', status: 'ga', traits: { reasoning: 4, coding: 4, writing: 5, research: 5, speed: 4, value: 3, multimodal: 4 } },
  { id: 'gpt-6-luna', name: 'GPT-6 Luna', vendor: 'OpenAI', vendorKey: 'openai', positioning: 'GPT-6 低价档', status: 'ga', traits: { reasoning: 3, coding: 3, writing: 3, research: 3, speed: 4, value: 5, multimodal: 3 } },
  { id: 'gemini-4-argon', name: 'Gemini 4 Argon', vendor: 'Google', vendorKey: 'google', positioning: '复杂编码、数学、科学', status: 'ga', traits: { reasoning: 5, coding: 5, writing: 4, research: 5, speed: 3, value: 2, multimodal: 5 } },
  { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', vendor: 'Google', vendorKey: 'google', positioning: '高智能 Flash、长程工程', status: 'ga', traits: { reasoning: 4, coding: 4, writing: 3, research: 4, speed: 5, value: 4, multimodal: 4 } },
  { id: 'grok-4.7', name: 'Grok 4.7', vendor: 'xAI', vendorKey: 'xai', positioning: '编码、知识工作、实时', status: 'ga', traits: { reasoning: 5, coding: 5, writing: 4, research: 4, speed: 4, value: 3, multimodal: 3 } },
  { id: 'muse-spark-1.3', name: 'Muse Spark 1.3', vendor: 'Meta', vendorKey: 'meta', positioning: '长程编码、Agent', status: 'ga', traits: { reasoning: 4, coding: 5, writing: 3, research: 3, speed: 4, value: 4, multimodal: 3 } },
  { id: 'mistral-large-4', name: 'Mistral Large 4', vendor: 'Mistral', vendorKey: 'mistral', positioning: '欧洲旗舰、多模态', status: 'preview', traits: { reasoning: 4, coding: 4, writing: 4, research: 4, speed: 3, value: 3, multimodal: 5 } },
  { id: 'deepseek-v4-pro', name: 'DeepSeek V4 Pro', vendor: 'DeepSeek', vendorKey: 'deepseek', positioning: '高能力旗舰', status: 'ga', traits: { reasoning: 5, coding: 4, writing: 3, research: 3, speed: 3, value: 4, multimodal: 1 } },
  { id: 'deepseek-v4.1-flash', name: 'DeepSeek V4.1 Flash', vendor: 'DeepSeek', vendorKey: 'deepseek', positioning: '快速低价、视觉', status: 'ga', traits: { reasoning: 4, coding: 4, writing: 3, research: 3, speed: 5, value: 5, multimodal: 3 } },
  { id: 'qwen3.8-max', name: 'Qwen 3.8 Max', vendor: '阿里云', vendorKey: 'alibaba', positioning: '复杂推理与编程', status: 'ga', traits: { reasoning: 4, coding: 5, writing: 4, research: 4, speed: 4, value: 4, multimodal: 3 } },
  { id: 'qwen3.7-plus', name: 'Qwen 3.7 Plus', vendor: '阿里云', vendorKey: 'alibaba', positioning: '性能/速度/成本均衡', status: 'ga', traits: { reasoning: 4, coding: 4, writing: 4, research: 4, speed: 4, value: 4, multimodal: 3 } },
  { id: 'qwen3.8-flash', name: 'Qwen 3.8 Flash', vendor: '阿里云', vendorKey: 'alibaba', positioning: '快速低成本', status: 'ga', traits: { reasoning: 3, coding: 4, writing: 3, research: 3, speed: 5, value: 5, multimodal: 3 } },
  { id: 'kimi-k3.1-pro', name: 'Kimi K3.1 Pro', vendor: '月之暗面', vendorKey: 'moonshot', positioning: '旗舰、长文、视觉', status: 'ga', traits: { reasoning: 4, coding: 4, writing: 5, research: 5, speed: 3, value: 3, multimodal: 4 } },
  { id: 'kimi-k3', name: 'Kimi K3', vendor: '月之暗面', vendorKey: 'moonshot', positioning: '开源旗舰、长程', status: 'ga', traits: { reasoning: 4, coding: 4, writing: 5, research: 5, speed: 3, value: 3, multimodal: 4 } },
  { id: 'kimi-k2.7-code', name: 'Kimi K2.7 Code', vendor: '月之暗面', vendorKey: 'moonshot', positioning: '编码专用', status: 'ga', traits: { reasoning: 3, coding: 5, writing: 2, research: 2, speed: 4, value: 4, multimodal: 2 } },
  { id: 'glm-5.3', name: 'GLM-5.3', vendor: '智谱', vendorKey: 'zhipu', positioning: '编程、Agent、开源', status: 'ga', traits: { reasoning: 4, coding: 5, writing: 3, research: 3, speed: 4, value: 4, multimodal: 3 } },
  { id: 'glm-5.3-flash', name: 'GLM-5.3-Flash', vendor: '智谱', vendorKey: 'zhipu', positioning: '多模态、高效', status: 'ga', traits: { reasoning: 4, coding: 4, writing: 3, research: 3, speed: 5, value: 5, multimodal: 4 } },
  { id: 'minimax-m3', name: 'MiniMax M3', vendor: 'MiniMax', vendorKey: 'minimax', positioning: '前沿编码、1M、多模态', status: 'ga', traits: { reasoning: 4, coding: 5, writing: 3, research: 4, speed: 3, value: 4, multimodal: 4 } },
  { id: 'minimax-m3.1-flash', name: 'MiniMax M3.1 Flash', vendor: 'MiniMax', vendorKey: 'minimax', positioning: 'Agent/Coding 轻量', status: 'ga', traits: { reasoning: 4, coding: 5, writing: 3, research: 3, speed: 5, value: 5, multimodal: 4 } },
  { id: 'mimo-v2.6-pro', name: 'MiMo V2.6 Pro', vendor: '小米', vendorKey: 'xiaomi', positioning: '推理优先、开源', status: 'ga', traits: { reasoning: 4, coding: 4, writing: 3, research: 3, speed: 4, value: 4, multimodal: 2 } },
  { id: 'mimo-v2.6-flash', name: 'MiMo V2.6 Flash', vendor: '小米', vendorKey: 'xiaomi', positioning: '轻量低成本', status: 'ga', traits: { reasoning: 3, coding: 3, writing: 3, research: 3, speed: 5, value: 5, multimodal: 2 } },
  { id: 'doubao-seed-evolving', name: 'Doubao-Seed-Evolving', vendor: '字节跳动', vendorKey: 'bytedance', positioning: '旗舰、多模态、Agent', status: 'ga', traits: { reasoning: 4, coding: 5, writing: 4, research: 4, speed: 4, value: 4, multimodal: 4 } },
  { id: 'doubao-seed-2.1-pro', name: 'Doubao-Seed-2.1-Pro', vendor: '字节跳动', vendorKey: 'bytedance', positioning: 'Pro 档通用', status: 'ga', traits: { reasoning: 4, coding: 4, writing: 4, research: 4, speed: 4, value: 4, multimodal: 4 } },
  { id: 'ernie-5.1', name: 'ERNIE 5.1', vendor: '百度', vendorKey: 'baidu', positioning: '全模态、知识、深度搜索', status: 'ga', traits: { reasoning: 4, coding: 4, writing: 4, research: 4, speed: 3, value: 4, multimodal: 4 } },
  { id: 'hunyuan-hy4', name: 'Hunyuan Hy4', vendor: '腾讯', vendorKey: 'tencent', positioning: '770B/1M、生产力', status: 'preview', traits: { reasoning: 4, coding: 4, writing: 3, research: 3, speed: 3, value: 4, multimodal: 3 } },
  { id: 'spark-x2', name: 'Spark X2', vendor: '科大讯飞', vendorKey: 'iflytek', positioning: '自主可控、推理', status: 'ga', traits: { reasoning: 3, coding: 3, writing: 3, research: 3, speed: 4, value: 4, multimodal: 3 } },
  { id: 'step-5', name: 'Step 5', vendor: '阶跃星辰', vendorKey: 'stepfun', positioning: '旗舰基模、真实任务', status: 'preview', traits: { reasoning: 4, coding: 4, writing: 3, research: 4, speed: 4, value: 4, multimodal: 3 } },
  { id: 'sensenova-6.8-flash-lite', name: 'SenseNova 6.8 Flash Lite', vendor: '商汤', vendorKey: 'sensetime', positioning: '轻量多模态 Agent', status: 'ga', traits: { reasoning: 3, coding: 4, writing: 3, research: 3, speed: 5, value: 5, multimodal: 4 } },
] satisfies readonly Model[];

export const VENDOR_GROUPS = [
  { key: 'anthropic', label: 'Anthropic' },
  { key: 'openai', label: 'OpenAI' },
  { key: 'google', label: 'Google' },
  { key: 'xai', label: 'xAI' },
  { key: 'meta', label: 'Meta' },
  { key: 'mistral', label: 'Mistral' },
  { key: 'deepseek', label: 'DeepSeek' },
  { key: 'alibaba', label: '阿里云' },
  { key: 'moonshot', label: '月之暗面' },
  { key: 'zhipu', label: '智谱' },
  { key: 'minimax', label: 'MiniMax' },
  { key: 'xiaomi', label: '小米' },
  { key: 'bytedance', label: '字节跳动' },
  { key: 'baidu', label: '百度' },
  { key: 'tencent', label: '腾讯' },
  { key: 'iflytek', label: '科大讯飞' },
  { key: 'stepfun', label: '阶跃星辰' },
  { key: 'sensetime', label: '商汤' },
] as const;

export const DEFAULT_MODEL_ID = 'claude-sonnet-5-5';

export function getModelById(id: string): Model | undefined {
  return MODELS.find((model) => model.id === id);
}

export function getModelGroups(): Array<{ key: string; label: string; models: Model[] }> {
  return VENDOR_GROUPS.map((group) => ({
    ...group,
    models: MODELS.filter((model) => model.vendorKey === group.key),
  }));
}
```

- [ ] **Step 5: 运行测试确认通过**

Run:

```bash
npm run test -- src/test/models.test.ts
npm run typecheck
```

Expected: PASS。

- [ ] **Step 6: Commit（仅在用户授权 git 时执行）**

```bash
git add src/domain/types.ts src/domain/models.ts src/test/models.test.ts
git commit -m "feat: add domain types and 2026 model roster"
```

---

### Task 4: 传统词映射、词库与事项数据

**Files:**
- Create: `src/domain/mappings.ts`
- Create: `src/domain/pools.ts`
- Test: `src/test/pools.test.ts`

**Interfaces:**
- Consumes: `HourVerdict` from `types.ts`。
- Produces:
  - `TRADITIONAL_MAP: Record<string, { yi: string; ji: string }>`
  - `mapTraditionalYi(terms: readonly string[]): string[]`
  - `mapTraditionalJi(terms: readonly string[]): string[]`
  - `DEITIES`, `CLASHES`, `TABOOS`, `FORTUNE_LABELS`, `APHORISMS`, `UNIVERSAL_YI`, `UNIVERSAL_JI`
  - `BRANCHES`, `BRANCH_BASE`, `ACTIVITIES`, `ActivityDef`, `getActivity(id: string): ActivityDef`

- [ ] **Step 1: 写失败测试**

`src/test/pools.test.ts`：

```ts
import { describe, expect, it } from 'vitest';
import { TRADITIONAL_MAP, mapTraditionalJi, mapTraditionalYi } from '../domain/mappings';
import {
  ACTIVITIES,
  APHORISMS,
  BRANCHES,
  CLASHES,
  DEITIES,
  FORTUNE_LABELS,
  TABOOS,
  UNIVERSAL_JI,
  UNIVERSAL_YI,
  getActivity,
} from '../domain/pools';

describe('mappings', () => {
  it('contains 50 traditional mappings', () => {
    expect(Object.keys(TRADITIONAL_MAP)).toHaveLength(50);
  });

  it('maps 开市 to launch semantics', () => {
    expect(mapTraditionalYi(['开市'])).toContain('发布新版本');
    expect(mapTraditionalJi(['开市'])).toContain('仓促上线');
  });

  it('deduplicates and skips unknown terms', () => {
    expect(mapTraditionalYi(['开市', '开市', '未知词'])).toEqual(['发布新版本']);
  });
});

describe('pools', () => {
  it('has complete day copy pools', () => {
    expect(DEITIES).toHaveLength(8);
    expect(CLASHES).toHaveLength(6);
    expect(TABOOS).toHaveLength(6);
    expect(FORTUNE_LABELS).toHaveLength(4);
    expect(APHORISMS.length).toBeGreaterThanOrEqual(10);
    expect(UNIVERSAL_YI).toHaveLength(18);
    expect(UNIVERSAL_JI).toHaveLength(16);
  });

  it('has 12 branches in order', () => {
    expect(BRANCHES.map((branch) => branch.branch)).toEqual([
      '子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥',
    ]);
  });

  it('has 5 activities with 12 weights each', () => {
    expect(ACTIVITIES).toHaveLength(5);
    for (const activity of ACTIVITIES) {
      expect(activity.weights).toHaveLength(12);
      expect(activity.yi.length).toBeGreaterThan(0);
      expect(activity.ji.length).toBeGreaterThan(0);
    }
  });

  it('falls back to the release activity', () => {
    expect(getActivity('missing').id).toBe('release');
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run:

```bash
npm run test -- src/test/pools.test.ts
```

Expected: FAIL，模块不存在。

- [ ] **Step 3: 实现映射表**

`src/domain/mappings.ts`：

```ts
export const TRADITIONAL_MAP: Record<string, { yi: string; ji: string }> = {
  '祭祀': { yi: '先对齐目标', ji: '跳过需求确认' },
  '祈福': { yi: '列可验收的目标', ji: '空喊目标' },
  '开光': { yi: '补系统提示词', ji: '提示词含糊' },
  '出行': { yi: '换一个模型试试', ji: '频繁换模型' },
  '移徙': { yi: '迁移工具链', ji: '迁移到一半' },
  '入宅': { yi: '接入新工作流', ji: '并行两套流程' },
  '安床': { yi: '固定一条系统提示词', ji: '每天换设定' },
  '修造': { yi: '重构代码', ji: '大爆炸式重构' },
  '动土': { yi: '改底层架构', ji: '无回滚改架构' },
  '破屋': { yi: '删除废弃代码', ji: '在旧代码上叠补丁' },
  '坏垣': { yi: '拆掉坏抽象', ji: '继续扩大坏抽象' },
  '开市': { yi: '发布新版本', ji: '仓促上线' },
  '交易': { yi: '批量处理文档', ji: '无核对批量处理' },
  '纳财': { yi: '用 Token 做批处理', ji: '无预算烧 Token' },
  '嫁娶': { yi: '绑定新依赖', ji: '仓促引入依赖' },
  '订盟': { yi: '定接口契约', ji: '口头约定' },
  '立券': { yi: '写测试用例', ji: '无测试合并' },
  '纳采': { yi: '收集需求', ji: '需求不清就开工' },
  '会亲友': { yi: '组织评审会', ji: '跳过评审' },
  '求医': { yi: '解释报错', ji: '不看日志就问' },
  '治病': { yi: '修复 bug', ji: '带病上线' },
  '解除': { yi: '清理上下文', ji: '把旧上下文带进新任务' },
  '沐浴': { yi: '整理会话', ji: '在脏会话里继续' },
  '栽种': { yi: '培养新习惯', ji: '三天打鱼' },
  '牧养': { yi: '维护模型配置', ji: '配置漂移' },
  '盖屋': { yi: '搭脚手架', ji: '没骨架就堆功能' },
  '竖柱': { yi: '立项目骨架', ji: '目录结构混乱' },
  '上梁': { yi: '合并主干', ji: '长期不合并' },
  '起基': { yi: '初始化仓库', ji: '无版本管理' },
  '掘井': { yi: '挖历史日志', ji: '无日志猜原因' },
  '开池': { yi: '建数据管道', ji: '管道无监控' },
  '放水': { yi: '跑数据回填', ji: '回填无校验' },
  '经络': { yi: '梳理调用链', ji: '跨层乱调' },
  '酝酿': { yi: '做方案推演', ji: '拍脑袋选型' },
  '作灶': { yi: '配 CI', ji: '手动发布' },
  '造仓': { yi: '建知识库', ji: '资料散落' },
  '平治道涂': { yi: '清理技术债', ji: '债务滚雪球' },
  '修饰垣墙': { yi: '补文档', ji: '文档过期' },
  '破土': { yi: '启动调研', ji: '调研无结论' },
  '启钻': { yi: '深挖根因', ji: '只修表象' },
  '移柩': { yi: '迁移旧系统', ji: '新旧双写失控' },
  '入殓': { yi: '归档旧项目', ji: '归档后还改' },
  '除服': { yi: '下线旧服务', ji: '下线无通知' },
  '捕捉': { yi: '抓 bug', ji: '只复现不定位' },
  '结网': { yi: '盖监控', ji: '无监控上线' },
  '塞穴': { yi: '堵漏洞', ji: '漏洞只记录不修' },
  '断蚁': { yi: '清理依赖', ji: '依赖无锁版本' },
  '馀事勿取': { yi: '只做一件事', ji: '多线程开工' },
  '求嗣': { yi: '培养新人', ji: '拔苗助长' },
  '纳畜': { yi: '引入新工具', ji: '工具堆叠' },
};

export function mapTraditionalYi(terms: readonly string[]): string[] {
  const result: string[] = [];
  for (const term of terms) {
    const mapped = TRADITIONAL_MAP[term]?.yi;
    if (mapped && !result.includes(mapped)) result.push(mapped);
  }
  return result;
}

export function mapTraditionalJi(terms: readonly string[]): string[] {
  const result: string[] = [];
  for (const term of terms) {
    const mapped = TRADITIONAL_MAP[term]?.ji;
    if (mapped && !result.includes(mapped)) result.push(mapped);
  }
  return result;
}
```

- [ ] **Step 4: 实现词库与事项**

`src/domain/pools.ts`：

```ts
import type { HourVerdict } from './types';

export const DEITIES = [
  { name: '上下文窗口', counsel: '窗口有限，先给关键上下文' },
  { name: '系统提示词', counsel: '先定角色，再提问题' },
  { name: '思维链', counsel: '让它先推理，再下结论' },
  { name: '工具调用', counsel: '能用工具就别靠记忆' },
  { name: '检索增强', counsel: '先检索，再引用' },
  { name: '温度参数', counsel: '创意调高，事实调低' },
  { name: '多轮记忆', counsel: '长会话要复盘，别硬续' },
  { name: '知识截止', counsel: '新事实先核对，别问旧记忆' },
] as const;

export const CLASHES = [
  { name: '超长对话', counsel: '对话宜短，上下文宜清' },
  { name: '含糊指令', counsel: '一次说清目标与边界' },
  { name: '多线程任务', counsel: '同时开三个窗口就够了' },
  { name: '无上下文提问', counsel: '先给背景，再问问题' },
  { name: '一次性大改', counsel: '大改先拆成小步' },
  { name: '盲信输出', counsel: '输出要看，引用要核' },
] as const;

export const TABOOS = [
  { name: '一次问十件事', counsel: '一次只问一件事' },
  { name: '盲信引用', counsel: '链接点开再信' },
  { name: '让 AI 自评', counsel: '自己 review 才算数' },
  { name: '深夜改生产', counsel: '生产变更留到白天' },
  { name: '跳过评审', counsel: '再小的改动也过一眼' },
  { name: '无日志排障', counsel: '先看日志再猜原因' },
] as const;

export const FORTUNE_LABELS = [
  { key: 'prompt', label: '提示词运势', notes: ['先写清楚', '少即是多', '中规中矩', '言简者吉', '一字千金'] },
  { key: 'hallucination', label: '幻觉风险', notes: ['大体可信', '较为安全', '引用须核', '多处存疑', '务必求证'] },
  { key: 'token', label: 'Token 财运', notes: ['省着点用', '小试即可', '收支平衡', '宜做长任务', '宜批量'] },
  { key: 'debug', label: '调试运势', notes: ['先睡一觉', '先看日志', '按图索骥', '报错易解', '一针见血'] },
] as const;

export const APHORISMS = [
  '先给上下文，再提问题。',
  '小步试，及时停。',
  '让模型列计划，你来拍板。',
  '引用要核，diff 要看。',
  '一次只问一件事。',
  '先备份，再让 AI 动手。',
  '能复现，再谈修复。',
  '长文先摘要，再细读。',
  '把好提示词存下来。',
  '模型是副驾，不是司机。',
] as const;

export const UNIVERSAL_YI = [
  '代码审查',
  '长文改写',
  '先复述需求',
  '列计划再动手',
  '让 AI 写测试',
  '整理会议纪要',
  '翻译润色',
  '批量处理文档',
  '校对引用',
  '拆分大任务',
  '写正则',
  '解释报错',
  '起草邮件',
  '总结长文',
  '对照两版方案',
  '给足上下文',
  '分步提问',
  '留好版本记录',
] as const;

export const UNIVERSAL_JI = [
  '凌晨三点改生产',
  '整本手册塞进对话',
  '一次问十件事',
  '盲信引用链接',
  '让 AI 自评对错',
  '未备份即覆盖',
  '把密钥贴进对话',
  '通宵争论',
  '跳过评审直接合并',
  '无日志就问原因',
  '同时开七个窗口',
  '不看 diff 直接接受',
  '用模糊指令催大活',
  '重复追问同一问题',
  '把模型当搜索引擎',
  '让轻量模型啃长推理',
] as const;

export const BRANCHES = [
  { branch: '子', alias: '夜半', time: '23–1 时' },
  { branch: '丑', alias: '鸡鸣', time: '1–3 时' },
  { branch: '寅', alias: '平旦', time: '3–5 时' },
  { branch: '卯', alias: '日出', time: '5–7 时' },
  { branch: '辰', alias: '食时', time: '7–9 时' },
  { branch: '巳', alias: '隅中', time: '9–11 时' },
  { branch: '午', alias: '日中', time: '11–13 时' },
  { branch: '未', alias: '日昳', time: '13–15 时' },
  { branch: '申', alias: '哺时', time: '15–17 时' },
  { branch: '酉', alias: '日入', time: '17–19 时' },
  { branch: '戌', alias: '黄昏', time: '19–21 时' },
  { branch: '亥', alias: '人定', time: '21–23 时' },
] as const;

export const BRANCH_BASE: Record<string, string> = {
  子: '深夜，宜睡',
  丑: '万籁俱寂',
  寅: '困倦',
  卯: '晨起',
  辰: '宜列计划',
  巳: '精力最盛',
  午: '适合沟通',
  未: '易困',
  申: '适合收尾',
  酉: '下班前',
  戌: '宜写文档',
  亥: '夜渐深',
};

export interface ActivityDef {
  id: string;
  label: string;
  weights: readonly number[];
  actions: Record<HourVerdict, string>;
  yi: readonly string[];
  ji: readonly string[];
}

export const ACTIVITIES: readonly ActivityDef[] = [
  {
    id: 'release',
    label: '发布新版本',
    weights: [1, 1, 1, 2, 3, 5, 4, 3, 5, 1, 2, 1],
    actions: { 吉: '宜发布', 平: '宜灰度', 凶: '忌上线' },
    yi: ['先备份再发布', '小步灰度', '发布前让 AI 通读变更说明', '留好回滚方案'],
    ji: ['下班前冲刺', '深夜直接上线', '跳过评审', '无监控即发布'],
  },
  {
    id: 'writing',
    label: '写长文',
    weights: [1, 1, 1, 3, 4, 4, 3, 2, 3, 2, 4, 2],
    actions: { 吉: '宜写长文', 平: '宜列提纲', 凶: '忌硬写' },
    yi: ['先列提纲', '分节写', '让 AI 只改一段', '最后统一润色'],
    ji: ['一次生成全文', '边写边改结构', '跳过事实核对', '深夜硬写'],
  },
  {
    id: 'interview',
    label: '面试备战',
    weights: [1, 1, 1, 3, 4, 5, 4, 3, 4, 2, 2, 1],
    actions: { 吉: '宜模拟面试', 平: '宜复习', 凶: '忌临阵磨枪' },
    yi: ['先梳理项目', '模拟追问', '让 AI 出题', '记录薄弱点'],
    ji: ['背模板', '临阵换简历', '只问不练', '熬夜突击'],
  },
  {
    id: 'refactor',
    label: '重构代码',
    weights: [1, 1, 1, 2, 3, 5, 4, 3, 5, 1, 3, 1],
    actions: { 吉: '宜动大结构', 平: '宜补测试', 凶: '忌大改' },
    yi: ['先补测试', '小步替换', '每步可回滚', '让 AI 解释 diff'],
    ji: ['大爆炸重写', '无测试动刀', '跳过评审', '一次改到底'],
  },
  {
    id: 'weekly',
    label: '让 AI 写周报',
    weights: [1, 1, 1, 2, 3, 4, 3, 2, 4, 3, 5, 3],
    actions: { 吉: '宜生成周报', 平: '宜列事实', 凶: '忌堆流水账' },
    yi: ['先列事实', '按项目归档', '让 AI 压缩', '人工补判断'],
    ji: ['流水账', '夸大成果', '漏掉风险', '直接群发'],
  },
];

export function getActivity(id: string): ActivityDef {
  return ACTIVITIES.find((activity) => activity.id === id) ?? ACTIVITIES[0];
}
```

- [ ] **Step 5: 运行测试确认通过**

Run:

```bash
npm run test -- src/test/pools.test.ts
npm run typecheck
```

Expected: PASS。

- [ ] **Step 6: Commit（仅在用户授权 git 时执行）**

```bash
git add src/domain/mappings.ts src/domain/pools.ts src/test/pools.test.ts
git commit -m "feat: add traditional mappings and almanac copy pools"
```

---

### Task 5: 农历层与模型评分

**Files:**
- Create: `src/types/lunar-javascript.d.ts`
- Create: `src/domain/lunar.ts`
- Create: `src/domain/scoring.ts`
- Test: `src/test/lunar.test.ts`
- Test: `src/test/scoring.test.ts`

**Interfaces:**
- Consumes: `Model`, `Traits`, `TraitKey`, `CategoryKey`, `CategoryScore`, `ModelScore`, `LunarSnapshot`；`RULESET_VERSION`；`jitter`；`clamp`；`MODELS`。
- Produces:
  - `readLunar(dateKey: string): LunarSnapshot`
  - `getElement(naYin: string): { name: string; suffix: string }`
  - `CATEGORY_DEFS`
  - `TRAIT_ORDER`, `TRAIT_LABELS`
  - `scoreCategory(model: Model, categoryKey: CategoryKey, dateKey: string): number`
  - `scoreModel(model: Model, dateKey: string): ModelScore`
  - `verdictForScore(score: number): Verdict`
  - `getBestCategory(categories: CategoryScore[]): CategoryScore`
  - `getTopTrait(model: Model): TraitKey`
  - `getLowTrait(model: Model): TraitKey`

- [ ] **Step 1: 写失败测试**

`src/test/lunar.test.ts`：

```ts
import { describe, expect, it } from 'vitest';
import { getElement, readLunar } from '../domain/lunar';

describe('lunar', () => {
  it('reads the design reference date', () => {
    const lunar = readLunar('2026-11-02');
    expect(lunar.yearGanZhi).toBe('丙午');
    expect(lunar.monthInChinese).toBe('九');
    expect(lunar.dayInChinese).toBe('廿四');
    expect(lunar.naYin).toContain('金');
    expect(lunar.tianShenType).toBe('黄道');
    expect(lunar.jiTerms).toContain('开市');
    expect(lunar.yiTerms.length).toBeGreaterThan(0);
    expect(lunar.hijri?.latin).toMatch(/\d{4}$/);
    expect(lunar.hijri?.arabic.length).toBeGreaterThan(0);
  });

  it('reads the weekend reference date', () => {
    const lunar = readLunar('2026-11-08');
    expect(lunar.dayInChinese).toBe('三十');
  });

  it('maps nayin to an element and suffix', () => {
    expect(getElement('白蜡金')).toEqual({ name: '金', suffix: '算力旺' });
    expect(getElement('屋上土')).toEqual({ name: '土', suffix: '缓存稳' });
  });
});
```

`src/test/scoring.test.ts`：

```ts
import { describe, expect, it } from 'vitest';
import { CATEGORY_DEFS, getBestCategory, getLowTrait, getTopTrait, scoreCategory, scoreModel, verdictForScore } from '../domain/scoring';
import { getModelById } from '../domain/models';

const sonnet = getModelById('claude-sonnet-5-5')!;

describe('scoring', () => {
  it('uses thresholds 75/60', () => {
    expect(verdictForScore(75)).toBe('宜');
    expect(verdictForScore(74)).toBe('平');
    expect(verdictForScore(60)).toBe('平');
    expect(verdictForScore(59)).toBe('忌');
  });

  it('keeps category weights normalized', () => {
    for (const def of CATEGORY_DEFS) {
      const sum = Object.values(def.weights).reduce((total, value) => total + value, 0);
      expect(sum).toBeCloseTo(1);
    }
  });

  it('scores four categories and an overall value', () => {
    const score = scoreModel(sonnet, '2026-11-02');
    expect(score.categories).toHaveLength(4);
    expect(score.overall).toBeGreaterThanOrEqual(0);
    expect(score.overall).toBeLessThanOrEqual(100);
    for (const category of score.categories) {
      expect(category.score).toBeGreaterThanOrEqual(0);
      expect(category.score).toBeLessThanOrEqual(100);
    }
  });

  it('is deterministic', () => {
    expect(scoreCategory(sonnet, 'code', '2026-11-02')).toBe(scoreCategory(sonnet, 'code', '2026-11-02'));
    expect(scoreModel(sonnet, '2026-11-02')).toEqual(scoreModel(sonnet, '2026-11-02'));
  });

  it('finds the best category and strongest/weakest traits', () => {
    const score = scoreModel(sonnet, '2026-11-02');
    expect(score.categories).toContain(getBestCategory(score.categories));
    expect(getTopTrait(sonnet)).toBe('writing');
    expect(getLowTrait(sonnet)).toBe('value');
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run:

```bash
npm run test -- src/test/lunar.test.ts src/test/scoring.test.ts
```

Expected: FAIL，模块不存在。

- [ ] **Step 3: 添加 lunar-javascript 类型声明**

`src/types/lunar-javascript.d.ts`：

```ts
declare module 'lunar-javascript' {
  export class Solar {
    static fromYmd(year: number, month: number, day: number): Solar;
    getLunar(): Lunar;
  }

  export class Lunar {
    getYearInGanZhi(): string;
    getMonthInChinese(): string;
    getDayInChinese(): string;
    getDayNaYin(): string;
    getDayYi(): string[];
    getDayJi(): string[];
    getDayTianShenType(): string;
    getDayChongDesc(): string;
    getDaySha(): string;
  }
}
```

- [ ] **Step 4: 实现农历层**

`src/domain/lunar.ts`：

```ts
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
    const arabic = new Intl.DateTimeFormat('ar-u-ca-islamic-umalqura', { month: 'long' }).format(date);
    return { latin: `${latinMonth} ${year}`, arabic };
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
    yiTerms: lunar.getDayYi(),
    jiTerms: lunar.getDayJi(),
    chongDesc: lunar.getDayChongDesc(),
    sha: lunar.getDaySha(),
    hijri: readHijri(date),
  };
}
```

- [ ] **Step 5: 实现评分**

`src/domain/scoring.ts`：

```ts
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
```

- [ ] **Step 6: 运行测试确认通过**

Run:

```bash
npm run test -- src/test/lunar.test.ts src/test/scoring.test.ts
npm run typecheck
```

Expected: PASS。若 `Intl` 回历在 Node 环境不可用，测试会失败；此时先确认 Node 为 24 完整 ICU，再按 `islamic-umalqura` → `islamic` 回退实现调整 `readHijri`，不要修改测试期望。

- [ ] **Step 7: Commit（仅在用户授权 git 时执行）**

```bash
git add src/types/lunar-javascript.d.ts src/domain/lunar.ts src/domain/scoring.ts src/test/lunar.test.ts src/test/scoring.test.ts
git commit -m "feat: add lunar calendar and model scoring"
```

---

### Task 6: 首页黄历生成器

**Files:**
- Create: `src/domain/almanac.ts`
- Test: `src/test/almanac.test.ts`

**Interfaces:**
- Consumes: `readLunar`, `getElement`, `MODELS`, `scoreModel`, `getLowTrait`, `CATEGORY_DEFS`, `mapTraditionalYi`, `mapTraditionalJi`, pools, date utilities, `RULESET_VERSION`, `fnv1a`, `pickOne`, `shuffle`, `clamp`。
- Produces: `generateAlmanac(dateKey: string): DayAlmanac`

- [ ] **Step 1: 写失败测试**

`src/test/almanac.test.ts`：

```ts
import { describe, expect, it } from 'vitest';
import { generateAlmanac } from '../domain/almanac';

describe('generateAlmanac', () => {
  it('builds the reference weekday almanac', () => {
    const almanac = generateAlmanac('2026-11-02');
    expect(almanac.lunar.text).toContain('丙午');
    expect(almanac.lunar.text).toContain('九月廿四');
    expect(almanac.element.name).toBe('金');
    expect(almanac.theme).toBe('green');
    expect(almanac.isWeekend).toBe(false);
    expect(almanac.yi.items).toHaveLength(18);
    expect(almanac.ji.items).toHaveLength(15);
    expect(almanac.yi.items[0]).toBe(almanac.yi.headline);
    expect(almanac.ji.items[0]).toBe(almanac.ji.headline);
    expect(new Set(almanac.yi.items).size).toBe(18);
    expect(new Set(almanac.ji.items).size).toBe(15);
    expect(almanac.fortunes).toHaveLength(4);
    for (const fortune of almanac.fortunes) {
      expect(fortune.stars).toBeGreaterThanOrEqual(1);
      expect(fortune.stars).toBeLessThanOrEqual(5);
      expect(fortune.note.length).toBeGreaterThan(0);
    }
  });

  it('is deterministic for the same date', () => {
    expect(generateAlmanac('2026-11-02')).toEqual(generateAlmanac('2026-11-02'));
  });

  it('uses the red theme on weekends', () => {
    const almanac = generateAlmanac('2026-11-08');
    expect(almanac.theme).toBe('red');
    expect(almanac.isWeekend).toBe(true);
  });

  it('changes content across dates', () => {
    const first = generateAlmanac('2026-11-02');
    const second = generateAlmanac('2026-11-03');
    expect(first.yi.items).not.toEqual(second.yi.items);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run:

```bash
npm run test -- src/test/almanac.test.ts
```

Expected: FAIL，模块不存在。

- [ ] **Step 3: 实现首页生成器**

`src/domain/almanac.ts`：

```ts
import { dayNumber, isTodayKey, isWeekendKey, monthOf, weekdayEn, weekdayZh, yearOf } from './date';
import { fnv1a, pickOne, shuffle } from './hash';
import { clamp } from './math';
import { getElement, readLunar } from './lunar';
import { mapTraditionalJi, mapTraditionalYi } from './mappings';
import { MODELS } from './models';
import {
  APHORISMS,
  CLASHES,
  DEITIES,
  FORTUNE_LABELS,
  TABOOS,
  UNIVERSAL_JI,
  UNIVERSAL_YI,
} from './pools';
import { CATEGORY_DEFS, getLowTrait, scoreModel } from './scoring';
import { RULESET_VERSION } from './version';
import type { DayAlmanac, Model } from './types';

const YI_CAP = 18;
const JI_CAP = 15;

const CATEGORY_ACTIONS: Record<string, string> = {
  code: '做代码审查',
  writing: '写长文',
  translation: '做翻译',
  research: '做资料检索',
};

const TASK_BY_TRAIT: Record<string, string> = {
  reasoning: '长推理',
  coding: '大重构',
  writing: '长文',
  research: '深调研',
  speed: '实时任务',
  value: '大批量',
  multimodal: '读图',
};

function unique(items: string[]): string[] {
  return [...new Set(items)];
}

function buildYi(
  dateKey: string,
  best: Model,
  scores: Array<{ model: Model; categories: Array<{ key: string; score: number }> }>,
  terms: readonly string[],
): { headline: string; items: string[] } {
  const headline = `使用 ${best.name}`;
  const modelItems: string[] = [];
  for (const def of CATEGORY_DEFS) {
    const top = [...scores].sort((a, b) => {
      const aScore = a.categories.find((category) => category.key === def.key)?.score ?? 0;
      const bScore = b.categories.find((category) => category.key === def.key)?.score ?? 0;
      return bScore - aScore;
    })[0];
    modelItems.push(`使用 ${top.model.name} ${CATEGORY_ACTIONS[def.key]}`);
  }
  const mapped = mapTraditionalYi(terms).slice(0, 8);
  const universal = shuffle(`${RULESET_VERSION}|${dateKey}|yi-universal`, UNIVERSAL_YI);
  return {
    headline,
    items: unique([headline, ...modelItems, ...mapped, ...universal]).slice(0, YI_CAP),
  };
}

function buildJi(
  dateKey: string,
  worst: Model,
  terms: readonly string[],
): { headline: string; items: string[] } {
  const headline = `忌用 ${worst.name}`;
  const lowTrait = getLowTrait(worst);
  const modelItem = `使用 ${worst.name} 硬扛${TASK_BY_TRAIT[lowTrait]}`;
  const mapped = mapTraditionalJi(terms).slice(0, 6);
  const universal = shuffle(`${RULESET_VERSION}|${dateKey}|ji-universal`, UNIVERSAL_JI);
  return {
    headline,
    items: unique([headline, modelItem, ...mapped, ...universal]).slice(0, JI_CAP),
  };
}

function buildFortunes(
  dateKey: string,
  tianShenType: string,
): DayAlmanac['fortunes'] {
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
    yi: buildYi(dateKey, best.model, scored, lunar.yiTerms),
    ji: buildJi(dateKey, worst.model, lunar.jiTerms),
    fortunes: buildFortunes(dateKey, lunar.tianShenType),
    aphorism: pickOne(`${RULESET_VERSION}|${dateKey}|aphorism`, APHORISMS),
  };
}
```

- [ ] **Step 4: 运行测试确认通过**

Run:

```bash
npm run test -- src/test/almanac.test.ts
npm run typecheck
```

Expected: PASS。

- [ ] **Step 5: Commit（仅在用户授权 git 时执行）**

```bash
git add src/domain/almanac.ts src/test/almanac.test.ts
git commit -m "feat: generate daily almanac from lunar data and model scores"
```

---

### Task 7: 模型查询生成器

**Files:**
- Create: `src/domain/modelReading.ts`
- Test: `src/test/modelReading.test.ts`

**Interfaces:**
- Consumes: `MODELS`, `getModelById`, `DEFAULT_MODEL_ID`, `scoreModel`, `verdictForScore`, `getBestCategory`, `getTopTrait`, `getLowTrait`, `TRAIT_LABELS`, `isTodayKey`, `fnv1a`, `RULESET_VERSION`。
- Produces: `generateModelReading(dateKey: string, modelId: string): ModelReading`

- [ ] **Step 1: 写失败测试**

`src/test/modelReading.test.ts`：

```ts
import { describe, expect, it } from 'vitest';
import { DEFAULT_MODEL_ID, MODELS } from '../domain/models';
import { generateModelReading } from '../domain/modelReading';

describe('generateModelReading', () => {
  it('produces a valid reading for every model', () => {
    for (const model of MODELS) {
      const reading = generateModelReading('2026-11-02', model.id);
      expect(reading.model.id).toBe(model.id);
      expect(reading.categories).toHaveLength(4);
      expect(['宜', '平', '忌']).toContain(reading.overall.verdict);
      expect(reading.overall.score).toBeGreaterThanOrEqual(0);
      expect(reading.overall.score).toBeLessThanOrEqual(100);
      expect(reading.alternatives).toHaveLength(3);
      expect(reading.alternatives.every((item) => item.model.id !== model.id)).toBe(true);
      expect(reading.judgment.length).toBeGreaterThan(0);
      expect(reading.verdictText.length).toBeGreaterThan(0);
    }
  });

  it('falls back to the default model for invalid ids', () => {
    const reading = generateModelReading('2026-11-02', 'missing');
    expect(reading.model.id).toBe(DEFAULT_MODEL_ID);
  });

  it('is deterministic', () => {
    expect(generateModelReading('2026-11-02', 'claude-sonnet-5-5')).toEqual(
      generateModelReading('2026-11-02', 'claude-sonnet-5-5'),
    );
  });

  it('uses a 宜 category in the verdict text when possible', () => {
    const reading = generateModelReading('2026-11-02', 'claude-opus-5-5');
    if (reading.overall.verdict === '宜') {
      const yiCategory = reading.categories.find((category) => category.verdict === '宜');
      if (yiCategory) {
        expect(reading.verdictText).toContain(yiCategory.label);
      }
    }
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run:

```bash
npm run test -- src/test/modelReading.test.ts
```

Expected: FAIL，模块不存在。

- [ ] **Step 3: 实现查询生成器**

`src/domain/modelReading.ts`：

```ts
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
```

- [ ] **Step 4: 运行测试确认通过**

Run:

```bash
npm run test -- src/test/modelReading.test.ts
npm run typecheck
```

Expected: PASS。

- [ ] **Step 5: Commit（仅在用户授权 git 时执行）**

```bash
git add src/domain/modelReading.ts src/test/modelReading.test.ts
git commit -m "feat: generate per-model daily readings"
```

---

### Task 8: 择日生成器

**Files:**
- Create: `src/domain/pickDay.ts`
- Test: `src/test/pickDay.test.ts`

**Interfaces:**
- Consumes: `getActivity`, `ACTIVITIES`, `BRANCHES`, `BRANCH_BASE`, `isTodayKey`, `jitter`, `clamp`, `RULESET_VERSION`。
- Produces: `generatePickDay(dateKey: string, activityId: string): PickDayReading`

- [ ] **Step 1: 写失败测试**

`src/test/pickDay.test.ts`：

```ts
import { describe, expect, it } from 'vitest';
import { ACTIVITIES } from '../domain/pools';
import { generatePickDay } from '../domain/pickDay';

const ORDER = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

describe('generatePickDay', () => {
  it('always produces 3 吉, 4 平 and 5 凶', () => {
    for (const activity of ACTIVITIES) {
      const reading = generatePickDay('2026-11-02', activity.id);
      const counts = reading.hours.reduce<Record<string, number>>(
        (result, hour) => {
          result[hour.verdict] = (result[hour.verdict] ?? 0) + 1;
          return result;
        },
        { 吉: 0, 平: 0, 凶: 0 },
      );
      expect(counts).toEqual({ 吉: 3, 平: 4, 凶: 5 });
      expect(reading.best).toHaveLength(2);
      expect(reading.worst).toHaveLength(2);
      expect(reading.hours.map((hour) => hour.branch)).toEqual(ORDER);
      expect(reading.yi.length).toBeGreaterThan(0);
      expect(reading.ji.length).toBeGreaterThan(0);
    }
  });

  it('falls back to release for unknown activities', () => {
    expect(generatePickDay('2026-11-02', 'missing').activity.id).toBe('release');
  });

  it('is deterministic', () => {
    expect(generatePickDay('2026-11-02', 'release')).toEqual(
      generatePickDay('2026-11-02', 'release'),
    );
  });

  it('keeps best and worst consistent with verdicts', () => {
    const reading = generatePickDay('2026-11-02', 'release');
    expect(reading.best.every((hour) => hour.verdict === '吉')).toBe(true);
    expect(reading.worst.every((hour) => hour.verdict === '凶')).toBe(true);
    expect(reading.summary).toContain('最宜');
    expect(reading.summary).toContain('大忌');
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run:

```bash
npm run test -- src/test/pickDay.test.ts
```

Expected: FAIL，模块不存在。

- [ ] **Step 3: 实现择日生成器**

`src/domain/pickDay.ts`：

```ts
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
```

- [ ] **Step 4: 运行测试确认通过**

Run:

```bash
npm run test -- src/test/pickDay.test.ts
npm run typecheck
```

Expected: PASS。

- [ ] **Step 5: Commit（仅在用户授权 git 时执行）**

```bash
git add src/domain/pickDay.ts src/test/pickDay.test.ts
git commit -m "feat: generate day-picking hour guidance"
```

---

### Task 9: 样式、应用外壳与首页

**Files:**
- Modify: `src/styles/app.css`
- Create: `src/components/Disclaimer.tsx`
- Create: `src/components/TopNav.tsx`
- Create: `src/components/AppShell.tsx`
- Create: `src/components/DateBar.tsx`
- Create: `src/components/AlmanacHeader.tsx`
- Create: `src/components/FateGrid.tsx`
- Create: `src/components/YiJiPanels.tsx`
- Create: `src/components/FortuneGrid.tsx`
- Create: `src/pages/HomePage.tsx`
- Modify: `src/App.tsx`
- Test: `src/test/home.test.tsx`

**Interfaces:**
- Consumes: `generateAlmanac`, date utilities, `DayAlmanac`。
- Produces: `AppRoutes`、`App`、`AppShell`、`TopNav`、`DateBar`、`AlmanacHeader`、`FateGrid`、`YiJiPanels`、`FortuneGrid`、`Disclaimer`、`HomePage`。

- [ ] **Step 1: 写失败测试**

`src/test/home.test.tsx`：

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AppRoutes } from '../App';

describe('home page', () => {
  it('renders the almanac for the requested date', () => {
    render(
      <MemoryRouter initialEntries={['/?date=2026-11-02']}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(screen.getAllByText('AI 老黄历').length).toBeGreaterThan(0);
    expect(screen.getByText(/九月廿四/)).toBeInTheDocument();
    expect(screen.getAllByText('宜').length).toBeGreaterThan(0);
    expect(screen.getAllByText('忌').length).toBeGreaterThan(0);
    expect(screen.getByText(/吉语/)).toBeInTheDocument();
  });

  it('moves to the next day', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/?date=2026-11-02']}>
        <AppRoutes />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole('button', { name: '后一天' }));
    expect(screen.getByText(/2026\.11\.03/)).toBeInTheDocument();
  });

  it('uses the red theme on weekends', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/?date=2026-11-08']}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(container.querySelector('.app')).toHaveClass('theme-red');
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run:

```bash
npm run test -- src/test/home.test.tsx
```

Expected: FAIL，`AppRoutes` 未导出或组件不存在。

- [ ] **Step 3: 补全基础样式**

把 `src/styles/app.css` 替换为：

```css
* {
  box-sizing: border-box;
}

html,
body,
#root {
  margin: 0;
  min-height: 100%;
}

body {
  background: var(--paper);
  color: var(--ink);
  font-family: var(--sans);
}

button,
input,
select {
  font: inherit;
}

a {
  color: inherit;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.app {
  min-height: 100vh;
  background: var(--paper);
  color: var(--ink);
}

.shell {
  width: min(1280px, 100%);
  margin: 0 auto;
  padding: 0 24px 48px;
}

.top-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 0;
  border-bottom: 1px solid var(--accent);
}

.brand-mark {
  font-family: var(--serif);
  font-size: 24px;
  font-weight: 900;
  color: var(--accent);
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 16px;
}

.nav-link {
  padding: 6px 2px;
  border-bottom: 1px solid transparent;
  font-size: 14px;
  text-decoration: none;
}

.nav-link.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

.date-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 16px 0;
  font-size: 14px;
}

.date-bar button,
.date-bar input {
  min-height: 44px;
  border: 1px solid var(--accent);
  background: transparent;
  color: var(--accent);
  padding: 0 12px;
}

.date-bar button:disabled {
  opacity: 0.4;
}

.date-label {
  font-family: var(--latin);
  font-weight: 700;
  letter-spacing: 1px;
}

.text-button {
  border: 0 !important;
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 4px;
}

.primary-button {
  display: inline-block;
  margin: 16px auto;
  border: 1px solid var(--accent);
  background: transparent;
  color: var(--accent);
  padding: 12px 20px;
  text-decoration: none;
  cursor: pointer;
}

.primary-button:hover {
  background: var(--accent);
  color: var(--white);
}

.cta-row {
  text-align: center;
}

.almanac-header {
  border-bottom: 3px double var(--accent);
}

.brand {
  margin: 0;
  padding: 12px 20px 0;
  font-family: var(--serif);
  font-size: 80px;
  font-weight: 900;
  line-height: 1.15;
  text-align: center;
  color: var(--accent);
}

.year-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 4px 20px 8px;
  border-bottom: 1px solid var(--accent);
}

.year,
.month-en {
  font-family: var(--latin);
  font-size: 44px;
  font-weight: 700;
}

.month-en {
  letter-spacing: 8px;
}

.month-zh {
  font-family: var(--serif);
  font-size: 44px;
  font-weight: 900;
  color: var(--accent);
}

.hero {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 460px;
  border-bottom: 3px double var(--accent);
}

.big-day {
  font-family: var(--display);
  font-size: 500px;
  line-height: 0.9;
  color: var(--accent-strong);
}

.vertical {
  position: absolute;
  top: 20px;
  writing-mode: vertical-rl;
  font-family: var(--brush);
  font-size: 20px;
  font-weight: 900;
  letter-spacing: 6px;
  color: var(--accent);
}

.vertical.left {
  left: 20px;
}

.vertical.right {
  right: 20px;
}

.hijri {
  position: absolute;
  left: 20px;
  bottom: 16px;
}

.hijri-latin {
  font-family: var(--latin);
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 2px;
}

.hijri-arabic {
  font-family: var(--arabic);
  font-size: 22px;
  font-weight: 700;
}

.lunar-line {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  padding: 12px 20px;
  border-bottom: 1px solid var(--accent);
  font-size: 14px;
}

.weekday-en {
  font-family: var(--latin);
  letter-spacing: 2px;
}

.fate-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  border-bottom: 3px double var(--accent);
}

.fate-cell {
  border: 1px solid var(--accent);
  padding: 12px;
}

.fate-label {
  font-size: 13px;
  letter-spacing: 4px;
  color: var(--accent);
}

.fate-name {
  margin-top: 6px;
  font-size: 20px;
  font-weight: 900;
  color: var(--accent);
}

.fate-counsel {
  margin-top: 6px;
  font-size: 13px;
  color: var(--accent);
}

.yi-ji-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  border-bottom: 3px double var(--accent);
}

.yi-ji-panel {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  border: 1px solid var(--accent);
  outline: 1px solid var(--accent);
  outline-offset: -5px;
  padding: 20px;
  color: var(--accent);
}

.yi-ji-panel.ji {
  border-color: var(--ink);
  outline-color: var(--ink);
  color: var(--ink);
}

.yi-ji-char {
  flex: none;
  font-family: var(--serif);
  font-size: 96px;
  font-weight: 900;
  line-height: 1;
}

.yi-ji-title {
  font-size: 24px;
  font-weight: 900;
}

.yi-ji-items {
  margin-top: 8px;
  font-size: 14px;
  line-height: 1.55;
}

.fortune-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border-bottom: 3px double var(--accent);
}

.fortune-cell {
  border: 1px solid var(--accent);
  padding: 12px;
}

.fortune-label {
  font-size: 13px;
}

.fortune-stars {
  font-size: 24px;
  letter-spacing: 3px;
  color: var(--accent);
}

.fortune-note {
  font-size: 14px;
}

.aphorism {
  padding: 16px;
  font-family: var(--brush);
  font-size: 30px;
  font-weight: 900;
  text-align: center;
  color: var(--accent);
}

.disclaimer {
  border-top: 1px solid rgba(26, 26, 26, 0.2);
  padding: 24px 16px;
  font-size: 12px;
  text-align: center;
  color: var(--ink);
}
```

- [ ] **Step 4: 实现共用组件**

`src/components/Disclaimer.tsx`：

```tsx
export function Disclaimer() {
  return (
    <footer className="disclaimer">
      仅供娱乐，非评测结论 · 模型名称与商标归各自权利人所有 · 农历数据由
      lunar-javascript 推算 · 首页「忌」为相对提醒，具体以查询页判定为准
    </footer>
  );
}
```

`src/components/TopNav.tsx`：

```tsx
import { Link, NavLink, useLocation } from 'react-router-dom';

export function TopNav() {
  const location = useLocation();
  const search = location.search;

  return (
    <nav className="top-nav" aria-label="主导航">
      <Link className="brand-mark" to={`/${search}`}>
        AI 老黄历
      </Link>
      <div className="nav-links">
        <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to={`/${search}`} end>
          今日
        </NavLink>
        <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to={`/query${search}`}>
          查询
        </NavLink>
        <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to={`/pick${search}`}>
          择日
        </NavLink>
      </div>
    </nav>
  );
}
```

`src/components/AppShell.tsx`：

```tsx
import { Outlet, useSearchParams } from 'react-router-dom';
import { isWeekendKey, normalizeDateKey } from '../domain/date';
import { Disclaimer } from './Disclaimer';
import { TopNav } from './TopNav';

export function AppShell() {
  const [params] = useSearchParams();
  const dateKey = normalizeDateKey(params.get('date'));
  const theme = isWeekendKey(dateKey) ? 'theme-red' : 'theme-green';

  return (
    <div className={`app ${theme}`}>
      <div className="shell">
        <TopNav />
        <Outlet />
      </div>
      <Disclaimer />
    </div>
  );
}
```

`src/components/DateBar.tsx`：

```tsx
import { MAX_DATE, MIN_DATE, addDays, isTodayKey, todayKey, weekdayZh } from '../domain/date';

interface DateBarProps {
  dateKey: string;
  onChange: (next: string) => void;
}

export function DateBar({ dateKey, onChange }: DateBarProps) {
  return (
    <div className="date-bar">
      <button type="button" aria-label="前一天" onClick={() => onChange(addDays(dateKey, -1))}>
        ‹
      </button>
      <span className="date-label">
        {dateKey.replaceAll('-', '.')} {weekdayZh(dateKey).replace('星期', '周')}
      </span>
      <button type="button" aria-label="后一天" onClick={() => onChange(addDays(dateKey, 1))}>
        ›
      </button>
      <label className="date-input">
        <span className="sr-only">选择日期</span>
        <input
          type="date"
          min={MIN_DATE}
          max={MAX_DATE}
          value={dateKey}
          onChange={(event) => onChange(event.target.value)}
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
  );
}
```

`src/components/AlmanacHeader.tsx`：

```tsx
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
            <div className="hijri-arabic" dir="rtl" lang="ar">
              {almanac.hijri.arabic}
            </div>
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
```

`src/components/FateGrid.tsx`：

```tsx
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
```

`src/components/YiJiPanels.tsx`：

```tsx
import type { DayAlmanac } from '../domain/types';

export function YiJiPanels({ almanac }: { almanac: DayAlmanac }) {
  return (
    <section className="yi-ji-grid" aria-label="宜忌">
      <article className="yi-ji-panel yi">
        <div className="yi-ji-char">宜</div>
        <div>
          <div className="yi-ji-title">{almanac.yi.headline}</div>
          <div className="yi-ji-items">{almanac.yi.items.join('、')}</div>
        </div>
      </article>
      <article className="yi-ji-panel ji">
        <div className="yi-ji-char">忌</div>
        <div>
          <div className="yi-ji-title">{almanac.ji.headline}</div>
          <div className="yi-ji-items">{almanac.ji.items.join('、')}</div>
        </div>
      </article>
    </section>
  );
}
```

`src/components/FortuneGrid.tsx`：

```tsx
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
```

- [ ] **Step 5: 实现首页与路由**

`src/pages/HomePage.tsx`：

```tsx
import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlmanacHeader } from '../components/AlmanacHeader';
import { DateBar } from '../components/DateBar';
import { FateGrid } from '../components/FateGrid';
import { FortuneGrid } from '../components/FortuneGrid';
import { YiJiPanels } from '../components/YiJiPanels';
import { generateAlmanac } from '../domain/almanac';
import { normalizeDateKey } from '../domain/date';

export function HomePage() {
  const [params, setParams] = useSearchParams();
  const dateKey = normalizeDateKey(params.get('date'));
  const almanac = useMemo(() => generateAlmanac(dateKey), [dateKey]);
  const dayWord = almanac.isToday ? '今日' : '当日';

  const setDate = (next: string) => {
    const nextParams = new URLSearchParams(params);
    nextParams.set('date', normalizeDateKey(next));
    setParams(nextParams, { replace: true });
  };

  return (
    <article className="home">
      <DateBar dateKey={dateKey} onChange={setDate} />
      <AlmanacHeader almanac={almanac} />
      <FateGrid almanac={almanac} />
      <YiJiPanels almanac={almanac} />
      <FortuneGrid fortunes={almanac.fortunes} />
      <div className="aphorism">
        {dayWord}吉语：{almanac.aphorism}
      </div>
      <div className="cta-row">
        <Link className="primary-button" to={`/query?date=${dateKey}`}>
          查询模型{dayWord}宜忌
        </Link>
      </div>
    </article>
  );
}
```

`src/App.tsx`：

```tsx
import { HashRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { HomePage } from './pages/HomePage';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
      </Route>
    </Routes>
  );
}

export function App() {
  return (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  );
}
```

- [ ] **Step 6: 运行测试确认通过**

Run:

```bash
npm run test -- src/test/home.test.tsx
npm run typecheck
```

Expected: PASS。

- [ ] **Step 7: Commit（仅在用户授权 git 时执行）**

```bash
git add src/styles/app.css src/components src/pages/HomePage.tsx src/App.tsx src/test/home.test.tsx
git commit -m "feat: add app shell and interactive homepage"
```

---

### Task 10: 模型查询页

**Files:**
- Create: `src/components/ModelSelect.tsx`
- Create: `src/components/VerdictSeal.tsx`
- Create: `src/pages/QueryPage.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles/app.css`
- Test: `src/test/query.test.tsx`

**Interfaces:**
- Consumes: `generateModelReading`, `getModelById`, `getModelGroups`, `DEFAULT_MODEL_ID`, `normalizeDateKey`, `DateBar`, `VerdictSeal`。
- Produces: `ModelSelect`、`VerdictSeal`、`QueryPage`、`/query` 路由。

- [ ] **Step 1: 写失败测试**

`src/test/query.test.tsx`：

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AppRoutes } from '../App';

describe('query page', () => {
  it('renders the default model reading', () => {
    render(
      <MemoryRouter initialEntries={['/query?date=2026-11-02']}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText('查询模型')).toHaveValue('claude-sonnet-5-5');
    expect(screen.getByRole('heading', { name: 'Claude Sonnet 5.5' })).toBeInTheDocument();
    expect(screen.getByText(/写代码/)).toBeInTheDocument();
    expect(screen.getByText(/写文章/)).toBeInTheDocument();
    expect(screen.getByText(/翻译/)).toBeInTheDocument();
    expect(screen.getByText(/查资料/)).toBeInTheDocument();
  });

  it('updates the reading when the model changes', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/query?date=2026-11-02']}>
        <AppRoutes />
      </MemoryRouter>,
    );
    await user.selectOptions(screen.getByLabelText('查询模型'), 'gpt-6-luna');
    expect(screen.getByRole('heading', { name: 'GPT-6 Luna' })).toBeInTheDocument();
  });

  it('falls back to the default model for invalid ids', () => {
    render(
      <MemoryRouter initialEntries={['/query?date=2026-11-02&model=missing']}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText('查询模型')).toHaveValue('claude-sonnet-5-5');
  });

  it('marks the result region as a live region', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/query?date=2026-11-02']}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(container.querySelector('[aria-live="polite"]')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run:

```bash
npm run test -- src/test/query.test.tsx
```

Expected: FAIL，`/query` 路由或组件不存在。

- [ ] **Step 3: 实现查询组件**

`src/components/ModelSelect.tsx`：

```tsx
import { getModelGroups } from '../domain/models';

interface ModelSelectProps {
  value: string;
  onChange: (id: string) => void;
}

export function ModelSelect({ value, onChange }: ModelSelectProps) {
  return (
    <label className="field">
      <span>查询模型</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {getModelGroups().map((group) => (
          <optgroup key={group.key} label={group.label}>
            {group.models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
                {model.status === 'preview' ? '（预览）' : ''}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}
```

`src/components/VerdictSeal.tsx`：

```tsx
import type { Verdict } from '../domain/types';

export function VerdictSeal({ verdict }: { verdict: Verdict }) {
  return (
    <div className="seal" data-verdict={verdict} aria-label={`判定：${verdict}`}>
      {verdict}
    </div>
  );
}
```

`src/pages/QueryPage.tsx`：

```tsx
import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { DateBar } from '../components/DateBar';
import { ModelSelect } from '../components/ModelSelect';
import { VerdictSeal } from '../components/VerdictSeal';
import { isTodayKey, normalizeDateKey } from '../domain/date';
import { DEFAULT_MODEL_ID, getModelById } from '../domain/models';
import { generateModelReading } from '../domain/modelReading';

export function QueryPage() {
  const [params, setParams] = useSearchParams();
  const dateKey = normalizeDateKey(params.get('date'));
  const rawModel = params.get('model');
  const modelId = rawModel && getModelById(rawModel) ? rawModel : DEFAULT_MODEL_ID;
  const reading = useMemo(() => generateModelReading(dateKey, modelId), [dateKey, modelId]);
  const dayWord = isTodayKey(dateKey) ? '今日' : '当日';

  const setDate = (next: string) => {
    const nextParams = new URLSearchParams(params);
    nextParams.set('date', normalizeDateKey(next));
    setParams(nextParams, { replace: true });
  };

  const setModel = (next: string) => {
    const nextParams = new URLSearchParams(params);
    nextParams.set('model', next);
    setParams(nextParams, { replace: true });
  };

  return (
    <section className="query-page">
      <DateBar dateKey={dateKey} onChange={setDate} />
      <header className="page-head">
        <Link to={`/?date=${dateKey}`}>返回首页</Link>
        <h1>模型查询</h1>
        <span>{dateKey}</span>
      </header>
      <div className="query-controls">
        <ModelSelect value={modelId} onChange={setModel} />
        <button type="button" className="primary-button" onClick={() => setModel(modelId)}>
          查询
        </button>
      </div>
      <div className="result" aria-live="polite">
        <VerdictSeal verdict={reading.overall.verdict} />
        <h2>{reading.model.name}</h2>
        <p className="model-meta">
          {reading.model.vendor}
          {reading.model.status === 'preview' ? ' · 预览' : ''}
        </p>
        <p className="verdict-text">{reading.verdictText}</p>
        <p className="judgment">{reading.judgment}</p>
        <h3>分项吉凶</h3>
        <div className="category-grid">
          {reading.categories.map((category) => (
            <div className="category-cell" key={category.key}>
              <span>{category.label}</span>
              <strong>{category.verdict}</strong>
            </div>
          ))}
        </div>
        <h3>{reading.overall.verdict === '忌' ? `${dayWord}改用` : '备用模型'}</h3>
        <div className="alternative-grid">
          {reading.alternatives.map((alternative) => (
            <article className="alternative-card" key={alternative.model.id}>
              <strong>{alternative.model.name}</strong>
              <span>{alternative.reason}</span>
              {alternative.model.status === 'preview' && <em>预览</em>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: 添加查询页样式**

在 `src/styles/app.css` 末尾追加：

```css
.page-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 0;
  border-bottom: 1px solid var(--accent);
}

.page-head h1 {
  margin: 0;
  font-family: var(--serif);
  font-size: 32px;
}

.page-head a {
  color: var(--accent);
}

.query-controls {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  flex-wrap: wrap;
  padding: 20px 0;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
}

.field select {
  min-height: 44px;
  min-width: 260px;
  border: 1px solid var(--accent);
  background: var(--paper);
  color: var(--ink);
  padding: 0 12px;
}

.result {
  position: relative;
  border: 1px solid var(--accent);
  outline: 1px solid var(--accent);
  outline-offset: -5px;
  padding: 24px;
  min-height: 520px;
}

.seal {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 96px;
  height: 96px;
  border: 1px solid var(--ink);
  font-family: var(--serif);
  font-size: 64px;
  font-weight: 900;
  line-height: 1;
}

.seal[data-verdict='宜'] {
  border-color: var(--accent);
  outline: 1px solid var(--accent);
  outline-offset: -5px;
  color: var(--accent);
}

.seal[data-verdict='忌'] {
  outline: 1px solid var(--ink);
  outline-offset: -5px;
}

.result h2 {
  margin: 16px 0 4px;
  font-family: var(--serif);
  font-size: 32px;
}

.model-meta {
  margin: 0;
  font-size: 13px;
  color: var(--accent);
}

.verdict-text {
  margin: 16px 0 4px;
  font-size: 20px;
  font-weight: 900;
  color: var(--accent);
}

.judgment {
  margin: 0 0 16px;
  font-size: 15px;
  line-height: 1.7;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border: 1px solid var(--accent);
}

.category-cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border-right: 1px solid var(--accent);
  padding: 12px;
}

.category-cell:last-child {
  border-right: 0;
}

.category-cell strong {
  color: var(--accent);
}

.alternative-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.alternative-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  border: 1px solid var(--accent);
  padding: 12px;
  font-size: 14px;
}

.alternative-card em {
  align-self: flex-start;
  border: 1px solid var(--accent);
  padding: 1px 6px;
  font-size: 11px;
  font-style: normal;
}
```

- [ ] **Step 5: 添加路由**

`src/App.tsx` 改为：

```tsx
import { HashRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { HomePage } from './pages/HomePage';
import { QueryPage } from './pages/QueryPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="query" element={<QueryPage />} />
      </Route>
    </Routes>
  );
}

export function App() {
  return (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  );
}
```

- [ ] **Step 6: 运行测试确认通过**

Run:

```bash
npm run test -- src/test/query.test.tsx
npm run typecheck
```

Expected: PASS。

- [ ] **Step 7: Commit（仅在用户授权 git 时执行）**

```bash
git add src/components/ModelSelect.tsx src/components/VerdictSeal.tsx src/pages/QueryPage.tsx src/App.tsx src/styles/app.css src/test/query.test.tsx
git commit -m "feat: add interactive model query page"
```

---

### Task 11: 择日页

**Files:**
- Create: `src/components/HourGrid.tsx`
- Create: `src/pages/PickDayPage.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles/app.css`
- Test: `src/test/pickPage.test.tsx`

**Interfaces:**
- Consumes: `generatePickDay`, `ACTIVITIES`, `normalizeDateKey`, `DateBar`。
- Produces: `HourGrid`、`PickDayPage`、`/pick` 路由。

- [ ] **Step 1: 写失败测试**

`src/test/pickPage.test.tsx`：

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AppRoutes } from '../App';

describe('pick day page', () => {
  it('renders 12 hour cells with the 3/4/5 split', () => {
    render(
      <MemoryRouter initialEntries={['/pick?date=2026-11-02']}>
        <AppRoutes />
      </MemoryRouter>,
    );
    const cells = screen.getAllByTestId('hour-cell');
    expect(cells).toHaveLength(12);
    expect(cells.filter((cell) => cell.getAttribute('data-verdict') === '吉')).toHaveLength(3);
    expect(cells.filter((cell) => cell.getAttribute('data-verdict') === '平')).toHaveLength(4);
    expect(cells.filter((cell) => cell.getAttribute('data-verdict') === '凶')).toHaveLength(5);
    expect(screen.getByText(/最宜/)).toBeInTheDocument();
    expect(screen.getByText(/大忌/)).toBeInTheDocument();
  });

  it('switches activity', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/pick?date=2026-11-02&activity=release']}>
        <AppRoutes />
      </MemoryRouter>,
    );
    const target = screen.getByRole('button', { name: '重构代码' });
    await user.click(target);
    expect(target).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getAllByTestId('hour-cell')).toHaveLength(12);
  });

  it('falls back to release for invalid activities', () => {
    render(
      <MemoryRouter initialEntries={['/pick?date=2026-11-02&activity=missing']}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: '发布新版本' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('labels each hour cell for screen readers', () => {
    render(
      <MemoryRouter initialEntries={['/pick?date=2026-11-02']}>
        <AppRoutes />
      </MemoryRouter>,
    );
    const first = screen.getAllByTestId('hour-cell')[0];
    expect(first).toHaveAttribute('aria-label');
    expect(first.getAttribute('aria-label')).toContain('时');
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run:

```bash
npm run test -- src/test/pickPage.test.tsx
```

Expected: FAIL，`/pick` 路由或组件不存在。

- [ ] **Step 3: 实现时辰网格**

`src/components/HourGrid.tsx`：

```tsx
import type { HourCell } from '../domain/types';

export function HourGrid({ hours }: { hours: HourCell[] }) {
  return (
    <section className="hour-grid" aria-label="十二时辰">
      {hours.map((hour) => (
        <article
          className="hour-cell"
          data-testid="hour-cell"
          data-verdict={hour.verdict}
          key={hour.branch}
          aria-label={`${hour.branch}时 ${hour.time}，${hour.verdict}，${hour.advice}`}
        >
          <strong className="hour-branch">{hour.branch}</strong>
          <span className="hour-verdict">{hour.verdict}</span>
          <span className="hour-time">{hour.time}</span>
          <p className="hour-advice">{hour.advice}</p>
        </article>
      ))}
    </section>
  );
}
```

- [ ] **Step 4: 实现择日页**

`src/pages/PickDayPage.tsx`：

```tsx
import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { DateBar } from '../components/DateBar';
import { HourGrid } from '../components/HourGrid';
import { normalizeDateKey } from '../domain/date';
import { ACTIVITIES } from '../domain/pools';
import { generatePickDay } from '../domain/pickDay';
import type { HourCell } from '../domain/types';

function hourLabel(hour: HourCell): string {
  return hour.branch === '子' ? '夜半' : `${hour.branch}时`;
}

export function PickDayPage() {
  const [params, setParams] = useSearchParams();
  const dateKey = normalizeDateKey(params.get('date'));
  const rawActivity = params.get('activity');
  const activityId = ACTIVITIES.some((activity) => activity.id === rawActivity) ? rawActivity! : 'release';
  const reading = useMemo(() => generatePickDay(dateKey, activityId), [dateKey, activityId]);

  const setDate = (next: string) => {
    const nextParams = new URLSearchParams(params);
    nextParams.set('date', normalizeDateKey(next));
    setParams(nextParams, { replace: true });
  };

  const setActivity = (next: string) => {
    const nextParams = new URLSearchParams(params);
    nextParams.set('activity', next);
    setParams(nextParams, { replace: true });
  };

  return (
    <section className="pick-page">
      <DateBar dateKey={dateKey} onChange={setDate} />
      <header className="page-head">
        <Link to={`/?date=${dateKey}`}>返回首页</Link>
        <h1>择日</h1>
        <span>{dateKey}</span>
      </header>
      <div className="activity-section">
        <h2>想做的事</h2>
        <div className="activity-chips">
          {ACTIVITIES.map((activity) => (
            <button
              type="button"
              key={activity.id}
              className={activity.id === activityId ? 'chip active' : 'chip'}
              aria-pressed={activity.id === activityId}
              onClick={() => setActivity(activity.id)}
            >
              {activity.label}
            </button>
          ))}
        </div>
      </div>
      <div className="pick-overview">
        <article>
          <h3>最宜</h3>
          {reading.best.map((hour) => (
            <div key={hour.branch}>
              {hourLabel(hour)}　{hour.time}
            </div>
          ))}
        </article>
        <article>
          <h3>大忌</h3>
          {reading.worst.map((hour) => (
            <div key={hour.branch}>
              {hourLabel(hour)}　{hour.time}
            </div>
          ))}
        </article>
      </div>
      <HourGrid hours={reading.hours} />
      <p className="pick-summary">{reading.summary}</p>
      <div className="pick-checklist">
        <p>宜：{reading.yi.join('、')}。</p>
        <p>忌：{reading.ji.join('、')}。</p>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: 添加择日样式**

在 `src/styles/app.css` 末尾追加：

```css
.activity-section {
  padding: 20px 0;
  border-bottom: 1px solid var(--accent);
}

.activity-section h2 {
  margin: 0 0 12px;
  font-family: var(--serif);
  font-size: 24px;
}

.activity-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  min-height: 44px;
  border: 1px solid var(--accent);
  background: transparent;
  color: var(--accent);
  padding: 0 14px;
  cursor: pointer;
}

.chip.active {
  background: var(--accent);
  color: var(--white);
}

.pick-overview {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  border-bottom: 3px double var(--accent);
}

.pick-overview article {
  border: 1px solid var(--accent);
  padding: 16px;
}

.pick-overview h3 {
  margin: 0 0 8px;
  font-size: 14px;
  letter-spacing: 4px;
  color: var(--accent);
}

.hour-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border-bottom: 3px double var(--accent);
}

.hour-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 120px;
  border: 1px solid var(--ink);
  padding: 12px;
}

.hour-cell[data-verdict='吉'] {
  border-color: var(--accent);
  background: var(--accent);
  color: var(--white);
}

.hour-cell[data-verdict='平'] {
  background: var(--paper);
  color: var(--ink);
}

.hour-cell[data-verdict='凶'] {
  background: var(--ink);
  color: var(--white);
}

.hour-branch {
  font-family: var(--serif);
  font-size: 32px;
  line-height: 1;
}

.hour-verdict {
  font-size: 13px;
  letter-spacing: 4px;
}

.hour-time {
  font-size: 12px;
}

.hour-advice {
  margin: auto 0 0;
  font-size: 12px;
  line-height: 1.5;
}

.pick-summary {
  padding: 16px 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--accent);
}

.pick-checklist {
  border-top: 1px solid var(--accent);
  padding-top: 12px;
  font-size: 14px;
  line-height: 1.8;
}
```

- [ ] **Step 6: 添加路由**

`src/App.tsx` 改为：

```tsx
import { HashRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { HomePage } from './pages/HomePage';
import { PickDayPage } from './pages/PickDayPage';
import { QueryPage } from './pages/QueryPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="query" element={<QueryPage />} />
        <Route path="pick" element={<PickDayPage />} />
      </Route>
    </Routes>
  );
}

export function App() {
  return (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  );
}
```

- [ ] **Step 7: 运行测试确认通过**

Run:

```bash
npm run test -- src/test/pickPage.test.tsx
npm run typecheck
```

Expected: PASS。

- [ ] **Step 8: Commit（仅在用户授权 git 时执行）**

```bash
git add src/components/HourGrid.tsx src/pages/PickDayPage.tsx src/App.tsx src/styles/app.css src/test/pickPage.test.tsx
git commit -m "feat: add interactive day-picking page"
```

---

### Task 12: URL 联动、主题、响应式、可访问性与最终验收

**Files:**
- Modify: `src/styles/app.css`
- Test: `src/test/navigation.test.tsx`
- Verify: all files.

**Interfaces:**
- Consumes: `AppRoutes`, `LocationProbe`（测试内定义）。
- Produces: 跨页 URL 保留、周末主题、响应式断点、焦点样式、减少动效，以及最终验证结果。

- [ ] **Step 1: 写跨页与主题测试**

`src/test/navigation.test.tsx`：

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AppRoutes } from '../App';

function LocationProbe() {
  const location = useLocation();
  return (
    <output data-testid="location">
      {location.pathname}
      {location.search}
    </output>
  );
}

describe('navigation and theme', () => {
  it('preserves the date when switching pages', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/?date=2026-11-02']}>
        <AppRoutes />
        <LocationProbe />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole('link', { name: '查询' }));
    expect(screen.getByTestId('location')).toHaveTextContent('/query?date=2026-11-02');
  });

  it('preserves the model when changing date', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/query?date=2026-11-02&model=gpt-6-luna']}>
        <AppRoutes />
        <LocationProbe />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole('button', { name: '后一天' }));
    expect(screen.getByTestId('location')).toHaveTextContent('/query?date=2026-11-03&model=gpt-6-luna');
  });

  it('preserves the activity when changing date', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/pick?date=2026-11-02&activity=refactor']}>
        <AppRoutes />
        <LocationProbe />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole('button', { name: '后一天' }));
    expect(screen.getByTestId('location')).toHaveTextContent('/pick?date=2026-11-03&activity=refactor');
  });

  it('falls back to today for invalid dates', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 2, 12, 0, 0));
    render(
      <MemoryRouter initialEntries={['/query?date=bad']}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(screen.getByDisplayValue('2026-11-02')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('uses the red theme for weekend dates', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/pick?date=2026-11-08']}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(container.querySelector('.app')).toHaveClass('theme-red');
  });
});
```

- [ ] **Step 2: 运行测试确认失败或暴露问题**

Run:

```bash
npm run test -- src/test/navigation.test.tsx
```

Expected: 初次运行如果有 URL 未保留或主题未切换，测试 FAIL；按 Step 3 修正。

- [ ] **Step 3: 修正跨页与日期行为**

确认以下实现：

- `TopNav` 的三条链接都使用 `location.search`，见 Task 9。
- `DateBar` 的 `onChange` 在三个页面都基于当前 `URLSearchParams` 复制后再 `set`，见 Task 9、10、11。
- `AppShell` 用 `normalizeDateKey(params.get('date'))` 和 `isWeekendKey(dateKey)` 决定 `theme-green` / `theme-red`，见 Task 9。
- `QueryPage` 的非法 `model` 回退 `DEFAULT_MODEL_ID`，见 Task 10。
- `PickDayPage` 的非法 `activity` 回退 `release`，见 Task 11。

如果测试仍失败，按失败断言定位到具体组件，不改测试期望。

- [ ] **Step 4: 补响应式、焦点与减少动效样式**

在 `src/styles/app.css` 末尾追加：

```css
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

@media (max-width: 1023px) {
  .shell {
    padding: 0 16px 32px;
  }

  .brand {
    font-size: 56px;
  }

  .year,
  .month-en,
  .month-zh {
    font-size: 30px;
  }

  .month-en {
    letter-spacing: 4px;
  }

  .big-day {
    font-size: 360px;
  }

  .yi-ji-char {
    font-size: 72px;
  }

  .fortune-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .hour-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .category-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .category-cell:nth-child(2n) {
    border-right: 0;
  }

  .alternative-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 639px) {
  .top-nav {
    gap: 8px;
  }

  .brand-mark {
    font-size: 18px;
  }

  .nav-links {
    gap: 10px;
  }

  .nav-link {
    font-size: 13px;
  }

  .brand {
    font-size: 40px;
  }

  .year-row {
    flex-wrap: wrap;
    gap: 4px 12px;
  }

  .year,
  .month-en,
  .month-zh {
    font-size: 24px;
  }

  .hero {
    min-height: 300px;
  }

  .big-day {
    font-size: 240px;
  }

  .vertical {
    display: none;
  }

  .hijri {
    position: static;
    margin: 0 auto 12px;
    text-align: center;
  }

  .yi-ji-grid,
  .pick-overview {
    grid-template-columns: 1fr;
  }

  .yi-ji-char {
    font-size: 64px;
  }

  .fortune-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .hour-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .hour-cell {
    min-height: 110px;
    padding: 8px;
  }

  .hour-branch {
    font-size: 24px;
  }

  .field select {
    min-width: 0;
    width: 100%;
  }

  .query-controls,
  .date-bar {
    align-items: stretch;
    flex-direction: column;
  }
}
```

- [ ] **Step 5: 运行全部测试与静态检查**

Run:

```bash
npm run test
npm run typecheck
npm run build
```

Expected: 全部 PASS，构建生成 `dist/`。

- [ ] **Step 6: 浏览器视觉核对**

Run:

```bash
npm run dev -- --host 127.0.0.1
```

在浏览器打开终端输出的地址（通常是 `http://127.0.0.1:5173/`），检查：

- `#/?date=2026-11-02`：绿色主题、农历「九月廿四」、大数字、宜/忌双栏、四项运势、吉语、查询 CTA。
- `#/query?date=2026-11-02&model=claude-sonnet-5-5`：印章、判词、四项分项、三张替代模型卡片。
- `#/pick?date=2026-11-02&activity=release`：5 个事项 chip、最宜/大忌、12 格 3 吉/4 平/5 凶。
- `#/?date=2026-11-08`：红色主题。
- 390px 宽：单列、日期栏换行、时辰 3 列、无横向溢出。

如果浏览器工具不可用，在最终报告中明确写「未做浏览器视觉核对」，不要声称通过。

- [ ] **Step 7: 最终验收清单**

逐项确认：

- [ ] `npm run build` 成功。
- [ ] `npm run typecheck` 成功。
- [ ] `npm run test` 全部通过。
- [ ] 三个路由可访问，URL 可分享。
- [ ] 同一天刷新两次内容完全一致。
- [ ] 2026-11-02 显示「丙午年 九月廿四」，绿色主题。
- [ ] 2026-11-08 显示「星期日」，红色主题。
- [ ] 34 款模型均可选、可出结果。
- [ ] 5 个事项均满足 3 吉、4 平、5 凶。
- [ ] 页脚声明可见且包含「仅供娱乐，非评测结论」。
- [ ] 断网时页面仍可读（字体回退）。

- [ ] **Step 8: Commit（仅在用户授权 git 时执行）**

```bash
git add src/styles/app.css src/test/navigation.test.tsx
git commit -m "feat: polish responsive layout and cross-page navigation"
```

---

## 计划自检

- **Spec 覆盖**：路由、34 款模型、真实农历种子、传统词映射、模型评分、首页生成、查询生成、择日生成、视觉 token、页脚声明、测试与验收均有对应任务；非目标（明日/关于/海报/后端）没有实现任务，符合 spec。
- **类型一致性**：`Verdict`（宜/平/忌）用于模型，`HourVerdict`（吉/平/凶）用于时辰；`generateAlmanac`、`generateModelReading`、`generatePickDay` 的签名与 spec 输出契约一致；日期工具、模型 helper、评分 helper 在后续任务中按名称复用。
- **无占位符**：每个任务都包含具体文件、测试代码、实现代码或样式代码、运行命令与期望结果。
- **风险点**：`lunar-javascript` 无类型声明，已在 Task 5 提供 `.d.ts`；回历依赖 Node/浏览器 ICU，Task 5 给出回退要求；字体依赖网络，已在 Global Constraints 与验收清单中说明回退。
