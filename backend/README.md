# 智驾百科 · 后端 (Node.js + Express + Prisma + PostgreSQL)

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 准备数据库（任选其一）
#    方式 A: 使用 docker-compose 一键起 PG
docker compose up -d postgres

#    方式 B: 本地已有 PostgreSQL，修改 .env 中 DATABASE_URL

# 3. 配置环境变量
cp .env.example .env
# 按需修改 JWT_SECRET、数据库连接等

# 4. 初始化 Prisma + 写入种子数据
npm run prisma:generate
npm run prisma:migrate     # 创建表 + 生成迁移
npm run prisma:seed        # 写入管理员/示例数据

# 5. 启动开发服务
npm run dev                # http://localhost:4000
```

## 内置账号（seed 后）

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | admin@adas.wiki | admin123 |
| 示例用户 | demo@adas.wiki  | demo1234 |

## 接口约定

所有业务接口位于 `/api/*`，统一返回 `{ code, data, message? }`。

| 模块 | 方法 | 路径 | 鉴权 | 描述 |
|------|------|------|------|------|
| Auth | POST | /api/auth/register | ❌ | 注册 |
| Auth | POST | /api/auth/login    | ❌ | 登录 |
| Auth | GET  | /api/auth/me       | ✅ | 当前用户 |
| Users | GET  | /api/users/me | ✅ | 个人资料 |
| Users | PATCH | /api/users/me | ✅ | 更新资料 |
| Users | POST | /api/users/me/password | ✅ | 修改密码 |
| Conversations | GET/POST/PATCH/DELETE | /api/conversations[/:id] | ✅ | 会话 CRUD |
| Messages | GET  | /api/messages/conversation/:cid | ✅ | 列出某会话消息 |
| Messages | POST | /api/messages | ✅ | 单条写入 |
| Knowledge | GET | /api/knowledge[/:id] | ❌ | 列表 / 详情 |
| Knowledge | POST/PATCH/DELETE | /api/knowledge[/:id] | ✅ | 写入操作 |
| Interview | GET | /api/interview[/:id] | ❌ | 列表 / 详情 |
| Interview | POST/PATCH/DELETE | /api/interview[/:id] | ✅ | 写入操作 |
| Dashboard | GET | /api/dashboard/overview | ✅ | 仪表盘聚合 |
| Dashboard | POST | /api/dashboard/mastered/:kbId | ✅ | 标记掌握 |
| Dashboard | POST | /api/dashboard/mock-score | ✅ | 提交模拟面试分 |

## 目录

```
src/
├── app.ts            # Express 装配
├── index.ts          # 启动入口
├── config/           # env / prisma
├── middlewares/      # auth / error / rateLimit
├── utils/            # jwt / password
└── modules/
    ├── auth/             # 鉴权
    ├── users/            # 用户
    ├── conversations/    # 会话
    ├── messages/         # 消息
    ├── knowledge/        # 知识库
    ├── interview/        # 面试题
    └── dashboard/        # 仪表盘
```
