// 聊天相关类型
import type { Dimension } from './index';

export type MessageRole = 'USER' | 'ASSISTANT' | 'SYSTEM';

export interface Citation {
  knowledgeId: string;
  title: string;
  snippet: string;
  score?: number;
}

/**
 * 六维结构化答案：把同一问题按 6 个维度分别给出精炼结论 + 展开
 * - 解决单一 Markdown 长文 "抓不住重点" 的痛点
 * - 让用户按维度跳转阅读，对标产品/算法/测试/合规不同岗位
 */
export interface SixDimensionAnswer {
  /** 顶层 TL;DR：3 句话以内 */
  tldr: string;
  /** 6 个维度分别给出的精炼答案 */
  dimensions: DimensionInsight[];
  /** 落地建议（行动清单） */
  actions: string[];
  /** 延伸阅读 / 知识图谱跳转 */
  related?: { label: string; to: string }[];
}

export interface DimensionInsight {
  dimension: Dimension;
  /** 该维度的核心结论（一行） */
  headline: string;
  /** 详细展开（2~4 行） */
  detail: string;
  /** 可选：关键名词解释 */
  terms?: { term: string; desc: string }[];
  /** 可选：该维度的置信度 0~1，用于展示 */
  confidence?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;                       // 兜底的 Markdown 全文（兼容旧数据）
  /** 六维结构化答案（可选） */
  structured?: SixDimensionAnswer;
  citations?: Citation[];
  followups?: string[];                  // 追问推荐
  isStreaming?: boolean;                 // 正在流式接收
  /** 回答来源：知识库命中 / 大模型兜底 */
  source?: 'KB' | 'LLM' | 'MOCK';
  /** 命中的知识库条目 id（KB 来源时） */
  knowledgeId?: string;
  createdAt: number;                     // timestamp
}

export interface Conversation {
  id: string;
  title: string;
  preview?: string;                       // 列表预览
  createdAt: number;
  updatedAt: number;
  messageCount?: number;
}

/**
 * 流式事件类型（与后端约定）
 * - 新增 'structure' 用于增量推送六维结构化答案
 */
export type StreamEvent =
  | { type: 'start';     messageId: string }
  | { type: 'delta';     text: string }
  | { type: 'citation';  citation: Citation }
  | { type: 'followup';  suggestions: string[] }
  | { type: 'structure'; answer: SixDimensionAnswer }
  | { type: 'done';      totalTokens?: number }
  | { type: 'error';     message: string };
