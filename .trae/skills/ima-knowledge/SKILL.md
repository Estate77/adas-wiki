---
name: "ima-knowledge"
description: "调用 IMA 知识库 OpenAPI，实现知识库搜索、笔记读取与写入。Invoke when user asks to search IMA knowledge base, read or create notes, or do topic/research material lookups."
---

# ima知识库助手

## 技能描述
用于调用ima知识库，实现笔记搜索、内容读取、笔记写入等功能。

## 触发条件
当用户需要以下操作时触发：
- 搜索ima知识库中的内容
- 读取特定笔记内容
- 将内容写入ima笔记
- 进行选题素材查找

## 指令

### 调用层选择（三层覆盖）
- **简单场景**（一次性 CLI 调用）：使用 `ima_api.py`（Python 原生）
- **复杂场景**（类接口、批量、类型、重试）：使用 `wrapper.py`（推荐用于集成到其它 Python 代码）
- **Node / 后端集成**：使用 `backend/src/services/ima/`（TypeScript，原生 fetch，无第三方依赖）

### 搜索知识库
执行 `python .trae/skills/ima-knowledge/ima_api.py search_knowledge "搜索关键词"`
或 `python .trae/skills/ima-knowledge/wrapper.py search_knowledge "搜索关键词"`
或 `npx tsx backend/src/services/ima/cli.ts search_knowledge "搜索关键词"`

### 搜索笔记
执行 `python .trae/skills/ima-knowledge/ima_api.py search_note "搜索关键词"`
或 `python .trae/skills/ima-knowledge/wrapper.py search_note "关键词" 0`（0=标题 1=内容）
或 `npx tsx backend/src/services/ima/cli.ts search_note "关键词" 0`

### 列出笔记本
执行 `python .trae/skills/ima-knowledge/ima_api.py list_folders`
或 `python .trae/skills/ima-knowledge/wrapper.py list_folders`
或 `npx tsx backend/src/services/ima/cli.ts list_folders`

### 列出笔记
执行 `python .trae/skills/ima-knowledge/ima_api.py list_notes "文件夹ID"`
或 `python .trae/skills/ima-knowledge/wrapper.py list_notes "文件夹ID"`
或 `npx tsx backend/src/services/ima/cli.ts list_notes "文件夹ID"`

### 列出知识库下的笔记（**API 限制：仅近似实现**）
> **重要说明**：当前 IMA OpenAPI 不提供"按知识库 ID 列文档"的端点（多种路径
> 均返回 404），且 `search_note` 返回的 `basic_info` 中无 `kb_id` 字段，无法反查
> 所属知识库。本命令采用 `search_note(query=...)` 兜底，**结果可能含无关笔记**，
> 请按 `raw._proxy.note` 字段甄别。

```bash
# 推荐：显式传 query
python .trae/skills/ima-knowledge/wrapper.py list_notes_by_kb "KB_ID" 5 "智驾"

# 不传 query：自动从 search_knowledge 缓存查 KB 名称（命中率有限）
python .trae/skills/ima-knowledge/wrapper.py list_notes_by_kb "KB_ID" 5
```

### 读取笔记内容
执行 `python .trae/skills/ima-knowledge/ima_api.py get_note "笔记ID"`
或 `python .trae/skills/ima-knowledge/wrapper.py get_note "笔记ID"`
或 `npx tsx backend/src/services/ima/cli.ts get_note "笔记ID"`

### 新建笔记
执行 `python .trae/skills/ima-knowledge/ima_api.py create_note "笔记标题" "笔记内容"`
或 `python .trae/skills/ima-knowledge/wrapper.py create_note "标题" "内容" "文件夹ID"`
或 `npx tsx backend/src/services/ima/cli.ts create_note "标题" "内容" "文件夹ID"`

### 追加内容到笔记
执行 `python .trae/skills/ima-knowledge/ima_api.py append_note "笔记ID" "追加内容"`
或 `python .trae/skills/ima-knowledge/wrapper.py append_note "笔记ID" "追加内容"`
或 `npx tsx backend/src/services/ima/cli.ts append_note "笔记ID" "追加内容"`

### 复合便捷：搜索 + 并发读取
Python: `python .trae/skills/ima-knowledge/wrapper.py search_and_read "关键词" 3`
Node  : `npx tsx backend/src/services/ima/cli.ts search_and_read "关键词" 3`

## Python 集成示例
```python
from wrapper import IMAClient, IMAAuthError, IMAAPIError, NoteSearchType

with IMAClient(verbose=False) as client:
    try:
        # 1) 列出笔记本
        for f in client.list_folders().items:
            print(f.id, f.name)

        # 2) 按标题搜索并并发读取前 3 条
        for note in client.search_and_read("端到端 自动驾驶", max_read=3):
            print("---", note.title, "---")
            print(note.content[:200])

        # 3) 批量获取
        notes = client.batch_get(["id1", "id2", "id3"])

        # 4) 写入
        client.create_note("智驾日报-2026-06-08", "今日要点：...", folder_id="")
        client.append_note("note-id-xxx", "\n\n## 附录\n...")

        # 5) 列出知识库下的笔记（近似实现，详见命令说明）
        kb_id = "hh0bdTM2zCRXvBUGKwi-d6Z65xTUxfqlS-6YVUgagoo="
        for note in client.list_notes_by_kb(kb_id, limit=5, query="智驾").items:
            print(note.id, note.title)
    except IMAAuthError as e:
        print("鉴权失败：", e)
    except IMAAPIError as e:
        print("API 错误：", e.status, e)
```

## 环境变量要求
- IMA_OPENAPI_CLIENTID：19433fcd783b5decac90156e5b0c4294
- IMA_OPENAPI_APIKEY：3uRm7nYGbMFLeE70MF66a08DSjMPftXnC9eqhGqDQy5bpjWkEopTuTQCYbHFkf/YTKRHDY3bRQ==

## Node / TypeScript 集成示例
文件位置：`backend/src/services/ima/`

```ts
import {
  IMAClient,
  NoteSearchType,
  IMAError,
  IMAAPIError,
  IMAAuthError,
} from '@/services/ima';   // 来自 backend/src/services/ima/index.ts

const client = new IMAClient({ verbose: false, timeoutMs: 30_000 });

try {
  // 1) 列出笔记本
  const folders = await client.listFolders();
  folders.items.forEach(f => console.log(f.id, f.name));

  // 2) 搜索 + 并发读取前 3 条正文
  const notes = await client.searchAndRead('端到端 自动驾驶', 3);
  notes.forEach(n => console.log('---', n.title, '---\n', n.content.slice(0, 200)));

  // 3) 批量获取
  const fetched = await client.batchGet(['id1', 'id2', 'id3'], 4);

  // 4) 写入
  await client.createNote('智驾日报-2026-06-08', '今日要点：...', '');
  await client.appendNote('note-id-xxx', '\n\n## 附录\n...');
} catch (e) {
  if (e instanceof IMAAuthError)   console.error('鉴权失败：', e.message);
  else if (e instanceof IMAAPIError) console.error('API 错误：', e.status, e.message);
  else if (e instanceof IMAError)    console.error('IMA 错误：', e.message);
  else throw e;
}
```

**依赖说明**：TypeScript 层使用 Node 18+ 内置 `fetch` / `AbortController`，**无需安装第三方 HTTP 库**。
