import { Deck, Slide, Fragment } from '@revealjs/react';
import 'reveal.js/reveal.css';
import 'reveal.js/theme/black.css';
import RevealNotes from 'reveal.js/plugin/notes';
import { Particles } from '../../components/Particles';
import { BackButton } from '../../components/BackButton';
import { SlideControls } from '../../components/SlideControls';
import './styles.css';

interface PlaygroundPresentationProps {
  onBack?: () => void;
}

function SectionTitle({ num, title }: { num: string; title: string }) {
  return (
    <Slide transition="zoom" className="section-title">
      <div className="section-num">{num}</div>
      <h2>{title}</h2>
    </Slide>
  );
}

export function PlaygroundPresentation({ onBack }: PlaygroundPresentationProps) {
  return (
    <>
      <Particles />
      {onBack && <BackButton onClick={onBack} />}
      <Deck
        config={{
          hash: true,
          slideNumber: true,
          transition: 'slide',
          transitionSpeed: 'default',
          backgroundTransition: 'fade',
          center: false,
          width: 1920,
          height: 1080,
          margin: 0,
          controls: true,
          progress: true,
          keyboard: true,
        }}
        plugins={[RevealNotes]}
      >
        <SlideControls metaUrl={import.meta.url} />

        {/* ==================== TITLE ==================== */}
        <Slide
          transition="zoom"
          className="title-slide playground-title"
          backgroundGradient="radial-gradient(ellipse at 30% 50%, rgba(255,107,107,0.12) 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(0,210,255,0.1) 0%, transparent 60%)"
        >
          <h1>Slide Playground</h1>
          <p className="subtitle">幻灯片视觉效果与布局灵感集</p>
        </Slide>

        {/* ==================== 01: 渐变文字 ==================== */}
        <SectionTitle num="01" title="渐变文字与排版" />

        <Slide>
          <h2>🎨 渐变文字效果库</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '0 80px' }}>
            <Fragment animation="fade-up" as="div">
              <h3 className="grad-text-sunset" style={{ fontSize: '2em', fontWeight: 900 }}>
                Sunset 日落渐变 — 热情而温暖
              </h3>
            </Fragment>
            <Fragment animation="fade-up" as="div">
              <h3 className="grad-text-ocean" style={{ fontSize: '2em', fontWeight: 900 }}>
                Ocean 海洋渐变 — 科技与信任
              </h3>
            </Fragment>
            <Fragment animation="fade-up" as="div">
              <h3 className="grad-text-aurora" style={{ fontSize: '2em', fontWeight: 900 }}>
                Aurora 极光渐变 — 活力与创新
              </h3>
            </Fragment>
            <Fragment animation="fade-up" as="div">
              <h3 className="grad-text-neon" style={{ fontSize: '2em', fontWeight: 900 }}>
                Neon 霓虹渐变 — 潮流与前沿
              </h3>
            </Fragment>
            <Fragment animation="fade-up" as="div">
              <h3 className="grad-text-fire" style={{ fontSize: '2em', fontWeight: 900 }}>
                Fire 烈焰渐变 — 力量与紧迫
              </h3>
            </Fragment>
          </div>
        </Slide>

        {/* ==================== 02: 卡片布局 ==================== */}
        <SectionTitle num="02" title="卡片与网格布局" />

        <Slide>
          <h2>🃏 玻璃拟态卡片 (Glassmorphism)</h2>
          <Fragment animation="fade-up" as="div">
            <div className="glass-grid">
              {[
                { icon: '⚡', title: '极速响应', desc: '毫秒级反馈，流畅动画转场' },
                { icon: '🛡️', title: '类型安全', desc: 'TypeScript 全栈覆盖' },
                { icon: '🎯', title: '组件化设计', desc: '可复用、可组合、可测试' },
                { icon: '🌈', title: '暗色主题', desc: '深色背景提升内容聚焦度' },
              ].map((item, i) => (
                <div key={i} className="glass-card">
                  <div className="card-icon">{item.icon}</div>
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
              ))}
            </div>
          </Fragment>
        </Slide>

        <Slide>
          <h2>📊 三列布局 + 标签系统</h2>
          <Fragment animation="fade-up" as="div">
            <div className="glass-grid-3">
              {[
                { icon: '🔍', title: '深度分析', tags: ['数据驱动', '洞察'], desc: '从数据中提取关键洞察' },
                { icon: '🚀', title: '快速迭代', tags: ['敏捷', '持续交付'], desc: '短周期交付高质量功能' },
                { icon: '🤝', title: '协作优先', tags: ['团队', '异步'], desc: '分布式团队的高效协作' },
              ].map((item, i) => (
                <div key={i} className="glass-card">
                  <div className="card-icon">{item.icon}</div>
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                  <div style={{ marginTop: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {item.tags.map(tag => (
                      <span key={tag} className={`floating-tag ${['purple', 'blue', 'green', 'red'][Math.floor(Math.random() * 3)]}`}>{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Fragment>
        </Slide>

        {/* ==================== 03: 数据展示 ==================== */}
        <SectionTitle num="03" title="数据展示与指标" />

        <Slide>
          <h2>📈 关键指标仪表盘</h2>
          <Fragment animation="fade-up" as="div">
            <div className="counter-grid">
              <div className="counter-card">
                <div className="counter-num grad-text-ocean">99.9%</div>
                <div className="counter-label">系统可用性</div>
              </div>
              <div className="counter-card">
                <div className="counter-num grad-text-aurora">&lt;50ms</div>
                <div className="counter-label">平均延迟</div>
              </div>
              <div className="counter-card">
                <div className="counter-num grad-text-sunset">12M+</div>
                <div className="counter-label">日活用户</div>
              </div>
              <div className="counter-card">
                <div className="counter-num grad-text-neon">4.9★</div>
                <div className="counter-label">用户评分</div>
              </div>
            </div>
          </Fragment>
          <Fragment animation="fade-up" as="div">
            <div className="progress-bars" style={{ marginTop: '28px' }}>
              {[
                { label: 'API 响应速度', value: 95, color: 'var(--gradient-1)' },
                { label: '代码覆盖率', value: 87, color: 'linear-gradient(90deg, #00ff87, #60efff)' },
                { label: '用户满意度', value: 92, color: 'var(--gradient-2)' },
              ].map((item, i) => (
                <div key={i} className="progress-item">
                  <div className="progress-label">
                    <span>{item.label}</span>
                    <span>{item.value}%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${item.value}%`, background: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </Fragment>
        </Slide>

        <Slide>
          <h2>📋 功能对比矩阵</h2>
          <Fragment animation="fade-up" as="div">
            <table className="feature-table">
              <thead>
                <tr>
                  <th>功能特性</th>
                  <th>基础版</th>
                  <th>专业版</th>
                  <th>企业版</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'API 访问', basic: true, pro: true, enterprise: true },
                  { feature: '实时协作', basic: false, pro: true, enterprise: true },
                  { feature: '自定义工作流', basic: false, pro: true, enterprise: true },
                  { feature: 'SSO 单点登录', basic: false, pro: false, enterprise: true },
                  { feature: '私有化部署', basic: false, pro: false, enterprise: true },
                  { feature: '专属技术支持', basic: false, pro: false, enterprise: true },
                ].map((row, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>{row.feature}</td>
                    <td>{row.basic ? <span className="check-mark">✓</span> : <span className="cross-mark">—</span>}</td>
                    <td>{row.pro ? <span className="check-mark">✓</span> : <span className="cross-mark">—</span>}</td>
                    <td>{row.enterprise ? <span className="check-mark">✓</span> : <span className="cross-mark">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Fragment>
        </Slide>

        {/* ==================== 04: 时间线 ==================== */}
        <SectionTitle num="04" title="时间线与流程" />

        <Slide>
          <h2>📅 项目里程碑时间线</h2>
          <div className="timeline">
            {[
              { dot: '', title: 'Q1 — 基础架构搭建', desc: '技术选型、CI/CD 流水线、设计系统', color: 'accent2' },
              { dot: '', title: 'Q2 — 核心功能上线', desc: '用户认证、数据面板、实时通知', color: '' },
              { dot: '', title: 'Q3 — 性能优化 & 国际化', desc: 'CDN 加速、i18n 支持、性能监控', color: 'accent3' },
              { dot: '', title: 'Q4 — 规模化 & 开放平台', desc: 'API 开放、插件市场、多租户', color: 'accent4' },
            ].map((item, i) => (
              <Fragment key={i} animation="fade-up">
                <div className="timeline-item">
                  <div className={`timeline-dot ${item.color}`} />
                  <div className="timeline-content">
                    <h4>{item.title}</h4>
                    <p>{item.desc}</p>
                  </div>
                </div>
              </Fragment>
            ))}
          </div>
        </Slide>

        {/* ==================== 05: 对比 ==================== */}
        <SectionTitle num="05" title="对比与选择" />

        <Slide>
          <h2>⚖️ 方案对比</h2>
          <Fragment animation="fade-up" as="div">
            <div className="comparison-box">
              <div className="comparison-side">
                <h4 style={{ color: 'var(--accent2)' }}>方案 A：微服务</h4>
                <ul>
                  <li>独立部署与扩展</li>
                  <li>技术栈自由选择</li>
                  <li>故障隔离好</li>
                  <li>运维复杂度高</li>
                </ul>
              </div>
              <div className="comparison-vs">VS</div>
              <div className="comparison-side">
                <h4 style={{ color: 'var(--accent)' }}>方案 B：模块化单体</h4>
                <ul>
                  <li>开发效率高</li>
                  <li>部署简单</li>
                  <li>数据一致性好</li>
                  <li>需要良好的模块边界</li>
                </ul>
              </div>
            </div>
          </Fragment>
          <Fragment animation="fade-up" as="div">
            <div className="neon-box" style={{ marginTop: '20px' }}>
              <strong>核心建议：</strong>不要因为「微服务更先进」而选择它。从单体开始，在真正需要时才拆分。
              <span className="floating-tag purple" style={{ marginLeft: '8px' }}>架构决策</span>
            </div>
          </Fragment>
        </Slide>

        {/* ==================== 06: 引用与高亮 ==================== */}
        <SectionTitle num="06" title="引用与高亮" />

        <Slide>
          <h2>💬 引用样式</h2>
          <Fragment animation="fade-up" as="div">
            <div className="quote-block">
              "优秀的演示不是信息越多越好，而是让观众记住最重要的那一件事。"
              <span className="quote-author">— 演讲设计原则</span>
            </div>
          </Fragment>
          <Fragment animation="fade-up" as="div">
            <div className="neon-box">
              💡 <strong>提示框</strong>：用于补充说明和关键信息的高亮展示。支持 <span className="floating-tag green">标签</span> 嵌入。
            </div>
          </Fragment>
          <Fragment animation="fade-up" as="div">
            <div className="neon-box warn">
              ⚠️ <strong>警告框</strong>：用于强调需要注意的风险信息。<span className="floating-tag red">注意</span>
            </div>
          </Fragment>
        </Slide>

        {/* ==================== 07: 图标 ==================== */}
        <SectionTitle num="07" title="图标展示" />

        <Slide>
          <h2>🧩 图标网格展示</h2>
          <Fragment animation="fade-up" as="div">
            <div className="icon-showcase">
              {[
                { icon: '🔐', label: '安全认证' },
                { icon: '📡', label: '实时通信' },
                { icon: '🗄️', label: '数据存储' },
                { icon: '⚙️', label: '配置管理' },
                { icon: '📊', label: '数据分析' },
                { icon: '🔔', label: '通知系统' },
                { icon: '🌐', label: '国际化' },
                { icon: '🧪', label: '自动化测试' },
                { icon: '📦', label: '包管理' },
                { icon: '🎯', label: '性能优化' },
              ].map((item, i) => (
                <div key={i} className="icon-item">
                  <span className="icon-emoji">{item.icon}</span>
                  <span className="icon-label">{item.label}</span>
                </div>
              ))}
            </div>
          </Fragment>
        </Slide>

        {/* ==================== 08: 分层架构 ==================== */}
        <SectionTitle num="08" title="架构分层展示" />

        <Slide>
          <h2>🏗️ 分层架构可视化</h2>
          <Fragment animation="fade-up" as="div">
            <div className="layer-stack-animated">
              {[
                { label: '🎨 展示层', desc: 'React + CSS Modules + Design Tokens', bg: 'rgba(108,99,255,0.18)' },
                { label: '🔄 业务逻辑层', desc: 'Custom Hooks + State Machine + Side Effects', bg: 'rgba(0,210,255,0.15)' },
                { label: '📡 数据访问层', desc: 'API Client + Cache + WebSocket', bg: 'rgba(0,255,135,0.1)' },
                { label: '🔧 基础设施层', desc: 'Auth + Logger + Config + Error Boundary', bg: 'rgba(255,217,61,0.1)' },
                { label: '🛡️ 平台层', desc: 'Docker + K8s + CDN + Monitoring', bg: 'rgba(255,107,107,0.1)' },
              ].map((item, i) => (
                <div key={i} className="layer" style={{ background: item.bg }}>
                  <span>{item.label}</span>
                  <span className="desc">{item.desc}</span>
                </div>
              ))}
            </div>
          </Fragment>
          <Fragment animation="fade-up" as="div">
            <div className="neon-box">
              每一层只依赖下层接口，不跨层调用。<strong>依赖方向单一 = 可替换性强</strong>。
            </div>
          </Fragment>
        </Slide>

        {/* ==================== 09: 导航与标签页 ==================== */}
        <SectionTitle num="09" title="导航与交互" />

        <Slide>
          <h2>🧭 Pill 导航 + 分栏内容</h2>
          <Fragment animation="fade-up" as="div">
            <div className="pill-nav">
              <span className="pill active">概览</span>
              <span className="pill">性能</span>
              <span className="pill">安全</span>
              <span className="pill">部署</span>
              <span className="pill">监控</span>
            </div>
          </Fragment>
          <Fragment animation="fade-up" as="div">
            <div className="split-layout">
              <div>
                <h3 className="grad-text-ocean" style={{ fontSize: '1.6em', marginBottom: '16px' }}>系统概览</h3>
                <p style={{ fontSize: '0.85em', lineHeight: 2, color: 'rgba(255,255,255,0.6)' }}>
                  展示当前系统的整体运行状态，包括核心服务健康度、
                  资源利用率、请求吞吐量等关键指标。
                </p>
                <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span className="floating-tag green">Health: OK</span>
                  <span className="floating-tag blue">v2.4.1</span>
                  <span className="floating-tag purple">3 节点</span>
                </div>
              </div>
              <div
                className="split-visual"
                style={{ background: 'radial-gradient(circle at 40% 40%, rgba(0,210,255,0.12), rgba(108,99,255,0.06), transparent 70%)' }}
              >
                <span style={{ fontSize: '0.3em', color: 'rgba(255,255,255,0.1)', fontFamily: 'monospace' }}>
                  {'{ dashboard }'}
                </span>
              </div>
            </div>
          </Fragment>
        </Slide>

        {/* ==================== 10: 辐射布局 ==================== */}
        <SectionTitle num="10" title="辐射布局" />

        <Slide>
          <h2>🎯 核心 + 周边组件辐射图</h2>
          <Fragment animation="fade-up" as="div">
            <div className="orbit-container">
              <div className="orbit-center">🧠</div>
              <div className="orbit-ring ring-1" />
              <div className="orbit-ring ring-2" />
              {/* Inner orbit – 4 nodes */}
              <div className="orbit-node" style={{ top: '8%', left: '50%', transform: 'translateX(-50%)' }}>
                <span className="node-icon">📝</span>
                <span>Prompt</span>
              </div>
              <div className="orbit-node" style={{ top: '50%', right: '4%', transform: 'translateY(-50%)' }}>
                <span className="node-icon">🔧</span>
                <span>Tools</span>
              </div>
              <div className="orbit-node" style={{ bottom: '8%', left: '50%', transform: 'translateX(-50%)' }}>
                <span className="node-icon">💾</span>
                <span>Memory</span>
              </div>
              <div className="orbit-node" style={{ top: '50%', left: '4%', transform: 'translateY(-50%)' }}>
                <span className="node-icon">🛡️</span>
                <span>Guard</span>
              </div>
              {/* Outer orbit – corners */}
              <div className="orbit-node" style={{ top: '2%', right: '8%' }}>
                <span className="node-icon">📡</span>
                <span>API</span>
              </div>
              <div className="orbit-node" style={{ bottom: '2%', right: '8%' }}>
                <span className="node-icon">🗄️</span>
                <span>DB</span>
              </div>
              <div className="orbit-node" style={{ bottom: '2%', left: '8%' }}>
                <span className="node-icon">📊</span>
                <span>Trace</span>
              </div>
              <div className="orbit-node" style={{ top: '2%', left: '8%' }}>
                <span className="node-icon">🔐</span>
                <span>Auth</span>
              </div>
            </div>
          </Fragment>
        </Slide>

        {/* ==================== FINAL ==================== */}
        <Slide
          transition="zoom"
          className="final-slide playground-final"
          backgroundGradient="radial-gradient(ellipse at 50% 50%, rgba(108,99,255,0.12) 0%, transparent 60%)"
        >
          <h2>✨ Keep Creating</h2>
          <p style={{ fontSize: '0.85em', color: 'var(--text-dim)', marginTop: '1em', lineHeight: 1.9 }}>
            这些布局与视觉效果可以自由组合<br />
            用于你的下一个演示项目
          </p>
          <div style={{ marginTop: '2em', display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <span className="floating-tag purple">渐变文字</span>
            <span className="floating-tag blue">玻璃拟态</span>
            <span className="floating-tag green">时间线</span>
            <span className="floating-tag yellow">数据面板</span>
            <span className="floating-tag red">对比布局</span>
          </div>
        </Slide>
      </Deck>
    </>
  );
}
