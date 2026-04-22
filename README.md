# Slides

技术分享与演示集合。

## 技术栈

- **React 19** + **TypeScript 5** — 组件化开发
- **Vite 6** — 极速开发服务器
- **reveal.js 6.0** + `@revealjs/react` — 幻灯片引擎
- **Vanilla CSS** — 自定义设计系统

## 快速开始

```bash
npm install
npm run dev
```

## 项目结构

```
slides/
├── README.md
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.js
└── src/
    ├── main.tsx                         # 入口
    ├── App.tsx                          # 路由管理
    ├── vite-env.d.ts                    # 类型声明
    ├── styles/
    │   ├── global.css                   # 全局样式（变量、字体、粒子、控制按钮）
    │   └── home.css                     # 首页样式
    ├── components/
    │   ├── Particles.tsx                # 共享粒子背景组件
    │   └── SlideControls.tsx            # 共享幻灯片控制按钮
    ├── home/
    │   └── HomePage.tsx                 # 首页
    └── presentations/
        └── agent/
            ├── AgentPresentation.tsx     # Agent 演示
            ├── styles.css               # 演示专属样式
            └── docs/
                ├── ARCHITECTURE.md      # 架构说明
                └── CONTENT.md           # 内容大纲
```

## 键盘快捷键

| 按键 | 功能 |
|------|------|
| `→` / `Space` | 下一页 |
| `←` | 上一页 |
| `Esc` / `O` | 总览模式 |
| `S` | 演讲者笔记 |

## 添加新演示

1. 在 `src/presentations/` 下新建目录
2. 创建演示组件、样式和文档
3. 在 `src/home/HomePage.tsx` 的 `projects` 数组中添加配置
4. 在 `src/App.tsx` 中添加路由分支
