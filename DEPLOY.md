# 智驾 (ADAS-Wiki) Vercel 部署指南

## 部署步骤

### 1. 准备代码仓库

1. 将代码推送到 GitHub/GitLab 仓库
2. 确保包含以下文件：
   - `api/` - Vercel Serverless API 路由
   - `frontend/` - 前端 React 应用
   - `vercel.json` - Vercel 配置
   - `backend/prisma/schema.prisma` - PostgreSQL 数据库 schema

### 2. 部署到 Vercel

**步骤 1: 导入项目**
1. 访问 [https://vercel.com](https://vercel.com) 登录
2. 点击 "Add New → Project"
3. 选择你的代码仓库

**步骤 2: 配置环境变量**

在 Vercel 项目设置 → Environment Variables 中添加：

| 变量名 | 值 |
|--------|-----|
| `JWT_SECRET` | 生成一个 32+ 字符的随机字符串 |
| `BCRYPT_ROUNDS` | `10` |
| `CORS_ORIGIN` | `*` |

**步骤 3: 启用 Vercel Postgres**

1. 在 Vercel 项目中 → 点击 "Storage"
2. 点击 "Connect Database" → 选择 "Postgres"
3. 创建新数据库或连接现有数据库

Vercel 会自动设置以下环境变量：
- `POSTGRES_URL` - 数据库连接 URL
- `POSTGRES_PRISMA_URL` - Prisma 优化的连接 URL（已在 `.env.vercel` 中引用）

**步骤 4: 配置 Build Command**

确保 `vercel.json` 中配置了正确的构建命令：
```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist"
}
```

### 3. 初始化数据库

部署成功后，需要初始化数据库表和种子数据：

**方式 A: 使用 Vercel CLI**
```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 连接到生产环境
vercel link

# 运行数据库迁移（需要在本地安装 Prisma）
cd backend
npx prisma db push
npx prisma db seed
```

**方式 B: 使用 Vercel 部署钩子（推荐）**

在 Vercel 项目设置 → Git → Deploy Hooks 中创建钩子，或在 `package.json` 中添加：

```json
{
  "scripts": {
    "vercel-build": "cd frontend && npm install && npm run build && cd ../backend && npx prisma db push && npx prisma db seed"
  }
}
```

### 4. 验证部署

访问 Vercel 分配的域名（如 `https://adas-wiki.vercel.app`），验证：
- 首页正常显示
- 注册/登录功能可用
- 知识库、面试题页面可访问

## 目录结构说明

```
├── api/                    # Vercel Serverless API 路由
│   ├── _lib/              # 共享库（Prisma、CORS、JWT）
│   ├── auth.ts            # 认证接口
│   ├── conversations.ts   # 会话接口
│   ├── dashboard.ts       # 仪表盘接口
│   ├── interview.ts       # 面试题接口
│   ├── knowledge.ts       # 知识库接口
│   ├── messages.ts        # 消息接口
│   └── users.ts           # 用户接口
├── backend/               # 后端服务代码（含 Prisma Schema）
├── frontend/              # 前端 React 应用
├── vercel.json           # Vercel 配置文件
└── .env.vercel           # 环境变量模板
```

## 常见问题

**Q: 数据库连接失败**

A: 检查：
1. Vercel Postgres 是否已正确连接
2. `DATABASE_URL` 是否使用了 `${POSTGRES_PRISMA_URL}`
3. 查看 Vercel Function 日志：Project → Functions

**Q: 静态资源加载失败**

A: 确保 `vercel.json` 中 `outputDirectory` 指向 `frontend/dist`

**Q: Prisma Client 版本不兼容**

A: 确保 `@prisma/client` 和 `prisma` 版本一致

## 生产环境优化建议

1. **JWT_SECRET**: 生产环境务必使用强随机字符串
2. **CORS**: 生产环境将 `CORS_ORIGIN` 改为具体域名
3. **监控**: 接入 Vercel Analytics
4. **数据库**: 考虑升级 Vercel Postgres 套餐以获得更高性能

## 环境变量完整列表

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `DATABASE_URL` | 数据库连接 URL | `${POSTGRES_PRISMA_URL}` |
| `JWT_SECRET` | JWT 签名密钥 | 需手动设置 |
| `JWT_EXPIRES_IN` | Token 过期时间 | `7d` |
| `BCRYPT_ROUNDS` | 密码加密轮数 | `10` |
| `CORS_ORIGIN` | 允许的跨域来源 | `*` |
