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
