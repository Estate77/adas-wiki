/**
 * IMA 知识库 OpenAPI · 统一导出
 *
 * 使用：
 *   import { IMAClient, NoteSearchType, IMAError, IMAAPIError } from '@/services/ima';
 */
export { IMAClient } from './client.js';
export { NoteSearchType, IMA_API_BASE } from './types.js';
export type {
  Folder,
  IMAClientOptions,
  KnowledgeItem,
  NoteContent,
  NoteMeta,
  SearchResult,
} from './types.js';
export { IMAError, IMAAuthError, IMAAPIError, IMAConfigError } from './errors.js';
