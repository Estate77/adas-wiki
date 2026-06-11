/**
 * 大模型兜底回答：当 KB 检索未命中时，调用通用 LLM 风格回答。
 *
 * 设计要点：
 * 1. 当前为离线版本（无后端 LLM 网关），使用本地模板生成"风格化"回答
 * 2. 后续接入真实 LLM 时，只需要在 backend 提供 /api/llm/generate 流式接口，
 *    并把 generate() 切到 fetch 真实后端即可
 * 3. 输出与 KB 风格保持一致：TL;DR + 六维 + 行动 + 关联
 */
import type { SixDimensionAnswer } from '@/types/chat';

export interface LLMRequest {
  prompt: string;
  signal?: AbortSignal;
  onEvent?: (ev: { type: 'delta'; text: string } | { type: 'done' } | { type: 'error'; message: string }) => void;
  onComplete?: () => void;
}

/** 关键词 → 维度聚类的简易路由（用于模板兜底） */
const KEYWORD_TO_DIMENSION: Array<{ re: RegExp; dim: keyof typeof DIM_TEMPLATES }> = [
  { re: /(BEV|occupancy|感知|激光雷达|毫米波|雷达|相机|摄像头|点云|深度学习|算法|模型|训练|神经网络|transformer|注意力)/i, dim: 'TECH_UNDERSTANDING' },
  { re: /(产品|需求|PRD|功能|价值|场景|用户|体验|HMI|交互|定义|规划)/i, dim: 'PRODUCT_DEFINITION' },
  { re: /(安全|合规|法规|ISO|SOTIF|ASIL|UN.?R157|接管|ODD|责任|接管率|降级|MRM|Safety.?Case)/i, dim: 'SAFETY_COMPLIANCE' },
  { re: /(UX|HMI|体验|接管提示|多模态|可视化|拟人|交互|车主)/i, dim: 'USER_EXPERIENCE' },
  { re: /(市场|竞争|竞品|商业|渗透率|出货|玩家|Tier.?1|供应商|价格|成本|车型|销量)/i, dim: 'BUSINESS_COMPETITION' },
  { re: /(场景|触发|长尾|博弈|路口|汇入|施工|改道|加塞|鬼探头|行人|横穿|高速公路|城区)/i, dim: 'SCENARIO_SYSTEM_THINKING' },
];

/** 各维度的"无 KB 命中"模板化回答（保持风格统一） */
const DIM_TEMPLATES = {
  TECH_UNDERSTANDING: {
    headline: '通用技术分析框架（待结合具体子领域深挖）',
    detail:
      '智驾技术栈通常可拆为 **感知**（摄像头/激光雷达/毫米波/4D 雷达 + BEV/Occupancy）、**预测**（障碍物轨迹 + 意图）、**规划**（全局/行为/局部）、**控制**（LQR/MPC/PID）四大模块。\n\n你的问题看上去涉及具体子领域（如 BEV、点云、Transformer 等），目前知识库尚未收录完整条目，建议：\n1) 在「全景图谱」中查看对应模块的可视化介绍\n2) 把问题拆得更具体，例如「BEV 与 Occupancy 的区别」「4D 雷达相对 3D 雷达的优势」\n3) 后续接入真实大模型后这里会由 LLM 基于 RAG 知识库生成更精准的回答',
    terms: [
      { term: 'BEV', desc: '多相机特征统一投影到俯视空间的范式' },
      { term: 'Occupancy', desc: '体素级占据预测，对未知障碍物鲁棒' },
      { term: 'Transformer', desc: '注意力机制，BEV/端到端的核心架构' },
    ],
  },
  PRODUCT_DEFINITION: {
    headline: '产品定义通用框架（需结合具体 ODD 落地）',
    detail:
      '智驾产品定义可从 **价值主张**、**ODD 边界**、**用户场景**、**商业 ROI** 四个维度切入。建议步骤：\n1) **价值排序**：安全 > 效率 > 舒适 > 便捷\n2) **场景反推**：从 Top10 高频危险场景反推功能优先级\n3) **ODD 设定**：地理 / 速度 / 天气 / 时间四元组\n4) **差异化**：从行业头部（华为 / 小鹏 / 理想 / 蔚来 / Tesla / 比亚迪）找位差',
    terms: [
      { term: 'ODD', desc: '运行设计域，决定产品在哪儿能用' },
      { term: 'MPI', desc: '每千公里接管数，衡量 L2+ 体验' },
    ],
  },
  SAFETY_COMPLIANCE: {
    headline: '功能安全与 SOTIF 双底座',
    detail:
      '智驾合规体系由 **ISO 26262（功能安全）** + **ISO 21448（SOTIF 预期功能安全）** + **ISO 21434（信息安全）** + **UN-R157（L3 准入）** 构成。当前问题涉及的具体条款需要进一步明确：是系统失效、性能局限、还是网络安全？',
    terms: [
      { term: 'ASIL', desc: '汽车安全完整性等级 A/B/C/D' },
      { term: 'SOTIF', desc: '预期功能安全，处理长尾场景' },
      { term: 'DSSAD', desc: '数据存储系统，自动驾驶黑匣子' },
    ],
  },
  USER_EXPERIENCE: {
    headline: '智驾 UX 三原则：可视化 + 拟人化 + 异常优先',
    detail:
      '优秀的智驾 HMI 需让用户 **看见系统在做什么**、**理解系统为什么这么做**、**在异常时第一时间接管**。具体设计要点：\n- 视觉：360° 感知可视化 + 轨迹预测\n- 听觉：变道/转向提示音 + 接管语音\n- 触觉：方向盘震动 + 安全带预紧',
  },
  BUSINESS_COMPETITION: {
    headline: '2025 智驾市场六分天下',
    detail:
      '当前国内智驾市场可分 **新势力（蔚/小/理/华）**、**传统转型（比亚迪/吉利/长安）**、**华为系（鸿蒙智行）**、**Tesla**、**L4 降维（小马/文远/百度）**、**Tier-1（华为车 BU / 大陆 / 博世）** 六大阵营。竞争维度从"硬件 BOM"转向"数据闭环 + 算法迭代 + 用户体验"。',
  },
  SCENARIO_SYSTEM_THINKING: {
    headline: '场景化拆解四步法',
    detail:
      '智驾是高度场景化的领域，建议按 **场景 → 触发条件 → 系统行为 → 边界** 四步拆解：\n1) **场景识别**：定义具体场景（高速汇入 / 无保护左转 / 鬼探头）\n2) **触发条件**：列出进入该场景的 N 个判定\n3) **系统行为**：期望智驾系统的输出（让/超/停）\n4) **边界与降级**：ODD 越界时的 MRM 流程',
  },
} as const;

const TLDR_FALLBACK =
  '我目前没在知识库中找到与该问题完全匹配的条目。下方基于智驾通用分析框架给出六维参考，并提示如何进一步定位。';

/** 模板兜底：根据问题命中的维度返回结构化答案 */
function buildTemplateStructure(question: string): SixDimensionAnswer {
  // 命中维度（可能多个）
  const dims = KEYWORD_TO_DIMENSION.filter((k) => k.re.test(question));
  const used = new Set<keyof typeof DIM_TEMPLATES>();

  const dimensions: SixDimensionAnswer['dimensions'] = [];

  for (const { dim } of dims) {
    if (used.has(dim)) continue;
    used.add(dim);
    const t = DIM_TEMPLATES[dim];
    dimensions.push({
      dimension: dim as any,
      headline: t.headline,
      detail: (t as any).detail,
      terms: (t as any).terms,
      confidence: 0.55,
    });
  }

  // 至少填满 3 个维度
  const allDims: Array<keyof typeof DIM_TEMPLATES> = [
    'TECH_UNDERSTANDING',
    'PRODUCT_DEFINITION',
    'SAFETY_COMPLIANCE',
    'USER_EXPERIENCE',
    'BUSINESS_COMPETITION',
    'SCENARIO_SYSTEM_THINKING',
  ];
  for (const d of allDims) {
    if (dimensions.length >= 3) break;
    if (used.has(d)) continue;
    used.add(d);
    const t = DIM_TEMPLATES[d];
    dimensions.push({
      dimension: d as any,
      headline: t.headline,
      detail: (t as any).detail,
      terms: (t as any).terms,
      confidence: 0.45,
    });
  }

  return {
    tldr: TLDR_FALLBACK,
    dimensions,
    actions: [
      '尝试用更具体的关键词（"激光雷达"、"端到端"、"ISO 26262"）命中预置知识库',
      '在「全景图谱」/「题库」中检索相关术语',
      '后续接入真实大模型后，这里将由 LLM 基于 RAG 生成更精准的回答',
    ],
    related: [
      { label: '全景图谱', to: '/graph' },
      { label: '面试题库', to: '/interview' },
      { label: '场景模拟器', to: '/simulator' },
    ],
  };
}

/** 文本回答兜底（用于流式 delta 推送） */
function buildTemplateAnswer(question: string): string {
  const dims = KEYWORD_TO_DIMENSION.filter((k) => k.re.test(question));
  const primary = dims[0]?.dim ?? 'TECH_UNDERSTANDING';
  const t = DIM_TEMPLATES[primary];

  return `> ⚠️ **未命中知识库，已切换为 LLM 兜底回答**（当前为离线模板版）

我目前在预置知识库中没有找到与"**${question.slice(0, 40)}${
    question.length > 40 ? '…' : ''
  }**"完全匹配的条目。下面用通用分析框架给你一些方向：

## ${t.headline}

${(t as any).detail}

## 建议的下一步

1. **把问题拆得更具体**：例如加上限定词"原理 / 案例 / 对比 / 选型"
2. **跨模块检索**：在「全景图谱」中按维度浏览，定位具体子模块
3. **场景化训练**：用「场景模拟器」用具体场景训练系统思维
4. **真题练手**：在「题库」中按岗位刷相关面试题

> 💡 后续接入真实 LLM 后，这里会由大模型基于 RAG 知识库实时生成更专业、更具体的回答。`;
}

/**
 * 离线 LLM 兜底：模拟流式输出
 * 后续接入真实 LLM 时，把 generate() 替换为 fetch 真实后端即可
 */
export async function generate(
  payload: { prompt: string; relatedKBItems?: { id: string; title: string; summary: string | null }[] },
  handlers: {
    signal?: AbortSignal;
    onEvent?: (ev: any) => void;
    onComplete?: () => void;
    onError?: (err: Error) => void;
  },
) {
  const answer = buildTemplateAnswer(payload.prompt);
  const structure = buildTemplateStructure(payload.prompt);
  const followups = [
    '能不能给一个具体的行业案例？',
    '这背后的技术原理是什么？',
    '相关竞品是怎么做的？',
  ];

  try {
    // 1) 先推结构
    handlers.onEvent?.({ type: 'structure', answer: structure });

    // 2) 推流式 delta
    for (let i = 0; i < answer.length; i++) {
      if (handlers.signal?.aborted) return;
      await sleep(18);
      handlers.onEvent?.({ type: 'delta', text: answer[i] });
    }

    // 3) 推追问
    handlers.onEvent?.({ type: 'followup', suggestions: followups });

    // 4) done
    handlers.onEvent?.({ type: 'done', totalTokens: answer.length });
    handlers.onComplete?.();
  } catch (err) {
    handlers.onError?.(err as Error);
  }
}

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

export const llmService = { generate };
