---
title: 冰山图宇宙项目指南
description: 冰山图宇宙（Iceberg Universe）是一个以冰山图为核心的社区驱动知识平台 — 将话题按认知深度分层拆解，从大众常识到冷门深水区，人人可协作。
date: 2026-07-13 00:00:00
updated: 2026-07-13 00:00:00
image: https://raw.githubusercontent.com/Gnix807/icebergs-1.0/main/public/screenshots/homepage.png
categories: [开发]
tags: [冰山图, 开源, Astro, 知识平台]
references:
  - title: 项目仓库
    link: https://github.com/Gnix807/icebergs-1.0
  - title: 在线访问
    link: https://icebergs.gnix807.cn
---

# 冰山图宇宙项目指南

## 这是什么

冰山图（Iceberg Chart）这种形式你可能在 Reddit 或 B 站见过——一个话题从水面之上的「大众常识」一层层往下挖，越深越冷门、越深越离谱。「冰山图宇宙」是把这种形式做成一个**开放协作的知识平台**，而不只是某个人画的一张图。

::alert{type="info"}
**在线地址**：[icebergs.gnix807.cn](https://icebergs.gnix807.cn)
::

目前站内有三座冰山图：

- 🕳️ **中文兔子洞冰山图【重制版】** — 点进去就再也出不来的互联网深坑
- 🤪 **奇异搞笑互联网冰山图（持续更新）** — 早期论坛神帖、抽象文化名场面
- 📼 **中文失传媒体冰山图（提案征集中）** — 曾经存在但今天难以寻觅的中文内容

和 Reddit 帖子或零散博客不同——这里的信息被组织成**结构化、可协作、可沉淀的知识地图**。每层条目有详细描述（支持 Markdown + KaTeX），可以投票、评论、协作编辑，积累品质分还能解锁 34+ 种成就徽章。

## 技术栈

| 层 | 选型 |
|---|---|
| 框架 | Astro + React |
| 语言 | TypeScript |
| 样式 | Tailwind CSS |
| 数据库 | PostgreSQL + Prisma ORM |
| 认证 | Better Auth |
| 搜索 | Orama |
| 部署 | Docker Compose |

一条 `docker compose up -d` 就起来了。

## 核心功能

### 冰山图编辑器
可视化拖拽编辑，支持 Markdown + KaTeX 公式，Ctrl+Z/Y 撤销重做，自动保存草稿，多人可同时协作编辑。这是整个平台最核心的组件，基本是从零手搓的。

::card-list
- **词条弹窗**：异步加载描述内容，键盘 ← → 逐条浏览，一键复制链接
- **全文搜索**：中英文混合检索，Ctrl+K 全局热键呼出，300ms 防抖
- **双色主题**：暗色终端绿（品牌色 `#00FF41`）+ 浅色模式，可选 CRT 复古扫描线效果
- **移动端适配**：44px 最小触控区域，响应式布局，iOS 安全区域适配
::

### 社区机制

::card-list
- **投票 & 评论**：每个冰山图都可以投票（赞同/反对）和评论讨论
- **品质分 & 成就**：浏览、投票、评论、创建均累积品质分；34+ 种成就徽章（传说/史诗/稀有/普通），活跃即解锁
- **排行榜**：热门 + 高赞双榜，前三名金银铜专属边框，支持时间段筛选
- **内容审核**：提交 → 编辑审核 → 发布流程，含提交前自动检查清单
- **RBAC 权限**：USER / CONTRIBUTOR / EDITOR / MODERATOR / ADMIN / FOUNDER 六层角色体系
::

### 进阶功能

::card-list
- **创意池**：35 种话题分类，看板 + 列表双视图，可提交创意让他人认领实现
- **专题协作 (WikiProject)**：开项目组，看板任务管理，成员邀请，多人协同编修
- **社区治理**：RfA 公开选举编辑资格，管理员弹劾机制，举报处理，反馈跟踪
- **管理面板**：用户管理、审核队列、系统配置、成就配置、SEO 管理
- **导出图片**：一键将冰山图导出为含水印的 PNG 信息图
- **SEO**：Open Graph + Twitter Card + JSON-LD 结构化数据 + Sitemap.xml + Robots.txt
::

## 本地开发

### 环境要求

- Node.js 18+
- PostgreSQL 16+
- Docker（可选，推荐）

### Docker 一键部署（推荐）

```bash
git clone https://github.com/Gnix807/icebergs-1.0.git
cd icebergs-1.0/frontend
cp .env.docker .env   # 编辑 .env 填必要配置
docker compose up -d
```

访问 `http://localhost:4321`。

### 手动开发

```bash
cd frontend
cp .env.example .env  # 填你的数据库连接等配置
npm install
npx prisma generate
npx prisma db push
npm run dev
```

数据库迁移和种子数据按 [Prisma 文档](https://www.prisma.io/docs) 标准流程操作。

## 项目结构

```text
frontend/
├── src/
│   ├── components/   # React 组件（冰山编辑器、词条弹窗等）
│   ├── pages/        # Astro 页面路由
│   ├── layouts/      # 页面布局
│   ├── lib/          # 工具库、认证、API 封装
│   └── styles/       # 全局样式
├── prisma/           # 数据库 Schema + 迁移
├── public/           # 静态资源
│   ├── screenshots/  # 项目截图
│   └── readme-banner.svg
├── docker-compose.yml
├── Dockerfile
└── astro.config.mjs
```

## 贡献方式

项目完全开源（MIT 协议），欢迎参与：

- **创建冰山图**：直接在网站上用编辑器创建新主题
- **编辑现有条目**：完善、修正或翻译已有内容
- **提交代码**：Fork 仓库 → 创建分支 → 提交 PR
- **报告问题**：在 GitHub Issues 提 bug 或功能建议
- **创意提交**：在站内「创意池」提交想法，有感兴趣的人会认领实现

## 架构简图

```text
用户浏览器 ──→ Astro SSR ──→ React 组件（冰山编辑器/词条弹窗/搜索）
                              │
                              ├── Prisma ORM ──→ PostgreSQL
                              ├── Better Auth ──→ 用户认证
                              └── Orama ──→ 全文搜索索引
```

## 写在后面

冰山图宇宙可以说是我写的第一个像样的全栈项目，从最开始的 idea → 原型 → 反复重写 → 到现在的版本，中间踩了不少坑也学了不少东西。它不只是一个「看冰山图」的网站——我更希望它变成一个**由社区共同维护的知识仓库**。冷门话题、互联网史记、小众爱好、失传媒体……这些散落的信息如果能被系统地整理成冰山图，比零散的帖子有用太多。

有什么想法或想参与，直接来仓库找我或者站内留言。
