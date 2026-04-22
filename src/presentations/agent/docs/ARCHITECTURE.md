# 架构说明

## 组件架构

```
AgentPresentation.tsx     ← 核心组件，包含所有幻灯片
├── Particles.tsx         ← 粒子动画背景（fixed 定位，z-index: -1）
├── <Deck>                ← @revealjs/react 的根组件，管理 reveal.js 实例
│   ├── <Slide>           ← 单页幻灯片
│   │   ├── <Fragment>    ← 逐步展示的内容片段
│   │   └── <Code>        ← 语法高亮代码块
│   └── <SectionTitle>    ← 章节标题页（自定义子组件）
└── styles.css            ← 演示专属样式（reveal 覆盖 + 组件类名）
```

## 关键 API

### `<Deck>` — 幻灯片容器

```tsx
<Deck
  config={{ width: 1280, height: 720, hash: true, transition: 'slide' }}
  plugins={[RevealHighlight]}
>
```

- `config` — 传递任何 [reveal.js 配置项](https://revealjs.com/config/)
- `plugins` — 仅初始化时生效，后续渲染忽略

### `<Slide>` — 单页

```tsx
<Slide transition="zoom" backgroundGradient="..." className="title-slide">
```

支持的 props：`background`, `backgroundGradient`, `transition`, `autoAnimate`, `notes` 等。

### `<Fragment>` — 逐步展示

```tsx
<Fragment animation="fade-up" as="div">内容</Fragment>
<Fragment asChild><p>合并到子元素</p></Fragment>
```

- `animation` — 动画类型：`fade-up`, `highlight-red`, `grow` 等
- `as` — 渲染为指定 HTML 元素（默认 `span`）
- `index` — 控制展示顺序

### `<Code>` — 代码高亮

```tsx
<Code language="typescript" lineNumbers="1|2-3">{codeString}</Code>
```

需要注册 `RevealHighlight` 插件并导入 monokai CSS。

## 样式设计

### CSS 变量

```css
--accent:    #6C63FF    /* 主色 · 紫 */
--accent2:   #00D2FF    /* 辅色 · 青 */
--accent3:   #FF6B6B    /* 警告 · 红 */
--accent4:   #FFD93D    /* 高亮 · 黄 */
--bg-dark:   #0a0a1a    /* 深色背景 */
--bg-card:   rgba(255,255,255,0.04)  /* 卡片背景 */
```

### 布局类名

| 类名 | 用途 |
|------|------|
| `.card-grid` | 2 列卡片网格 |
| `.card-grid-3` | 3 列卡片网格 |
| `.card` | 半透明卡片（hover 动效） |
| `.two-col` | 双栏布局 |
| `.flow` | 流程图（flex 横排） |
| `.layer-stack` | 层级堆叠（垂直排列） |
| `.vs-box` | 对比框 |
| `.highlight-box` | 重点提示框（左边框高亮） |
| `.stat-row` | 统计数字行 |
| `.tag-*` | 标签（purple/blue/red/yellow） |

### 特殊幻灯片类型

| 类名 | 用途 |
|------|------|
| `.title-slide` | 封面（居中 + 渐变标题） |
| `.section-title` | 章节分隔页（大号序号 + 渐变标题） |
| `.final-slide` | 结尾页 |

## reveal.js 6.0 导入路径

reveal.js 6.0 使用 `package.json` 的 `exports` 字段限制导入路径：

```typescript
// ✅ 正确
import 'reveal.js/reveal.css';
import 'reveal.js/theme/black.css';
import 'reveal.js/plugin/highlight/monokai.css';
import RevealHighlight from 'reveal.js/plugin/highlight';

// ❌ 错误（不要用 dist/ 前缀）
import 'reveal.js/dist/reveal.css';
```

## 字体

通过 Google Fonts CDN 加载（在 `global.css` 中引入）：

- **Inter** — 英文正文
- **Noto Sans SC** — 中文正文
- **JetBrains Mono** — 代码
