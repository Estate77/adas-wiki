/**
 * 数据库种子：写入一个管理员账户、丰富知识库、100+ 面试题
 * 运行：npm run prisma:seed
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const KB_ITEMS: Array<{
  id: string; title: string; summary: string; content: string;
  dimension: string; tags: string[]; source?: string;
}> = [
  { id: 'kb_lidar_principle', title: '激光雷达工作原理与车规选型',
    summary: '主动式 ToF 测距生成 3D 点云；905nm/1550nm 两类波长权衡',
    content: '激光雷达通过发射激光脉冲并测量反射光飞行时间（ToF）得到距离；扫描机构按角度输出(x,y,z,intensity)点云。905nm 成本低、1550nm 安全性高。',
    dimension: 'TECH_UNDERSTANDING', tags: ['传感器', 'LiDAR', '感知'] },
  { id: 'kb_bev_paradigm', title: 'BEV 范式与端到端融合',
    summary: '多相机特征统一投影到俯视空间，是端到端智驾的基础表征',
    content: 'BEV 通过 Transformer/深度估计将多相机特征变换到俯视栅格，下游检测/跟踪/预测/规划共享同一表征。',
    dimension: 'TECH_UNDERSTANDING', tags: ['BEV', '感知', 'Transformer'] },
  { id: 'kb_occupancy', title: 'Occupancy Network 与未知障碍物检测',
    summary: '体素级 0/1 占据预测，解决 SOTIF 长尾场景',
    content: 'Occupancy 网络输出体素级占据/不占据，对训练集外异形障碍物天然鲁棒，是 SOTIF 风险评估关键。',
    dimension: 'TECH_UNDERSTANDING', tags: ['Occupancy', 'SOTIF', '感知'] },
  { id: 'kb_iso26262', title: 'ISO 26262 功能安全基础',
    summary: '电子电气系统故障的 V 模型 + ASIL 等级 + 安全机制',
    content: 'ISO 26262 关注系统性失效与随机硬件失效；ASIL 分 A/B/C/D 等级；要求 FMEA、冗余、独立监控。',
    dimension: 'SAFETY_COMPLIANCE', tags: ['功能安全', 'ISO 26262', 'ASIL'] },
  { id: 'kb_sotif', title: 'SOTIF 预期功能安全',
    summary: '无故障时由于感知/算法局限造成的不合理输出',
    content: 'ISO 21448 把场景拆为四象限，要求触发条件分析与区域降级。',
    dimension: 'SAFETY_COMPLIANCE', tags: ['SOTIF', '预期功能安全', '长尾场景'] },
  { id: 'kb_isa_l3', title: 'L3 准入与 UN-R157 法规',
    summary: 'L3 系统在 ODD 内负主责；DSSAD 数据记录器',
    content: 'UN-R157 限速 130km/h；要求 DSSAD、ALKS、10s 接管 + MRM 兜底。',
    dimension: 'SAFETY_COMPLIANCE', tags: ['L3', 'UN-R157', 'DSSAD'] },
  { id: 'kb_e2e_autonomous', title: '端到端自动驾驶',
    summary: '传感器→控制的一体化神经网络',
    content: '取消人工模块切分，用一个大模型从传感器直接输出轨迹/控制。',
    dimension: 'TECH_UNDERSTANDING', tags: ['端到端', 'E2E', 'UniAD'] },
  { id: 'kb_planning_control', title: '规控 Planning & Control',
    summary: '规划=全局+行为+局部轨迹；控制=LQR/MPC/PID',
    content: '规划解决接下来怎么走，控制解决怎么执行。',
    dimension: 'TECH_UNDERSTANDING', tags: ['规控', 'MPC', 'LQR'] },
  { id: 'kb_v2x', title: 'V2X 车路协同',
    summary: 'V2V/V2I/V2P/V2N 四类通信',
    content: 'C-V2X 基于蜂窝通信，分短距 PC5 与长距 Uu。',
    dimension: 'TECH_UNDERSTANDING', tags: ['V2X', 'C-V2X', '车路协同'] },
  { id: 'kb_data_closed_loop', title: '数据闭环与影子模式',
    summary: '影子模式 + 自动标注 + 数据回流',
    content: '真实路测+影子模式+自动标注+主动学习构成数据飞轮。',
    dimension: 'TECH_UNDERSTANDING', tags: ['数据闭环', '影子模式', '标注'] },
  { id: 'kb_4d_radar', title: '4D 成像毫米波雷达',
    summary: '增加俯仰维度 + 更高点云密度',
    content: '4D 雷达可输出 (x,y,z,velocity) 密集点云。',
    dimension: 'TECH_UNDERSTANDING', tags: ['毫米波雷达', '4D', '传感器'] },
  { id: 'kb_simulation', title: '仿真回放与场景库',
    summary: 'CARLA / Waymax + 高保真场景库',
    content: '仿真回放 + 场景泛化 + 闭环 SIL/HIL 测试是量产前关键。',
    dimension: 'TECH_UNDERSTANDING', tags: ['仿真', '回放', '测试'] },
  { id: 'kb_localization', title: 'GNSS+RTK+IMU 高精定位',
    summary: '厘米级定位是城市 NOA 鲁棒性的关键',
    content: 'RTK 差分定位 + IMU 航位推算 + 视觉定位融合。',
    dimension: 'TECH_UNDERSTANDING', tags: ['定位', 'RTK', 'IMU'] },
  { id: 'kb_market_data', title: '2025 中国智驾市场数据',
    summary: 'NOA 渗透率、城市覆盖、出货量',
    content: '2025 H1 城市 NOA 渗透率约 18%，头部开城 300+。',
    dimension: 'BUSINESS_COMPETITION', tags: ['市场数据', '渗透率', '2025'] },
  { id: 'kb_safety_case', title: 'Safety Case 与 SOTIF 论证',
    summary: 'L3+ 验收的核心证据：Goal → Argument → Evidence',
    content: 'Safety Case 用 GSN 把安全目标→论证→证据结构化。',
    dimension: 'SAFETY_COMPLIANCE', tags: ['Safety Case', 'GSN', 'SOTIF'] },
  { id: 'kb_product_positioning', title: '智驾产品价值主张',
    summary: '安全/效率/舒适/便捷四维度',
    content: '从 ODD 边界内高频场景反推功能优先级。',
    dimension: 'PRODUCT_DEFINITION', tags: ['产品定位', '价值主张'] },
  { id: 'kb_competitor_landscape', title: '智驾方案竞争格局',
    summary: '六大玩家路线对比',
    content: '纯视觉 vs 多模态、城区开城、自研芯片、数据闭环是核心竞争维度。',
    dimension: 'BUSINESS_COMPETITION', tags: ['竞品', '行业格局', '市场分析'] },
  { id: 'kb_scenario_method', title: 'SOTIF 场景四象限方法',
    summary: '已知/未知 × 安全/危险',
    content: 'SOTIF 方法学把场景拆为四象限。',
    dimension: 'SCENARIO_SYSTEM_THINKING', tags: ['场景方法', 'SOTIF', '长尾'] },
  { id: 'kb_takeover_hmi', title: '接管 HMI 多模态设计',
    summary: '视觉+听觉+触觉三层提示',
    content: 'L3 系统的最后一公里是多模态人机交接。',
    dimension: 'USER_EXPERIENCE', tags: ['接管 HMI', 'L3', '多模态'] },
  { id: 'kb_test_methodology', title: '智驾测试方法论',
    summary: 'SIL/HIL/VIL + 场景库 + 影子模式',
    content: '软件/硬件/整车在环 + 高保真场景库是量产前关键。',
    dimension: 'TECH_UNDERSTANDING', tags: ['测试', 'HIL', 'SIL'] },
  { id: 'kb_map_strategy', title: '有图 vs 无图策略',
    summary: 'BEV+端到端让无图化成为可能',
    content: 'BEV+端到端让无图成为可能，但极端场景仍需 SD Map 兜底。',
    dimension: 'TECH_UNDERSTANDING', tags: ['高精地图', '无图化', 'BEV'] },
  { id: 'kb_motion_control', title: '线控底盘与运动控制',
    summary: '线控转向/制动/油门是 L3+ 执行基础',
    content: '线控底盘响应延迟 < 50ms、精度 ±0.1°。',
    dimension: 'TECH_UNDERSTANDING', tags: ['线控底盘', '运动控制', 'L3'] },
  { id: 'kb_algo_evolution', title: '智驾算法演进路线',
    summary: '规则 → BEV → 端到端 → 世界模型',
    content: '算法演进 4 阶段。',
    dimension: 'TECH_UNDERSTANDING', tags: ['算法演进', '世界模型', 'BEV'] },
  { id: 'kb_oddd', title: 'ODD 设计与运行域管理',
    summary: 'ODD 决定在哪儿用',
    content: 'ODD 包括道路/速度/天气/时间/地理等维度。',
    dimension: 'SAFETY_COMPLIANCE', tags: ['ODD', '运行设计域', '降级'] },
  { id: 'kb_remote_drive', title: '5G 云代驾 / 远程驾驶',
    summary: 'L4 Robotaxi 兜底',
    content: '5G + 低时延视频回传 + 远程操控。',
    dimension: 'TECH_UNDERSTANDING', tags: ['云代驾', '5G', 'L4'] },
  { id: 'kb_hmi_design', title: '智驾 HMI 设计原则',
    summary: '可视化+拟人化+异常优先',
    content: '智驾 HMI 三原则：异常信息优先、拟人化提示、视觉+听觉+触觉多模态。',
    dimension: 'USER_EXPERIENCE', tags: ['HMI', '可视化', '拟人化'] },
  { id: 'kb_fmea', title: 'FMEA 失效模式分析',
    summary: '失效模式 + 影响 + 严重度 + 探测度',
    content: 'FMEA 通过 S/O/D 三维度评分识别系统风险点，是 ISO 26262 必备的失效分析方法。',
    dimension: 'SAFETY_COMPLIANCE', tags: ['FMEA', '失效分析', '功能安全'] },
  { id: 'kb_iso21434', title: 'ISO 21434 信息安全',
    summary: '车联网网络安全保障框架',
    content: 'ISO 21434 覆盖概念-开发-生产-运维-退役全生命周期，要求 TARA 威胁分析与风险评估。',
    dimension: 'SAFETY_COMPLIANCE', tags: ['信息安全', 'ISO 21434', 'TARA'] },
  { id: 'kb_odd', title: 'ODD 运行设计域',
    summary: 'ODD 决定在哪儿用',
    content: 'ODD 包括道路/速度/天气/时间/地理等维度，决定 L3 系统的运行边界与接管策略。',
    dimension: 'SAFETY_COMPLIANCE', tags: ['ODD', '运行设计域', 'L3'] },
  { id: 'kb_dms', title: 'DMS 驾驶员监测',
    summary: 'L2+ 必备的驾驶员状态监测',
    content: 'DMS 通过摄像头+红外感知驾驶员疲劳/分神，触发 L2+ 系统的警告与降级。',
    dimension: 'SAFETY_COMPLIANCE', tags: ['DMS', '驾驶员监测', 'L2+'] },
  { id: 'kb_sales_methodology', title: '智驾销售方法论',
    summary: 'SPIN + 顾问式销售',
    content: '面向 B 端主机厂客户，先讲 ODD 边界与接管率，再讲成本与开城节奏。',
    dimension: 'BUSINESS_COMPETITION', tags: ['销售', '方法论', 'B 端'] },
  { id: 'kb_competitor_analysis', title: '竞品差异化分析',
    summary: '从技术-商业-体验三维差异化',
    content: '竞品分析需从技术路线、城市覆盖、自研芯片、数据闭环四维切入。',
    dimension: 'BUSINESS_COMPETITION', tags: ['竞品', '差异化', '分析'] },
  { id: 'kb_sensor_fusion', title: '多传感器融合',
    summary: '前融合/中融合/后融合',
    content: '前融合保留最多信息但计算量大；后融合工程友好；中融合是当前主流折中方案。',
    dimension: 'TECH_UNDERSTANDING', tags: ['融合', '前融合', '后融合'] },
  { id: 'kb_business_model', title: '智驾商业模式',
    summary: 'Tier-1 / 解决方案 / 全栈自研',
    content: '智驾商业模式主要有三种：Tier-1 供应商、解决方案合作、主机厂全栈自研。',
    dimension: 'BUSINESS_COMPETITION', tags: ['商业模式', 'Tier-1', '自研'] },
  { id: 'kb_global_market', title: '2025 全球智驾市场',
    summary: '中美欧三地格局',
    content: '中国 NOA 渗透率领先；欧洲 UN-R157 推动 L3；北美 Tesla 引领端到端。',
    dimension: 'BUSINESS_COMPETITION', tags: ['全球', '市场', '2025'] },
  { id: 'kb_industry_trend', title: '2025 智驾行业趋势',
    summary: '端到端+无图化+城市 NOA 下沉',
    content: '2025 三大趋势：端到端量产上车、无图化成为主流、城市 NOA 下沉至 15 万级。',
    dimension: 'BUSINESS_COMPETITION', tags: ['趋势', '2025', '行业'] },
  { id: 'kb_communication', title: '跨部门沟通技巧',
    summary: '技术-产品-PM 三方对齐',
    content: '跨部门沟通需用统一语言：技术讲 ODD/ASIL，产品讲场景/价值，PM 讲 ROI/排期。',
    dimension: 'USER_EXPERIENCE', tags: ['沟通', '跨部门', '协作'] },
  { id: 'kb_industry_history', title: '智驾行业演进史',
    summary: '从 ADAS 到 NOA 二十年',
    content: '智驾行业从 2003 ACC 起步，经历 L2 普及、L2+ 城区 NOA、端到端三个阶段。',
    dimension: 'BUSINESS_COMPETITION', tags: ['历史', '演进', 'ADAS'] },
  { id: 'kb_ethics', title: '智驾伦理与电车难题',
    summary: '事故责任与价值选择',
    content: '智驾系统需要预设"电车难题"的处理规则：保护行人优先还是乘客优先？',
    dimension: 'SAFETY_COMPLIANCE', tags: ['伦理', '电车难题', '价值选择'] },
];

type Q = {
  id: string; position: string; difficulty: string;
  stem: string; intent: string; answer: string;
  keypoints: string[]; tags: string[]; relatedKBId?: string;
};
function q(p: Q) {
  return {
    id: p.id, position: p.position, difficulty: p.difficulty,
    stem: p.stem, intent: p.intent, answer: p.answer,
    keypoints: JSON.stringify(p.keypoints),
    tags: JSON.stringify(p.tags),
    relatedKBId: p.relatedKBId,
  };
}

// 完整题目数据：从外部 .data.ts 加载
import { ALL_QUESTIONS } from './seed-data.js';

async function main() {
  console.log('🌱 开始种子数据…');

  const adminPwd = await bcrypt.hash('admin123', 10);
  const demoPwd  = await bcrypt.hash('demo1234', 10);

  await prisma.user.upsert({
    where:  { email: 'admin@adas.wiki' },
    update: {},
    create: { email: 'admin@adas.wiki', username: 'admin', passwordHash: adminPwd, role: 'ADMIN',
      bio: 'ADAS-Wiki 官方管理员' },
  });

  const demo = await prisma.user.upsert({
    where:  { email: 'demo@adas.wiki' },
    update: {},
    create: { email: 'demo@adas.wiki', username: 'demouser', passwordHash: demoPwd, role: 'USER',
      bio: '正在学习智能驾驶的产品经理',
      progress: { create: { totalQuestions: 100, masteredCount: 12 } } },
  });

  // 1. 知识库
  for (const k of KB_ITEMS) {
    await prisma.knowledgeBase.upsert({
      where: { id: k.id }, update: {},
      create: { id: k.id, title: k.title, summary: k.summary, content: k.content,
                dimension: k.dimension, tags: JSON.stringify(k.tags), source: k.source },
    });
  }
  console.log(`✅ 知识库: ${KB_ITEMS.length} 条`);

  // 2. 面试题
  for (const it of ALL_QUESTIONS) {
    await prisma.interviewQuestion.upsert({
      where: { id: it.id }, update: {},
      create: { ...it, keypoints: typeof it.keypoints === 'string' ? it.keypoints : JSON.stringify(it.keypoints),
                tags: typeof it.tags === 'string' ? it.tags : JSON.stringify(it.tags) },
    });
  }
  console.log(`✅ 面试题: ${ALL_QUESTIONS.length} 道`);

  // 3. 模拟面试记录
  await prisma.mockExamRecord.createMany({
    data: [
      { userId: demo.id, score: 62, position: 'PRODUCT_MANAGER' },
      { userId: demo.id, score: 70, position: 'PRODUCT_MANAGER' },
      { userId: demo.id, score: 78, position: 'PRODUCT_MANAGER' },
      { userId: demo.id, score: 85, position: 'PRODUCT_MANAGER' },
    ],
  });

  console.log('✅ 种子完成');
  console.log('   管理员: admin@adas.wiki / admin123');
  console.log('   示例 : demo@adas.wiki  / demo1234');
  console.log(`   知识库 ${KB_ITEMS.length} 条 · 题目 ${ALL_QUESTIONS.length} 道`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
