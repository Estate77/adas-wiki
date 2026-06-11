#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""ima知识库API调用脚本，用于Trae Skills集成"""

import os, sys, json, urllib.request, urllib.error

IMA_API_BASE = "https://ima.qq.com"

def get_credentials():
    client_id = os.environ.get("IMA_OPENAPI_CLIENTID", "")
    api_key = os.environ.get("IMA_OPENAPI_APIKEY", "")
    if not client_id or not api_key:
        print("错误：请设置环境变量 IMA_OPENAPI_CLIENTID 和 IMA_OPENAPI_APIKEY")
        sys.exit(1)
    return client_id, api_key

def call_ima_api(path, body):
    client_id, api_key = get_credentials()
    url = f"{IMA_API_BASE}/{path}"
    headers = {
        "ima-openapi-clientid": client_id,
        "ima-openapi-apikey": api_key,
        "Content-Type": "application/json"
    }
    data = json.dumps(body).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        print(f"API调用失败：HTTP {e.code}")
        print(e.read().decode("utf-8"))
        return None
    except Exception as e:
        print(f"API调用异常：{str(e)}")
        return None

def search_knowledge(query, limit=20):
    result = call_ima_api("openapi/wiki/v1/search_knowledge_base", {"query": query, "cursor": "", "limit": limit})
    if result: print(json.dumps(result, ensure_ascii=False, indent=2))

def search_note(keyword, search_type=0, limit=20):
    result = call_ima_api("openapi/note/v1/search_note_book", {
        "search_type": search_type,
        "query_info": {"title": keyword if search_type == 0 else "", "content": keyword if search_type == 1 else ""},
        "start": 0, "end": limit
    })
    if result: print(json.dumps(result, ensure_ascii=False, indent=2))

def list_folders():
    result = call_ima_api("openapi/note/v1/list_folders", {"cursor": "", "limit": 100})
    if result: print(json.dumps(result, ensure_ascii=False, indent=2))

def list_notes(folder_id="", limit=20):
    result = call_ima_api("openapi/note/v1/list_note_by_folder_id", {"folder_id": folder_id, "cursor": "", "limit": limit})
    if result: print(json.dumps(result, ensure_ascii=False, indent=2))

def get_note(note_id):
    result = call_ima_api("openapi/note/v1/get_note_content", {"note_id": note_id})
    if result: print(json.dumps(result, ensure_ascii=False, indent=2))

def create_note(title, content, folder_id=""):
    result = call_ima_api("openapi/note/v1/import_doc", {"content_format": 1, "content": f"# {title}\n\n{content}", "folder_id": folder_id})
    if result: print("笔记创建成功！")

def append_note(note_id, content):
    result = call_ima_api("openapi/note/v1/append_note_content", {"note_id": note_id, "content": content, "content_format": 1})
    if result: print("内容追加成功！")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("用法: python ima_api.py <命令> [参数]")
        print("命令: search_knowledge, search_note, list_folders, list_notes, get_note, create_note, append_note")
        sys.exit(0)
    cmd = sys.argv[1]
    if cmd == "search_knowledge" and len(sys.argv) >= 3: search_knowledge(sys.argv[2])
    elif cmd == "search_note" and len(sys.argv) >= 3: search_note(sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 0)
    elif cmd == "list_folders": list_folders()
    elif cmd == "list_notes": list_notes(sys.argv[2] if len(sys.argv) > 2 else "")
    elif cmd == "get_note" and len(sys.argv) >= 3: get_note(sys.argv[2])
    elif cmd == "create_note" and len(sys.argv) >= 4: create_note(sys.argv[2], sys.argv[3], sys.argv[4] if len(sys.argv) > 4 else "")
    elif cmd == "append_note" and len(sys.argv) >= 4: append_note(sys.argv[2], sys.argv[3])
    else: print("参数错误，请检查命令格式")
