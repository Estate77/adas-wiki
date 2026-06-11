#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ima知识库 · 调用层包装（Wrapper）

在 ima_api.py 之上提供：
- 类型安全的类接口（IMAClient）
- 自定义异常体系
- 数据类结果（dataclass）
- 失败重试 / 超时控制
- 复合便捷方法（search_and_read、batch_get）
- CLI 子命令（与 ima_api.py 兼容）
- 异步并发批量拉取

使用示例：
    from wrapper import IMAClient, IMAError
    with IMAClient() as c:
        for n in c.search_and_read("端到端 自动驾驶", max_read=3):
            print(n.title, "->", n.content[:80])
"""
from __future__ import annotations

import io
import json
import os
import sys
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass, field, asdict
from enum import IntEnum
from typing import Any, Iterable, List, Optional

# Windows 控制台默认 GBK，强制 UTF-8 防止 emoji / 中文乱码
if sys.platform == "win32":
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")
    except Exception:
        pass

# ==================== 基础配置 ====================
IMA_API_BASE = "https://ima.qq.com"
DEFAULT_TIMEOUT = 30
DEFAULT_RETRIES = 2
DEFAULT_RETRY_BACKOFF = 0.6  # 秒


# ==================== 异常体系 ====================
class IMAError(Exception):
    """IMA 通用错误基类"""


class IMAAuthError(IMAError):
    """鉴权失败（缺少/无效的 clientid/apikey）"""


class IMAAPIError(IMAError):
    """远端 API 返回非 2xx 或业务失败"""

    def __init__(self, status: int, message: str, payload: Any = None):
        super().__init__(f"HTTP {status}: {message}")
        self.status = status
        self.payload = payload


class IMAConfigError(IMAError):
    """本地配置/参数错误"""


# ==================== 枚举 / 数据类 ====================
class NoteSearchType(IntEnum):
    TITLE = 0
    CONTENT = 1


@dataclass
class KnowledgeItem:
    id: str
    title: str = ""
    snippet: str = ""
    score: float = 0.0
    source: str = ""
    raw: dict = field(default_factory=dict)


@dataclass
class NoteMeta:
    id: str
    title: str = ""
    folder_id: str = ""
    updated_at: int = 0
    raw: dict = field(default_factory=dict)


@dataclass
class NoteContent:
    id: str
    title: str = ""
    content: str = ""
    raw: dict = field(default_factory=dict)


@dataclass
class Folder:
    id: str
    name: str = ""
    parent_id: str = ""
    raw: dict = field(default_factory=dict)


@dataclass
class SearchResult:
    items: List[Any] = field(default_factory=list)
    has_more: bool = False
    next_cursor: str = ""
    raw: dict = field(default_factory=dict)


# ==================== 客户端 ====================
class IMAClient:
    """
    IMA 知识库客户端（同步）。

    参数：
        base_url:     API 根地址
        timeout:      单次请求超时（秒）
        max_retries:  失败重试次数（不含首次）
        backoff:      重试退避基数（指数退避）
        verbose:      打印调试日志
    """

    def __init__(
        self,
        base_url: str = IMA_API_BASE,
        timeout: int = DEFAULT_TIMEOUT,
        max_retries: int = DEFAULT_RETRIES,
        backoff: float = DEFAULT_RETRY_BACKOFF,
        verbose: bool = False,
    ):
        self.base_url    = base_url.rstrip("/")
        self.timeout     = timeout
        self.max_retries = max(0, max_retries)
        self.backoff     = backoff
        self.verbose     = verbose
        self._client_id, self._api_key = self._load_creds()
        self._kb_name_cache: Dict[str, str] = {}

    # ---------- 工具 ----------
    def _load_creds(self) -> tuple[str, str]:
        cid = os.environ.get("IMA_OPENAPI_CLIENTID", "").strip()
        key = os.environ.get("IMA_OPENAPI_APIKEY", "")
        # APIKEY 保留原样（含末尾空格），故不 strip
        if not cid or not key:
            raise IMAAuthError(
                "缺少环境变量 IMA_OPENAPI_CLIENTID / IMA_OPENAPI_APIKEY"
            )
        return cid, key

    def _log(self, *args):
        if self.verbose:
            print("[IMA]", *args, file=sys.stderr)

    def _post(self, path: str, body: dict) -> dict:
        url = f"{self.base_url}/{path.lstrip('/')}"
        headers = {
            "ima-openapi-clientid": self._client_id,
            "ima-openapi-apikey":   self._api_key,
            "Content-Type":         "application/json",
        }
        data = json.dumps(body, ensure_ascii=False).encode("utf-8")

        last_err: Optional[Exception] = None
        for attempt in range(1 + self.max_retries):
            req = urllib.request.Request(url, data=data, headers=headers, method="POST")
            try:
                with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                    payload = json.loads(resp.read().decode("utf-8"))
                return self._unwrap(payload)
            except urllib.error.HTTPError as e:
                raw = e.read().decode("utf-8", errors="replace")
                last_err = IMAAPIError(e.code, raw)
                # 4xx 不重试
                if 400 <= e.code < 500:
                    raise last_err from None
            except (urllib.error.URLError, TimeoutError, OSError) as e:
                last_err = e
                self._log(f"network error: {e} (attempt {attempt + 1})")

            if attempt < self.max_retries:
                time.sleep(self.backoff * (2 ** attempt))

        raise IMAAPIError(-1, f"重试 {self.max_retries} 次后仍失败: {last_err}")

    @staticmethod
    def _unwrap(payload: dict) -> dict:
        """
        兼容 IMA 返回结构：成功时顶层可能为 {'code':0, 'data': {...}}
        解开 data 层，失败抛 IMAAPIError。
        """
        if not isinstance(payload, dict):
            return {"raw": payload}
        code = payload.get("code", payload.get("errcode", 0))
        if code not in (0, "0", None, ""):
            raise IMAAPIError(
                int(code) if isinstance(code, int) else -1,
                payload.get("msg") or payload.get("errmsg") or json.dumps(payload, ensure_ascii=False),
                payload,
            )
        return payload.get("data", payload)

    # ---------- 知识库 ----------
    def search_knowledge(
        self, query: str, limit: int = 20, cursor: str = ""
    ) -> SearchResult:
        if not query.strip():
            raise IMAConfigError("query 不能为空")
        data = self._post(
            "openapi/wiki/v1/search_knowledge_base",
            {"query": query, "cursor": cursor, "limit": limit},
        )
        # 兼容多种返回字段：info_list / items / list
        items_raw = data.get("info_list") or data.get("items") or data.get("list") or []
        items = [
            KnowledgeItem(
                id=str(x.get("kb_id") or x.get("id") or x.get("knowledge_id") or ""),
                title=x.get("kb_name") or x.get("title", ""),
                snippet=x.get("description") or x.get("snippet") or x.get("content") or "",
                score=float(x.get("score") or 0.0),
                source=(x.get("creator") or x.get("source") or ""),
                raw=x,
            )
            for x in items_raw
        ]
        return SearchResult(
            items=items,
            has_more=not bool(data.get("is_end", True)),
            next_cursor=data.get("next_cursor", ""),
            raw=data,
        )

    # ---------- 笔记本 ----------
    def list_folders(self, limit: int = 100, cursor: str = "") -> SearchResult:
        data = self._post(
            "openapi/note/v1/list_folders",
            {"cursor": cursor, "limit": limit},
        )
        raw_items = data.get("folders") or data.get("items") or []
        items = [
            Folder(
                id=str(x.get("id") or x.get("folder_id") or ""),
                name=x.get("name", ""),
                parent_id=x.get("parent_id", ""),
                raw=x,
            )
            for x in raw_items
        ]
        return SearchResult(items=items, raw=data)

    def list_notes(
        self, folder_id: str = "", limit: int = 20, cursor: str = ""
    ) -> SearchResult:
        data = self._post(
            "openapi/note/v1/list_note_by_folder_id",
            {"folder_id": folder_id, "cursor": cursor, "limit": limit},
        )
        # 兼容 note_book_list[].basic_info.basic_info / notes / items
        arr = (
            data.get("note_book_list")
            or data.get("notes")
            or data.get("items")
            or []
        )
        items: list[NoteMeta] = []
        for x in arr:
            # 双层嵌套：x.basic_info.basic_info
            bi = (x.get("basic_info") or {}).get("basic_info") or x.get("basic_info") or x
            items.append(
                NoteMeta(
                    id=str(bi.get("docid") or bi.get("id") or bi.get("note_id") or ""),
                    title=bi.get("title", ""),
                    folder_id=bi.get("folder_id", ""),
                    updated_at=int(bi.get("modify_time") or bi.get("updated_at") or 0),
                    raw=x,
                )
            )
        return SearchResult(
            items=items,
            has_more=not bool(data.get("is_end", True)),
            next_cursor=data.get("next_cursor", ""),
            raw=data,
        )

    def list_notes_by_kb(
        self,
        kb_id: str,
        limit: int = 20,
        query: Optional[str] = None,
    ) -> SearchResult:
        """
        列出知识库（kb_id）下的笔记/文档。

        重要说明：
          当前 IMA OpenAPI 不提供"按知识库 ID 列文档"的端点
          （尝试多种路径均返回 404），且 search_note 返回的 basic_info
          中也不包含 kb_id 字段，无法反查笔记所属知识库。

          因此本方法采用"折中"实现：调用 search_note(keyword=...) 检索全库
          笔记作为代理结果。**结果可能包含与该 KB 无关的笔记**（API 限制），
          请按 raw.title/snippet 自行甄别。

        参数：
          kb_id   知识库 ID（仅用于在 raw._proxy.kb_id 中标注，原样回显）
          limit   返回条数上限
          query   搜索关键词（KB 名称或主题词）。**强烈建议显式传 query**；
                  若不传，本方法会先用 search_knowledge 翻页拉取所有已加入
                  的 KB 构建内部 id→name 缓存，再以 kb_name 作为 query。
                  翻页拉取受 API 单次 20 条限制，最坏情况可能查不到。
        """
        if not kb_id or not kb_id.strip():
            raise IMAConfigError("kb_id 不能为空")

        # 1) 决定 search query
        if query and query.strip():
            search_q = query.strip()
        else:
            # 1a) 缓存命中？
            search_q = self._kb_name_cache.get(kb_id, "")
            if not search_q:
                # 1b) 翻页拉取所有已订阅 KB
                self._log("list_notes_by_kb: 缓存未命中，开始拉取 KB 列表…")
                cur = ""
                for page in range(20):  # 最多 20 页 = 400 个 KB
                    try:
                        r = self.search_knowledge("0", 20, cur)  # "0" 通过验证
                    except IMAAPIError as e:
                        self._log(f"  拉取失败: {e}")
                        break
                    for kb in r.items:
                        self._kb_name_cache[kb.id] = kb.title
                    if not r.has_more or not r.next_cursor or r.next_cursor == cur:
                        break
                    cur = r.next_cursor
                self._log(f"  已缓存 {len(self._kb_name_cache)} 个 KB")
                search_q = self._kb_name_cache.get(kb_id, "")

        # 2) 用 search_q 走 search_note
        if not search_q:
            self._log(f"list_notes_by_kb: kb_id={kb_id[:12]}… 未在已订阅 KB 中，"
                      f"且未传 query；返回空 SearchResult")
            return SearchResult(items=[], has_more=False, next_cursor="", raw={
                "_proxy": {"kb_id": kb_id, "kb_name": "",
                           "note": "未找到对应 KB 名称；建议显式传 query= 关键词重试"}
            })

        self._log(f"list_notes_by_kb: kb_id={kb_id[:12]}… → query='{search_q}'")
        result = self.search_note(search_q, 0, limit)
        if isinstance(result.raw, dict):
            result.raw.setdefault("_proxy", {})["kb_id"] = kb_id
            result.raw["_proxy"]["query"] = search_q
            result.raw["_proxy"]["note"] = (
                "IMA OpenAPI 无 list_doc_by_kb 端点，本结果为 search_note 兜底，"
                "可能含无关笔记"
            )
        return result

    def search_note(
        self,
        keyword: str,
        search_type: NoteSearchType | int = NoteSearchType.TITLE,
        limit: int = 20,
    ) -> SearchResult:
        st = int(search_type)
        if not keyword.strip():
            raise IMAConfigError("keyword 不能为空")
        data = self._post(
            "openapi/note/v1/search_note_book",
            {
                "search_type": st,
                "query_info": {
                    "title":   keyword if st == 0 else "",
                    "content": keyword if st == 1 else "",
                },
                "start": 0,
                "end": limit,
            },
        )
        # 兼容多种结构：docs[].doc.basic_info / results[].doc.basic_info / notes / items
        raw_items: list[dict] = []
        for list_key in ("docs", "results"):
            arr = data.get(list_key)
            if isinstance(arr, list):
                for r in arr:
                    bi = (r or {}).get("doc", {}).get("basic_info")
                    if bi:
                        raw_items.append(bi)
                if raw_items:
                    break
        if not raw_items:
            raw_items = data.get("notes") or data.get("items") or []
        items = [
            NoteMeta(
                id=str(x.get("docid") or x.get("id") or x.get("note_id") or ""),
                title=x.get("title", ""),
                folder_id=x.get("folder_id", ""),
                updated_at=int(x.get("modify_time") or x.get("updated_at") or 0),
                raw=x,
            )
            for x in raw_items
        ]
        return SearchResult(items=items, raw=data)

    def get_note(self, note_id: str) -> NoteContent:
        if not note_id.strip():
            raise IMAConfigError("note_id 不能为空")
        data = self._post(
            "openapi/note/v1/get_note_content", {"note_id": note_id}
        )
        return NoteContent(
            id=note_id,
            title=data.get("title", ""),
            content=data.get("content") or data.get("text") or "",
            raw=data,
        )

    # ---------- 写入 ----------
    def create_note(
        self, title: str, content: str, folder_id: str = ""
    ) -> dict:
        if not title.strip():
            raise IMAConfigError("title 不能为空")
        return self._post(
            "openapi/note/v1/import_doc",
            {
                "content_format": 1,
                "content": f"# {title}\n\n{content}",
                "folder_id": folder_id,
            },
        )

    def append_note(self, note_id: str, content: str) -> dict:
        if not note_id.strip() or not content:
            raise IMAConfigError("note_id / content 不能为空")
        return self._post(
            "openapi/note/v1/append_note_content",
            {"note_id": note_id, "content": content, "content_format": 1},
        )

    # ---------- 复合便捷方法 ----------
    def search_and_read(
        self, query: str, max_read: int = 3
    ) -> List[NoteContent]:
        """搜笔记并并发读取前 N 条正文"""
        search = self.search_note(query, NoteSearchType.TITLE)
        targets = search.items[:max_read]
        return self.batch_get([n.id for n in targets])

    def list_kb_and_read(
        self,
        kb_id: str,
        max_read: int = 5,
        limit: int = 50,
        query: Optional[str] = None,
    ) -> List[NoteContent]:
        """列知识库下的笔记并并发读取前 max_read 条正文（基于 search_note 兜底）"""
        listing = self.list_notes_by_kb(kb_id, limit=limit, query=query)
        targets = listing.items[:max_read]
        return self.batch_get([n.id for n in targets])

    def batch_get(self, note_ids: Iterable[str], max_workers: int = 4) -> List[NoteContent]:
        ids = [i for i in note_ids if i]
        if not ids:
            return []
        results: List[Optional[NoteContent]] = [None] * len(ids)
        with ThreadPoolExecutor(max_workers=min(max_workers, len(ids))) as pool:
            future_to_idx = {
                pool.submit(self.get_note, nid): idx for idx, nid in enumerate(ids)
            }
            for fut in as_completed(future_to_idx):
                idx = future_to_idx[fut]
                try:
                    results[idx] = fut.result()
                except IMAError as e:
                    self._log(f"get_note {ids[idx]} 失败: {e}")
        return [r for r in results if r is not None]

    # ---------- 上下文管理 ----------
    def __enter__(self) -> "IMAClient":
        return self

    def __exit__(self, *args) -> None:
        pass


# ==================== CLI ====================
def _print_json(obj: Any) -> None:
    print(json.dumps(obj, ensure_ascii=False, indent=2, default=lambda o: asdict(o) if hasattr(o, "__dataclass_fields__") else str(o)))


def _cli():
    if len(sys.argv) < 2 or sys.argv[1] in ("-h", "--help"):
        print(__doc__)
        print("\n用法: python wrapper.py <命令> [参数]")
        print("命令: search_knowledge, search_note, list_folders, list_notes,")
        print("      list_notes_by_kb, get_note, create_note, append_note,")
        print("      search_and_read, list_kb_and_read")
        sys.exit(0)

    cmd = sys.argv[1]
    args = sys.argv[2:]

    try:
        with IMAClient(verbose="--debug" in args) as c:
            args = [a for a in args if a != "--debug"]

            if cmd == "search_knowledge" and args:
                _print_json(c.search_knowledge(args[0], int(args[1]) if len(args) > 1 else 20))

            elif cmd == "search_note" and args:
                st = NoteSearchType(int(args[1])) if len(args) > 1 else NoteSearchType.TITLE
                _print_json(c.search_note(args[0], st))

            elif cmd == "list_folders":
                _print_json(c.list_folders())

            elif cmd == "list_notes":
                _print_json(c.list_notes(args[0] if args else ""))

            elif cmd == "list_notes_by_kb" and args:
                _print_json(c.list_notes_by_kb(
                    args[0],
                    int(args[1]) if len(args) > 1 else 20,
                    args[2] if len(args) > 2 else None,
                ))

            elif cmd == "get_note" and args:
                _print_json(c.get_note(args[0]))

            elif cmd == "create_note" and len(args) >= 2:
                _print_json(c.create_note(args[0], args[1], args[2] if len(args) > 2 else ""))

            elif cmd == "append_note" and len(args) >= 2:
                _print_json(c.append_note(args[0], args[1]))

            elif cmd == "search_and_read" and args:
                _print_json(c.search_and_read(args[0], int(args[1]) if len(args) > 1 else 3))

            elif cmd == "list_kb_and_read" and args:
                _print_json(c.list_kb_and_read(
                    args[0],
                    int(args[1]) if len(args) > 1 else 5,
                    int(args[2]) if len(args) > 2 else 50,
                    args[3] if len(args) > 3 else None,
                ))

            else:
                print("参数错误，python wrapper.py --help 查看用法")
                sys.exit(2)

    except IMAAuthError as e:
        print(f"[鉴权失败] {e}", file=sys.stderr); sys.exit(3)
    except IMAConfigError as e:
        print(f"[参数错误] {e}", file=sys.stderr); sys.exit(2)
    except IMAAPIError as e:
        print(f"[API 错误] {e}", file=sys.stderr); sys.exit(4)
    except KeyboardInterrupt:
        sys.exit(130)


if __name__ == "__main__":
    _cli()
