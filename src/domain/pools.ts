import type { HourVerdict, TraitKey } from './types';

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

export const YI_BY_TRAIT: Record<TraitKey, readonly string[]> = {
  reasoning: ['推理', '深思', '拆解'],
  coding: ['编码', '重构', '调试'],
  writing: ['撰文', '润色', '提纲'],
  research: ['检索', '考据', '查证'],
  speed: ['速办', '快查', '批跑'],
  value: ['降本', '省算', '比价'],
  multimodal: ['读图', '识图', '图译'],
};

export const JI_BY_TRAIT: Record<TraitKey, readonly string[]> = {
  reasoning: ['硬推', '跳步', '猜答'],
  coding: ['大改', '盲改', '堆码'],
  writing: ['硬写', '长文', '套话'],
  research: ['盲查', '盲信', '编引'],
  speed: ['催稿', '赶工', '通宵'],
  value: ['烧算', '堆料', '超支'],
  multimodal: ['盲图', '糊图', '乱传'],
};

export const YI_DAILY = [
  '提问',
  '复盘',
  '校对',
  '归档',
  '评审',
  '测试',
  '备份',
  '分工',
  '总结',
  '整理',
  '引用',
  '通读',
  '小步',
  '留痕',
] as const;

export const JI_DAILY = [
  '泄密',
  '越权',
  '幻觉',
  '跳评',
  '长聊',
  '乱问',
  '无备',
  '复制',
  '硬扛',
  '多开',
  '催更',
  '盲从',
  '裸奔',
  '省步',
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
