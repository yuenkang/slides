import { Deck, Slide, Fragment, Code } from '@revealjs/react';
import 'reveal.js/reveal.css';
import 'reveal.js/theme/black.css';
import 'reveal.js/plugin/highlight/monokai.css';
import RevealHighlight from 'reveal.js/plugin/highlight';
import RevealNotes from 'reveal.js/plugin/notes';
import { Particles } from '../../components/Particles';
import { BackButton } from '../../components/BackButton';
import { SlideControls } from '../../components/SlideControls';
import './styles.css';

const AGENT_LOOP_CODE = `const messages: MessageParam[] = [{ role: "user", content: userInput }];
while (true) {
  const response = await client.messages.create({
    model: "claude-opus-4-6", max_tokens: 8096,
    tools: toolDefinitions, messages,
  });
  if (response.stop_reason === "tool_use") {
    const toolResults = await Promise.all(
      response.content.filter((b) => b.type === "tool_use")
        .map(async (b) => ({
          type: "tool_result" as const, tool_use_id: b.id,
          content: await executeTool(b.name, b.input),
        }))
    );
    messages.push({ role: "assistant", content: response.content });
    messages.push({ role: "user", content: toolResults });
  } else {
    return response.content.find((b) => b.type === "text")?.text ?? "";
  }
}`;

const SKILLS_CODE = `const systemPrompt = \`
可用 Skills：
 - deploy: 部署到生产环境
 - code-review: 代码审查清单
 - git-workflow: 分支策略和 PR 规范
\`;

async function executeLoadSkill(
  name: string
): Promise<string> {
  return fs.readFile(
    \`./skills/\${name}.md\`, "utf-8"
  );
}`;

interface SectionTitleProps {
  num: string;
  title: string;
}

function SectionTitle({ num, title }: SectionTitleProps) {
  return (
    <Slide transition="zoom" className="section-title">
      <div className="section-num">{num}</div>
      <h2>{title}</h2>
    </Slide>
  );
}

interface AgentPresentationProps {
  onBack?: () => void;
}

export function AgentPresentation({ onBack }: AgentPresentationProps) {
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
        plugins={[RevealHighlight, RevealNotes]}
      >
        <SlideControls />
        {/* ==================== TITLE ==================== */}
        <Slide
          transition="zoom"
          className="title-slide"
          backgroundGradient="radial-gradient(ellipse at 30% 50%, rgba(108,99,255,0.15) 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(0,210,255,0.1) 0%, transparent 60%)"
        >
          <h1>你不知道的 Agent</h1>
          <p className="subtitle">原理、架构与工程实践</p>
          <p className="author">基于 Tw93 文章 · 分享整理</p>
        </Slide>

        {/* ==================== AGENDA ==================== */}
        <Slide backgroundGradient="radial-gradient(ellipse at 80% 20%, rgba(108,99,255,0.08) 0%, transparent 50%)">
          <h2>📋 今日议程</h2>
          <div className="card-grid">
            {[
              { icon: '🔄', title: '1. Agent Loop', desc: '感知→决策→行动→反馈的核心循环' },
              { icon: '🏗️', title: '2. Harness', desc: '为什么基础设施比模型更关键' },
              { icon: '📐', title: '3. 上下文工程', desc: '分层管理与 Context Rot 防护' },
              { icon: '🔧', title: '4. 工具设计', desc: 'ACI 原则与工具演进' },
              { icon: '🧠', title: '5. 记忆系统', desc: '四种记忆的存取设计' },
              { icon: '🤖', title: '6-10. 更多主题', desc: '自主度 · 多Agent · 评测 · OpenClaw' },
            ].map((item, i) => (
              <Fragment key={i} animation="fade-up">
                <div className="card">
                  <div className="icon">{item.icon}</div>
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
              </Fragment>
            ))}
          </div>
        </Slide>

        {/* ==================== 核心判断 ==================== */}
        <Slide>
          <h2>⚡ 核心判断</h2>
          <Fragment animation="fade-up" as="div">
            <div className="highlight-box">
              更贵的模型带来的提升，很多时候没有想象中那么大。反而 <strong>Harness 和验证测试质量</strong>对成功率的影响更大。
            </div>
          </Fragment>
          <Fragment animation="fade-up" as="div">
            <div className="highlight-box warn">
              调试 Agent 行为时，应优先检查<strong>工具定义</strong>，多数工具选择错误都出在描述不准确。
            </div>
          </Fragment>
          <Fragment animation="fade-up" as="div">
            <div className="highlight-box">
              <strong>评测系统本身的问题</strong>，很多时候比 Agent 出问题更难发现。
            </div>
          </Fragment>
        </Slide>

        {/* ==================== SECTION 1 ==================== */}
        <SectionTitle num="01" title="Agent Loop 的基本运转方式" />

        <Slide>
          <h2>🔄 核心循环</h2>
          <p>Agent Loop 的核心实现逻辑抽象后其实<strong>不到 20 行代码</strong>：</p>
          <Fragment animation="fade-up" as="div">
            <div className="flow">
              <div className="flow-item" style={{ borderColor: 'rgba(0,210,255,0.5)' }}>👁️ 感知</div>
              <div className="flow-arrow">→</div>
              <div className="flow-item" style={{ borderColor: 'rgba(108,99,255,0.5)' }}>🧠 决策</div>
              <div className="flow-arrow">→</div>
              <div className="flow-item" style={{ borderColor: 'rgba(255,107,107,0.5)' }}>⚡ 行动</div>
              <div className="flow-arrow">→</div>
              <div className="flow-item" style={{ borderColor: 'rgba(255,217,61,0.5)' }}>📊 反馈</div>
              <div className="flow-arrow">↩️</div>
            </div>
          </Fragment>
          <Fragment animation="fade-up" as="div">
            <Code language="typescript">{AGENT_LOOP_CODE}</Code>
          </Fragment>
        </Slide>

        <Slide>
          <h2>Workflow vs Agent</h2>
          <Fragment animation="fade-up" as="div">
            <div className="vs-box">
              <div className="side" style={{ borderColor: 'rgba(0,210,255,0.3)' }}>
                <h4 style={{ color: 'var(--accent2)', margin: '0 0 8px' }}>Workflow</h4>
                <p style={{ fontSize: '0.9em' }}>执行路径由<strong>代码预先写死</strong><br />DAG 有向无环图</p>
              </div>
              <div className="vs">VS</div>
              <div className="side" style={{ borderColor: 'rgba(108,99,255,0.3)' }}>
                <h4 style={{ color: 'var(--accent)', margin: '0 0 8px' }}>Agent</h4>
                <p style={{ fontSize: '0.9em' }}>由 <strong>LLM 动态决定</strong>下一步<br />路径根据状态生成</p>
              </div>
            </div>
          </Fragment>
          <Fragment animation="fade-up" as="div">
            <div className="highlight-box">
              核心区别在于控制权掌握在谁手里。两者无高下之分，真正重要的是给任务找到更适合的解决方案。
            </div>
          </Fragment>
        </Slide>

        <Slide>
          <h2>五种常见控制模式</h2>
          <Fragment animation="fade-up" as="div">
            <div className="card-grid">
              <div className="card">
                <h4>1️⃣ 提示链 Prompt Chaining</h4>
                <p>任务拆成顺序步骤，每步处理上一步输出<br /><span className="tag tag-blue">线性流程</span></p>
              </div>
              <div className="card">
                <h4>2️⃣ 路由 Routing</h4>
                <p>对输入分类，定向到专用处理流程<br /><span className="tag tag-purple">分类分发</span></p>
              </div>
              <div className="card">
                <h4>3️⃣ 并行 Parallelization</h4>
                <p>分段法并发 / 投票法取共识<br /><span className="tag tag-red">高风险决策</span></p>
              </div>
              <div className="card">
                <h4>4️⃣ 编排器-工作者</h4>
                <p>中央 LLM 动态分解，委派工作者<br /><span className="tag tag-yellow">复杂任务</span></p>
              </div>
            </div>
          </Fragment>
          <Fragment animation="fade-up" as="div">
            <div className="card" style={{ marginTop: 16 }}>
              <h4>5️⃣ 评估器-优化器 Evaluator-Optimizer</h4>
              <p>生成器产出 → 评估器反馈 → 循环直到达标。适合翻译、创意写作等质量标准难以用代码定义的任务。</p>
            </div>
          </Fragment>
        </Slide>

        <Slide>
          <h2>🧩 新能力仅通过三种方式接入</h2>
          <Fragment animation="fade-up" as="div">
            <div className="card-grid-3">
              <div className="card" style={{ textAlign: 'center' }}>
                <div className="icon">🔧</div>
                <h4>扩展工具集<br />和 handler</h4>
              </div>
              <div className="card" style={{ textAlign: 'center' }}>
                <div className="icon">📝</div>
                <h4>调整系统<br />提示结构</h4>
              </div>
              <div className="card" style={{ textAlign: 'center' }}>
                <div className="icon">💾</div>
                <h4>状态外化到<br />文件或数据库</h4>
              </div>
            </div>
          </Fragment>
          <Fragment animation="fade-up" as="div">
            <div className="highlight-box">
              不要让循环体变成巨大的状态机。<br />
              <strong>模型负责推理，外部系统负责状态和边界</strong>，核心循环逻辑就很少需要调整。
            </div>
          </Fragment>
        </Slide>

        {/* ==================== SECTION 2 ==================== */}
        <SectionTitle num="02" title="为什么 Harness 比模型更关键" />

        <Slide>
          <h2>🏗️ Harness 四大组成</h2>
          <p>围绕 Agent 构建的测试、验证与约束基础设施</p>
          <Fragment animation="fade-up" as="div">
            <div className="card-grid">
              <div className="card"><h4>✅ 验收基线</h4><p>明确的成功/失败标准</p></div>
              <div className="card"><h4>🚧 执行边界</h4><p>Agent 能做什么、不能做什么</p></div>
              <div className="card"><h4>📡 反馈信号</h4><p>自动化验证结果回传</p></div>
              <div className="card"><h4>🔙 回退手段</h4><p>出错时的恢复机制</p></div>
            </div>
          </Fragment>
          <Fragment animation="fade-up" as="div">
            <div className="highlight-box">
              Harness 要做的就是把任务推进<strong>"目标明确 × 可自动验证"</strong>的象限，让对错有机器可以执行的判断标准。
            </div>
          </Fragment>
        </Slide>

        <Slide>
          <h2>🚀 OpenAI 的 Agent 优先开发实践</h2>
          <Fragment animation="fade-up" as="div">
            <div className="stat-row">
              <div className="stat"><div className="num">3</div><div className="label">工程师</div></div>
              <div className="stat"><div className="num">5</div><div className="label">个月</div></div>
              <div className="stat"><div className="num">100万+</div><div className="label">行代码</div></div>
              <div className="stat"><div className="num">10×</div><div className="label">传统速度</div></div>
            </div>
          </Fragment>
          <ul style={{ marginTop: 24 }}>
            <Fragment as="li"><strong>Agent 看不到的内容等于不存在</strong> — 知识必须存在于代码库本身</Fragment>
            <Fragment as="li"><strong>约束编码化而非文档化</strong> — 靠 Linter 和类型系统强制执行</Fragment>
            <Fragment as="li"><strong>Agent 端到端自主完成</strong> — 从复现 Bug 到合并 PR 全链路无需人介入</Fragment>
            <Fragment as="li"><strong>最小化合并阻力</strong> — 测试偶发失败用重跑处理，不阻塞进度</Fragment>
          </ul>
        </Slide>

        {/* ==================== SECTION 3 ==================== */}
        <SectionTitle num="03" title="上下文工程为什么决定稳定性" />

        <Slide>
          <h2>🧬 Context Rot 问题</h2>
          <p>Transformer 注意力复杂度 <code>O(n²)</code>，上下文越长，关键信号越容易被噪声稀释。</p>
          <Fragment animation="fade-up" as="div">
            <div className="highlight-box warn">
              很多看起来像<strong>模型能力不足</strong>的问题，往往可以追溯到<strong>上下文组织不当</strong>。
            </div>
          </Fragment>
          <Fragment animation="fade-up" as="div">
            <h3>上下文分层管理</h3>
            <div className="layer-stack">
              <div className="layer" style={{ background: 'rgba(108,99,255,0.15)' }}><span>💎 常驻层</span><span className="desc">身份定义 · 项目约定 · 绝对禁止项</span></div>
              <div className="layer" style={{ background: 'rgba(0,210,255,0.12)' }}><span>📚 按需加载</span><span className="desc">Skills · 领域知识 · 描述符常驻内容触发注入</span></div>
              <div className="layer" style={{ background: 'rgba(255,217,61,0.1)' }}><span>⚡ 运行时注入</span><span className="desc">当前时间 · 渠道 ID · 用户偏好</span></div>
              <div className="layer" style={{ background: 'rgba(255,107,107,0.1)' }}><span>💾 记忆层</span><span className="desc">MEMORY.md · 跨会话经验 · 需要时才读取</span></div>
              <div className="layer" style={{ background: 'rgba(255,255,255,0.04)' }}><span>⚙️ 系统层</span><span className="desc">Hooks · 代码规则 · 完全不进上下文</span></div>
            </div>
          </Fragment>
        </Slide>

        <Slide>
          <h2>🗜️ 压缩策略与 Prompt Caching</h2>
          <div className="two-col">
            <div>
              <h3>三种压缩策略</h3>
              <Fragment animation="fade-up" as="div">
                <ul>
                  <li><strong>滑动窗口</strong> — 最简单，但丢失早期决策背景</li>
                  <li><strong>LLM 摘要</strong> — 保留架构决策、未完成任务和关键约束</li>
                  <li><strong>工具结果替换</strong> — <code>micro_compact</code> 每轮替换旧输出</li>
                </ul>
              </Fragment>
              <Fragment animation="fade-up" as="div">
                <div className="highlight-box warn" style={{ fontSize: '0.85em' }}>
                  <strong>压缩时不要改标识符！</strong><br />UUID、hash、URL、文件名必须原样保留。
                </div>
              </Fragment>
            </div>
            <div>
              <h3>Prompt Caching</h3>
              <Fragment animation="fade-up" as="div">
                <div className="card">
                  <h4>💡 反直觉的结论</h4>
                  <p>稳定的大系统提示，比频繁变动的小提示<strong>实际成本更低</strong>。</p>
                  <p>写入成本只付一次，后续读取折扣可达 <strong>90%</strong>。</p>
                </div>
              </Fragment>
              <Fragment animation="fade-up" as="div">
                <div className="card" style={{ marginTop: 12 }}>
                  <h4>常驻层越稳定 = 缓存命中率越高</h4>
                  <p>Skills 延迟加载不破坏系统提示前缀，追加在稳定前缀之后。</p>
                </div>
              </Fragment>
            </div>
          </div>
        </Slide>

        <Slide>
          <h2>📦 Skills 按需加载</h2>
          <p>系统提示只保留索引，完整知识按需加载</p>
          <div className="two-col">
            <div>
              <Fragment animation="fade-up" as="div">
                <Code language="typescript">{SKILLS_CODE}</Code>
              </Fragment>
            </div>
            <div>
              <Fragment animation="fade-up" as="div">
                <div className="card">
                  <h4>Skill 描述符要点</h4>
                  <ul>
                    <li>"何时该用我" 比 "我能做什么" 重要</li>
                    <li>必须写 <code>Use when / Don't use when</code></li>
                    <li>加反例：准确率 53% → <strong>85%</strong></li>
                  </ul>
                </div>
              </Fragment>
              <Fragment animation="fade-up" as="div">
                <div className="card" style={{ marginTop: 12 }}>
                  <h4>⚠️ 常见反模式</h4>
                  <ul>
                    <li>几百行工作手册全塞进 Skill 正文</li>
                    <li>一个 Skill 覆盖 review/deploy/debug 五件事</li>
                    <li>有副作用的 Skill 没限制调用时机</li>
                  </ul>
                </div>
              </Fragment>
            </div>
          </div>
        </Slide>

        {/* ==================== SECTION 4 ==================== */}
        <SectionTitle num="04" title="工具设计决定 Agent 能做什么" />

        <Slide>
          <h2>🔧 ACI 工具设计原则</h2>
          <p><strong>ACI (Agent-Computer Interface)</strong>：面向 Agent 目标设计工具，不是面向底层 API</p>
          <Fragment animation="fade-up" as="div">
            <div className="card-grid">
              <div className="card"><h4>🎯 命名明确</h4><p>工具名就能知道做什么，不需要看描述猜</p></div>
              <div className="card"><h4>🛡️ 参数防错</h4><p>提供默认值、枚举约束、类型校验</p></div>
              <div className="card"><h4>📖 定义里给示例</h4><p>直接在工具描述中提供调用示例</p></div>
              <div className="card"><h4>🧩 隔离工具消息</h4><p>工具结果独立于对话上下文</p></div>
            </div>
          </Fragment>
          <Fragment animation="fade-up" as="div">
            <div className="highlight-box">
              仅 5 个 MCP 服务器就可能带来 <strong>~55,000 tokens</strong> 的工具定义开销，在 200K 上下文里还没开始对话就用掉了近三成。
            </div>
          </Fragment>
        </Slide>

        {/* ==================== SECTION 5 ==================== */}
        <SectionTitle num="05" title="记忆系统如何设计" />

        <Slide>
          <h2>🧠 四种记忆类型</h2>
          <Fragment animation="fade-up" as="div">
            <table>
              <thead>
                <tr><th>类型</th><th>存储位置</th><th>说明</th></tr>
              </thead>
              <tbody>
                <tr><td><span className="tag tag-blue">工作记忆</span></td><td>上下文窗口</td><td>当前会话的短期记忆</td></tr>
                <tr><td><span className="tag tag-purple">程序性记忆</span></td><td>Skills 文件</td><td>如何做某事的方法论</td></tr>
                <tr><td><span className="tag tag-yellow">情景记忆</span></td><td>JSONL 日志</td><td>历史会话的完整记录</td></tr>
                <tr><td><span className="tag tag-red">语义记忆</span></td><td>MEMORY.md</td><td>Agent 主动写入的重要事实</td></tr>
              </tbody>
            </table>
          </Fragment>
          <Fragment animation="fade-up" as="div">
            <div className="highlight-box">
              记忆对 Agent 来说是<strong>基础设施</strong>，不是可以事后补上的能力。会话结束后上下文随之清空，跨会话一致性需要专门设计。
            </div>
          </Fragment>
        </Slide>

        {/* ==================== SECTION 6 ==================== */}
        <SectionTitle num="06" title="如何逐步放开 Agent 自主度" />

        <Slide>
          <h2>🔓 自主度的三个前提</h2>
          <Fragment animation="fade-up" as="div">
            <div className="card-grid-3">
              <div className="card" style={{ textAlign: 'center' }}>
                <div className="icon">🔗</div>
                <h4>跨 Session 续跑</h4>
                <p>任务进度写入磁盘<br />支持断点继续</p>
              </div>
              <div className="card" style={{ textAlign: 'center' }}>
                <div className="icon">📋</div>
                <h4>进度约束</h4>
                <p>单 Session 内的<br />状态外化记录</p>
              </div>
              <div className="card" style={{ textAlign: 'center' }}>
                <div className="icon">⏳</div>
                <h4>后台 I/O 接入</h4>
                <p>慢速操作<br />异步处理</p>
              </div>
            </div>
          </Fragment>
          <Fragment animation="fade-up" as="div">
            <div className="highlight-box">
              任务超过半小时，<strong>崩溃恢复是必选项</strong>。<br />
              不是直接放权，而是先补齐基础设施。
            </div>
          </Fragment>
        </Slide>

        {/* ==================== SECTION 7 ==================== */}
        <SectionTitle num="07" title="多 Agent 如何组织" />

        <Slide>
          <h2>🤖 两种工作模式</h2>
          <Fragment animation="fade-up" as="div">
            <div className="vs-box">
              <div className="side" style={{ borderColor: 'rgba(0,210,255,0.3)' }}>
                <h4 style={{ color: 'var(--accent2)', margin: '0 0 8px' }}>指挥者模式</h4>
                <p style={{ fontSize: '0.9em' }}>同步协作 · 每轮调整<br />Session 结束 Context 就没了</p>
              </div>
              <div className="vs">VS</div>
              <div className="side" style={{ borderColor: 'rgba(108,99,255,0.3)' }}>
                <h4 style={{ color: 'var(--accent)', margin: '0 0 8px' }}>统筹者模式</h4>
                <p style={{ fontSize: '0.9em' }}>异步委派 · 并行工作<br />产出为可持久化工件（PR/分支）</p>
              </div>
            </div>
          </Fragment>
          <ul style={{ marginTop: 20 }}>
            <Fragment as="li">主 Agent 作为 <strong>Orchestrator</strong> 统筹全局</Fragment>
            <Fragment as="li">子 Agent 通过 <strong>JSONL inbox</strong> 协议通信</Fragment>
            <Fragment as="li">用 <strong>Worktree</strong> 隔离文件修改</Fragment>
            <Fragment as="li">子 Agent <strong>只回传摘要</strong>，细节留在自己上下文里</Fragment>
          </ul>
        </Slide>

        {/* ==================== SECTION 8 ==================== */}
        <SectionTitle num="08" title="Agent 评测如何做" />

        <Slide>
          <h2>📊 评测核心指标</h2>
          <div className="two-col">
            <div>
              <Fragment animation="fade-up" as="div">
                <div className="card">
                  <h4>Pass@k — 能力上限</h4>
                  <p>k 次尝试只要对 1 次<br />验证 Agent 是否<strong>有能力</strong>做到</p>
                </div>
              </Fragment>
              <Fragment animation="fade-up" as="div">
                <div className="card" style={{ marginTop: 12 }}>
                  <h4>Pass^k — 回归质量</h4>
                  <p>k 次尝试<strong>全部正确</strong><br />保证上线后的稳定性</p>
                </div>
              </Fragment>
            </div>
            <div>
              <h3>三类评分器</h3>
              <Fragment animation="fade-up" as="div">
                <table>
                  <thead><tr><th>评分器</th><th>特点</th></tr></thead>
                  <tbody>
                    <tr><td><span className="tag tag-blue">代码评分器</span></td><td>最高准确性，确定性验证</td></tr>
                    <tr><td><span className="tag tag-purple">模型评分器</span></td><td>语义质量评估</td></tr>
                    <tr><td><span className="tag tag-yellow">人工评分器</span></td><td>基准校准和标注</td></tr>
                  </tbody>
                </table>
              </Fragment>
              <Fragment animation="fade-up" as="div">
                <div className="highlight-box warn" style={{ fontSize: '0.85em' }}>
                  <strong>先修评测，再改 Agent</strong><br />
                  评测系统出问题先修评测，不要基于失真信号调整方向。
                </div>
              </Fragment>
            </div>
          </div>
        </Slide>

        {/* ==================== SECTION 9 ==================== */}
        <SectionTitle num="09" title="如何追踪 Agent 执行过程" />

        <Slide>
          <h2>🔍 可观测性设计</h2>
          <Fragment animation="fade-up" as="div">
            <div className="card-grid">
              <div className="card"><h4>📝 Trace 记录</h4><p>Tool Start/End、Turn End 等事件<br />完整记录每一步决策路径</p></div>
              <div className="card"><h4>📡 两层分工</h4><p>传统 APM 监控延迟和错误率<br />Agent Trace 定位决策失误</p></div>
              <div className="card"><h4>🎲 在线采样评测</h4><p>线上流量采样<br />持续改进 Agent 质量</p></div>
              <div className="card"><h4>📊 事件流底座</h4><p>一次发布多路消费<br />解耦记录与分析</p></div>
            </div>
          </Fragment>
          <Fragment animation="fade-up" as="div">
            <div className="highlight-box">
              传统 APM 接口层看起来可能一切正常，但真正的问题出在模型某一轮做出了<strong>错误决策</strong>，只有回看完整 Trace 才能定位。
            </div>
          </Fragment>
        </Slide>

        {/* ==================== SECTION 10 ==================== */}
        <SectionTitle num="10" title="OpenClaw 实践" />

        <Slide>
          <h2>⚙️ OpenClaw 五层解耦架构</h2>
          <Fragment animation="fade-up" as="div">
            <div className="layer-stack">
              <div className="layer" style={{ background: 'rgba(108,99,255,0.2)' }}><span>🔌 渠道层</span><span className="desc">消息总线解耦渠道与 Agent</span></div>
              <div className="layer" style={{ background: 'rgba(0,210,255,0.15)' }}><span>📝 提示层</span><span className="desc">系统提示按层叠加</span></div>
              <div className="layer" style={{ background: 'rgba(255,217,61,0.12)' }}><span>🔧 工具层</span><span className="desc">Skills 延迟加载 · ACI 设计</span></div>
              <div className="layer" style={{ background: 'rgba(255,107,107,0.12)' }}><span>💾 状态层</span><span className="desc">文件系统状态 · 任务恢复</span></div>
              <div className="layer" style={{ background: 'rgba(255,255,255,0.06)' }}><span>🔒 安全层</span><span className="desc">先于功能设计的权限兜底</span></div>
            </div>
          </Fragment>
          <Fragment animation="fade-up" as="div">
            <div className="highlight-box">
              工程实现顺序：<strong>安全边界 → 消息解耦 → 状态外化 → 分层提示 → 记忆整合</strong>
            </div>
          </Fragment>
        </Slide>

        {/* ==================== SECTION 11 ==================== */}
        <SectionTitle num="11" title="常见反模式" />

        <Slide>
          <h2>⚠️ Agent 落地常见坑</h2>
          <Fragment animation="fade-up" as="div">
            <div className="card-grid">
              <div className="card" style={{ borderColor: 'rgba(255,107,107,0.3)' }}>
                <h4>❌ 系统提示当知识库</h4><p>应移至 Skills，按需加载</p>
              </div>
              <div className="card" style={{ borderColor: 'rgba(255,107,107,0.3)' }}>
                <h4>❌ 工具数量失控</h4><p>应合并或分命名空间</p>
              </div>
              <div className="card" style={{ borderColor: 'rgba(255,107,107,0.3)' }}>
                <h4>❌ 约束靠期望不靠机制</h4><p>应改为 Linter/Hook 强制执行</p>
              </div>
              <div className="card" style={{ borderColor: 'rgba(255,107,107,0.3)' }}>
                <h4>❌ 基于失真评测调 Agent</h4><p>先修评测系统，再修 Agent</p>
              </div>
            </div>
          </Fragment>
          <Fragment animation="fade-up" as="div">
            <div className="highlight-box warn">
              这些问题都很常见，很多看起来像模型能力不够，回头看其实是<strong>工程约束没立住</strong>。
            </div>
          </Fragment>
        </Slide>

        {/* ==================== SECTION 12 ==================== */}
        <SectionTitle num="12" title="划重点" />

        <Slide>
          <h2>🎯 十大核心要点</h2>
          <div style={{ fontSize: '0.62em', lineHeight: 1.9 }}>
            <ol style={{ paddingLeft: '1.5em' }}>
              <Fragment as="li"><strong>Agent 核心循环稳定</strong>，新能力通过工具扩展、提示调整和状态外化实现</Fragment>
              <Fragment as="li"><strong>Harness 比模型更重要</strong>，验收基线 + 执行边界 + 反馈信号 + 回退手段</Fragment>
              <Fragment as="li"><strong>防 Context Rot</strong>，分层管理 + 按需加载 + 滑动窗口压缩</Fragment>
              <Fragment as="li"><strong>ACI 工具设计</strong>，面向目标不面向底层 API，调试优先查工具描述</Fragment>
              <Fragment as="li"><strong>四种记忆分层</strong>，MEMORY.md + 按需检索 + 可回退整合</Fragment>
              <Fragment as="li"><strong>长任务靠状态外化</strong>，进度通过文件传递不依赖上下文窗口</Fragment>
              <Fragment as="li"><strong>多 Agent 先有隔离再并行</strong>，协议先于协作，子 Agent 只回传摘要</Fragment>
              <Fragment as="li"><strong>Pass@k 验能力，Pass^k 保质量</strong>，评测出问题先修评测</Fragment>
              <Fragment as="li"><strong>Trace 是排查前提</strong>，事件流底座一次发布多路消费</Fragment>
              <Fragment as="li"><strong>跑稳靠工程细节</strong>：消息解耦 · 状态外化 · 分层提示 · 记忆整合 · 安全边界</Fragment>
            </ol>
          </div>
        </Slide>

        {/* ==================== FINAL ==================== */}
        <Slide
          transition="zoom"
          className="final-slide"
          backgroundGradient="radial-gradient(ellipse at 50% 50%, rgba(108,99,255,0.12) 0%, transparent 60%)"
        >
          <h2>Thank You</h2>
          <p style={{ fontSize: '0.8em', color: 'var(--text-dim)', marginTop: '1em' }}>
            「Agent 跑稳靠的不是更复杂的循环，而是工程细节」
          </p>
          <p style={{ fontSize: '0.6em', color: 'var(--text-dim)', marginTop: '2em' }}>
            原文：Tw93 · <a href="https://tw93.fun/2026-03-21/agent.html" style={{ color: 'var(--accent)' }}>你不知道的 Agent</a>
          </p>
        </Slide>

      </Deck>
    </>
  );
}
