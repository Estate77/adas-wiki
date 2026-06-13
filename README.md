# 智驾百科 · ADAS-Wiki

> 用最简单的方式，看懂最硬核的智能驾驶。

一个面向智能驾驶（ADAS / 自动驾驶）学习者与从业者的**纯前端知识平台**，把零散的概念、法规、算法、传感器、主机厂方案、面试题、典型场景，整理成可视化的图谱和可交互的模拟器，帮你**从 0 到 1 搭建完整的智驾认知体系**。

🌐 **在线访问**：<https://estate77.github.io/adas-wiki/>

---

## ✨ 项目亮点

- 📚 **全景图谱** — 法规地图、算法演进时间线、系统架构图、传感器拓扑，一张图讲清楚整个行业脉络
- 💬 **功能问答** — 围绕感知 / 规划 / 控制 / 数据闭环等六维度的轻量级对话式知识检索
- 🎯 **面试题库** — 智驾岗位高频考点分类练习，记录学习进度
- 🚗 **场景模拟** — 高速 NOA、城区路口、雨夜停车场、长尾 Corner Case 等典型场景的推理训练器
- 🛡️ **安全合规** — SAE 分级矩阵、ODD / SOTIF 探索器、接管 Playbook、数据合规与责任划分
- 🏎️ **竞品拆解** — 主流主机厂 / 方案商的硬件配置、算法路线、市场份额、商业模式对比
- 👤 **个人中心** — 登录后可保存学习进度、收藏高频考点、生成专属能力报告

---

## 🧱 技术栈

| 类别 | 选型 |
|------|------|
| 框架 | **React 19** + **React Router v7** |
| 构建 | **Vite 5** + TypeScript 5 |
| 样式 | **TailwindCSS 3** + 自定义玻璃拟态（glass-panel）/ 霓虹（neon）/ 暗色系 |
| 状态 | **Zustand**（auth / chat / learning） |
| 数据 | **localStorage 纯前端 Demo 模式**（无需后端，开箱即用） |
| 渲染 | **react-markdown** + **remark-gfm** |
| HTTP | axios（已封装，但当前默认走本地存储） |
| 部署 | **GitHub Pages**（自动化 CI / CD） |

---

## 🚀 快速开始

```bash
# 安装依赖
cd frontend
npm install

# 本地开发（热更新，默认 http://localhost:5173）
npm run dev

# 生产构建（产物输出到 frontend/dist）
npm run build

# 本地预览构建产物（http://localhost:4173）
npm run preview
```

> 提示：当前所有数据均存储在浏览器 `localStorage` 中，**清空浏览器数据会重置学习进度**，请按需备份。

---

## 📁 目录结构

```
adas-wiki/
├── frontend/                 # 前端应用
│   ├── public/
│   │   └── 404.html          # SPA 路由 fallback
│   ├── src/
│   │   ├── components/       # 通用组件（FilterChip / Navbar / Footer / Tabs…）
│   │   ├── hooks/            # 自定义 Hooks（useParallax / useTypewriter）
│   │   ├── layouts/          # 整体布局 MainLayout
│   │   ├── pages/            # 业务页面
│   │   │   ├── Home/         # 首页（Hero / 雷达 / 速问 / 热点 / 学习路径）
│   │   │   ├── QnA/          # 功能问答
│   │   │   ├── Graph/        # 全景图谱
│   │   │   ├── Interview/    # 面试题库
│   │   │   ├── Simulator/    # 场景模拟
│   │   │   ├── Safety/       # 安全合规
│   │   │   ├── Competitor/   # 竞品拆解
│   │   │   ├── Auth/         # 登录 / 注册
│   │   │   └── Profile/      # 个人中心（Dashboard / 收藏 / 历史 / 进度 / 设置）
│   │   ├── router/           # 路由配置
│   │   ├── services/         # 数据服务层（demo-db / auth / chat / knowledge / …）
│   │   ├── store/            # Zustand 全局状态
│   │   ├── types/            # 全局类型定义
│   │   ├── constants.ts      # 全局静态常量
│   │   └── main.tsx          # 应用入口
│   ├── index.html
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── vite.config.ts        # Vite 配置（GitHub Pages 子路径 / 隧道 Host 白名单）
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Pages 自动部署
├── scripts/
│   └── surge-deploy.cjs      # Surge.sh 备用部署脚本
├── vercel.json               # Vercel 部署配置
└── DEPLOY.md                 # 部署状态与可选方案
```

---

## 🌐 部署

- **主部署**：GitHub Pages（推送 `main` 分支自动构建并发布）
- **备用**：Vercel / Surge.sh / localtunnel 隧道

详细的可访问地址、验证命令与故障排查见 [DEPLOY.md](./DEPLOY.md)。

---

## 🤝 参与贡献

欢迎提 Issue / PR 补充以下内容：

- 新增/修正知识点（法规、算法、传感器、主机厂方案）
- 新增典型场景（高速、城区、泊车、恶劣天气、长尾 Case）
- 优化 UI / 交互 / 动画
- 翻译为英文版本

---

## 📜 License

MIT
