/**
 * IMA 知识库 OpenAPI · 类型定义
 *
 * 与 Python 版本 (wrapper.py) 保持一致的形状，便于双端对照。
 */

export const IMA_API_BASE = 'https://ima.qq.com';

/** 笔记搜索类型 */
export enum NoteSearchType {
  TITLE = 0,
  CONTENT = 1,
}

/** 通用搜索结果（知识库 / 笔记 / 文件夹共用） */
export interface SearchResult<T = unknown> {
  items: T[];
  hasMore: boolean;
  nextCursor: string;
  raw: Record<string, unknown>;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  snippet: string;
  score: number;
  source: string;
  raw: Record<string, unknown>;
}

export interface NoteMeta {
  id: string;
  title: string;
  folderId: string;
  updatedAt: number;
  raw: Record<string, unknown>;
}

export interface NoteContent {
  id: string;
  title: string;
  content: string;
  raw: Record<string, unknown>;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string;
  raw: Record<string, unknown>;
}

/** 客户端可配项 */
export interface IMAClientOptions {
  baseUrl?: string;
  timeoutMs?: number;
  maxRetries?: number;
  backoffMs?: number;
  verbose?: boolean;
  /** 覆盖凭据（不传则从环境变量读取） */
  credentials?: { clientId: string; apiKey: string };
  /** 自定义 fetch 实现（便于测试注入） */
  fetchImpl?: typeof fetch;
}
