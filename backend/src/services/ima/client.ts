/**
 * IMA 知识库 OpenAPI · 客户端（Node.js / TypeScript）
 *
 * 功能：
 * - 7 个核心 API（search_knowledge / search_note / list_folders / list_notes /
 *                get_note / create_note / append_note）
 * - 自定义异常、重试/退避、并发批量拉取
 * - 复合便捷方法：searchAndRead、batchGet
 * - 内置 CLI（tsx services/ima/cli.ts <cmd> [...]）
 *
 * 依赖：仅使用 Node 18+ 内置 fetch / AbortController，无第三方 HTTP 依赖。
 */
import { IMA_API_BASE, NoteSearchType } from './types.js';
import type {
  Folder,
  IMAClientOptions,
  KnowledgeItem,
  NoteContent,
  NoteMeta,
  SearchResult,
} from './types.js';
import {
  IMAAPIError,
  IMAAuthError,
  IMAConfigError,
} from './errors.js';

const DEFAULT_TIMEOUT_MS   = 30_000;
const DEFAULT_MAX_RETRIES  = 2;
const DEFAULT_BACKOFF_MS   = 600;

export class IMAClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;
  private readonly backoffMs: number;
  private readonly verbose: boolean;
  private readonly fetchImpl: typeof fetch;
  private readonly creds: { clientId: string; apiKey: string };

  constructor(opts: IMAClientOptions = {}) {
    this.baseUrl    = (opts.baseUrl ?? IMA_API_BASE).replace(/\/+$/, '');
    this.timeoutMs  = opts.timeoutMs  ?? DEFAULT_TIMEOUT_MS;
    this.maxRetries = Math.max(0, opts.maxRetries ?? DEFAULT_MAX_RETRIES);
    this.backoffMs  = opts.backoffMs  ?? DEFAULT_BACKOFF_MS;
    this.verbose    = opts.verbose    ?? false;
    this.fetchImpl  = opts.fetchImpl  ?? fetch;
    this.creds      = opts.credentials ?? this.loadCredsFromEnv();
  }

  // ---------------- 基础 ----------------

  private loadCredsFromEnv(): { clientId: string; apiKey: string } {
    // 注意：APIKEY 末尾可能含空格，保留原样不 trim
    const clientId = (process.env.IMA_OPENAPI_CLIENTID ?? '').trim();
    const apiKey   = process.env.IMA_OPENAPI_APIKEY ?? '';
    if (!clientId || !apiKey) {
      throw new IMAAuthError(
        '缺少环境变量 IMA_OPENAPI_CLIENTID / IMA_OPENAPI_APIKEY',
      );
    }
    return { clientId, apiKey };
  }

  private log(...args: unknown[]): void {
    if (this.verbose) {
      // eslint-disable-next-line no-console
      console.error('[IMA]', ...args);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }

  /** 发起 POST 请求 + 自动重试 + 解开 data 层 + 异常分类 */
  private async post<T = Record<string, unknown>>(
    path: string,
    body: Record<string, unknown>,
  ): Promise<T> {
    const url = `${this.baseUrl}/${path.replace(/^\/+/, '')}`;
    const payload = JSON.stringify(body);

    let lastError: unknown;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);
      try {
        const resp = await this.fetchImpl(url, {
          method: 'POST',
          headers: {
            'ima-openapi-clientid': this.creds.clientId,
            'ima-openapi-apikey':   this.creds.apiKey,
            'Content-Type':         'application/json',
          },
          body: payload,
          signal: controller.signal,
        });
        clearTimeout(timer);

        const text = await resp.text();
        let json: Record<string, unknown> = {};
        try { json = text ? JSON.parse(text) : {}; } catch { /* keep empty */ }

        if (!resp.ok) {
          // 4xx 不重试（业务错误）
          if (resp.status >= 400 && resp.status < 500) {
            throw new IMAAPIError(resp.status, text, json);
          }
          lastError = new IMAAPIError(resp.status, text, json);
        } else {
          return this.unwrap<T>(json);
        }
      } catch (err) {
        clearTimeout(timer);
        if (err instanceof IMAAPIError) throw err; // 4xx 已抛
        // 网络/超时错误 → 计入重试
        lastError = err;
        this.log(`network error (attempt ${attempt + 1}):`, err);
      }

      if (attempt < this.maxRetries) {
        await this.sleep(this.backoffMs * Math.pow(2, attempt));
      }
    }

    throw new IMAAPIError(-1, `重试 ${this.maxRetries} 次后仍失败: ${String(lastError)}`);
  }

  /** 兼容 IMA 返回结构：{ code, data, msg } → 解开 data 层 */
  private unwrap<T>(payload: Record<string, unknown>): T {
    if (!payload || typeof payload !== 'object') {
      return { raw: payload } as T;
    }
    const code = (payload.code ?? payload.errcode) as number | string | undefined;
    if (code !== undefined && code !== 0 && code !== '0') {
      const msg =
        (payload.msg as string) ??
        (payload.errmsg as string) ??
        JSON.stringify(payload);
      throw new IMAAPIError(typeof code === 'number' ? code : -1, msg, payload);
    }
    return (payload.data ?? payload) as T;
  }

  // ---------------- 知识库 ----------------

  /** 搜索知识库 */
  async searchKnowledge(
    query: string,
    limit = 20,
    cursor = '',
  ): Promise<SearchResult<KnowledgeItem>> {
    if (!query?.trim()) throw new IMAConfigError('query 不能为空');
    const data = await this.post<Record<string, any>>(
      'openapi/wiki/v1/search_knowledge_base',
      { query, cursor, limit },
    );
    const rawItems: any[] = data.items ?? data.list ?? [];
    const items: KnowledgeItem[] = rawItems.map((x) => ({
      id:      String(x.id ?? x.knowledge_id ?? ''),
      title:   String(x.title ?? ''),
      snippet: String(x.snippet ?? x.content ?? ''),
      score:   Number(x.score ?? 0),
      source:  String(x.source ?? ''),
      raw:     x,
    }));
    return {
      items,
      hasMore:    Boolean(data.has_more),
      nextCursor: String(data.next_cursor ?? ''),
      raw:        data,
    };
  }

  // ---------------- 笔记本 ----------------

  /** 列出笔记本 */
  async listFolders(limit = 100, cursor = ''): Promise<SearchResult<Folder>> {
    const data = await this.post<Record<string, any>>(
      'openapi/note/v1/list_folders',
      { cursor, limit },
    );
    const rawItems: any[] = data.folders ?? data.items ?? [];
    const items: Folder[] = rawItems.map((x) => ({
      id:       String(x.id ?? x.folder_id ?? ''),
      name:     String(x.name ?? ''),
      parentId: String(x.parent_id ?? ''),
      raw:      x,
    }));
    return { items, hasMore: false, nextCursor: '', raw: data };
  }

  /** 列出某文件夹下笔记 */
  async listNotes(
    folderId = '',
    limit = 20,
    cursor = '',
  ): Promise<SearchResult<NoteMeta>> {
    const data = await this.post<Record<string, any>>(
      'openapi/note/v1/list_note_by_folder_id',
      { folder_id: folderId, cursor, limit },
    );
    const rawItems: any[] = data.notes ?? data.items ?? [];
    const items: NoteMeta[] = rawItems.map((x) => ({
      id:        String(x.id ?? x.note_id ?? ''),
      title:     String(x.title ?? ''),
      folderId:  String(x.folder_id ?? ''),
      updatedAt: Number(x.updated_at ?? 0),
      raw:       x,
    }));
    return {
      items,
      hasMore:    Boolean(data.has_more),
      nextCursor: String(data.next_cursor ?? ''),
      raw:        data,
    };
  }

  /** 搜索笔记（按标题或内容） */
  async searchNote(
    keyword: string,
    searchType: NoteSearchType | number = NoteSearchType.TITLE,
    limit = 20,
  ): Promise<SearchResult<NoteMeta>> {
    if (!keyword?.trim()) throw new IMAConfigError('keyword 不能为空');
    const st = Number(searchType);
    const data = await this.post<Record<string, any>>(
      'openapi/note/v1/search_note_book',
      {
        search_type: st,
        query_info: {
          title:   st === 0 ? keyword : '',
          content: st === 1 ? keyword : '',
        },
        start: 0,
        end: limit,
      },
    );
    const rawItems: any[] = data.notes ?? data.items ?? [];
    const items: NoteMeta[] = rawItems.map((x) => ({
      id:        String(x.id ?? x.note_id ?? ''),
      title:     String(x.title ?? ''),
      folderId:  String(x.folder_id ?? ''),
      updatedAt: Number(x.updated_at ?? 0),
      raw:       x,
    }));
    return { items, hasMore: false, nextCursor: '', raw: data };
  }

  /** 读取笔记正文 */
  async getNote(noteId: string): Promise<NoteContent> {
    if (!noteId?.trim()) throw new IMAConfigError('noteId 不能为空');
    const data = await this.post<Record<string, any>>(
      'openapi/note/v1/get_note_content',
      { note_id: noteId },
    );
    return {
      id:      noteId,
      title:   String(data.title ?? ''),
      content: String(data.content ?? data.text ?? ''),
      raw:     data,
    };
  }

  // ---------------- 写入 ----------------

  /** 新建笔记 */
  async createNote(
    title: string,
    content: string,
    folderId = '',
  ): Promise<Record<string, unknown>> {
    if (!title?.trim()) throw new IMAConfigError('title 不能为空');
    return this.post<Record<string, unknown>>(
      'openapi/note/v1/import_doc',
      {
        content_format: 1,
        content: `# ${title}\n\n${content}`,
        folder_id: folderId,
      },
    );
  }

  /** 追加内容到笔记 */
  async appendNote(
    noteId: string,
    content: string,
  ): Promise<Record<string, unknown>> {
    if (!noteId?.trim() || !content) {
      throw new IMAConfigError('noteId / content 不能为空');
    }
    return this.post<Record<string, unknown>>(
      'openapi/note/v1/append_note_content',
      { note_id: noteId, content, content_format: 1 },
    );
  }

  // ---------------- 复合便捷 ----------------

  /** 搜索笔记并并发读取前 N 条正文 */
  async searchAndRead(
    query: string,
    maxRead = 3,
    searchType: NoteSearchType | number = NoteSearchType.TITLE,
  ): Promise<NoteContent[]> {
    const search = await this.searchNote(query, searchType, Math.max(maxRead, 1));
    const targets = search.items.slice(0, maxRead).map((n) => n.id);
    return this.batchGet(targets);
  }

  /** 线程池式并发批量拉取 */
  async batchGet(
    noteIds: string[],
    concurrency = 4,
  ): Promise<NoteContent[]> {
    const ids = noteIds.filter(Boolean);
    if (!ids.length) return [];

    const results: (NoteContent | null)[] = new Array(ids.length).fill(null);
    let cursor = 0;

    const worker = async () => {
      while (true) {
        const idx = cursor++;
        if (idx >= ids.length) return;
        const id = ids[idx];
        try {
          results[idx] = await this.getNote(id);
        } catch (e) {
          this.log(`getNote ${id} 失败:`, e);
        }
      }
    };

    const workers = Array.from(
      { length: Math.min(concurrency, ids.length) },
      () => worker(),
    );
    await Promise.all(workers);

    return results.filter((r): r is NoteContent => r !== null);
  }
}
