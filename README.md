# OwenFX — 精选软件资源站

> 一个 GitHub Explore 风格的开源软件资源分享站

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Next.js 16 + TypeScript |
| 样式 | Tailwind CSS 4 + GitHub Dark 主题 |
| 内容 | Notion API (CMS) |
| 部署 | Vercel |
| UI风格 | GitHub Explore + 毛玻璃混合 |

## 项目结构

`
src/
  app/
    globals.css       # 全局样式 (GitHub Dark + 毛玻璃)
    layout.tsx        # 根布局 (Navbar + Sidebar)
    page.tsx          # 首页 (Software Feed)
  components/
    Navbar.tsx        # 顶部毛玻璃导航栏
    Sidebar.tsx       # 左侧固定侧栏
    SoftwareCard.tsx  # 软件卡片 (GitHub Repo 风格)
    TrendingPanel.tsx # 右侧热门标签/分类面板
  lib/
    types.ts          # Software/Category 类型定义
    notion.ts         # Notion API 数据获取
    mock.ts           # 示例 Mock 数据 (fallback)
    environment.d.ts  # 环境变量类型声明
`

## 本地运行

1. 安装依赖
   npm install

2. 配置环境变量
   复制 .env.example 为 .env.local
   填入 NOTION_TOKEN 和 NOTION_DATABASE_ID

3. 启动开发服务器
   npm run dev
   访问 http://localhost:3000

## 部署到 Vercel

1. Push 到 GitHub
   git add .
   git commit -m "deploy OwenFX"
   git push

2. 在 Vercel 导入项目
   访问 vercel.com
   Import langyuso/OwenFX
   Framework: Next.js

3. 添加环境变量
   NOTION_TOKEN
   NOTION_DATABASE_ID

4. Deploy

## 设计系统

背景: #0d1117 (GitHub Dark)
卡片: #161b22
边框: #30363d
文字: #c9d1d9
强调色: #58a6ff
成功: #3fb950

## Notion 数据库结构

| 字段 | 类型 | 说明 |
|------|------|------|
| Name | Title | 软件名称 |
| Description | Rich Text | 简介 |
| Category | Select | 分类 |
| Tags | Multi-select | 标签 |
| DownloadUrl | URL | 下载链接 |
| UpdatedAt | Date | 更新时间 |
| Featured | Checkbox | 是否精选 |
| Image | URL | 软件图标 |
| Version | Rich Text | 版本号 |
| Size | Rich Text | 文件大小 |
| Platform | Select | 支持平台 |
