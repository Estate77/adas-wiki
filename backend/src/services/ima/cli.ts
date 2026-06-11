#!/usr/bin/env tsx
/**
 * IMA CLI · 独立命令行入口
 *
 * 运行：
 *   tsx src/services/ima/cli.ts <command> [args...]
 *
 * 示例：
 *   tsx src/services/ima/cli.ts list_folders
 *   tsx src/services/ima/cli.ts search_note "端到端 自动驾驶" 1
 *   tsx src/services/ima/cli.ts search_and_read "BEV" 3
 */
import { IMAClient, NoteSearchType } from './index.js';
import { IMAError, IMAAPIError, IMAConfigError, IMAAuthError } from './errors.js';

const HELP = `
ima知识库 · CLI（Node / TypeScript）

用法: tsx src/services/ima/cli.ts <command> [args...]

命令:
  list_folders
  list_notes [folder_id]
  search_knowledge <query> [limit=20]
  search_note <keyword> [search_type=0|1] [limit=20]
  get_note <note_id>
  create_note <title> <content> [folder_id]
  append_note <note_id> <content>
  search_and_read <keyword> [max_read=3]

环境变量:
  IMA_OPENAPI_CLIENTID
  IMA_OPENAPI_APIKEY
`;

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  if (!argv.length || argv[0] === '-h' || argv[0] === '--help') {
    process.stdout.write(HELP);
    return;
  }

  const cmd  = argv[0];
  const args = argv.slice(1);
  const verbose = args.includes('--debug');
  const cleanArgs = args.filter((a) => a !== '--debug');

  const client = new IMAClient({ verbose });

  try {
    switch (cmd) {
      case 'list_folders': {
        const r = await client.listFolders();
        console.log(JSON.stringify(r, null, 2));
        break;
      }
      case 'list_notes': {
        const r = await client.listNotes(cleanArgs[0] ?? '');
        console.log(JSON.stringify(r, null, 2));
        break;
      }
      case 'search_knowledge': {
        if (!cleanArgs[0]) throw new IMAConfigError('缺少 query');
        const r = await client.searchKnowledge(
          cleanArgs[0],
          Number(cleanArgs[1] ?? 20),
        );
        console.log(JSON.stringify(r, null, 2));
        break;
      }
      case 'search_note': {
        if (!cleanArgs[0]) throw new IMAConfigError('缺少 keyword');
        const st = cleanArgs[1] !== undefined
          ? Number(cleanArgs[1]) as NoteSearchType
          : NoteSearchType.TITLE;
        const r = await client.searchNote(cleanArgs[0], st, Number(cleanArgs[2] ?? 20));
        console.log(JSON.stringify(r, null, 2));
        break;
      }
      case 'get_note': {
        if (!cleanArgs[0]) throw new IMAConfigError('缺少 note_id');
        const r = await client.getNote(cleanArgs[0]);
        console.log(JSON.stringify(r, null, 2));
        break;
      }
      case 'create_note': {
        if (!cleanArgs[0] || cleanArgs[1] === undefined) {
          throw new IMAConfigError('缺少 title / content');
        }
        const r = await client.createNote(cleanArgs[0], cleanArgs[1], cleanArgs[2] ?? '');
        console.log(JSON.stringify(r, null, 2));
        break;
      }
      case 'append_note': {
        if (!cleanArgs[0] || cleanArgs[1] === undefined) {
          throw new IMAConfigError('缺少 note_id / content');
        }
        const r = await client.appendNote(cleanArgs[0], cleanArgs[1]);
        console.log(JSON.stringify(r, null, 2));
        break;
      }
      case 'search_and_read': {
        if (!cleanArgs[0]) throw new IMAConfigError('缺少 keyword');
        const r = await client.searchAndRead(
          cleanArgs[0],
          Number(cleanArgs[1] ?? 3),
        );
        console.log(JSON.stringify(r, null, 2));
        break;
      }
      default:
        process.stdout.write(HELP);
        process.exitCode = 2;
    }
  } catch (e) {
    if (e instanceof IMAAuthError)   { console.error('[鉴权失败]', e.message); process.exit(3); }
    else if (e instanceof IMAConfigError) { console.error('[参数错误]', e.message); process.exit(2); }
    else if (e instanceof IMAAPIError)    { console.error('[API 错误]',   e.message); process.exit(4); }
    else if (e instanceof IMAError)       { console.error('[IMA 错误]',  e.message); process.exit(5); }
    else                                  { console.error('[未知错误]',   e);         process.exit(1); }
  }
}

main();
