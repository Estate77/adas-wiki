# 智驾百科 (ADAS-Wiki) · 第 1 步交付物

> 本文档包含：
> 1. 完整项目目录结构
> 2. 数据库 ER 图（基于 PostgreSQL + Prisma ORM）

---

## 1. 项目目录结构

```
智驾/
├── docs/                                # 项目文档
│   ├── ER.md                            # ER 图（本文件）
│   ├── API.md                           # 接口约定（后续补充）
│   └── ARCHITECTURE.md                  # 架构图（后续补充）
│
├── frontend/                            # React 19 + Vite + TailwindCSS
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.svg
│   ├── src/
│   │   ├── main.tsx                     # 入口
│   │   ├── App.tsx
│   │   ├── index.css                    # Tailwind 入口
│   │   ├── router/
│   │   │   └── index.tsx                # 路由配置
│   │   ├── layouts/
│   │   │   ├── MainLayout.tsx           # 通用布局(导航+页脚)
│   │   │   └── AuthLayout.tsx           # 登录/注册布局
│   │   ├── pages/
│   │   │   ├── Home/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── HeroSection.tsx      # 视差滚动 Hero
│   │   │   │   ├── RadarChart.tsx       # 六大能力雷达图
│   │   │   │   └── QuickNav.tsx         # 快捷导航卡片
│   │   │   ├── QnA/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── SessionList.tsx      # 左侧历史会话
│   │   │   │   ├── ChatWindow.tsx       # 右侧对话区
│   │   │   │   ├── MessageBubble.tsx
│   │   │   │   ├── InputBox.tsx
│   │   │   │   ├── MarkdownView.tsx     # Markdown 渲染
│   │   │   │   └── SuggestedFollowups.tsx
│   │   │   ├── KnowledgeGraph/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── GraphCanvas.tsx      # ECharts 节点图
│   │   │   │   └── NodeDetailDrawer.tsx
│   │   │   ├── Interview/
│   │   │   │   ├── index.tsx            # 题目列表
│   │   │   │   ├── Filters.tsx          # 多维筛选
│   │   │   │   └── Detail.tsx           # 题目详情
│   │   │   ├── Simulator/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── ScenarioPanel.tsx    # 左侧参数面板
│   │   │   │   ├── Visualizer.tsx       # 右侧动画
│   │   │   │   └── Perspectives.tsx     # 双视角点评
│   │   │   ├── Articles/
│   │   │   │   ├── SafetyCompliance.tsx
│   │   │   │   ├── CompetitorAnalysis.tsx
│   │   │   │   └── ArticleLayout.tsx    # 维基百科式排版
│   │   │   ├── Profile/
│   │   │   │   ├── Dashboard.tsx        # 仪表盘
│   │   │   │   ├── Login.tsx
│   │   │   │   ├── Register.tsx
│   │   │   │   └── Settings.tsx
│   │   │   └── NotFound.tsx
│   │   ├── components/
│   │   │   ├── ui/                      # 通用 UI 原子组件
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Tag.tsx
│   │   │   │   └── Skeleton.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── TypeWriter.tsx           # AI 打字机效果
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useChatStream.ts         # SSE 流式响应
│   │   │   ├── useParallax.ts
│   │   │   └── useIntersection.ts
│   │   ├── services/
│   │   │   ├── http.ts                  # Axios 实例
│   │   │   ├── auth.service.ts
│   │   │   ├── qna.service.ts
│   │   │   ├── knowledge.service.ts
│   │   │   ├── interview.service.ts
│   │   │   └── user.service.ts
│   │   ├── store/                       # Zustand 状态
│   │   │   ├── authStore.ts
│   │   │   └── chatStore.ts
│   │   ├── types/
│   │   ├── utils/
│   │   └── constants.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── vite.config.ts
│   └── .env.example
│
├── backend/                             # Node.js + Express + Prisma（主业务）
│   ├── src/
│   │   ├── index.ts
│   │   ├── app.ts
│   │   ├── config/
│   │   │   ├── env.ts
│   │   │   └── prisma.ts
│   │   ├── middlewares/
│   │   │   ├── auth.ts                  # JWT 鉴权
│   │   │   ├── error.ts
│   │   │   └── rateLimit.ts
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── auth.routes.ts
│   │   │   ├── users/
│   │   │   ├── conversations/
│   │   │   ├── messages/
│   │   │   ├── knowledge/               # 知识库 CRUD
│   │   │   ├── interview/               # 面试题 CRUD
│   │   │   └── qna/                     # 转发到 AI Service
│   │   ├── utils/
│   │   │   ├── jwt.ts
│   │   │   └── password.ts
│   │   └── types/
│   ├── prisma/
│   │   ├── schema.prisma                # ORM 模型
│   │   ├── migrations/
│   │   └── seed.ts                      # 种子数据
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── ai-service/                          # Python FastAPI + RAG（可独立部署）
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   │   ├── chat.py                  # /chat 流式接口
│   │   │   ├── recommend.py             # 追问推荐
│   │   │   └── embed.py                 # 知识入库
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── llm.py                   # OpenAI 兼容客户端
│   │   │   └── prompts.py
│   │   ├── rag/
│   │   │   ├── retriever.py
│   │   │   ├── vector_store.py          # Chroma / Milvus
│   │   │   ├── ingest.py
│   │   │   └── splitter.py
│   │   ├── schemas/
│   │   └── services/
│   │       └── stream.py                # SSE 流式生成
│   ├── requirements.txt
│   ├── pyproject.toml
│   └── .env.example
│
├── shared/                              # 前后端共享类型
│   └── types/
│       ├── user.ts
│       ├── conversation.ts
│       ├── knowledge.ts
│       └── interview.ts
│
├── docker-compose.yml                   # PG / Redis / Milvus 一键起
├── .gitignore
└── README.md
```

**架构关键点**
- **前端**：`React 19 + Vite + TailwindCSS v3 + React Router 7 + Zustand + Axios + ECharts`。
- **后端**：`Node.js 20 + Express + Prisma + PostgreSQL + Redis + JWT`。负责鉴权、CRUD、对话记录持久化。
- **AI 服务**：`Python 3.11 + FastAPI + LangChain + Chroma`。负责 RAG 检索 + 大模型流式生成。
- **流式链路**：浏览器 ←SSE← Node 业务层 ←SSE/HTTP← FastAI 服务 ←LLM。
- **移动端适配**：Tailwind `sm/md/lg/xl` 断点 + 弹性布局。

---

## 2. 数据库 ER 图

### 2.1 实体关系总览

```
┌──────────┐        ┌──────────────────┐        ┌──────────┐
│  Users   │1──────*│  Conversations   │1──────*│ Messages │
└──────────┘        └──────────────────┘        └──────────┘
     │                                                 ▲
     │1                                                │
     │                                                 │
     │*                                                │
┌──────────────────┐                          ┌───────┴──────┐
│ UserProgress     │                          │  Messages    │
│  - mastered KBs  │                          │ role: user/  │
│  - mock scores   │                          │       assist │
└──────────────────┘                          └──────────────┘

┌──────────────────┐        ┌───────────────────────┐
│ Knowledge_Base   │1──────*│ Knowledge_Tags (M2M)  │
│  (六大维度)       │        └───────────────────────┘
└──────────────────┘
        ▲
        │ N
        │
        │ *  (通过 Interview_Questions.related_kb_id 关联)
        │
┌───────────────────────┐        ┌──────────────────────┐
│ Interview_Questions   │*──────1│  Positions(枚举)      │
│  难度 / 岗位 / 知识点  │        └──────────────────────┘
└───────────────────────┘

┌────────────────────┐
│ MockExamRecords    │  (模拟面试记录，统计得分趋势)
│  user_id / score   │
└────────────────────┘
```

### 2.2 核心表结构（Prisma Schema 草稿）

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ====== 枚举 ======
enum UserRole {
  USER
  ADMIN
  EXPERT
}

enum Dimension {
  TECH_UNDERSTANDING       // 技术理解力
  PRODUCT_DEFINITION       // 产品定义力
  SAFETY_COMPLIANCE        // 安全与合规
  USER_EXPERIENCE          // 用户体验
  BUSINESS_COMPETITION     // 商业与竞争
  SCENARIO_SYSTEM_THINKING // 场景与系统思维
}

enum QuestionDifficulty {
  EASY
  MEDIUM
  HARD
  EXPERT
}

enum Position {
  PRODUCT_MANAGER
  ALGO_ENGINEER
  PERCEPTION_ENGINEER
  PLANNING_ENGINEER
  TEST_ENGINEER
  SAFETY_ENGINEER
  SALES_SOLUTION
  OTHER
}

enum MessageRole {
  USER
  ASSISTANT
  SYSTEM
}

// ====== 1. 用户 ======
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  username     String   @unique
  passwordHash String
  role         UserRole @default(USER)
  avatar       String?
  bio          String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  conversations    Conversation[]
  progress         UserProgress[]
  mockExams        MockExamRecord[]
  masteredKBs      UserKnowledgeMastery[]
}

// ====== 2. 会话 ======
model Conversation {
  id        String   @id @default(cuid())
  userId    String
  title     String   @default("新会话")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages Message[]

  @@index([userId, updatedAt])
}

// ====== 3. 消息 ======
model Message {
  id             String      @id @default(cuid())
  conversationId String
  role           MessageRole
  content        String      @db.Text
  tokensUsed     Int?        // 可选：用于统计
  createdAt      DateTime    @default(now())

  conversation Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  citations    Citation[]   // 引用片段

  @@index([conversationId, createdAt])
}

// 引用片段：记录大模型回答引用的知识条目
model Citation {
  id          String  @id @default(cuid())
  messageId   String
  knowledgeId String
  snippet     String  @db.Text
  score       Float?

  message    Message       @relation(fields: [messageId], references: [id], onDelete: Cascade)
  knowledge  KnowledgeBase @relation(fields: [knowledgeId], references: [id], onDelete: Cascade)
}

// ====== 4. 知识库条目 ======
model KnowledgeBase {
  id          String    @id @default(cuid())
  title       String
  content     String    @db.Text
  summary     String?   @db.Text   // 一句话通俗解释
  dimension   Dimension              // 所属六大维度
  tags        String[]  // 全文检索/前端过滤
  source      String?   // 来源引用（论文/白皮书 URL）
  vectorId    String?   // 向量库中的 ID
  viewCount   Int       @default(0)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  citations      Citation[]
  interviewLinks InterviewQuestion[] @relation("QuestionKB")
  masteredBy     UserKnowledgeMastery[]

  @@index([dimension])
  @@index([tags], type: Gin)
}

// ====== 5. 面试题库 ======
model InterviewQuestion {
  id            String            @id @default(cuid())
  position      Position
  difficulty    QuestionDifficulty
  stem          String            @db.Text       // 原题
  intent        String            @db.Text       // 考察意图
  answer        String            @db.Text       // 参考答案
  tags          String[]
  relatedKBId   String?
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt

  relatedKB KnowledgeBase? @relation("QuestionKB", fields: [relatedKBId], references: [id])

  @@index([position, difficulty])
  @@index([tags], type: Gin)
}

// ====== 6. 用户学习进度 ======
model UserKnowledgeMastery {
  id          String   @id @default(cuid())
  userId      String
  knowledgeId String
  masteredAt  DateTime @default(now())

  user      User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  knowledge KnowledgeBase @relation(fields: [knowledgeId], references: [id], onDelete: Cascade)

  @@unique([userId, knowledgeId])
}

// 仪表盘统计：累计提问数（冗余计数，由 trigger / 业务层维护）
model UserProgress {
  id            String   @id @default(cuid())
  userId        String   @unique
  totalQuestions Int     @default(0)   // 累计提问数
  masteredCount  Int     @default(0)   // 已掌握知识点数量
  updatedAt      DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// 模拟面试记录 → 趋势图
model MockExamRecord {
  id        String   @id @default(cuid())
  userId    String
  score     Int      // 0-100
  position  Position
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
}
```

### 2.3 关系说明

| 关系 | 基数 | 说明 |
|------|------|------|
| User → Conversation | 1:N | 一个用户拥有多个会话 |
| Conversation → Message | 1:N | 一个会话包含多条消息（user/assistant） |
| Message → Citation | 1:N | 大模型回答可引用多条知识片段 |
| KnowledgeBase → Citation | 1:N | 一个知识条目可被多次引用 |
| KnowledgeBase → InterviewQuestion | 1:N | 题目关联一个核心知识点（可空） |
| User ↔ KnowledgeBase | M:N（通过 UserKnowledgeMastery） | 用户掌握的知识点 |
| User → UserProgress | 1:1 | 用户仪表盘汇总数据 |
| User → MockExamRecord | 1:N | 模拟面试得分趋势 |

### 2.4 扩展点（后续迭代）

- **会话标签 / 收藏夹**：在 `Conversation` 上加 `tags: String[]` + `FavoriteConversation` 表。
- **追问推荐**：`SuggestedQuestion` 表（缓存 RAG 生成的相关问题）。
- **场景模拟器存档**：`ScenarioRun { userId, scenarioId, parameters, result }`。
- **点赞 / 反馈**：在 `Message` 上加 `feedback: 'LIKE' | 'DISLIKE' | null`。

---

## ✅ 第 1 步完成

请你确认：
- ✅ 目录结构是否符合预期（特别是 `backend` 选 Node.js + PrORM，`ai-service` 选 FastAPI + Chroma 的拆分）？
- ✅ ER 图是否覆盖了 5 张核心表（Users / Conversations / Messages / Knowledge_Base / Interview_Questions）+ 4 张辅助表？
- ✅ 枚举（Dimension 六大能力、Position 岗位、Difficulty 难度）是否需要增减？

确认后我会进入**第 2 步**：生成首页 Hero 区 + 能力雷达图的前端组件代码（含视差滚动、暗黑科技风、雷达图交互）。
