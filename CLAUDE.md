# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 常用命令

```bash
npm run dev      # 启动开发服务器
npm run build    # 构建生产产物
npm run preview  # 预览构建结果
```

无测试框架，无 lint 脚本。

## 架构概述

这是一个基于 React + reveal.js 构建的演示文稿集合，通过简单的状态路由在多个演示之间切换（无 React Router）。

**路由机制**：`App.tsx` 维护一个 `Page` 类型的状态，通过条件渲染决定展示哪个演示组件。所有页面 ID 需同时在三处注册：

1. `App.tsx` — 在 `Page` 类型联合和条件分支中添加
2. `src/home/HomePage.tsx` — 在 `projects` 数组中添加配置项（id、icon、title、description、tags、gradient）
3. 演示组件本身接收 `onBack` prop，调用后返回首页

**演示组件结构**：每个演示位于 `src/presentations/<name>/`，包含组件文件（`*Presentation.tsx`）和专属样式（`styles.css`）。组件通过 `@revealjs/react` 的 `<Deck>` / `<Slide>` / `<Fragment>` / `<Code>` 组件构建幻灯片，固定分辨率 1920×1080，`center: false`。

**共享组件**：
- `Particles` — 粒子背景，在首页和每个演示页面顶层渲染
- `BackButton` — 返回首页按钮，接收 `onClick` prop
- `SlideControls` — 自定义翻页控制按钮，置于 `<Deck>` 内部

**样式**：全局变量和字体定义在 `src/styles/global.css`，每个演示维护自己的 `styles.css`。设计系统使用 CSS 变量（`--accent`、`--accent2`、`--text-dim` 等）。

**部署**：构建后部署至 GitHub Pages，`public/CNAME` 配置自定义域名。

## 添加新演示

```
src/presentations/<name>/
├── <Name>Presentation.tsx
└── styles.css
```

1. 在 `src/home/HomePage.tsx` 的 `projects` 数组末尾追加配置
2. 在 `App.tsx` 的 `Page` 类型和条件渲染中添加对应分支
3. 组件签名需与现有演示保持一致：`({ onBack }: { onBack?: () => void })`
