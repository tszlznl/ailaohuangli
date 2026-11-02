# AI 老黄历交互版 · 设计规格

| 项 | 内容 |
|---|---|
| 日期 | 2026-11-02 |
| 状态 | 已实现 |
| 规则版本 | `2026.11.2` |
| 目标仓库 | 本仓库根目录 |
| 交付范围 | 首页、模型查询、择日三页交互版 |
| 设计输入 | `AI 老黄历.html`（14 张画板）、`AI老黄历_设计稿清单.xlsx` |

> 实现变更（2026-11-02）：首页宜忌已改为每组 3–6 个两字词，前两个词取自当日主推/避用模型的强弱项，其余按日期轮换；本文档中 18 宜 / 15 忌长文案与传统词映射的描述不再对应当前实现。

## 1. 产品目标与非目标

### 1.1 目标

- 做一个借用传统老黄历形式的 AI 使用趣味工具：每天给出使用 AI 的「宜」与「忌」。
- 同一天、同一模型，所有人看到的结果一致；跨天自动更换。
- 三个可交互页面：首页、模型查询、择日。
- 保持设计稿的版式与气质：大数字、竖排毛笔字、双线框、绿/红双主题。
- 纯前端、可静态部署、无后端、无运行时 LLM 调用。

### 1.2 非目标

- 不做明日预告、关于与免责声明独立页、分享海报/图片导出。
- 不做登录、账号、收藏、历史记录、统计、A/B、国际化。
- 不做真实模型评测、排名或购买建议；能力分是编辑主观设定。
- 不做 SSR/SEO 优化；交付物是客户端 SPA。
- 不覆盖图像、视频、语音、嵌入等专用模型。

## 2. 关键决策

| 决策 | 结论 |
|---|---|
| 技术形态 | Vite + React + TypeScript，构建为纯静态文件 |
| 路由 | `react-router-dom` 的 `HashRouter`，静态托管无需 rewrite |
| 模型清单 | 34 款 2026 年真实在售/预览的通用文本与编程模型 |
| 宜忌规则 | 真实农历做种子 → 传统宜忌词映射 → 模型能力评分 → 固定文案池 |
| 日历库 | `lunar-javascript`（农历、干支、纳音、真实宜忌、值神） |
| 回历 | 浏览器原生 `Intl` 的 `islamic-umalqura`，失败时回退 `islamic` |
| 样式 | CSS 变量 + 两个全局样式表（tokens/app），不引入 UI 库或 Tailwind |
| 字体 | Google Fonts 网络加载 + 系统中文字体回退 |
| 测试 | Vitest + React Testing Library + jsdom；最后做一次浏览器视觉核对 |

## 3. 信息架构

### 3.1 路由

| 路由 | 页面 | 说明 |
|---|---|---|
| `/` | 首页 | 当日/所选日期的完整黄历 |
| `/query` | 模型查询 | 选日期 + 模型，出单模型判词 |
| `/pick` | 择日 | 选日期 + 事项，出十二时辰吉凶 |

### 3.2 URL 参数

| 参数 | 适用页面 | 取值 | 缺省/非法值 |
|---|---|---|---|
| `date` | 全部 | `YYYY-MM-DD` | 缺省为本地今天；非法则回退今天 |
| `model` | `/query` | 模型 `id` | 缺省 `claude-sonnet-5-5`；非法则回退该值 |
| `activity` | `/pick` | `release` / `writing` / `interview` / `refactor` / `weekly` | 缺省 `release`；非法则回退该值 |

- 日期参数变化用 `replace` 更新，避免历史记录被逐日刷满。
- 页面间跳转用 `push`，并保留 `date`；查询页切到择日页时只带 `date`，择日页切到查询页时只带 `date`。
- 所有参数值在读取时做白名单/格式校验，不做异常页面。

### 3.3 日期语义

- `today` 指用户本地时区的今天，日期键由 `getFullYear/getMonth/getDate` 生成本地 `YYYY-MM-DD`，不使用 UTC。
- 所选日期等于今天时，页面文案用「今日」；否则用「当日」。
- 支持范围：`1901-01-01` 至 `2099-12-31`。日期输入越界时钳制到边界，并在日期栏下方显示一行提示「日期范围为 1901–2099」。
- 周末（周六、周日）使用红色主题，其余使用绿色主题。主题由所选日期决定，不是由访问当天决定。

### 3.4 顶部导航

- 左侧品牌「AI 老黄历」，右侧三个文字链接：今日 / 查询 / 择日。
- 当前页链接加下划线或实心点，保持与主题色一致。
- 三个页面共用；移动端同一行展示，字号缩小，不折叠成汉堡菜单。

## 4. 页面规格

### 4.1 首页 `/`

#### 4.1.1 结构（自上而下）

1. 顶部导航。
2. 日期栏：`‹` 前一天、`2026.11.02 周一`、`›` 后一天、日期选择器、「回今日」。
3. 报头：
   - 品牌大字「AI 老黄历」。
   - 年/月行：`2026`、`NOVEMBER`、`十一月`（公历月份的中文）。
   - 大数字：公历日。
   - 左侧竖排：「今日值神　{值神}」；右侧竖排：「冲　{冲}　煞　{煞}」。
   - 左下角：回历拉丁月名 + 年份，下方阿拉伯文月名。
   - 大数字下方：农历月日、`农历{干支}年　公历 {月} 月 {日} 日`、`星期{中文}`、英文星期大写。
4. 四格：值神 / 五行 / 冲 / 煞，每格「标题 + 名称 + 一句判词」。
5. 宜/忌双栏：大字「宜」「忌」+ 标题 + 长文案，用「、」连接。
6. 四项运势：提示词运势 / 幻觉风险 / Token 财运 / 调试运势，每项「名称 + 星级 + 四字评语」。星级用 ★/☆ 渲染，例如 4 星为 ★★★★☆。
7. 吉语：毛笔字体，居中，「今日吉语：{句}。」
8. 主按钮：「查询模型今日宜忌」→ `/query?date=...`。
9. 页脚声明。

#### 4.1.2 交互

- 前一天/后一天：日期 ±1 天，主题、农历、宜忌、运势全部重算；使用 `replace` 更新 URL。
- 日期选择器：原生 `<input type="date">`，改变后立即重算。
- 「回今日」：回到本地今天；若已是今天则按钮为禁用态。
- CTA：跳转查询页并带当前日期。
- 首页不出现加载态；所有数据同步计算。

#### 4.1.3 文案状态

- 今日：`今日值神`、`今日吉语`、`查询模型今日宜忌`。
- 非今日：`当日值神`、`当日吉语`、`查询模型当日宜忌`。
- 周末：主题变红；宜/忌边框、按钮、星级、竖排字全部跟随主题色。

### 4.2 模型查询 `/query`

#### 4.2.1 结构

1. 顶部导航。
2. 页头：返回首页链接（保留日期）、标题「模型查询」、当前日期。
3. 查询控件：
   - 日期栏（同首页）。
   - 模型下拉：按厂商分组，默认 `Claude Sonnet 5.5`。
   - 主按钮「查询」。
4. 结果区（`aria-live="polite"`）：
   - 印章：大字「宜」/「平」/「忌」；宜用主题色，平用墨黑，忌用墨黑。
   - 模型名 + 厂商 + 状态徽标（预览）。
   - 判定语：宜「今日可用，宜做{最佳类别}」；平「可用，但宜守不宜攻」；忌「今日不宜，改日再试」。
   - 判词：2–3 句，引用该模型的最强项/最弱项。
   - 分项吉凶：写代码 / 写文章 / 翻译 / 查资料，各自显示「类别 + 宜/平/忌」。
   - 今日改用 / 备用模型：3 张卡片，每张「模型名 + {类别判定} · {最佳类别}」，预览模型带徽标。
   - 生成分享海报：本轮不做，不显示该按钮。
5. 页脚声明。

#### 4.2.2 交互

- 改变模型：结果即时重算（无需点「查询」也可），URL `model` 同步替换；「查询」按钮保留，用于显式提交和键盘操作。
- 改变日期：保留当前模型，结果重算。
- 分享链接：复制当前 `#/query?date=...&model=...`；本轮不做复制按钮，URL 本身可分享。
- 下拉选项按厂商分组，顺序见附录 A。
- 结果区高度变化时不做滚动跳跃；用容器最小高度减少抖动。

#### 4.2.3 状态文案

- 今日：`今日可用` / `今日不宜`；非今日：`当日可用` / `当日不宜`。
- 预览模型：模型名旁显示「预览」徽标；结果区底部提示「预览模型状态可能变化」。
- 免责声明常驻。

### 4.3 择日 `/pick`

#### 4.3.1 结构

1. 顶部导航。
2. 页头：返回首页链接（保留日期）、标题「择日」、当前日期。
3. 日期栏（同首页）。
4. 事项选择：「想做的事」+ 5 个 chip：发布新版本 / 写长文 / 面试备战 / 重构代码 / 让 AI 写周报；默认「发布新版本」。
5. 概览双栏：
   - 最宜：两个时辰 + 时间段。
   - 大忌：两个时辰 + 时间段。
6. 十二时辰网格：4 列 × 3 行（桌面），3 列 × 4 行（移动）；每格「地支字 + 吉/平/凶 + 时间段 + 一句建议」。
7. 判词：`{今日/当日}最宜{a}、{b}；大忌{c}、{d}。` + 事项宜忌清单。
8. 页脚声明。

#### 4.3.2 交互

- 切换事项：十二时辰评分、最宜/大忌、判词、清单全部重算；URL `activity` 同步。
- 改变日期：保留当前事项，全部重算。
- 时辰格子不可点击（本轮不做时辰详情页）；用 `aria-label` 提供完整朗读文本。
- 结果区 `aria-live="polite"`。

### 4.4 共用组件

| 组件 | 职责 |
|---|---|
| `AppShell` | 顶部导航、主题作用域、页脚声明 |
| `TopNav` | 品牌 + 三页链接，保留日期参数 |
| `DateBar` | 前后一天、日期显示、日期选择器、回今日、越界提示 |
| `AlmanacHeader` | 报头：品牌、年月、大数字、竖排字、回历、农历、星期 |
| `FateGrid` | 值神/五行/冲/煞四格 |
| `YiJiPanels` | 宜/忌双栏 |
| `FortuneGrid` | 四项运势 |
| `VerdictSeal` | 宜/平/忌印章 |
| `HourGrid` | 十二时辰网格 |
| `ModelSelect` | 按厂商分组的模型下拉 |
| `Disclaimer` | 页脚声明 |

### 4.5 响应式

| 断点 | 规则 |
|---|---|
| `≥ 1024px` | 内容最大宽 1280px，左右留白；大数字 500px；宜/忌 96px 字；运势 4 列；时辰 4 列 |
| `640–1023px` | 大数字 360px；宜/忌仍双栏但字号降为 72px；运势 2×2；时辰 3 列 |
| `< 640px` | 单列；大数字 240px；宜/忌上下堆叠，96px 字降为 64px；竖排字改为横排小字或隐藏；运势 2×2；时辰 3 列；日期栏换行 |

- 移动端触控目标不小于 44×44px。
- 所有网格使用 `min-width: 0` 防止长模型名撑破。

### 4.6 文案与空态

- 不出现「加载中」「无数据」；计算是同步的。
- 日期越界只显示一行提示，不阻断页面。
- 模型名过长时允许换行，不截断关键信息。

### 4.7 页脚声明

三个页面统一显示：

> 仅供娱乐，非评测结论 · 模型名称与商标归各自权利人所有 · 农历数据由 lunar-javascript 推算 · 首页「忌」为相对提醒，具体以查询页判定为准

- 字号 12–13px，墨黑色，居中或左对齐，随页面主题不变。
- 不链接到独立关于页（本轮不做）。

## 5. 规则引擎

### 5.1 确定性与哈希

- 规则版本常量：`RULESET_VERSION = "2026.11.1"`。
- 哈希：FNV-1a 32 位，输入 UTF-8 字符串，输出 uint32。
- 随机源：`mulberry32(seed)`，只用于生成稳定的伪随机序列。
- 种子格式：

```
RULESET_VERSION|YYYY-MM-DD|model:{modelId}|category:{categoryKey}
RULESET_VERSION|YYYY-MM-DD|pick:{activityId}|branch:{branch}
RULESET_VERSION|YYYY-MM-DD|deity
RULESET_VERSION|YYYY-MM-DD|clash
RULESET_VERSION|YYYY-MM-DD|taboo
RULESET_VERSION|YYYY-MM-DD|fortunes
RULESET_VERSION|YYYY-MM-DD|aphorism
RULESET_VERSION|YYYY-MM-DD|model:{modelId}|judgment
```

- 领域层禁止使用 `Math.random()`、`Date.now()`、网络、locale 相关的数字格式（`Intl.NumberFormat` 除外，且仅用于展示）。
- 工具函数：
  - `random(seed)` 返回 [0, 1)。
  - `jitter(seed, min, max) = min + floor(random(seed) × (max - min + 1))`。
  - `pickOne(seed, arr) = arr[floor(random(seed) × arr.length)]`。
  - `shuffle(seed, arr)` 用 Fisher–Yates，随机源为 `mulberry32(seed)`。
- 同一天同一模型重复调用 100 次，结果必须完全一致。
- 跨天日期键变化，所有带日期种子的字段随之变化。

### 5.2 日历层

使用 `lunar-javascript`：

```ts
const solar = Solar.fromYmd(year, month, day);
const lunar = solar.getLunar();

lunar.getYearInGanZhi();      // 丙午
lunar.getMonthInChinese();    // 九
lunar.getDayInChinese();      // 廿四
lunar.getDayNaYin();          // 白蜡金
lunar.getDayYi();             // string[]
lunar.getDayJi();             // string[]
lunar.getDayTianShenType();   // 黄道 / 黑道
```

派生字段：

- 农历显示：`农历{年干支}年　{lunarMonth}月{lunarDay}`；闰月保留「闰」字。
- 公历显示：`公历 {month} 月 {day} 日`。
- 五行：取纳音字符串中第一个「金木水火土」字符；后缀映射：
  - 金 → `算力旺`
  - 木 → `上下文生`
  - 水 → `灵感流`
  - 火 → `并发旺`
  - 土 → `缓存稳`
- 英文星期：`MONDAY`…`SUNDAY`。
- 公历月份英文：`JANUARY`…`DECEMBER`。
- 公历月份中文：`Intl.DateTimeFormat('zh-CN', { month: 'long' })`，用于报头「十一月」。

回历：

```ts
new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
}).formatToParts(date);
```

- 拉丁月名转大写，例如 `JAMADILAWAL 1448`。
- 拉丁月名按固定表转写，避免不同浏览器返回 `Jumada I` 之类的缩写：
  `Muharram, Safar, Rabi al-Awwal, Rabi al-Thani, JAMADILAWAL, JAMADILAKHIR, Rajab, Shaban, Ramadan, Shawwal, Dhu al-Qadah, Dhu al-Hijjah`。
  月 5/6 采用设计稿的 `JAMADILAWAL` / `JAMADILAKHIR` 拼写；优先用 `formatToParts` 取得月份序号后查表，只能拿到月名时用月名映射。
- 阿拉伯月名用 `Intl.DateTimeFormat('ar-u-ca-islamic-umalqura', { month: 'long' })`。
- 若 `islamic-umalqura` 抛错，回退 `islamic`；两者都失败时隐藏回历区块，不影响其他内容。
- 回历仅用于展示，不参与评分。

### 5.3 传统宜忌词映射

- 输入：`lunar.getDayYi()` 与 `lunar.getDayJi()`。
- 查表：附录 B 的 50 条映射。
- 对 `getDayYi()` 的每一项，取「宜（AI 行动）」；对 `getDayJi()` 的每一项，取「忌（AI 行动）」。
- 查不到的项跳过。
- 宜映射最多取 8 条，忌映射最多取 6 条；按真实宜忌数组原顺序。
- 映射结果去重；与模型专属条目重复时优先保留模型专属条目。
- 映射为空时，完全由模型专属与通用词库填充。

### 5.4 模型评分

能力维度：`reasoning / coding / writing / research / speed / value / multimodal`，取值 1–5。

类别权重：

| 类别 | 键 | 权重 |
|---|---|---|
| 写代码 | `code` | 编程 0.5、推理 0.3、速度 0.1、性价比 0.1 |
| 写文章 | `writing` | 写作 0.5、资料 0.2、推理 0.2、速度 0.1 |
| 翻译 | `translation` | 写作 0.4、资料 0.3、推理 0.2、速度 0.1 |
| 查资料 | `research` | 资料 0.45、推理 0.25、速度 0.15、性价比 0.15 |

单类别得分：

```
base = Σ(trait × weight) × 20          // 20–100
luck = jitter(seed(model, category), -6, +6)
score = clamp(round(base + luck), 0, 100)
```

综合得分：

```
overall = round(
  code × 0.30 +
  writing × 0.25 +
  translation × 0.20 +
  research × 0.25
)
```

判定阈值（类别与综合共用）：

```
score >= 75  → 宜
60 <= score < 75 → 平
score < 60   → 忌
```

- 首页最佳模型 = 综合分最高；最差模型 = 综合分最低。
- 平分时按附录 A 的模型顺序稳定取第一个。
- 最强项 = 能力分最高的维度；并列时按 `reasoning → coding → writing → research → speed → value → multimodal` 取第一个。
- 最弱项 = 能力分最低的维度；并列规则同上。

### 5.5 首页生成

输出 `DayAlmanac`：

1. 计算 34 款模型的综合分，得到 `bestModel`、`worstModel`。
2. 宜标题：`使用 {bestModel.name}`。
3. 忌标题：`忌用 {worstModel.name}`。
4. 模型专属宜条目：
   - 对四个类别分别取最高分模型（去重），生成 `使用 {model.name} {动作}`。
   - 动作映射：写代码→做代码审查、写文章→写长文、翻译→做翻译、查资料→做资料检索。
   - 最多 4 条；最佳模型已在标题出现，不强制重复。
5. 模型专属忌条目：
   - `使用 {worstModel.name} 硬扛{最弱项对应的任务}`。
   - 最弱项到任务映射：推理→长推理、编程→大重构、写作→长文、资料→深调研、速度→实时任务、性价比→大批量、多模态→读图。
6. 真实黄历映射条目：附录 B 结果，宜最多 8 条、忌最多 6 条。
7. 通用词库：对附录 C 的宜/忌池做种子洗牌，补足到宜 18 条、忌 15 条。
8. 合并顺序：标题 → 模型专属 → 真实黄历映射 → 通用词库；逐条去重；标题必须在第一位；合并后超过 18/15 上限时按顺序截断。
9. 值神、冲、煞：各自从附录 C 的池中按日期种子取一项，带一句判词。
10. 四项运势：
    - 基础星级 = `1 + hash(date|fortunes|{key}) % 5`。
    - 黄道日：提示词运势 +1、调试运势 +1、幻觉风险 −1。
    - 黑道日：提示词运势 −1、调试运势 −1、幻觉风险 +1。
    - 结果钳制在 1–5。
    - 评语按星级从附录 C 的词表取。
11. 吉语：从附录 C 的吉语池按日期种子取一项。
12. 主题：周六/周日为 `red`，其余为 `green`。
13. 回历、农历、干支、五行、星期按 5.2 生成。

### 5.6 查询生成

输出 `ModelReading`：

1. 目标模型与日期的四个类别得分、判定。
2. 综合分与判定。
3. 最强项、最弱项。
4. 替代模型：其余模型按综合分降序，取前 3；每款的推荐理由为「{该类别判定} · {该模型最高类别}」，例如「宜 · 写代码」「平 · 查资料」。
5. 判词：
   - 先算替代模型，再生成判词，保证「改用 X」有值。
   - 模板池按判定分组，每组 3 条；用 `hash(date|model|judgment) % 3` 选一条。`dayWord` 在所选日期为今天时取「今日」，否则取「当日」。
   - 宜模板：
     - `{最强项}正利，宜攻难活。先列计划，再动手。`
     - `锋刃正利，宜做{最佳类别}。留好回滚，再加速。`
     - `{dayWord}手顺，宜把最难的一段交给 {模型名}。`
   - 平模板：
     - `不疾不徐，宜做熟活。新领域先小试。`
     - `中平之日，宜整理、宜补测试、宜复盘。`
     - `{最弱项}稍弱，重要判断请自己复核。`
   - 忌模板：
     - `{最弱项}未稳，凡事须自行核对。`
     - `{dayWord}不宜硬攻，宜拆小、宜求证、宜早收。`
     - `锋芒不显，改用{替代模型名}或明日再试。`
6. 判定语：
   - 计算 `topYiCategory`：优先取判定为「宜」的类别中得分最高者；没有「宜」类别时取得分最高的类别。
   - 宜：`{今日/当日}可用，宜做{topYiCategory.label}`。
   - 平：`可用，但宜守不宜攻`。
   - 忌：`{今日/当日}不宜，改日再试`。
7. 输出模型状态 `ga / preview`，预览模型在 UI 显示徽标。

### 5.7 择日生成

输出 `PickDayReading`：

1. 十二地支固定顺序：子、丑、寅、卯、辰、巳、午、未、申、酉、戌、亥。
2. 每个地支对应时间段：

| 地支 | 时段 | 别名 |
|---|---|---|
| 子 | 23–1 时 | 夜半 |
| 丑 | 1–3 时 | 鸡鸣 |
| 寅 | 3–5 时 | 平旦 |
| 卯 | 5–7 时 | 日出 |
| 辰 | 7–9 时 | 食时 |
| 巳 | 9–11 时 | 隅中 |
| 午 | 11–13 时 | 日中 |
| 未 | 13–15 时 | 日昳 |
| 申 | 15–17 时 | 哺时 |
| 酉 | 17–19 时 | 日入 |
| 戌 | 19–21 时 | 黄昏 |
| 亥 | 21–23 时 | 人定 |

3. 事项权重：每个事项有 12 个 1–5 的亲和度值，见附录 C。
4. 单时辰得分：

```
base = weight × 20
luck = jitter(seed(activity, branch), -8, +8)
score = clamp(round(base + luck), 0, 100)
```

5. 排名分配：
   - 按得分降序排序；平分按地支顺序。
   - 前 3 名 → 吉。
   - 后 5 名 → 凶。
   - 其余 4 名 → 平。
   - 固定得到 3 吉、4 平、5 凶。
6. 最宜 = 得分最高的 2 个时辰，按得分降序。
7. 大忌 = 得分最低的 2 个时辰，按得分升序。
8. 每个时辰的建议 = `{地支基础建议}；{事项动作}`，见附录 C。
9. 判词：`{今日/当日}最宜{a}、{b}；大忌{c}、{d}。` + 事项宜忌清单。时辰名显示为「{branch}时」；子时在概览中显示为「夜半」，与时段的别名一致。
10. 十二时辰按子→亥的时间顺序输出，不按得分排序。

### 5.8 输出契约

```ts
type Verdict = '宜' | '平' | '忌';
type HourVerdict = '吉' | '平' | '凶';
type ModelStatus = 'ga' | 'preview';
type Theme = 'green' | 'red';

interface Traits {
  reasoning: number;
  coding: number;
  writing: number;
  research: number;
  speed: number;
  value: number;
  multimodal: number;
}

interface Model {
  id: string;
  name: string;
  vendor: string;
  vendorKey: string;
  positioning: string;
  status: ModelStatus;
  traits: Traits;
}

interface DayAlmanac {
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

interface ModelReading {
  dateKey: string;
  model: Model;
  overall: { score: number; verdict: Verdict };
  categories: Array<{ key: string; label: string; score: number; verdict: Verdict }>;
  topTrait: string;
  lowTrait: string;
  judgment: string;
  verdictText: string;
  alternatives: Array<{ model: Model; score: number; reason: string }>;
}

interface HourCell {
  branch: string;
  alias: string;
  time: string;
  score: number;
  verdict: HourVerdict;
  advice: string;
}

interface PickDayReading {
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

## 6. 数据模型

### 6.1 模型清单

- 共 34 款，完整表见附录 A。
- 字段：`id`、`name`、`vendor`、`vendorKey`、`positioning`、`status`、`traits`。
- `vendorKey` 用于下拉分组，顺序为：
  `anthropic → openai → google → xai → meta → mistral → deepseek → alibaba → moonshot → zhipu → minimax → xiaomi → bytedance → baidu → tencent → iflytek → stepfun → sensetime`。
- 默认模型：`claude-sonnet-5-5`。
- 能力分是编辑主观设定，不来自官方 benchmark；页面与 spec 都必须保留「非评测」声明。
- 表中的 `id` 是本站内部标识，不保证与厂商 API 的 model id 完全一致；路由与代码只使用本站 id。

### 6.2 事项

| id | 名称 | 说明 |
|---|---|---|
| `release` | 发布新版本 | 上线、灰度、回滚 |
| `writing` | 写长文 | 长文、报告、文档 |
| `interview` | 面试备战 | 项目梳理、模拟追问 |
| `refactor` | 重构代码 | 大结构、补测试、迁移 |
| `weekly` | 让 AI 写周报 | 汇总、压缩、归档 |

### 6.3 派生文案

- 模型最强/最弱项显示名：推理、编程、写作、资料、速度、性价比、多模态。
- 类别显示名：写代码、写文章、翻译、查资料。
- 预览模型徽标：`预览`。
- 首页忌栏口径：表达「相对不宜」，不承诺该模型在查询页一定判忌；页脚声明写明「首页忌为相对提醒，具体以查询页判定为准」。

## 7. 视觉规范

### 7.1 色彩

| 变量 | 值 | 用途 |
|---|---|---|
| `--paper` | `#FAF9F5` | 页面背景 |
| `--ink` | `#1A1A1A` | 正文、忌栏、忌印章 |
| `--green` | `#009640` | 平日大数字、大色块 |
| `--green-deep` | `#00742F` | 平日正文、边框、标题 |
| `--red` | `#C0281C` | 周末主题色 |
| `--white` | `#FFFFFF` | 反白文字、按钮激活态 |
| `--accent` | 主题变量 | 平日 `#00742F`，周末 `#C0281C` |
| `--accent-strong` | 主题变量 | 平日 `#009640`，周末 `#C0281C` |

- 大数字用 `--accent-strong`；正文与边框用 `--accent`。
- 周末所有主题色切换为红色；忌栏保持墨黑。
- 不使用渐变、阴影堆叠、玻璃拟态；保持纸面印刷感。

### 7.2 字体

| 用途 | 字体栈 |
|---|---|
| 中文标题/正文 | `'Noto Serif SC','Source Han Serif SC','Songti SC','SimSun',serif` |
| 中文小字/标签 | `'Noto Sans SC','PingFang SC','Microsoft YaHei',sans-serif` |
| 大数字 | `'Abril Fatface','Playfair Display','Didot','Bodoni 72',serif` |
| 拉丁小标 | `'Libre Caslon Text','Century Schoolbook','Times New Roman',serif` |
| 毛笔竖排/吉语 | `'Ma Shan Zheng','KaiTi','STKaiti',serif` |
| 阿拉伯文 | `'Noto Naskh Arabic',serif` |

- Google Fonts 通过 `<link>` 加载，`display=swap`；断网时使用系统回退。
- 中文正文行高 1.55–1.7；大数字行高 0.9。

### 7.3 版式

- 桌面内容最大宽 1280px，页面背景 `--paper`，无外层卡片阴影。
- 主要分隔线：`3px double var(--accent)`；内部边框：`1px solid var(--accent)`。
- 宜/忌面板：双层描边（`border` + `outline` + 负 offset），内边距 20px，大字 96px。
- 四格与运势格：1px 边框，12–16px 内边距，无圆角。
- 按钮：透明底、1px 主题色边框、主题色文字；悬停反白；禁用态 40% 透明度。
- Chip：1px 主题色边框；激活态主题色实底 + 白字。
- 不使用卡片阴影；必要时用 1px 线分隔。

### 7.4 组件状态

- 印章：宜 = 主题色双线框；平 = 墨黑单线框；忌 = 墨黑双线框。
- 时辰格：吉 = 主题色实底 + 白字；平 = 白底 + 墨黑字；凶 = 墨黑实底 + 白字。与设计稿的「吉绿、平白、凶墨黑」一致。
- 链接：主题色下划线，`text-underline-offset: 4px`。
- 焦点：`outline: 2px solid var(--accent); outline-offset: 3px`。
- 错误/提示：墨黑小字，不用红色错误条，避免与周末主题混淆。

### 7.5 动效与可访问性

- 结果更新时印章做 180ms 的 `opacity + scale(0.96→1)`；`prefers-reduced-motion: reduce` 时关闭。
- 不做持续动画、粒子、视差。
- 颜色不是唯一信息：吉/平/凶同时有文字。
- 表单控件都有可见 label；下拉用 `<select>` + `<optgroup>`；日期用原生 `<input type="date">`。
- 结果区用 `aria-live="polite"`；时辰格用 `aria-label` 拼接完整信息。
- 移动端触控目标 ≥ 44px。
- 正文对比度：`#00742F` / `#C0281C` 在 `#FAF9F5` 上均满足 WCAG AA；大数字 `#009640` 仅用于大字号。

## 8. 技术架构

### 8.1 技术栈

- Vite + React + TypeScript。
- `react-router-dom` 的 `HashRouter`。
- `lunar-javascript`。
- Vitest + React Testing Library + jsdom。
- 不使用 UI 库、CSS-in-JS、状态管理库；页面局部状态用 `useState/useMemo`。

### 8.2 目录

```
ailaohuangli/
  index.html
  package.json
  tsconfig.json
  vite.config.ts
  docs/superpowers/specs/2026-11-02-ai-almanac-design.md
  src/
    main.tsx
    App.tsx
    styles/
      tokens.css
      app.css
    domain/
      types.ts
      hash.ts
      date.ts
      lunar.ts
      models.ts
      mappings.ts
      pools.ts
      scoring.ts
      almanac.ts
      modelReading.ts
      pickDay.ts
    components/
      AppShell.tsx
      TopNav.tsx
      DateBar.tsx
      AlmanacHeader.tsx
      FateGrid.tsx
      YiJiPanels.tsx
      FortuneGrid.tsx
      VerdictSeal.tsx
      HourGrid.tsx
      ModelSelect.tsx
      Disclaimer.tsx
    pages/
      HomePage.tsx
      QueryPage.tsx
      PickDayPage.tsx
    test/
      setup.ts
      hash.test.ts
      almanac.test.ts
      modelReading.test.ts
      pickDay.test.ts
      pages.test.tsx
```

### 8.3 状态与路由

- 日期、模型、事项全部来自 URL；页面不另存全局状态。
- `useSearchParams` 读取参数并做校验；非法值回退缺省值。
- 日期计算集中在 `domain/date.ts`，避免各页面重复。
- 页面通过 `useMemo` 缓存生成结果，依赖为 `dateKey`、`modelId` 或 `activityId`。

### 8.4 字体与离线

- Google Fonts 是唯一运行时外部请求；其余资源本地打包。
- 字体加载失败不阻塞内容；回退到系统宋体/黑体/楷体。
- 不引入字体 CDN 的 JS 脚本。

### 8.5 错误处理

- URL 参数非法：静默回退，不显示错误页。
- 日期越界：钳制 + 一行提示。
- 回历不可用：隐藏回历区块。
- 模型/事项查找失败：回退默认值。
- 领域函数不抛异常；边界输入在入口收窄后向内传递。

### 8.6 npm 脚本

| 脚本 | 命令 | 用途 |
|---|---|---|
| `dev` | `vite` | 本地开发 |
| `build` | `tsc -b && vite build` | 类型检查 + 生产构建 |
| `preview` | `vite preview` | 预览构建产物 |
| `typecheck` | `tsc --noEmit` | 只做类型检查 |
| `test` | `vitest run` | 单元与组件测试 |
| `test:watch` | `vitest` | 监听模式 |

`vite.config.ts` 同时配置 Vitest：`environment: 'jsdom'`、`setupFiles: './src/test/setup.ts'`；`setup.ts` 引入 `@testing-library/jest-dom`。

## 9. 测试与验收

### 9.1 单元测试

- `hash`：同一输入多次一致；不同日期/模型/类别变化。
- `date`：本地日期键不受时区影响；跨月、跨年正确。
- `lunar`：
  - 2026-11-02：干支 `丙午`、农历月 `九`、农历日 `廿四`、纳音含 `金`、值神类型 `黄道`。
  - 2026-11-08：农历日 `三十`、星期日、`isWeekend === true`。
  - 真实忌含 `开市`，映射后忌条目包含 `仓促上线`。
- `models`：34 条、id 唯一、name 唯一、traits 均为 1–5、status 合法。
- `scoring`：类别权重和为 1；综合权重和为 1；阈值边界 59/60/74/75 正确。
- `almanac`：
  - 宜 18 条、忌 15 条、无重复、标题在第一位。
  - 同日重复调用 100 次完全一致。
  - 不同日期至少有一个字段变化。
  - 2026-11-02 主题 green，2026-11-08 主题 red。
- `modelReading`：
  - 34 款模型都能生成 4 个类别、合法判定、0–100 分数。
  - 替代模型不含自身、数量为 3。
  - 同日同模型重复一致。
- `pickDay`：
  - 5 个事项均为 3 吉、4 平、5 凶。
  - 最宜/大忌各 2 个，且属于对应判定。
  - 12 个时辰顺序为子→亥，无重复。

### 9.2 组件测试

- 首页渲染日期、农历、宜/忌、运势；点「后一天」日期与内容更新。
- 2026-11-08 首页使用红色主题类名。
- 查询页默认 Sonnet；切换模型后判定变化；URL `model` 同步。
- 查询页非法 `model` 回退默认。
- 择日页默认 `release`；切换 chip 后网格变化；URL `activity` 同步。
- 三页导航保留 `date`。
- 结果区有 `aria-live`，时辰格有 `aria-label`。

### 9.3 视觉核对

- `npm run dev` 启动。
- 桌面 1280×1400：首页、查询、择日各截图一次，检查字体、双线框、宜/忌、十二时辰网格无溢出。
- 设计稿 2026-11-02 的文案作为视觉参考；农历、五行、主题必须一致，具体值神/冲/煞/宜忌条目由规则生成，不要求逐字相同。
- 移动 390×1500：首页与择日各截图一次，检查大数字、双栏堆叠、日期栏换行。
- 周末日期 2026-11-08：检查红色主题与忌栏墨黑。
- 若浏览器工具不可用，需在最终报告中明确说明「未做浏览器视觉核对」。

### 9.4 验收清单

- [ ] `npm run build` 成功。
- [ ] `npm run typecheck` 成功。
- [ ] `npm run test` 全部通过。
- [ ] `/`、`/query`、`/pick` 三页可访问，URL 参数可分享。
- [ ] 同一天刷新两次，内容完全一致。
- [ ] 2026-11-02 显示「丙午年 九月廿四」，绿色主题。
- [ ] 2026-11-08 显示「星期日」，红色主题。
- [ ] 34 款模型均可选、可出结果。
- [ ] 5 个事项均满足 3 吉、4 平、5 凶。
- [ ] 页脚声明可见：仅供娱乐、非评测、商标归属、首页忌为相对提醒。
- [ ] 断网时内容仍可读（字体回退）。

## 10. 风险与维护

### 10.1 风险

| 风险 | 影响 | 应对 |
|---|---|---|
| 模型清单变化快 | 预览模型转 GA、模型下架 | 清单集中在 `models.ts`；更新时同步升 `RULESET_VERSION` |
| 能力分为主观值 | 用户误当评测 | 页面声明、spec 声明、判词用「宜/忌」而非「强/弱」 |
| 真实宜忌词覆盖面 | 某些日期映射为空 | 通用词库兜底；映射表可持续补充 |
| 回历 Intl 差异 | 月名格式不一致 | `islamic-umalqura` → `islamic` → 隐藏 |
| 农历库范围 | 超出 1900–2100 | UI 限制 1901–2099，越界钳制 |
| Google Fonts 不可达 | 字体回退，观感下降 | 系统字体栈；不阻塞内容 |
| 周末主题与忌色冲突 | 红色主题下忌栏不明显 | 忌栏强制墨黑，不跟主题 |

### 10.2 更新规则

- 改动模型表、映射表、权重、阈值、文案池任一内容，必须升 `RULESET_VERSION` 并更新测试期望。
- 只改样式或页面布局，不动规则版本。
- 新增模型时同步更新附录 A、厂商分组顺序、模型数量断言（34 → 新数量）。

## 附录 A：模型清单（34 款）

能力分顺序：推理/编程/写作/资料/速度/性价比/多模态，均为 1–5 的编辑主观值。

### A.1 国际阵营（13 款）

| id | 模型 | 厂商 | 定位 | 状态 | 能力分 |
|---|---|---|---|---|---|
| `claude-fable-5-1` | Claude Fable 5.1 | Anthropic | 最强推理、长程代理 | ga | 5/5/4/5/2/2/4 |
| `claude-opus-5-5` | Claude Opus 5.5 | Anthropic | 长程编码、知识工作 | ga | 5/5/5/4/3/2/4 |
| `claude-sonnet-5-5` | Claude Sonnet 5.5 | Anthropic | 速度与智能均衡 | ga | 4/4/5/4/4/3/4 |
| `claude-haiku-5-5` | Claude Haiku 5.5 | Anthropic | 高并发、低延迟 | ga | 3/3/3/3/5/5/3 |
| `gpt-6-astra` | GPT-6 Astra | OpenAI | 旗舰档（高价） | ga | 5/5/5/5/2/1/5 |
| `gpt-6.1-terra` | GPT-6.1 Terra | OpenAI | 旗舰、视觉推理 | ga | 5/5/4/4/3/2/5 |
| `gpt-5.6-sol` | GPT-5.6 Sol | OpenAI | 通用、写作分析 | ga | 4/4/5/5/4/3/4 |
| `gpt-6-luna` | GPT-6 Luna | OpenAI | GPT-6 低价档 | ga | 3/3/3/3/4/5/3 |
| `gemini-4-argon` | Gemini 4 Argon | Google | 复杂编码、数学、科学 | ga | 5/5/4/5/3/2/5 |
| `gemini-3.8-flash` | Gemini 3.8 Flash | Google | 高智能 Flash、长程工程 | ga | 4/4/3/4/5/4/4 |
| `grok-4.7` | Grok 4.7 | xAI | 编码、知识工作、实时 | ga | 5/5/4/4/4/3/3 |
| `muse-spark-1.3` | Muse Spark 1.3 | Meta | 长程编码、Agent | ga | 4/5/3/3/4/4/3 |
| `mistral-large-4` | Mistral Large 4 | Mistral | 欧洲旗舰、多模态 | preview | 4/4/4/4/3/3/5 |

### A.2 国内阵营（21 款）

| id | 模型 | 厂商 | 定位 | 状态 | 能力分 |
|---|---|---|---|---|---|
| `deepseek-v4-pro` | DeepSeek V4 Pro | DeepSeek | 高能力旗舰 | ga | 5/4/3/3/3/4/1 |
| `deepseek-v4.1-flash` | DeepSeek V4.1 Flash | DeepSeek | 快速低价、视觉 | ga | 4/4/3/3/5/5/3 |
| `qwen3.8-max` | Qwen 3.8 Max | 阿里云 | 复杂推理与编程 | ga | 4/5/4/4/4/4/3 |
| `qwen3.7-plus` | Qwen 3.7 Plus | 阿里云 | 性能/速度/成本均衡 | ga | 4/4/4/4/4/4/3 |
| `qwen3.8-flash` | Qwen 3.8 Flash | 阿里云 | 快速低成本 | ga | 3/4/3/3/5/5/3 |
| `kimi-k3.1-pro` | Kimi K3.1 Pro | 月之暗面 | 旗舰、长文、视觉 | ga | 4/4/5/5/3/3/4 |
| `kimi-k3` | Kimi K3 | 月之暗面 | 开源旗舰、长程 | ga | 4/4/5/5/3/3/4 |
| `kimi-k2.7-code` | Kimi K2.7 Code | 月之暗面 | 编码专用 | ga | 3/5/2/2/4/4/2 |
| `glm-5.3` | GLM-5.3 | 智谱 | 编程、Agent、开源 | ga | 4/5/3/3/4/4/3 |
| `glm-5.3-flash` | GLM-5.3-Flash | 智谱 | 多模态、高效 | ga | 4/4/3/3/5/5/4 |
| `minimax-m3` | MiniMax M3 | MiniMax | 前沿编码、1M、多模态 | ga | 4/5/3/4/3/4/4 |
| `minimax-m3.1-flash` | MiniMax M3.1 Flash | MiniMax | Agent/Coding 轻量 | ga | 4/5/3/3/5/5/4 |
| `mimo-v2.6-pro` | MiMo V2.6 Pro | 小米 | 推理优先、开源 | ga | 4/4/3/3/4/4/2 |
| `mimo-v2.6-flash` | MiMo V2.6 Flash | 小米 | 轻量低成本 | ga | 3/3/3/3/5/5/2 |
| `doubao-seed-evolving` | Doubao-Seed-Evolving | 字节跳动 | 旗舰、多模态、Agent | ga | 4/5/4/4/4/4/4 |
| `doubao-seed-2.1-pro` | Doubao-Seed-2.1-Pro | 字节跳动 | Pro 档通用 | ga | 4/4/4/4/4/4/4 |
| `ernie-5.1` | ERNIE 5.1 | 百度 | 全模态、知识、深度搜索 | ga | 4/4/4/4/3/4/4 |
| `hunyuan-hy4` | Hunyuan Hy4 | 腾讯 | 770B/1M、生产力 | preview | 4/4/3/3/3/4/3 |
| `spark-x2` | Spark X2 | 科大讯飞 | 自主可控、推理 | ga | 3/3/3/3/4/4/3 |
| `step-5` | Step 5 | 阶跃星辰 | 旗舰基模、真实任务 | preview | 4/4/3/4/4/4/3 |
| `sensenova-6.8-flash-lite` | SenseNova 6.8 Flash Lite | 商汤 | 轻量多模态 Agent | ga | 3/4/3/3/5/5/4 |

## 附录 B：传统宜忌词映射（50 条）

映射是编辑创作，不是对传统黄历的学术解释。左列为 `lunar-javascript` 可能返回的词，中/右列为 AI 行动短语。

| 传统词 | 宜（AI 行动） | 忌（AI 行动） |
|---|---|---|
| 祭祀 | 先对齐目标 | 跳过需求确认 |
| 祈福 | 列可验收的目标 | 空喊目标 |
| 开光 | 补系统提示词 | 提示词含糊 |
| 出行 | 换一个模型试试 | 频繁换模型 |
| 移徙 | 迁移工具链 | 迁移到一半 |
| 入宅 | 接入新工作流 | 并行两套流程 |
| 安床 | 固定一条系统提示词 | 每天换设定 |
| 修造 | 重构代码 | 大爆炸式重构 |
| 动土 | 改底层架构 | 无回滚改架构 |
| 破屋 | 删除废弃代码 | 在旧代码上叠补丁 |
| 坏垣 | 拆掉坏抽象 | 继续扩大坏抽象 |
| 开市 | 发布新版本 | 仓促上线 |
| 交易 | 批量处理文档 | 无核对批量处理 |
| 纳财 | 用 Token 做批处理 | 无预算烧 Token |
| 嫁娶 | 绑定新依赖 | 仓促引入依赖 |
| 订盟 | 定接口契约 | 口头约定 |
| 立券 | 写测试用例 | 无测试合并 |
| 纳采 | 收集需求 | 需求不清就开工 |
| 会亲友 | 组织评审会 | 跳过评审 |
| 求医 | 解释报错 | 不看日志就问 |
| 治病 | 修复 bug | 带病上线 |
| 解除 | 清理上下文 | 把旧上下文带进新任务 |
| 沐浴 | 整理会话 | 在脏会话里继续 |
| 栽种 | 培养新习惯 | 三天打鱼 |
| 牧养 | 维护模型配置 | 配置漂移 |
| 盖屋 | 搭脚手架 | 没骨架就堆功能 |
| 竖柱 | 立项目骨架 | 目录结构混乱 |
| 上梁 | 合并主干 | 长期不合并 |
| 起基 | 初始化仓库 | 无版本管理 |
| 掘井 | 挖历史日志 | 无日志猜原因 |
| 开池 | 建数据管道 | 管道无监控 |
| 放水 | 跑数据回填 | 回填无校验 |
| 经络 | 梳理调用链 | 跨层乱调 |
| 酝酿 | 做方案推演 | 拍脑袋选型 |
| 作灶 | 配 CI | 手动发布 |
| 造仓 | 建知识库 | 资料散落 |
| 平治道涂 | 清理技术债 | 债务滚雪球 |
| 修饰垣墙 | 补文档 | 文档过期 |
| 破土 | 启动调研 | 调研无结论 |
| 启钻 | 深挖根因 | 只修表象 |
| 移柩 | 迁移旧系统 | 新旧双写失控 |
| 入殓 | 归档旧项目 | 归档后还改 |
| 除服 | 下线旧服务 | 下线无通知 |
| 捕捉 | 抓 bug | 只复现不定位 |
| 结网 | 盖监控 | 无监控上线 |
| 塞穴 | 堵漏洞 | 漏洞只记录不修 |
| 断蚁 | 清理依赖 | 依赖无锁版本 |
| 馀事勿取 | 只做一件事 | 多线程开工 |
| 求嗣 | 培养新人 | 拔苗助长 |
| 纳畜 | 引入新工具 | 工具堆叠 |

## 附录 C：词库与文案

### C.1 值神池

| 值神 | 判词 |
|---|---|
| 上下文窗口 | 窗口有限，先给关键上下文 |
| 系统提示词 | 先定角色，再提问题 |
| 思维链 | 让它先推理，再下结论 |
| 工具调用 | 能用工具就别靠记忆 |
| 检索增强 | 先检索，再引用 |
| 温度参数 | 创意调高，事实调低 |
| 多轮记忆 | 长会话要复盘，别硬续 |
| 知识截止 | 新事实先核对，别问旧记忆 |

### C.2 冲池

| 冲 | 判词 |
|---|---|
| 超长对话 | 对话宜短，上下文宜清 |
| 含糊指令 | 一次说清目标与边界 |
| 多线程任务 | 同时开三个窗口就够了 |
| 无上下文提问 | 先给背景，再问问题 |
| 一次性大改 | 大改先拆成小步 |
| 盲信输出 | 输出要看，引用要核 |

### C.3 煞池

| 煞 | 判词 |
|---|---|
| 一次问十件事 | 一次只问一件事 |
| 盲信引用 | 链接点开再信 |
| 让 AI 自评 | 自己 review 才算数 |
| 深夜改生产 | 生产变更留到白天 |
| 跳过评审 | 再小的改动也过一眼 |
| 无日志排障 | 先看日志再猜原因 |

### C.4 运势评语

| 星级 | 提示词运势 | 幻觉风险 | Token 财运 | 调试运势 |
|---|---|---|---|---|
| 1 | 先写清楚 | 大体可信 | 省着点用 | 先睡一觉 |
| 2 | 少即是多 | 较为安全 | 小试即可 | 先看日志 |
| 3 | 中规中矩 | 引用须核 | 收支平衡 | 按图索骥 |
| 4 | 言简者吉 | 多处存疑 | 宜做长任务 | 报错易解 |
| 5 | 一字千金 | 务必求证 | 宜批量 | 一针见血 |

- 提示词运势、Token 财运、调试运势：星级越高越好。
- 幻觉风险：星级越高风险越高。

### C.5 吉语池

- 先给上下文，再提问题。
- 小步试，及时停。
- 让模型列计划，你来拍板。
- 引用要核，diff 要看。
- 一次只问一件事。
- 先备份，再让 AI 动手。
- 能复现，再谈修复。
- 长文先摘要，再细读。
- 把好提示词存下来。
- 模型是副驾，不是司机。

### C.6 通用宜池（18 条）

- 代码审查
- 长文改写
- 先复述需求
- 列计划再动手
- 让 AI 写测试
- 整理会议纪要
- 翻译润色
- 批量处理文档
- 校对引用
- 拆分大任务
- 写正则
- 解释报错
- 起草邮件
- 总结长文
- 对照两版方案
- 给足上下文
- 分步提问
- 留好版本记录

### C.7 通用忌池（16 条）

- 凌晨三点改生产
- 整本手册塞进对话
- 一次问十件事
- 盲信引用链接
- 让 AI 自评对错
- 未备份即覆盖
- 把密钥贴进对话
- 通宵争论
- 跳过评审直接合并
- 无日志就问原因
- 同时开七个窗口
- 不看 diff 直接接受
- 用模糊指令催大活
- 重复追问同一问题
- 把模型当搜索引擎
- 让轻量模型啃长推理

### C.8 事项数据

| 事项 | 十二时辰权重（子→亥） | 吉动作 | 平动作 | 凶动作 |
|---|---|---|---|---|
| 发布新版本 | 1,1,1,2,3,5,4,3,5,1,2,1 | 宜发布 | 宜灰度 | 忌上线 |
| 写长文 | 1,1,1,3,4,4,3,2,3,2,4,2 | 宜写长文 | 宜列提纲 | 忌硬写 |
| 面试备战 | 1,1,1,3,4,5,4,3,4,2,2,1 | 宜模拟面试 | 宜复习 | 忌临阵磨枪 |
| 重构代码 | 1,1,1,2,3,5,4,3,5,1,3,1 | 宜动大结构 | 宜补测试 | 忌大改 |
| 让 AI 写周报 | 1,1,1,2,3,4,3,2,4,3,5,3 | 宜生成周报 | 宜列事实 | 忌堆流水账 |

### C.9 地支基础建议

| 地支 | 基础建议 |
|---|---|
| 子 | 深夜，宜睡 |
| 丑 | 万籁俱寂 |
| 寅 | 困倦 |
| 卯 | 晨起 |
| 辰 | 宜列计划 |
| 巳 | 精力最盛 |
| 午 | 适合沟通 |
| 未 | 易困 |
| 申 | 适合收尾 |
| 酉 | 下班前 |
| 戌 | 宜写文档 |
| 亥 | 夜渐深 |

### C.10 事项宜忌清单

| 事项 | 宜 | 忌 |
|---|---|---|
| 发布新版本 | 先备份再发布、小步灰度、发布前让 AI 通读变更说明、留好回滚方案 | 下班前冲刺、深夜直接上线、跳过评审、无监控即发布 |
| 写长文 | 先列提纲、分节写、让 AI 只改一段、最后统一润色 | 一次生成全文、边写边改结构、跳过事实核对、深夜硬写 |
| 面试备战 | 先梳理项目、模拟追问、让 AI 出题、记录薄弱点 | 背模板、临阵换简历、只问不练、熬夜突击 |
| 重构代码 | 先补测试、小步替换、每步可回滚、让 AI 解释 diff | 大爆炸重写、无测试动刀、跳过评审、一次改到底 |
| 让 AI 写周报 | 先列事实、按项目归档、让 AI 压缩、人工补判断 | 流水账、夸大成果、漏掉风险、直接群发 |

## 附录 D：来源与核对时间

模型名称、状态与定位核对于 2026-11-02；预览模型的状态可能随时变化。

- Anthropic Models overview：https://platform.claude.com/docs/en/models/overview
- OpenAI API Pricing：https://developers.openai.com/api/docs/pricing
- Gemini API Changelog：https://ai.google.dev/gemini-api/docs/changelog
- xAI Models：https://docs.x.ai/developers/models
- Meta Model API：https://dev.meta.ai/
- Mistral Large 4：https://mistral.ai/news/mistral-large-4/
- DeepSeek API Pricing：https://api-docs.deepseek.com/quick_start/pricing
- 阿里云百炼模型列表：https://help.aliyun.com/zh/model-studio/models
- Kimi 模型列表：https://platform.kimi.com/docs/models
- 智谱模型发布记录：https://docs.bigmodel.cn/cn/update/new-releases
- MiniMax M3.1 Flash：https://www.minimax.cn/blog/minimax-m31f
- 小米 MiMo V2.6：https://mimo.mi.com/docs/zh-CN/news
- 豆包模型列表：https://docs.volcengine.com/docs/82379/1593703
- ERNIE Blog：https://ernie.baidu.com/blog/zh/
- 腾讯混元 Hy4 preview：https://hunyuan.tencent.com/research/hy4-preview
- 讯飞星火 X2：https://cn.wicinternet.org/2026-02/28/content_38619933.htm
- 阶跃星辰开放平台：https://platform.stepfun.com/
- 商汤日日新模型：https://www.sensenova.cn/models
- lunar-javascript：https://www.npmjs.com/package/lunar-javascript

## 附录 E：规则版本变更记录

| 版本 | 日期 | 变更 |
|---|---|---|
| `2026.11.1` | 2026-11-02 | 初版：34 款模型、真实黄历种子、三页交互、3/4/5 时辰分配 |
