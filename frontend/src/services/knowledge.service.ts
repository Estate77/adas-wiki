import {
  createDemoId,
  listKnowledgeRecords,
  saveKnowledgeRecords,
} from './demo-db';

export type Dimension =
  | 'TECH_UNDERSTANDING'
  | 'PRODUCT_DEFINITION'
  | 'SAFETY_COMPLIANCE'
  | 'USER_EXPERIENCE'
  | 'BUSINESS_COMPETITION'
  | 'SCENARIO_SYSTEM_THINKING';

export interface KnowledgeListItem {
  id: string;
  title: string;
  summary: string | null;
  dimension: Dimension;
  tags: string[];
  viewCount: number;
  updatedAt: string;
}

export interface KnowledgeDetail extends KnowledgeListItem {
  content: string;
  source: string | null;
  interviewLinks: { id: string; position: string; difficulty: string; stem: string }[];
}

export interface ListParams {
  dimension?: Dimension;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export const knowledgeService = {
  async list(params: ListParams = {}) {
    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.max(1, params.pageSize ?? 20);
    const keyword = params.keyword?.trim().toLowerCase();

    let items = listKnowledgeRecords();
    if (params.dimension) {
      items = items.filter((item) => item.dimension === params.dimension);
    }
    if (keyword) {
      items = items.filter((item) =>
        [item.title, item.summary ?? '', item.content, item.tags.join(' ')]
          .join(' ')
          .toLowerCase()
          .includes(keyword)
      );
    }

    items = [...items].sort((a, b) => {
      if (b.viewCount !== a.viewCount) return b.viewCount - a.viewCount;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    const total = items.length;
    const start = (page - 1) * pageSize;
    return {
      items: items.slice(start, start + pageSize),
      total,
      page,
      pageSize,
    };
  },
  async detail(id: string): Promise<KnowledgeDetail> {
    const item = listKnowledgeRecords().find((record) => record.id === id);
    if (!item) throw new Error('知识点不存在');

    const updated = listKnowledgeRecords().map((record) =>
      record.id === id ? { ...record, viewCount: record.viewCount + 1 } : record
    );
    saveKnowledgeRecords(updated);

    return {
      ...item,
      viewCount: item.viewCount + 1,
      interviewLinks: [],
    };
  },
  /** 关键字搜索：用于 RAG，未命中时回退 LLM */
  async search(keyword: string, pageSize = 5) {
    const result = await this.list({ keyword, pageSize, page: 1 });
    return { items: result.items, total: result.total };
  },
  async create(payload: { title: string; content: string; summary?: string; dimension: Dimension; tags?: string[]; source?: string }) {
    const item: KnowledgeDetail = {
      id: createDemoId('kb'),
      title: payload.title.trim(),
      content: payload.content.trim(),
      summary: payload.summary?.trim() ?? null,
      dimension: payload.dimension,
      tags: payload.tags ?? [],
      source: payload.source ?? 'Demo Custom',
      viewCount: 0,
      updatedAt: new Date().toISOString(),
      interviewLinks: [],
    };
    saveKnowledgeRecords([item, ...listKnowledgeRecords()]);
    return item;
  },
  async update(id: string, payload: Partial<{ title: string; content: string; summary: string; tags: string[]; source: string }>) {
    const items = listKnowledgeRecords();
    const current = items.find((item) => item.id === id);
    if (!current) throw new Error('知识点不存在');

    const updatedItem = {
      ...current,
      title: payload.title?.trim() ?? current.title,
      content: payload.content?.trim() ?? current.content,
      summary: payload.summary === undefined ? current.summary : payload.summary,
      tags: payload.tags ?? current.tags,
      source: payload.source === undefined ? current.source : payload.source,
      updatedAt: new Date().toISOString(),
    };

    saveKnowledgeRecords(items.map((item) => (item.id === id ? updatedItem : item)));
    return { ...updatedItem, interviewLinks: [] };
  },
  async remove(id: string) {
    saveKnowledgeRecords(listKnowledgeRecords().filter((item) => item.id !== id));
  },
};
