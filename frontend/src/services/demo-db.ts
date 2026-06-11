import type { Dimension } from '@/types';

export type DemoRole = 'USER' | 'ADMIN' | 'EXPERT';
export type DemoPosition =
  | 'PRODUCT_MANAGER'
  | 'ALGO_ENGINEER'
  | 'PERCEPTION_ENGINEER'
  | 'PLANNING_ENGINEER'
  | 'TEST_ENGINEER'
  | 'SAFETY_ENGINEER'
  | 'SALES_SOLUTION'
  | 'OTHER';
export type DemoDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';

export interface DemoUserRecord {
  id: string;
  email: string;
  username: string;
  password: string;
  role: DemoRole;
  avatar: string | null;
  bio: string | null;
  createdAt: string;
}

export interface DemoKnowledgeRecord {
  id: string;
  title: string;
  summary: string | null;
  content: string;
  dimension: Dimension;
  tags: string[];
  source: string | null;
  viewCount: number;
  updatedAt: string;
}

export interface DemoInterviewRecord {
  id: string;
  position: DemoPosition;
  difficulty: DemoDifficulty;
  stem: string;
  intent: string;
  answer: string;
  keypoints: string[];
  tags: string[];
  relatedKBId: string | null;
  createdAt: string;
}

export interface DemoMockExamRecord {
  id: string;
  score: number;
  position: DemoPosition;
  createdAt: string;
}

export interface DemoProgressRecord {
  masteredKnowledgeIds: string[];
  mockExamRecords: DemoMockExamRecord[];
}

export interface DemoConversationRecord {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface DemoMessageRecord {
  id: string;
  conversationId: string;
  role: string;
  content: string;
  tokensUsed: number | null;
  createdAt: string;
}

const TOKEN_KEY = 'adas_token';
const USERS_KEY = 'adas_demo_users_v1';
const KNOWLEDGE_KEY = 'adas_demo_knowledge_v1';
const INTERVIEW_KEY = 'adas_demo_interview_v1';
const PROGRESS_KEY = 'adas_demo_progress_v1';
const DEMO_MODE_KEY = 'adas_demo_mode_v1';
const CONVERSATIONS_KEY = 'adas_demo_conversations_v1';
const MESSAGES_KEY = 'adas_demo_messages_v1';

const SEED_USERS: DemoUserRecord[] = [
  {
    id: 'user_demo',
    email: 'demo@adas.wiki',
    username: 'demouser',
    password: 'demo1234',
    role: 'USER',
    avatar: null,
    bio: '纯前端 Demo 账号，可本地保存学习进度与面试记录。',
    createdAt: '2026-06-01T09:00:00.000Z',
  },
  {
    id: 'user_admin',
    email: 'admin@adas.wiki',
    username: 'admin',
    password: 'admin123',
    role: 'ADMIN',
    avatar: null,
    bio: '演示管理员账号，用于体验更完整的资料编辑视角。',
    createdAt: '2026-06-01T08:00:00.000Z',
  },
];

const SEED_KNOWLEDGE: DemoKnowledgeRecord[] = [
  {
    id: 'kb_lidar_principle',
    title: '激光雷达工作原理与车规选型',
    summary: '主动式 ToF 测距生成 3D 点云；905nm 与 1550nm 两类波长存在成本与安全权衡。',
    content:
      '激光雷达通过发射激光脉冲并测量反射光飞行时间得到距离，再结合扫描角度输出三维点云。在量产车规方案中，905nm 成本更低、产业链更成熟；1550nm 则在人眼安全和探测距离上更具潜力。产品选型时需要同时评估成本、体积、功耗、雨雾衰减、感知冗余与供应链稳定性。',
    dimension: 'TECH_UNDERSTANDING',
    tags: ['LiDAR', '传感器', '感知'],
    source: 'Demo Seed',
    viewCount: 1280,
    updatedAt: '2026-06-11T00:00:00.000Z',
  },
  {
    id: 'kb_bev_paradigm',
    title: 'BEV 范式与端到端融合',
    summary: '多相机特征统一投影到俯视空间，是端到端智驾的基础表征。',
    content:
      'BEV 把多个摄像头的图像特征统一到俯视坐标系，让检测、跟踪、预测和规划使用同一空间表征。相比传统多相机后处理拼接，BEV 更适合时序融合、多模态融合和端到端优化，也是当前无图化城市 NOA 的核心技术底座。',
    dimension: 'TECH_UNDERSTANDING',
    tags: ['BEV', 'Transformer', '端到端'],
    source: 'Demo Seed',
    viewCount: 1160,
    updatedAt: '2026-06-10T00:00:00.000Z',
  },
  {
    id: 'kb_occupancy',
    title: 'Occupancy Network 与未知障碍物检测',
    summary: '体素级占据预测提升对长尾、异形和未知障碍物的鲁棒性。',
    content:
      'Occupancy 网络不先假设目标类别，而是直接预测空间是否被占据，因此对施工路障、掉落物、异形车等长尾目标更友好。它在 SOTIF 视角下很有价值，因为很多危险场景并不是系统故障，而是系统没见过的新型障碍物。',
    dimension: 'TECH_UNDERSTANDING',
    tags: ['Occupancy', 'SOTIF', '感知'],
    source: 'Demo Seed',
    viewCount: 980,
    updatedAt: '2026-06-09T00:00:00.000Z',
  },
  {
    id: 'kb_iso26262',
    title: 'ISO 26262 功能安全基础',
    summary: '面向电子电气系统故障的 V 模型、ASIL 等级与安全机制设计。',
    content:
      'ISO 26262 关注系统失效导致的安全风险，核心包括危害分析与风险评估、ASIL 分级、功能安全概念、技术安全概念和验证确认活动。对智驾团队来说，它回答的是“系统坏了怎么办”。',
    dimension: 'SAFETY_COMPLIANCE',
    tags: ['ISO 26262', '功能安全', 'ASIL'],
    source: 'Demo Seed',
    viewCount: 845,
    updatedAt: '2026-06-08T00:00:00.000Z',
  },
  {
    id: 'kb_sotif',
    title: 'SOTIF 预期功能安全',
    summary: '无故障状态下，由感知与算法性能局限导致的不合理输出。',
    content:
      'SOTIF 关注的是“系统没坏，但场景太复杂或数据不充分导致它判断错了怎么办”。它强调场景触发条件分析、已知与未知区域划分，以及针对长尾场景的验证覆盖。',
    dimension: 'SAFETY_COMPLIANCE',
    tags: ['SOTIF', 'ISO 21448', '长尾场景'],
    source: 'Demo Seed',
    viewCount: 812,
    updatedAt: '2026-06-07T00:00:00.000Z',
  },
  {
    id: 'kb_product_positioning',
    title: '智驾产品价值主张',
    summary: '从安全、效率、舒适、便捷四个维度定义智驾产品价值。',
    content:
      '智驾产品定义不能只讲技术堆料，更要说明用户为什么愿意用。常见价值框架包括安全感提升、通勤效率提升、驾驶疲劳缓解和体验差异化。功能取舍应回到 ODD 与高频场景，而不是盲目追求功能数量。',
    dimension: 'PRODUCT_DEFINITION',
    tags: ['产品定位', '价值主张', 'ODD'],
    source: 'Demo Seed',
    viewCount: 731,
    updatedAt: '2026-06-06T00:00:00.000Z',
  },
  {
    id: 'kb_competitor_landscape',
    title: '智驾方案竞争格局',
    summary: '纯视觉与多模态、开城规模、自研芯片与数据闭环构成竞争主轴。',
    content:
      '头部玩家的差异不仅在硬件配置，更在数据闭环能力、迭代速度、开城节奏、法规策略和用户体验。竞品分析应同时看技术路线、商业模式与品牌叙事，而不是只比传感器颗数。',
    dimension: 'BUSINESS_COMPETITION',
    tags: ['竞品', '行业格局', '商业化'],
    source: 'Demo Seed',
    viewCount: 688,
    updatedAt: '2026-06-05T00:00:00.000Z',
  },
  {
    id: 'kb_scenario_method',
    title: '场景四步拆解法',
    summary: '按“场景-触发条件-系统行为-边界”拆解智驾问题。',
    content:
      '智驾问题一定要回到具体场景。把问题拆成场景、触发条件、期望行为和 ODD 边界后，跨团队才有统一语言。这个方法特别适合产品定义、SOTIF 评估和测试用例设计。',
    dimension: 'SCENARIO_SYSTEM_THINKING',
    tags: ['场景方法', 'ODD', '测试'],
    source: 'Demo Seed',
    viewCount: 624,
    updatedAt: '2026-06-04T00:00:00.000Z',
  },
  {
    id: 'kb_takeover_hmi',
    title: '接管 HMI 多模态设计',
    summary: '视觉、听觉、触觉三层提示决定 L2/L3 系统的最后一公里体验。',
    content:
      '用户是否敢用智驾，很大程度取决于接管提示是否明确、及时、可信。接管 HMI 不只是 UI 设计，更是安全策略的一部分，涉及提示分级、倒计时、最小风险策略和用户信任管理。',
    dimension: 'USER_EXPERIENCE',
    tags: ['HMI', '接管', '多模态'],
    source: 'Demo Seed',
    viewCount: 592,
    updatedAt: '2026-06-03T00:00:00.000Z',
  },
  {
    id: 'kb_data_closed_loop',
    title: '数据闭环与影子模式',
    summary: '真实路测、影子模式、自动标注和主动学习共同形成模型迭代飞轮。',
    content:
      '影子模式用于在不控制车辆的情况下并行跑一套新策略，比较它与线上策略的差异，再把关键场景回流用于训练和验证。没有数据闭环，再好的模型也难以持续进化。',
    dimension: 'TECH_UNDERSTANDING',
    tags: ['数据闭环', '影子模式', '自动标注'],
    source: 'Demo Seed',
    viewCount: 570,
    updatedAt: '2026-06-02T00:00:00.000Z',
  },
  {
    id: 'kb_planning_control',
    title: '规控 Planning & Control',
    summary: '规划负责“怎么走”，控制负责“怎么执行”，共同决定拟人化与稳定性。',
    content:
      '规划层给出路径、行为和轨迹，控制层把轨迹转换为方向盘、油门和刹车。规则驱动、学习型规划、端到端规控是当前三条主要路线，工程上通常还会保留显式安全兜底。',
    dimension: 'TECH_UNDERSTANDING',
    tags: ['规控', 'MPC', 'LQR'],
    source: 'Demo Seed',
    viewCount: 556,
    updatedAt: '2026-06-01T00:00:00.000Z',
  },
  {
    id: 'kb_test_methodology',
    title: '智驾测试方法论',
    summary: 'SIL、HIL、VIL、道路测试和场景库是量产验证的组合拳。',
    content:
      '量产前验证不能只靠路测。软件在环、硬件在环、整车在环、仿真回放和场景库回归共同构成验证体系。测试价值不在于堆公里数，而在于高风险场景的覆盖深度。',
    dimension: 'TECH_UNDERSTANDING',
    tags: ['测试', 'SIL', 'HIL', '场景库'],
    source: 'Demo Seed',
    viewCount: 521,
    updatedAt: '2026-05-31T00:00:00.000Z',
  },
];

const SEED_INTERVIEW: DemoInterviewRecord[] = [
  {
    id: 'q_pm_002',
    position: 'PRODUCT_MANAGER',
    difficulty: 'EASY',
    stem: '你怎么理解“智驾产品经理”这个岗位？它和传统互联网 PM 的核心区别是什么？',
    intent: '考察候选人对智驾 PM 角色差异化的认知深度。',
    answer:
      '智驾 PM 不是只写 PRD，而是在“用户价值、技术边界、法规责任、商业回报”之间做平衡的人。与传统互联网 PM 相比，智驾 PM 必须理解 ODD、接管责任、功能安全、数据闭环和跨团队协作，因为一次错误决策可能直接影响人身安全。',
    keypoints: ['强调安全与 ODD', '能区分互联网 PM 与智驾 PM 的约束差异', '体现跨学科沟通能力'],
    tags: ['岗位认知', '产品经理'],
    relatedKBId: 'kb_product_positioning',
    createdAt: '2026-06-11T09:00:00.000Z',
  },
  {
    id: 'q_pm_003',
    position: 'PRODUCT_MANAGER',
    difficulty: 'EASY',
    stem: '请解释什么是 ODD（运行设计域），为什么它对智驾产品至关重要？',
    intent: '考察候选人对 ODD 概念的掌握以及产品化理解。',
    answer:
      'ODD 是系统被设计为可以安全运行的条件集合，至少包括道路、天气、时间、速度、地理范围和交通参与者。它决定产品在哪能用、宣传能怎么讲、责任如何划分、越界时如何降级，因此可以理解为智驾产品的边界说明书。',
    keypoints: ['列出 ODD 维度', '说明 ODD 对产品定义和责任划分的重要性', '提到越界降级'],
    tags: ['ODD', '基础概念'],
    relatedKBId: 'kb_product_positioning',
    createdAt: '2026-06-11T09:05:00.000Z',
  },
  {
    id: 'q_pm_005',
    position: 'PRODUCT_MANAGER',
    difficulty: 'MEDIUM',
    stem: '请设计一个“城市 NOA”的 MVP 方案。',
    intent: '考察候选人的 MVP 思维、场景边界意识和功能取舍能力。',
    answer:
      '城市 NOA 的 MVP 应限定在结构化道路、白天晴天、Top5 城市、车速 60km/h 以内，只做红绿灯识别、城区 LCC、简单转向和障碍物识别，不做复杂无保护左转、极端天气和施工改道深度博弈。成功指标应包含 ODD 内可用率、MPI 和用户 NPS。',
    keypoints: ['范围克制', 'ODD 清晰', '有量化成功指标'],
    tags: ['城市NOA', 'MVP'],
    relatedKBId: 'kb_scenario_method',
    createdAt: '2026-06-11T09:10:00.000Z',
  },
  {
    id: 'q_algo_001',
    position: 'ALGO_ENGINEER',
    difficulty: 'MEDIUM',
    stem: '为什么当前多相机感知几乎都绕不开 BEV？',
    intent: '考察候选人对多视角融合与统一空间表征的理解。',
    answer:
      'BEV 的核心价值是把多个摄像头特征统一到一个俯视坐标系，让检测、跟踪、预测和规划共享同一空间。这样可以降低多相机之间的几何不一致问题，也便于时序和多模态融合，是端到端范式的重要中间表征。',
    keypoints: ['统一空间表征', '几何一致性', '有利于多任务共享'],
    tags: ['BEV', '多相机', '感知'],
    relatedKBId: 'kb_bev_paradigm',
    createdAt: '2026-06-11T09:15:00.000Z',
  },
  {
    id: 'q_perception_001',
    position: 'PERCEPTION_ENGINEER',
    difficulty: 'HARD',
    stem: 'LiDAR、Camera、Radar 在量产智驾中应该如何做融合取舍？',
    intent: '考察候选人对多传感器能力边界和量产约束的理解。',
    answer:
      'Camera 成本低、语义强，但深度和夜间能力有限；LiDAR 距离精度和 3D 结构强，但成本和体积高；Radar 对速度和恶劣天气更稳。量产上通常不是单一传感器最优，而是围绕目标价位、ODD、冗余等级和供应链成熟度做取舍，再决定采用前融合、中融合还是后融合。',
    keypoints: ['讲清三类传感器优劣', '说明量产约束', '能把方案与 ODD 绑定'],
    tags: ['传感器融合', 'LiDAR', 'Camera', 'Radar'],
    relatedKBId: 'kb_lidar_principle',
    createdAt: '2026-06-11T09:20:00.000Z',
  },
  {
    id: 'q_planning_001',
    position: 'PLANNING_ENGINEER',
    difficulty: 'MEDIUM',
    stem: 'MPC 和 PID 在规控系统中的使用边界分别是什么？',
    intent: '考察候选人对经典控制方法与工程折中的认知。',
    answer:
      'PID 实现简单、调参直观，适合纵向速度控制等相对单一场景；MPC 能显式处理约束和多变量耦合，更适合横纵联合控制和复杂轨迹跟踪，但对算力与模型精度要求更高。实际工程里常见组合式方案，而不是二选一。',
    keypoints: ['说明 PID 简洁优势', '说明 MPC 约束处理能力', '能讲工程折中'],
    tags: ['MPC', 'PID', '规控'],
    relatedKBId: 'kb_planning_control',
    createdAt: '2026-06-11T09:25:00.000Z',
  },
  {
    id: 'q_test_001',
    position: 'TEST_ENGINEER',
    difficulty: 'MEDIUM',
    stem: '你如何设计智驾系统的验证闭环，而不是只做“堆路测里程”？',
    intent: '考察候选人对验证方法论和高风险场景覆盖的理解。',
    answer:
      '完整闭环应由仿真场景库、SIL/HIL、回放回归、道路测试和问题回流组成。关键不是里程数，而是对高风险场景的覆盖密度、问题复现能力和回归效率。每一次接管和异常都应该变成新的验证资产。',
    keypoints: ['不是只看里程', '重视场景库与回归', '强调问题回流'],
    tags: ['测试', '验证闭环', '场景库'],
    relatedKBId: 'kb_test_methodology',
    createdAt: '2026-06-11T09:30:00.000Z',
  },
  {
    id: 'q_safety_001',
    position: 'SAFETY_ENGINEER',
    difficulty: 'MEDIUM',
    stem: 'ISO 26262 和 SOTIF 的差别是什么？在智驾项目里怎么配合使用？',
    intent: '考察候选人是否能正确区分“系统故障”和“性能局限”两类风险。',
    answer:
      'ISO 26262 解决的是系统故障带来的风险，SOTIF 解决的是系统没坏但感知和算法能力不足导致的风险。智驾项目里，两者必须并行推进：前者保证架构和失效兜底，后者保证对复杂真实场景的能力边界有清晰认知。',
    keypoints: ['故障 vs 性能局限', '两者互补而非替代', '能结合智驾场景解释'],
    tags: ['ISO 26262', 'SOTIF', '安全'],
    relatedKBId: 'kb_iso26262',
    createdAt: '2026-06-11T09:35:00.000Z',
  },
  {
    id: 'q_sales_001',
    position: 'SALES_SOLUTION',
    difficulty: 'EASY',
    stem: '如果主机厂客户问“你们的城市 NOA 到底能在哪些地方稳定用”，你会怎么回答？',
    intent: '考察候选人是否能把技术边界翻译成客户能理解的话术。',
    answer:
      '我会先回答 ODD，而不是直接承诺“全国都能开”。比如明确哪些城市、哪些道路类型、什么天气和时间条件下效果最好，再解释当前版本的降级策略和后续开城节奏。销售阶段最忌讳模糊承诺，因为它最终会反噬客户预期和品牌信任。',
    keypoints: ['先讲 ODD', '避免过度承诺', '把技术边界翻译成客户语言'],
    tags: ['销售', 'ODD', '解决方案'],
    relatedKBId: 'kb_product_positioning',
    createdAt: '2026-06-11T09:40:00.000Z',
  },
  {
    id: 'q_algo_002',
    position: 'ALGO_ENGINEER',
    difficulty: 'HARD',
    stem: '为什么 Occupancy 对未知障碍物比传统检测框架更有价值？',
    intent: '考察候选人对开放集感知和长尾问题的理解。',
    answer:
      '传统检测依赖类别标签，遇到训练集中未覆盖的目标时容易漏检；Occupancy 直接预测空间占据情况，不强依赖类别先验，因此对异形、长尾和未知障碍物更稳。它的价值并不在替代所有检测，而在于补齐开放世界感知能力。',
    keypoints: ['传统检测依赖类别标签', 'Occupancy 更适合开放世界', '说明两者是互补关系'],
    tags: ['Occupancy', '长尾场景', '开放集'],
    relatedKBId: 'kb_occupancy',
    createdAt: '2026-06-11T09:45:00.000Z',
  },
];

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readJson<T>(key: string, fallback: T): T {
  if (!isBrowser()) return clone(fallback);
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return clone(fallback);
    return JSON.parse(raw) as T;
  } catch {
    return clone(fallback);
  }
}

function writeJson<T>(key: string, value: T) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore write failures
  }
}

export function createDemoId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36)}`;
}

export function ensureDemoDb() {
  if (!isBrowser()) return;
  if (!localStorage.getItem(DEMO_MODE_KEY)) {
    localStorage.setItem(DEMO_MODE_KEY, 'true');
  }
  if (!localStorage.getItem(USERS_KEY)) {
    writeJson(USERS_KEY, SEED_USERS);
  }
  if (!localStorage.getItem(KNOWLEDGE_KEY)) {
    writeJson(KNOWLEDGE_KEY, SEED_KNOWLEDGE);
  }
  if (!localStorage.getItem(INTERVIEW_KEY)) {
    writeJson(INTERVIEW_KEY, SEED_INTERVIEW);
  }
  if (!localStorage.getItem(PROGRESS_KEY)) {
    writeJson<Record<string, DemoProgressRecord>>(PROGRESS_KEY, {
      user_demo: {
        masteredKnowledgeIds: [
          'kb_lidar_principle',
          'kb_bev_paradigm',
          'kb_iso26262',
          'kb_product_positioning',
          'kb_takeover_hmi',
          'kb_data_closed_loop',
        ],
        mockExamRecords: [
          { id: 'mock_1', score: 78, position: 'PRODUCT_MANAGER', createdAt: '2026-06-08T19:20:00.000Z' },
          { id: 'mock_2', score: 82, position: 'PRODUCT_MANAGER', createdAt: '2026-06-09T20:10:00.000Z' },
          { id: 'mock_3', score: 86, position: 'ALGO_ENGINEER', createdAt: '2026-06-10T21:00:00.000Z' },
        ],
      },
      user_admin: {
        masteredKnowledgeIds: SEED_KNOWLEDGE.slice(0, 8).map((item) => item.id),
        mockExamRecords: [
          { id: 'mock_4', score: 91, position: 'SAFETY_ENGINEER', createdAt: '2026-06-09T18:00:00.000Z' },
          { id: 'mock_5', score: 93, position: 'SALES_SOLUTION', createdAt: '2026-06-10T18:00:00.000Z' },
        ],
      },
    });
  }
}

export function isDemoModeEnabled() {
  ensureDemoDb();
  return true;
}

export function listKnowledgeRecords() {
  ensureDemoDb();
  return readJson<DemoKnowledgeRecord[]>(KNOWLEDGE_KEY, SEED_KNOWLEDGE);
}

export function saveKnowledgeRecords(records: DemoKnowledgeRecord[]) {
  ensureDemoDb();
  writeJson(KNOWLEDGE_KEY, records);
}

export function listInterviewRecords() {
  ensureDemoDb();
  return readJson<DemoInterviewRecord[]>(INTERVIEW_KEY, SEED_INTERVIEW);
}

export function saveInterviewRecords(records: DemoInterviewRecord[]) {
  ensureDemoDb();
  writeJson(INTERVIEW_KEY, records);
}

export function listConversations() {
  ensureDemoDb();
  return readJson<DemoConversationRecord[]>(CONVERSATIONS_KEY, []);
}

export function saveConversations(records: DemoConversationRecord[]) {
  ensureDemoDb();
  writeJson(CONVERSATIONS_KEY, records);
}

export function listMessages() {
  ensureDemoDb();
  return readJson<DemoMessageRecord[]>(MESSAGES_KEY, []);
}

export function saveMessages(records: DemoMessageRecord[]) {
  ensureDemoDb();
  writeJson(MESSAGES_KEY, records);
}

export function listUserRecords() {
  ensureDemoDb();
  return readJson<DemoUserRecord[]>(USERS_KEY, SEED_USERS);
}

export function saveUserRecords(records: DemoUserRecord[]) {
  ensureDemoDb();
  writeJson(USERS_KEY, records);
}

function parseUserIdFromToken(token: string | null) {
  if (!token) return null;
  if (!token.startsWith('demo-token:')) return null;
  return token.slice('demo-token:'.length) || null;
}

export function makeToken(userId: string) {
  return `demo-token:${userId}`;
}

export function getCurrentUserRecord() {
  ensureDemoDb();
  const userId = parseUserIdFromToken(isBrowser() ? localStorage.getItem(TOKEN_KEY) : null);
  if (!userId) return null;
  return listUserRecords().find((user) => user.id === userId) ?? null;
}

export function sanitizeUser(user: DemoUserRecord) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    avatar: user.avatar,
    bio: user.bio,
    createdAt: user.createdAt,
  };
}

export function getProgressMap() {
  ensureDemoDb();
  return readJson<Record<string, DemoProgressRecord>>(PROGRESS_KEY, {});
}

export function getUserProgressRecord(userId: string) {
  const progressMap = getProgressMap();
  return (
    progressMap[userId] ?? {
      masteredKnowledgeIds: [],
      mockExamRecords: [],
    }
  );
}

export function saveUserProgressRecord(userId: string, progress: DemoProgressRecord) {
  const progressMap = getProgressMap();
  progressMap[userId] = progress;
  writeJson(PROGRESS_KEY, progressMap);
}

export function getChatQuestionCount() {
  if (!isBrowser()) return 0;
  try {
    const raw = localStorage.getItem('adas_qna_v1');
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as {
      messages?: Record<string, Array<{ role?: string }>>;
    };
    return Object.values(parsed.messages ?? {}).reduce((sum, messages) => {
      return sum + messages.filter((message) => message.role === 'USER').length;
    }, 0);
  } catch {
    return 0;
  }
}
