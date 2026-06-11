import { http } from './http';
import type { SixDimensionAnswer, StreamEvent } from '@/types/chat';

const AI_BASE = (import.meta.env.VITE_AI_BASE_URL as string) || '';

/**
 * 通用 SSE 流式解析器
 *  - 支持 GET(EventSource)和 POST(fetch + ReadableStream)
 *  - 协议格式：
 *      data: {"type":"delta","text":"..."}\n\n
 *      event: done\ndata: {...}\n\n
 */
export interface StreamHandlers {
  onEvent?: (e: StreamEvent) => void;
  onError?: (err: Error) => void;
  onComplete?: () => void;
  signal?: AbortSignal;
}

/** POST 方式触发流式聊天（推荐：可携带会话上下文） */
export async function streamChat(
  payload: { conversationId: string; content: string },
  handlers: StreamHandlers,
) {
  const url = `${AI_BASE}/api/chat`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        Authorization: `Bearer ${localStorage.getItem('adas_token') ?? ''}`,
      },
      body: JSON.stringify(payload),
      signal: handlers.signal,
    });

    if (!res.ok || !res.body) {
      throw new Error(`HTTP ${res.status}`);
    }

    await parseSSEStream(res.body, handlers);
  } catch (err) {
    if ((err as Error).name === 'AbortError') return; // 用户主动取消
    handlers.onError?.(err as Error);
  }
}

/** 解析 SSE 字节流 */
export async function parseSSEStream(
  body: ReadableStream<Uint8Array>,
  handlers: StreamHandlers,
) {
  const reader = body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  const flushEvent = (rawEvent: string) => {
    if (!rawEvent.trim()) return;
    // 仅取 data 行
    const dataLines = rawEvent
      .split('\n')
      .filter((l) => l.startsWith('data:'))
      .map((l) => l.slice(5).trim())
      .join('');
    if (!dataLines) return;
    try {
      const ev = JSON.parse(dataLines) as StreamEvent;
      handlers.onEvent?.(ev);
    } catch {
      // 非 JSON 视为纯文本增量
      handlers.onEvent?.({ type: 'delta', text: dataLines });
    }
  };

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // 事件之间以 \n\n 分隔
      let idx;
      while ((idx = buffer.indexOf('\n\n')) !== -1) {
        const raw = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);
        flushEvent(raw);
      }
    }
    // 收尾处理
    if (buffer.trim()) flushEvent(buffer);
    handlers.onComplete?.();
  } catch (err) {
    if ((err as Error).name === 'AbortError') return;
    handlers.onError?.(err as Error);
  } finally {
    reader.releaseLock();
  }
}

// =============================================================
//  Mock 实现：当后端 AI 服务未就绪时，本地模拟流式问答。
//  后续接入真实后端时，将 VITE_USE_MOCK=false 即可。
// =============================================================
const MOCK_DELAY = 22; // ms/字

interface MockQa {
  match: RegExp;
  answer: string;
  structure: SixDimensionAnswer;
  citations: { title: string; snippet: string }[];
  followups: string[];
}

const MOCK_QA: MockQa[] = [
  {
    match: /(激光雷达|lidar|LiDAR)/i,
    answer: `**激光雷达（LiDAR）** 是自动驾驶系统中常用的主动式传感器。它通过发射激光脉冲并测量反射光的时间，生成周围环境的三维点云。

## 核心原理
- 发射：905nm / 1550nm 波长的激光脉冲
- 接收：测量光子返回时间（ToF）
- 重建：根据扫描角度生成 \`(x, y, z, intensity)\` 点云

## 在智驾中的作用
1. **高精度距离感知**：厘米级测距，弥补摄像头的深度缺失
2. **夜间/恶劣天气**：不依赖环境光，强光/弱光表现稳定
3. **静态建图**：与高精地图结合，实现厘米级定位

## 主流方案
- **机械式**：Velodyne HDL-64E（早期 Robotaxi）
- **半固态**：禾赛 AT128、图达通 Robin（量产主力）
- **纯固态**：Innoviz / Luminar（下一代方向）

> **零基础记忆点**：LiDAR ≈ "用光做尺子" + "360° 拍立得"，每秒能生成上百万个 3D 点。`,
    structure: {
      tldr: '激光雷达是主动式测距传感器，输出带强度信息的 3D 点云；它与摄像头/毫米波构成多模态融合，是当前 L2+/L3 智驾主流感知冗余方案。',
      dimensions: [
        {
          dimension: 'TECH_UNDERSTANDING',
          headline: 'ToF 测距 + 扫描机构输出每秒百万级 3D 点云',
          detail: '激光雷达通过发射 905/1550nm 激光脉冲，测量光子返回时间（Time of Flight）得到距离，再结合扫描角得到 (x,y,z,intensity) 点云。机械式 360° 旋转、半固态转镜、纯固态电子扫描是三种主要工程实现。',
          terms: [
            { term: 'ToF', desc: 'Time of Flight，光飞行时间测距' },
            { term: '点云', desc: '由离散 3D 点构成的环境表征' },
            { term: '1550nm', desc: '对人眼更安全的波长，可发射更高功率' },
          ],
          confidence: 0.95,
        },
        {
          dimension: 'PRODUCT_DEFINITION',
          headline: '作为高阶智驾的"安全冗余 + 体验加分项"',
          detail: '在城市 NOA / 高速 NOA 中，LiDAR 主要解决夜间、强逆光、异形障碍物等摄像头盲区场景；产品定义上需要权衡"是否标配"（成本 +2000~10000 元）vs"选装"（影响 ODD 范围）。',
          confidence: 0.82,
        },
        {
          dimension: 'SAFETY_COMPLIANCE',
          headline: '涉及激光人眼安全 IEC 60825 与车规级认证',
          detail: '905nm 激光受功率限制，雨雾穿透有限；1550nm 安全性更高但成本贵。量产 LiDAR 需满足 AEC-Q100、功能安全 ASIL-B(D) 分解，同时配合 SOTIF 评估恶劣天气下的感知退化。',
          terms: [
            { term: 'IEC 60825', desc: '激光产品人眼安全国际标准' },
            { term: 'AEC-Q100', desc: '汽车级集成电路应力测试' },
          ],
          confidence: 0.88,
        },
        {
          dimension: 'USER_EXPERIENCE',
          headline: '"看不见的车"是用户最直接的体验差异',
          detail: '配备 LiDAR 的车型在夜间、暴雨场景的智驾可用度显著优于纯视觉；同时 LiDAR 体积（前挡/车顶凸起）会影响外观设计，厂商需在形态/位置/集成度上下工夫。',
          confidence: 0.8,
        },
        {
          dimension: 'BUSINESS_COMPETITION',
          headline: '硬件 BOM 占比 10~20%，是降本核心战场',
          detail: '禾赛/速腾/图达通主导国内 LiDAR 供应链，单颗成本从 2018 年 10 万元 → 2024 年千元级。Tesla 走纯视觉路线倒逼其他玩家在"是否要 LiDAR"上做选择题，纯视觉派 vs 多模态派路线之争仍在继续。',
          confidence: 0.9,
        },
        {
          dimension: 'SCENARIO_SYSTEM_THINKING',
          headline: '高价值场景：夜间 / 强逆光 / 异形障碍物',
          detail: '在 LCC / 高速 NOA 中 LiDAR 收益有限，但在城市 NOA 的"鬼探头"、施工改道、低矮落石等场景作用巨大；需要从"场景 → 触发条件 → 传感器需求"反推 LiDAR 配置。',
          confidence: 0.85,
        },
      ],
      actions: [
        '画一张"场景-传感器"矩阵：列出 Top10 高频危险场景，标注每个场景下 LiDAR 相比纯视觉的边际收益',
        '评估自家 ODD 范围内"必装 LiDAR"的场景比例（>30% 建议标配）',
        '跟进国产 LiDAR 厂商的 AEC-Q 与 ASIL 认证进展，作为供应链准入门槛',
      ],
      related: [
        { label: '传感器拓扑', to: '/graph' },
        { label: '竞品硬件对比', to: '/competitor' },
      ],
    },
    citations: [
      { title: '激光雷达技术综述', snippet: '从机械式到固态，LiDAR 正在向车规级、低成本方向演进...' },
      { title: '感知融合中的 LiDAR 角色', snippet: '与摄像头、毫米波雷达的多模态融合是当前主流方案...' },
    ],
    followups: [
      '激光雷达和摄像头相比有什么优势？',
      '为什么 1550nm 激光比 905nm 更安全？',
      '纯视觉方案（Tesla）真的不需要 LiDAR 吗？',
    ],
  },
  {
    match: /(BEV|鸟瞰|occupancy|占用网络)/i,
    answer: `**BEV（Bird's Eye View，鸟瞰视角）** 是当下自动驾驶感知的主流范式。它将多个摄像头的特征统一投影到俯视坐标系下，让下游任务获得"上帝视角"。

## 解决了什么问题
传统方案下，每个摄像头各自检测后通过后处理拼接，难以做到时序融合与几何一致。
BEV 的核心思想是 **统一表征**：
- 多相机特征 → BEV 空间
- 融合时序 + 雷达 + LiDAR
- 输出 Occupancy / 轨迹 / Map

## 代表性工作
- **Tesla Occupancy Network**（2022 AI Day）
- **BEVFormer**（上海 AI Lab, ECCV 2022）
- **UniAD**（CVPR 2023 Best Paper，端到端范式）

## 为什么是趋势
1. **去高精地图化**：从 BEV 实时构建局部地图
2. **端到端优化**：感知-预测-规划共享特征
3. **Occupancy 输出**：能识别未知障碍物（如路上的落石、异形车）

> 一句话：**BEV 让车"抬头看路"，是端到端智驾的基石**。`,
    structure: {
      tldr: 'BEV 是多相机融合的统一俯视表征；它让感知、预测、规划共享同一坐标系，是端到端智驾的"基础空间"。',
      dimensions: [
        {
          dimension: 'TECH_UNDERSTANDING',
          headline: '将多相机特征通过 IPM / Transformer 变换到 BEV 空间',
          detail: 'BEV 范式先用 backbone 提取多相机图像特征，再通过几何变换（IPM、深度估计、Transformer 注意力）投影到俯视栅格。下游任务（检测、跟踪、预测、规划）都在这一统一空间内执行。',
          terms: [
            { term: 'BEV', desc: 'Bird\'s Eye View，俯视坐标表征' },
            { term: 'Occupancy', desc: '占用网络，体素级 0/1 占据预测' },
            { term: 'Transformer', desc: '注意力机制，可学习跨视角关联' },
          ],
          confidence: 0.96,
        },
        {
          dimension: 'PRODUCT_DEFINITION',
          headline: '"无图化"是 BEV 给用户最直接的价值',
          detail: 'BEV 让车可以"实时建图"，摆脱对高精地图的依赖；产品上对应"全国都能开"的开城能力，ODD 边界从"画好的区域"扩展到"任意道路"。',
          confidence: 0.85,
        },
        {
          dimension: 'SAFETY_COMPLIANCE',
          headline: 'BEV 输出的 Occupancy 解决 SOTIF 中的未知障碍物',
          detail: '传统检测对训练集外的异形物无能为力；Occupancy 网络只预测"占据/不占据"，对未知物体天然鲁棒，是 SOTIF 风险评估的重要工具。',
          confidence: 0.78,
        },
        {
          dimension: 'USER_EXPERIENCE',
          headline: '让"开城"从 100 城跃升到全国可用',
          detail: '用户在城市 NOA 中遇到改道、施工、临时管制时，BEV 实时建图能"看懂"未事先采集的场景，体验上对应"接管次数显著下降"和"通勤路径自由"。',
          confidence: 0.82,
        },
        {
          dimension: 'BUSINESS_COMPETITION',
          headline: 'BEV + 端到端是头部车企的"军备竞赛"',
          detail: 'Tesla FSD v12 / 华为 ADS 3.0 / 小鹏 XNGP 5.x 都把 BEV 作为关键卖点；BEV 训练依赖大规模标注数据 + 高算力，数据闭环和自研芯片成为护城河。',
          confidence: 0.9,
        },
        {
          dimension: 'SCENARIO_SYSTEM_THINKING',
          headline: '场景思维：把"看不见的红绿灯"映射到 BEV 栅格',
          detail: '在十字路口、环岛、潮汐车道等结构化场景中，BEV 可融合地图先验与在线观测；在长尾场景中（暴雨、夜晚），需要靠 Occupancy + 多帧时序融合来弥补单帧不确定性。',
          confidence: 0.8,
        },
      ],
      actions: [
        '通读 BEVFormer / UniAD 论文，画出"输入→特征变换→下游任务"全流程图',
        '在公司内部组织一次"无图 vs 有图"的脑暴：评估不依赖高精地图的产品/技术收益',
        '梳理 ODD 内的 Top20 高频危险场景，逐一对照 BEV 输出能力，找出盲区',
      ],
      related: [
        { label: '算法演进路线', to: '/graph' },
        { label: '场景模拟器', to: '/simulator' },
      ],
    },
    citations: [
      { title: 'BEVFormer 论文解读', snippet: '时空 Transformer 架构，在 nuScenes 上取得 SOTA...' },
      { title: '从 BEV 到 Occupancy', snippet: '占用网络进一步解决了长尾障碍物检测问题...' },
    ],
    followups: [
      'Occupancy Network 和 BEV 有什么关系？',
      '为什么端到端一定要 BEV？',
      'BEV 需要多少算力才能实时运行？',
    ],
  },
  {
    match: /(规控|规划|控制|planning|control)/i,
    answer: `**规控（Planning & Control）** 是自动驾驶的"决策大脑"，负责把感知结果转化为具体的方向盘、油门、刹车指令。

## 两大子任务

### 1. 规划（Planning）
回答"**接下来怎么走**"：
- 全局路径规划：A*、RRT* 等
- 行为决策：变道、超车、让行
- 局部轨迹：5~10 秒内的轨迹曲线

### 2. 控制（Control）
回答"**怎么执行**"：
- 横向控制：LQR、MPC、纯跟踪
- 纵向控制：PID、滑模控制
- 横纵耦合：协同控制

## 现代方案演进
| 范式 | 特点 | 代表 |
|------|------|------|
| 规则驱动 | 可解释、安全 | Apollo、Tesla 旧版本 |
| 学习型 | 数据驱动、拟人化 | UniAD、VAD |
| 端到端 | 一体化、潜力大 | Tesla FSD v12 |

## 关键指标
- **舒适度**：加加速度 Jerk ≤ 4 m/s³
- **安全性**：最大减速度 ≤ 5 m/s²
- **合规性**：符合交通法规与人类驾驶习惯`,
    structure: {
      tldr: '规控 = 规划（决定怎么走）+ 控制（怎么执行），是自动驾驶的"决策大脑"；当前正从规则驱动向学习型/端到端演进。',
      dimensions: [
        {
          dimension: 'TECH_UNDERSTANDING',
          headline: '规划 = 全局路径 + 行为决策 + 局部轨迹',
          detail: '规划层先做全局 A* / RRT* 给出参考路径，再做行为决策（让/超/停），最后输出 5~10 秒局部轨迹；控制层用 LQR / MPC / PID 把轨迹转换为方向盘转角和油门刹车。',
          terms: [
            { term: 'MPC', desc: 'Model Predictive Control，模型预测控制' },
            { term: 'LQR', desc: 'Linear Quadratic Regulator，线性二次调节器' },
            { term: 'Jerk', desc: '加加速度，舒适度的关键指标' },
          ],
          confidence: 0.95,
        },
        {
          dimension: 'PRODUCT_DEFINITION',
          headline: '"拟人化"是规划层的核心产品差异',
          detail: 'L2 阶段用户能感知到的体验差异（变道果断/跟车柔和/博弈自然）主要来自规划策略；产品定义需在"安全保守"和"流畅效率"间找平衡。',
          confidence: 0.83,
        },
        {
          dimension: 'SAFETY_COMPLIANCE',
          headline: '规划输出必须满足 ISO 21448 SOTIF 与 ASIL',
          detail: '规划模块是 SOTIF 的"重灾区"：长尾场景的不合理决策可能造成严重事故；工程上需要最小风险策略（MRM）和冗余规划（rule-based 兜底）来满足 ASIL-D。',
          confidence: 0.88,
        },
        {
          dimension: 'USER_EXPERIENCE',
          headline: '"接管率"和"顿挫感"是用户最直观的感受',
          detail: '规控质量直接决定用户主观体验：频繁的急刹、不合理的变道、路口徘徊都会拉高用户接管率；行业目标是把每千公里接管数（MPI）压到个位数。',
          confidence: 0.85,
        },
        {
          dimension: 'BUSINESS_COMPETITION',
          headline: '学习型规划是"老车企"追赶新势力的关键',
          detail: '传统 Tier-1 基于规则引擎的规划栈在"拟人化"上落后；新势力通过数据驱动的规划策略快速迭代，形成体验护城河。',
          confidence: 0.78,
        },
        {
          dimension: 'SCENARIO_SYSTEM_THINKING',
          headline: '场景化：博弈路口 / 高速汇入 / 行人横穿',
          detail: '在博弈类场景（无保护左转、窄道会车）中，规则难以穷举，学习型规划 + 交互预测更有效；需要"场景拆解 → 策略定制 → 评价指标"的闭环。',
          confidence: 0.8,
        },
      ],
      actions: [
        '复现一个 LQR 横向控制器 + PID 纵向控制器的最小 demo，体会规控闭环',
        '分析公司当前版本 ODD 内的 Top10 高频接管场景，分类（感知不足 / 规划保守 / 控制顿挫）',
        '阅读 UniAD / VAD 论文，理解学习型规划与传统规则栈的边界与融合方式',
      ],
      related: [
        { label: '算法演进路线', to: '/graph' },
        { label: '面试题库', to: '/interview' },
      ],
    },
    citations: [
      { title: '自动驾驶规划控制综述', snippet: '从经典控制到学习型规划的发展脉络...' },
      { title: '端到端规划的挑战', snippet: '可解释性、长尾场景、可验证性是核心难题...' },
    ],
    followups: [
      '端到端规划和传统规控的区别是什么？',
      'MPC 在自动驾驶中为什么这么常用？',
      '怎么评价规控算法的好坏？',
    ],
  },
  {
    match: /(端到端|end.to.end|FSD)/i,
    answer: `**端到端（End-to-End）自动驾驶** 是指从传感器输入直接到控制输出的统一神经网络模型，中间不依赖人工设计的规则模块。

## 传统模块化 vs 端到端

| 维度 | 模块化 | 端到端 |
|------|--------|--------|
| 信息流 | 单向、模块隔离 | 全局共享特征 |
| 优化 | 各模块独立 loss | 整体 loss |
| 可解释 | 高 | 低（黑盒） |
| 上限 | 受限于规则设计 | 理论上限更高 |

## 关键技术
- **BEV 表征**：统一空间
- **Transformer 架构**：捕捉长程依赖
- **世界模型**：可"想象"的预训练
- **数据闭环**：影子模式 + 自动标注

## 代表玩家
- **Tesla FSD v12**：纯视觉端到端
- **Waymo**：端到端 + 规则兜底
- **小鹏 XNGP / 华为 ADS 3.0**：模块化 → 端到端渐进
- **Wayve (UK)**：AVG 基础模型路线

> **争议焦点**：可解释性 vs 性能上限。世界模型或许能给出第三条路。`,
    structure: {
      tldr: '端到端 = 传感器→控制的一体化神经网络，最大化全局优化但牺牲可解释性；Tesla FSD v12 是量产代表，行业正从模块化渐进过渡。',
      dimensions: [
        {
          dimension: 'TECH_UNDERSTANDING',
          headline: '传感器→轨迹/控制的一体化神经网络',
          detail: '端到端取消了"感知-预测-规划-控制"的人工模块切分，用一个（或少数几个）大模型从传感器输入直接输出轨迹或控制信号；代表工作：UniAD、VAD、Tesla FSD v12。',
          terms: [
            { term: 'One Model', desc: 'Tesla 提出的端到端单体模型范式' },
            { term: '影子模式', desc: 'Shadow Mode，在后台静默运行收集对比' },
            { term: '世界模型', desc: 'World Model，可"想象"未来场景的生成式模型' },
          ],
          confidence: 0.94,
        },
        {
          dimension: 'PRODUCT_DEFINITION',
          headline: '"更拟人、接管更少"是端到端的产品卖点',
          detail: '端到端把"路况博弈"的学习交给数据而非规则工程师，理论上能持续逼近人类老司机水平；但用户对"黑盒决策"的心理安全感需要产品体验去弥补。',
          confidence: 0.82,
        },
        {
          dimension: 'SAFETY_COMPLIANCE',
          headline: '可解释性 + 形式化验证是 L3+ 的硬约束',
          detail: '端到端模型难以通过传统 FMEDA 等手段验证；目前行业做法是"端到端 + 规则兜底 / 独立监控层（Safety Layer）"，让 AI 决策 + 显式安全机制共同满足 ASIL-D。',
          confidence: 0.9,
        },
        {
          dimension: 'USER_EXPERIENCE',
          headline: '"开起来像人"是用户对端到端最直观的感受',
          detail: '对比规则驱动的"机械感"，端到端能学会社区道路的礼让博弈、加塞避让、连续变道等"老司机"行为；用户对"敢用"和"接管频率"的容忍度更高。',
          confidence: 0.85,
        },
        {
          dimension: 'BUSINESS_COMPETITION',
          headline: '端到端拉开"数据 + 算力"的代际差距',
          detail: '端到端的护城河 = 真实道路数据规模 × 自研芯片算力 × 自动标注效率。Tesla 凭 FSD 数百万辆车的车队建立"数据-模型"飞轮，国内玩家要追赶必须解决数据合规与算力问题。',
          confidence: 0.92,
        },
        {
          dimension: 'SCENARIO_SYSTEM_THINKING',
          headline: '端到端 + 世界模型 = 可"想象"的智驾',
          detail: '世界模型让车在决策前先"脑补"未来几秒的轨迹，再选最安全方案；这能极大降低 SOTIF 中的"未见过场景"风险，是端到端通向 L3/L4 的关键拼图。',
          confidence: 0.8,
        },
      ],
      actions: [
        '对比阅读 UniAD / VAD / FSD v12 公开材料，画出"端到端 vs 模块化"的架构差异图',
        '在公司内部建立"影子模式"数据闭环：人工接管事件自动回流 + 自动标注',
        '关注世界模型（World Model）在决策预演中的研究进展，评估 1~3 年内工程化落地的可行性',
      ],
      related: [
        { label: '算法演进路线', to: '/graph' },
        { label: '安全与合规', to: '/safety' },
      ],
    },
    citations: [
      { title: '端到端自动驾驶综述', snippet: '从模块化到端到端的范式转移...' },
      { title: '世界模型与自动驾驶', snippet: '用生成式模型预演未来帧，提升安全性...' },
    ],
    followups: [
      '端到端模型怎么调试？',
      '世界模型在智驾里有什么用？',
      'Tesla 的纯视觉端到端真的可行吗？',
    ],
  },
  {
    match: /(功能安全|ISO.?26262|SOTIF|预期功能)/i,
    answer: `**功能安全** 是自动驾驶产品化过程中绕不开的核心议题。两大主流标准：

## ISO 26262（功能安全）
- **核心对象**：电子电气系统故障（系统性 + 随机硬件失效）
- **核心方法**：V 模型 + ASIL 等级（A/B/C/D）+ 安全机制
- **关键概念**：FMEA/FTA、故障注入、E/E 架构冗余

## ISO 21448 / SOTIF（预期功能安全）
- **核心对象**：传感器/算法在 **无故障** 情况下的性能局限
- **触发场景**：Corner case、长尾场景
- **关键方法**：触发条件分析、区域划分（已知安全/未知危险）

## 实际落地
1. **L2/L2+**：ASIL B(D) 分解 + SOTIF 评估
2. **L3**：需要冗余架构（双 Orin / 双 MCU）+ 最小风险策略（MRM）
3. **L4**：完整安全案例 + 运行设计域（ODD）声明

> **零基础记忆点**：ISO 26262 防的是"硬件/软件坏了怎么办"，SOTIF 防的是"系统没坏但场景它没见过怎么办"。`,
    structure: {
      tldr: 'ISO 26262 解决"硬件/软件故障"，SOTIF 解决"系统没坏但场景没见过"，两者互补，是 L2+ 智驾产品化的双安全底座。',
      dimensions: [
        {
          dimension: 'TECH_UNDERSTANDING',
          headline: 'ISO 26262 防故障失效，SOTIF 防性能局限',
          detail: 'ISO 26262 关注 E/E 系统在系统性失效和随机硬件失效下的安全；SOTIF 关注无故障时由于感知/算法局限性导致的不合理输出。两者在 L2+ 系统中是互补的：硬件冗余 + 数据闭环共同保障安全。',
          terms: [
            { term: 'ASIL', desc: 'Automotive Safety Integrity Level，汽车安全完整性等级' },
            { term: 'FMEA', desc: 'Failure Mode and Effects Analysis' },
            { term: 'ODD', desc: 'Operational Design Domain，运行设计域' },
          ],
          confidence: 0.96,
        },
        {
          dimension: 'PRODUCT_DEFINITION',
          headline: 'ODD 声明决定产品能"在哪儿用"',
          detail: 'L2/L2+ 通常在产品手册中明确"高速/城市快速路/部分城区"等 ODD 边界；L3 还需要明确接管时间和最小风险策略（MRM）。ODD 越宽，技术难度越大。',
          confidence: 0.85,
        },
        {
          dimension: 'SAFETY_COMPLIANCE',
          headline: 'L3 及以上必须有完整安全案例',
          detail: 'L3 系统在 ODD 内可"完全自动驾驶"，因此需要向监管部门提交完整 Safety Case：包括 ASIL 分解、冗余架构、SOTIF 区域划分、ODD 边界、MRM 流程、接管 HMI 设计。',
          confidence: 0.93,
        },
        {
          dimension: 'USER_EXPERIENCE',
          headline: '"接管 HMI"是功能安全的最后一公里',
          detail: '再安全的系统也需要清晰的人机交接：视觉/听觉/触觉多模态提醒、接管时间 10s 倒计时、降级靠边策略——这些 UX 细节直接决定 L3 系统的"敢用度"。',
          confidence: 0.78,
        },
        {
          dimension: 'BUSINESS_COMPETITION',
          headline: '功能安全能力是 OEM 的"准入门槛"',
          detail: '海外 OEM（VW、Stellantis）的功能安全团队 100+ 人；国内新势力（蔚来/小鹏/理想）通过收购或自建也建立了完整团队。功能安全是供应商准入、车型出口的硬卡口。',
          confidence: 0.82,
        },
        {
          dimension: 'SCENARIO_SYSTEM_THINKING',
          headline: '场景化：场景触发条件 → 已知/未知/危险区域',
          detail: 'SOTIF 方法学要求把场景拆成"已知安全 / 已知危险 / 未知安全 / 未知危险"四象限，再设计触发条件 + 区域降级策略；这是 L3+ 验收的核心证据。',
          confidence: 0.86,
        },
      ],
      actions: [
        '画出"ISO 26262 vs SOTIF"的对比矩阵（适用对象 / 失效模式 / 关键方法）',
        '梳理自家产品 ODD 文档，标注每个 ODD 元素对应的"已知安全/已知危险/未知"分类',
        '评估 L3 接管 HMI 是否满足"10s 接管时间 + 多模态提醒 + MRM 兜底"三大要求',
      ],
      related: [
        { label: '安全与合规专区', to: '/safety' },
        { label: '法规体系', to: '/graph' },
      ],
    },
    citations: [
      { title: 'ISO 26262 实战解读', snippet: '从概念阶段到生产阶段的完整流程...' },
      { title: 'SOTIF 与长尾场景', snippet: '预期功能安全是 L3+ 落地的关键...' },
    ],
    followups: [
      'L2 和 L3 在安全标准上有什么区别？',
      '什么是 ASIL 分解？',
      'ODD（运行设计域）是什么？',
    ],
  },
];

const FALLBACK_ANSWER = `这是一个很好的问题！我可以帮你拆解一下思路：

## 建议的分析框架
1. **明确问题边界**：先界定这是技术问题、产品问题还是商业问题
2. **拆解关键变量**：用 MECE 原则把问题切成互不重叠的子项
3. **结合场景思考**：智驾是高度场景化的，要回到 ODD 内具体讨论
4. **借鉴行业实践**：参考头部玩家的解决思路

> 当前为 Mock 模式（VITE_USE_MOCK=true），真实接入后端后这里会由大模型基于 RAG 知识库生成更精准的回答。

你可以试着问：
- "激光雷达的工作原理是什么？"
- "端到端自动驾驶和模块化有什么区别？"
- "ISO 26262 和 SOTIF 有什么区别？"`;

const FALLBACK_FOLLOWUPS = [
  '能再具体讲讲实际应用吗？',
  '这背后的技术原理是什么？',
  '行业头部玩家是怎么做的？',
];

/** 兜底结构化答案：用于未命中关键词时，仍能给出六维视图 */
const FALLBACK_STRUCTURE: SixDimensionAnswer = {
  tldr: '当前为 Mock 模式，尚未命中预置知识；下面从六个维度提供通用的智驾分析框架。',
  dimensions: [
    {
      dimension: 'TECH_UNDERSTANDING',
      headline: '先界定这是技术 / 产品 / 工程问题',
      detail: '先回答"为什么"再回答"怎么做"：明确这个问题的技术边界（感知/规控/座舱/云），并列出关键名词与定义。',
      confidence: 0.6,
    },
    {
      dimension: 'PRODUCT_DEFINITION',
      headline: '回到用户场景与 ODD 边界',
      detail: '智驾是高度场景化的产品；先定义目标用户（通勤/高速/城区）、ODD（地理、速度、天气），再设计功能。',
      confidence: 0.6,
    },
    {
      dimension: 'SAFETY_COMPLIANCE',
      headline: '对齐 ISO 26262 / SOTIF / 当地法规',
      detail: '任何 L2+ 功能都需要做 ASIL 分解 + SOTIF 评估；上市前还需符合 UN-R157 等地方法规。',
      confidence: 0.55,
    },
    {
      dimension: 'USER_EXPERIENCE',
      headline: '"敢用"和"好用"是 UX 的两个独立维度',
      detail: '接管 HMI、提示音、动画反馈、可解释性——这些是用户感知价值的核心；通过用户研究和影子模式数据闭环迭代。',
      confidence: 0.55,
    },
    {
      dimension: 'BUSINESS_COMPETITION',
      headline: '对比头部玩家的方案 + 商业模式',
      detail: '从硬件 BOM、软件订阅、城市覆盖三个维度对比；思考差异化卖点（数据飞轮 / 自研芯片 / 用户教育）。',
      confidence: 0.5,
    },
    {
      dimension: 'SCENARIO_SYSTEM_THINKING',
      headline: '场景化拆解 + 触发条件分析',
      detail: '用"场景 → 触发条件 → 系统行为 → 边界"四步法拆解；优先解决 Top10 高频危险场景。',
      confidence: 0.55,
    },
  ],
  actions: [
    '尝试用更具体的关键词提问（如"激光雷达"、"端到端"、"ISO 26262"）命中预置知识',
    '在"全景图谱"中浏览知识体系后再回到问答',
    '进入"场景模拟器"用具体场景训练系统思维',
  ],
  related: [
    { label: '全景图谱', to: '/graph' },
    { label: '场景模拟器', to: '/simulator' },
    { label: '面试题库', to: '/interview' },
  ],
};

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/** Mock 流式：基于关键字匹配，模拟 SSE 事件 */
export async function mockStreamChat(
  payload: { conversationId: string; content: string },
  handlers: StreamHandlers,
) {
  const matched = MOCK_QA.find((q) => q.match.test(payload.content));
  const answer    = matched?.answer    ?? FALLBACK_ANSWER;
  const structure = matched?.structure ?? FALLBACK_STRUCTURE;
  const citations = matched?.citations ?? [];
  const followups = matched?.followups ?? FALLBACK_FOLLOWUPS;

  const messageId = uid();
  handlers.onEvent?.({ type: 'start', messageId });

  // 0) 推送六维结构（在 delta 之前，让用户先看到框架）
  handlers.onEvent?.({ type: 'structure', answer: structure });

  // 1) 逐字推送 delta
  for (let i = 0; i < answer.length; i++) {
    if (handlers.signal?.aborted) return;
    await sleep(MOCK_DELAY);
    handlers.onEvent?.({ type: 'delta', text: answer[i] });
  }

  // 2) 推送引用
  for (const c of citations) {
    if (handlers.signal?.aborted) return;
    handlers.onEvent?.({
      type: 'citation',
      citation: {
        knowledgeId: uid(),
        title: c.title,
        snippet: c.snippet,
        score: 0.85,
      },
    });
  }

  // 3) 推送追问推荐
  handlers.onEvent?.({ type: 'followup', suggestions: followups });

  // 4) 完成
  handlers.onEvent?.({ type: 'done', totalTokens: answer.length });
  handlers.onComplete?.();
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

// =============================================================
//  对外统一接口
// =============================================================
const USE_MOCK =
  (import.meta.env.VITE_USE_MOCK as string) === 'true' || !import.meta.env.VITE_AI_BASE_URL;

export function askStream(
  payload: { conversationId: string; content: string },
  handlers: StreamHandlers,
) {
  if (USE_MOCK) return mockStreamChat(payload, handlers);
  return streamChat(payload, handlers);
}

// 列表 / 会话管理（接入真实后端时启用）
export const qnaService = {
  listConversations: () => http.get('/conversations').then((r) => r.data),
  createConversation: (title: string) =>
    http.post('/conversations', { title }).then((r) => r.data),
  deleteConversation: (id: string) =>
    http.delete(`/conversations/${id}`).then((r) => r.data),
  listMessages: (conversationId: string) =>
    http.get(`/conversations/${conversationId}/messages`).then((r) => r.data),
};
