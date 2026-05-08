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

interface AgentIntroProps {
  onBack?: () => void;
}

/* ===== Code Snippets (incremental) ===== */

const CODE_BARE = `// 形态 0：裸 API 调用
const response = await client.messages.create({
  model: "claude-opus-4-7",
  messages: [{ role: "user", content: userInput }]
});

console.log(response.content);
// 结束。这次对话永远消失。
// 下次再问，对方完全不记得你。`;

const CODE_MEMORY = `// 形态 1：加了记忆（Messages 数组）
const messages = [];                       // ← 新增：历史容器

async function chat(input) {
  messages.push({ role: "user", content: input });

  const response = await client.messages.create({
    model: "claude-opus-4-7",
    messages,                              // ← 新增：把所有历史都带上
  });

  messages.push({                          // ← 新增：把这次回答也存起来
    role: "assistant",
    content: response.content
  });

  return response.content;
}`;

const CODE_WORKFLOW = `// 形态 2：基于工作流的节点 Agent
// 路径全部由开发者提前写死

async function triage(symptom) {
  const dept = await llm.classify(symptom);  // ← LLM 只做分类

  if (dept === "内科")      return route("内科诊室");
  else if (dept === "外科") return route("外科诊室");
  else if (dept === "急诊") return route("急诊室");
  else                      return route("人工分诊");  // 兜底

  // ↑ 路径写死，遇到不在规则里的情况就走兜底
}`;

const CODE_TOOLS = `// 形态 3：有了 Tools（工具调用）
const tools = [                            // ← 新增：工具定义
  {
    name: "query_account",
    description: "查询玩家账号记录",
    input_schema: { /* ... */ }
  },
  {
    name: "send_compensation",
    description: "发放道具补偿",
    input_schema: { /* ... */ }
  }
];

const response = await client.messages.create({
  model, messages,
  tools,                                   // ← 新增：把工具交给 LLM
});
// LLM 自己决定要不要调用、调用哪个`;

const CODE_LOOP = `// 形态 4：完整 Agent Loop
const messages = [{ role: "user", content: userInput }];

while (true) {                             // ← 新增：循环
  const response = await client.messages.create({
    model, tools, messages
  });

  if (response.stop_reason === "tool_use") {
    const results = await executeTools(response.content);
    messages.push(
      { role: "assistant", content: response.content },
      { role: "user", content: results }    // 工具结果塞回去
    );
    // 继续循环，让 LLM 看到结果再决策
  } else {
    return response.content;                // LLM 自己说「完了」
  }
}`;

const CODE_LOOP_PROBLEMS = `// 看起来很简洁，但放进生产环境会发生什么？
while (true) {
  const response = await client.messages.create(...);

  // ❌ 工具调用超时了，怎么办？重试几次？
  // ❌ LLM 输出了错误格式，工具解析失败，然后呢？
  // ❌ 循环了 50 次还没完，是卡住了还是在干活？
  // ❌ 这次结果对不对？和上次比变好了还是变差了？
  // ❌ 出了问题，哪一步出的？日志在哪？

  if (response.stop_reason === "tool_use") {
    // ...
  }
}`;

/* ===== Helper Components ===== */

interface EvoNode {
  icon: string;
  label: string;
  desc?: string;
}

const EVO_NODES: EvoNode[] = [
  { icon: '📞', label: '裸 API', desc: '一问一答' },
  { icon: '🧠', label: '加记忆', desc: 'Messages 数组' },
  { icon: '🔀', label: '工作流', desc: '路径写死' },
  { icon: '🔧', label: '加工具', desc: '能干活了' },
  { icon: '🔁', label: 'Agent Loop', desc: '自主循环' },
  { icon: '🛡️', label: 'Harness', desc: '稳定运行' },
];

function EvolutionChain({ litUntil = -1 }: { litUntil?: number }) {
  return (
    <div className="evo-chain">
      {EVO_NODES.map((n, i) => {
        const lit = i <= litUntil;
        const isStar = i === EVO_NODES.length - 1;
        return (
          <>
            <div
              key={`n-${i}`}
              className={`evo-node ${lit ? 'evo-node--lit' : ''} ${isStar ? 'evo-node--star' : ''}`}
            >
              <div className="evo-icon">{n.icon}</div>
              <div className="evo-label">{n.label}</div>
              {n.desc && <div className="evo-desc">{n.desc}</div>}
            </div>
            {i < EVO_NODES.length - 1 && (
              <div key={`a-${i}`} className={`evo-arrow ${lit ? 'evo-arrow--lit' : ''}`}>›</div>
            )}
          </>
        );
      })}
    </div>
  );
}

export function AgentIntroPresentation({ onBack }: AgentIntroProps) {
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

        {/* ============================================================ */}
        {/* PART 0 · 开篇互动                                              */}
        {/* ============================================================ */}

        {/* SLIDE 1: 你们用过 Agent 吗？ */}
        <Slide
          transition="zoom"
          className="ai-title-slide"
          backgroundGradient="radial-gradient(ellipse at 30% 40%, rgba(17,153,142,0.18) 0%, transparent 55%), radial-gradient(ellipse at 70% 60%, rgba(56,239,125,0.1) 0%, transparent 55%)"
          notes="开场停一下，邀请听众分享。请大家说说自己用过哪些 Agent — 工作里的、生活里的都行。把听众说的例子记在白板或脑子里，下一张幻灯片要把这些归类。预留 2-3 分钟互动时间，制造『被看见』的体验。"
        >
          <div className="ai-big-emoji">🤖</div>
          <h1>你们用过 Agent 吗？</h1>
          <p className="ai-subtitle">先听听大家说，再开始讲</p>
          <div className="ai-tag-row">
            <span className="ai-tag">举手分享</span>
            <span className="ai-tag">工作 / 生活</span>
            <span className="ai-tag">不一定要『高大上』</span>
          </div>
        </Slide>

        {/* SLIDE 2: 你们提到了这些 */}
        <Slide
          notes="把刚才听众说的例子归类到这五格里。每出现一格就解释一下：这个例子的特点是什么。重点不是『谁说对了』，而是让听众发现：原来我们说的『Agent』其实是非常不同的几种东西。"
        >
          <h2>你们提到的，大概就是这五类</h2>
          <div className="card-grid-3" style={{ gridTemplateColumns: '1fr 1fr 1fr', marginTop: '12px' }}>
            <Fragment animation="fade-up">
              <div className="card">
                <div className="icon">📞</div>
                <h4>裸 API 调用</h4>
                <p>给模型发一句、收一句，下次就忘了。<br />最简陋的形态。</p>
              </div>
            </Fragment>
            <Fragment animation="fade-up">
              <div className="card">
                <div className="icon">💬</div>
                <h4>早期 ChatGPT</h4>
                <p>能记住上下文，能多轮对话。<br />但只会说，不会做事。</p>
              </div>
            </Fragment>
            <Fragment animation="fade-up">
              <div className="card">
                <div className="icon">🏥</div>
                <h4>医院分诊机器人</h4>
                <p>按规则路由：症状 → 科室。<br />路径由人提前写死。</p>
              </div>
            </Fragment>
          </div>
          <div className="card-grid-3" style={{ gridTemplateColumns: '1fr 1fr', marginTop: '14px', maxWidth: '70%', margin: '14px auto 0' }}>
            <Fragment animation="fade-up">
              <div className="card">
                <div className="icon">🎙️</div>
                <h4>豆包 / 通用助手</h4>
                <p>对话 + 路由 + 工具 + 知识库。<br />多个子系统拼起来的复合产品。</p>
              </div>
            </Fragment>
            <Fragment animation="fade-up">
              <div className="card" style={{ borderColor: 'rgba(56,239,125,0.25)' }}>
                <div className="icon">🛠️</div>
                <h4>Claude Code / OpenClaw</h4>
                <p>能稳定干长任务的工程级 Agent。<br />背后是一整套 Harness。</p>
              </div>
            </Fragment>
          </div>
        </Slide>

        {/* SLIDE 3: 这五类 = 五个工程成熟度阶段 */}
        <Slide
          notes="今天的主线就是这条进化链。从最左边最简陋的裸 API 开始，每一步加一个东西，最终走到最右边的 Harness。听众会发现：他们日常说的那些 Agent，其实分布在这条线上不同的位置。我们今天要做的，就是把这条进化路径完整走一遍。"
        >
          <h2>这五类，其实是<span style={{ color: '#38ef7d' }}>五个工程成熟度阶段</span></h2>
          <Fragment animation="fade-up" as="div">
            <EvolutionChain litUntil={5} />
          </Fragment>
          <Fragment animation="fade-up" as="div">
            <div className="highlight-box" style={{ marginTop: '24px' }}>
              今天的主线 — 从最简陋的<strong>一次 API 调用</strong>开始，每一步加一个能力，最终走到能稳定运行的 <strong>Harness</strong>。
            </div>
          </Fragment>
          <Fragment animation="fade-up" as="div">
            <p style={{ fontSize: '0.6em', color: 'rgba(255,255,255,0.55)', textAlign: 'center', marginTop: '12px' }}>
              工程师可以看代码，非技术同事看每一步加了什么、解决了什么问题。
            </p>
          </Fragment>
        </Slide>

        {/* ============================================================ */}
        {/* PART 1 · Agent 的五种形态                                      */}
        {/* ============================================================ */}

        {/* SLIDE 4: 形态 0 — 裸 API 调用 */}
        <Slide
          className="form-slide"
          notes="最简陋的形态。一次 API 调用：把用户的问题发给模型，拿到回复，结束。这次对话永远消失。下次再问，模型完全不记得你。类比就像发一条没有留存的语音消息：说完就没了。这就是『一次性顾问』。"
        >
          <h2>形态 0 · 裸 API 调用 <span style={{ color: 'var(--ai-dim)', fontSize: '0.6em', fontWeight: 400 }}>一问一答，不留痕</span></h2>
          <div className="ai-two-col">
            <div className="ai-code-col">
              <h4>代码</h4>
              <Code language="typescript">{CODE_BARE}</Code>
            </div>
            <div className="ai-diagram-col">
              <h4>时序图</h4>
              <div className="seq-diagram">
                <div className="seq-actors">
                  <div className="seq-actor">
                    <div className="seq-actor-icon">👤</div>
                    <div className="seq-actor-name">用户</div>
                  </div>
                  <div className="seq-actor">
                    <div className="seq-actor-icon">🤖</div>
                    <div className="seq-actor-name">LLM</div>
                  </div>
                </div>
                <div className="seq-lines">
                  <div className="seq-msg seq-send">
                    <span>发送问题</span>
                    <span className="seq-msg-arrow seq-arrowhead-r" />
                  </div>
                  <div className="seq-msg" style={{ justifyContent: 'center', color: 'var(--ai-dim)' }}>
                    <span style={{ fontSize: '1.2em' }}>💭 思考</span>
                  </div>
                  <div className="seq-msg seq-recv">
                    <span className="seq-msg-arrow seq-arrowhead-l" />
                    <span>返回回复</span>
                  </div>
                </div>
                <div className="seq-disconnect">✗ 连接断开 — LLM 不再记得这次对话</div>
              </div>
            </div>
          </div>
          <Fragment animation="fade-up" as="div">
            <div className="ai-callout warn">
              <strong>缺什么：</strong>没有记忆，没有工具，没有循环。每次都是第一次见面，什么都得重新说。
            </div>
          </Fragment>
        </Slide>

        {/* SLIDE 5: 形态 1 — 加了记忆 */}
        <Slide
          className="form-slide"
          notes="加一个东西：messages 数组。把历史对话都拼进去，每次都带过去。这就是早期 ChatGPT 多轮对话的本质。能做什么：连续对话有上下文了。缺什么：上下文越来越长，成本越来越高，容量有上限，而且还是只能说话，不能行动。"
        >
          <h2>形态 1 · 加了记忆 <span style={{ color: 'var(--ai-dim)', fontSize: '0.6em', fontWeight: 400 }}>能记住上下文了</span></h2>
          <div className="ai-two-col">
            <div className="ai-code-col">
              <h4>代码（高亮 = 新增）</h4>
              <Code language="typescript">{CODE_MEMORY}</Code>
            </div>
            <div className="ai-diagram-col">
              <h4>对话历史堆叠</h4>
              <div className="msg-stack">
                <div className="msg-round">
                  <div className="msg-round-label">第 1 轮</div>
                  <div className="msg-row">
                    <div className="msg-bubble u new-msg">👤 你好</div>
                    <div className="msg-bubble a new-msg">🤖 你好！</div>
                  </div>
                </div>
                <Fragment animation="fade-up" as="div">
                  <div className="msg-round">
                    <div className="msg-round-label">第 2 轮 — 把第 1 轮也带上</div>
                    <div className="msg-row">
                      <div className="msg-bubble u">👤 你好</div>
                      <div className="msg-bubble a">🤖 你好！</div>
                      <div className="msg-bubble u new-msg">👤 帮我查 X</div>
                      <div className="msg-bubble a new-msg">🤖 查到了…</div>
                    </div>
                  </div>
                </Fragment>
                <Fragment animation="fade-up" as="div">
                  <div className="msg-round">
                    <div className="msg-round-label">第 3 轮 — 历史越带越长</div>
                    <div className="msg-row">
                      <div className="msg-bubble u">👤 你好</div>
                      <div className="msg-bubble a">🤖 你好！</div>
                      <div className="msg-bubble u">👤 帮我查 X</div>
                      <div className="msg-bubble a">🤖 查到了…</div>
                      <div className="msg-bubble u new-msg">👤 再帮我…</div>
                      <div className="msg-bubble a new-msg">🤖 好的…</div>
                    </div>
                  </div>
                </Fragment>
                <Fragment animation="fade-up" as="div">
                  <div className="msg-overflow">⚠️ 越来越长 → 成本上升、有上限、还是不能「行动」</div>
                </Fragment>
              </div>
            </div>
          </div>
          <Fragment animation="fade-up" as="div">
            <div className="ai-callout">
              <strong>类比：</strong>把每次聊天记录都复印一份附在下封信里 — 信越来越厚，但模型还是只会说，不会做。
            </div>
          </Fragment>
        </Slide>

        {/* SLIDE 6: 形态 2 — 工作流节点 */}
        <Slide
          className="form-slide"
          notes="再加一种东西：用 LLM 做分类，路径用代码写死。医院分诊就是经典例子。患者描述症状，LLM 判断属于哪个科室，路由到对应诊室。能做什么：确定性强，快速可靠，成本低。缺什么：路径无法穷举时就失效。遇到没想到的情况只能走兜底，或者直接懵。这就是为什么很多『智能客服』看起来不智能 — 它们其实就是工作流。"
        >
          <h2>形态 2 · 工作流节点 <span style={{ color: 'var(--ai-dim)', fontSize: '0.6em', fontWeight: 400 }}>路径写死，LLM 只选方向</span></h2>
          <div className="ai-two-col">
            <div className="ai-code-col">
              <h4>伪代码</h4>
              <Code language="typescript">{CODE_WORKFLOW}</Code>
            </div>
            <div className="ai-diagram-col">
              <h4>决策树</h4>
              <div className="dtree">
                <div className="dtree-input">患者描述症状</div>
                <div className="dtree-vline" />
                <div className="dtree-diamond-wrap">
                  <div className="dtree-diamond">
                    <div className="dtree-diamond-inner">LLM<br />分类</div>
                  </div>
                </div>
                <div className="dtree-branches">
                  <div className="dtree-branch">
                    <div className="dtree-branch-line" />
                    <div className="dtree-leaf dept">内科</div>
                  </div>
                  <div className="dtree-branch">
                    <div className="dtree-branch-line" />
                    <div className="dtree-leaf dept">外科</div>
                  </div>
                  <div className="dtree-branch">
                    <div className="dtree-branch-line" />
                    <div className="dtree-leaf dept">急诊</div>
                  </div>
                  <div className="dtree-branch">
                    <div className="dtree-branch-line" />
                    <div className="dtree-leaf fallback">人工兜底</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Fragment animation="fade-up" as="div">
            <div className="ai-callout warn">
              <strong>缺什么：</strong>路径必须穷举。遇到不在规则里的情况就走兜底 — 这就是为什么很多『智能客服』看起来不智能。
            </div>
          </Fragment>
        </Slide>

        {/* SLIDE 7: 形态 3 — 有了 Tools */}
        <Slide
          className="form-slide"
          notes="再加一个东西：tools。把外部能力（查数据库、发消息、调 API）描述清楚，交给 LLM。LLM 自己决定要不要调用、调用哪个。这一步非常关键 — Agent 从只会说话变成能干活。但还有个问题：每次还是一个 request/response，LLM 调完工具拿到结果就结束了，它不会主动说『我还没做完，继续做下一步』。"
        >
          <h2>形态 3 · 有了 Tools <span style={{ color: 'var(--ai-dim)', fontSize: '0.6em', fontWeight: 400 }}>从『会说话』变成『能干活』</span></h2>
          <div className="ai-two-col">
            <div className="ai-code-col">
              <h4>代码（高亮 = 新增）</h4>
              <Code language="typescript">{CODE_TOOLS}</Code>
            </div>
            <div className="ai-diagram-col">
              <h4>三方交互</h4>
              <div className="seq-3col">
                <div className="seq-3actor user-col">
                  <div className="seq-3icon">👤</div>
                  <div className="seq-3name">用户</div>
                </div>
                <div className="seq-3actor llm-col">
                  <div className="seq-3icon">🤖</div>
                  <div className="seq-3name">LLM</div>
                </div>
                <div className="seq-3actor tool-col">
                  <div className="seq-3icon">🔧</div>
                  <div className="seq-3name">工具 / API</div>
                </div>
              </div>
              <div className="seq-flow">
                <div className="seq-flow-row">
                  <span className="seq-flow-label">👤 发申诉</span>
                  <span className="arrow">→</span>
                  <span className="seq-flow-label">🤖</span>
                </div>
                <div className="seq-flow-row">
                  <span className="seq-flow-label">🤖 决定调用</span>
                  <span className="arrow">→</span>
                  <span className="seq-flow-tool">query_account()</span>
                </div>
                <div className="seq-flow-row">
                  <span className="seq-flow-tool">🔧 返回数据</span>
                  <span className="arrow-back">←</span>
                  <span className="seq-flow-label">🤖</span>
                </div>
                <div className="seq-flow-row">
                  <span className="seq-flow-label">🤖 拼回复</span>
                  <span className="arrow-back">←</span>
                  <span className="seq-flow-label">👤</span>
                </div>
              </div>
            </div>
          </div>
          <Fragment animation="fade-up" as="div">
            <div className="ai-callout warn">
              <strong>缺什么：</strong>调完工具就结束。LLM 不会主动说「我还没做完，继续下一步」 — 没有循环，能力就被切断了。
            </div>
          </Fragment>
        </Slide>

        {/* SLIDE 8: 形态 4 — Agent Loop */}
        <Slide
          className="form-slide"
          notes="终于到了最关键的一步：循环。用 while(true) 把整个交互包起来 — 模型输出 → 执行工具 → 把结果塞回 messages → 再让模型看 → 直到模型自己说『完了』。整个核心逻辑不到 20 行。这就是 Agent 的心脏。从这一刻起，LLM 不再是『一次性顾问』，而是真的能自己走完一整个任务。"
        >
          <h2>形态 4 · Agent Loop <span style={{ color: 'var(--ai-dim)', fontSize: '0.6em', fontWeight: 400 }}>整个核心 不到 20 行</span></h2>
          <div className="ai-two-col">
            <div className="ai-code-col">
              <h4>代码（高亮 = 新增）</h4>
              <Code language="typescript">{CODE_LOOP}</Code>
            </div>
            <div className="ai-diagram-col">
              <h4>循环状态机</h4>
              <div className="loop-machine">
                <div className="loop-top-row">
                  <div className="loop-box entry">📥<br />输入</div>
                  <div className="loop-h-arrow">→</div>
                  <div className="loop-box llm">🤖<br />LLM 决策</div>
                  <div className="loop-h-arrow">→</div>
                  <div className="loop-box tool">🔧<br />执行工具</div>
                </div>
                <div className="loop-return-wrap" style={{ marginTop: '12px' }}>
                  <div className="loop-return-line" />
                  <div className="loop-return-label">↑ 工具结果塞回去，让 LLM 再看一遍</div>
                </div>
                <Fragment animation="fade-up" as="div">
                  <div className="loop-bottom-row" style={{ marginTop: '14px' }}>
                    <span className="loop-done-label">LLM 说「完了」</span>
                    <span className="loop-h-arrow">→</span>
                    <div className="loop-box done">✅<br />输出结果</div>
                  </div>
                </Fragment>
              </div>
            </div>
          </div>
          <Fragment animation="fade-up" as="div">
            <div className="ai-callout">
              <strong>关键：</strong>「任务完成」由 LLM 自己判断 — 这是 Agent 和工作流最本质的区别。
            </div>
          </Fragment>
        </Slide>

        {/* SLIDE 9: Workflow vs Agent */}
        <Slide
          notes="这里特别强调一下：Workflow 和 Agent 不是高下之分，而是不同场景下的不同选择。路径可预测、规则清晰，用 Workflow 更便宜更稳定。路径无法穷举、需要灵活应变，才用 Agent。选错工具比选错模型代价更大 — 这句话之后会反复出现。"
        >
          <h2>Workflow vs Agent — 该用哪个？</h2>
          <div className="vs-box" style={{ marginTop: '20px' }}>
            <Fragment animation="fade-up" as="div" style={{ flex: 1 }}>
              <div className="side" style={{ borderColor: 'rgba(0,210,255,0.25)' }}>
                <h3 style={{ color: 'var(--ai-blue)', fontSize: '1.1em' }}>🔀 Workflow</h3>
                <ul style={{ marginTop: '8px' }}>
                  <li>路径由<strong>代码预先写死</strong></li>
                  <li>适合规则清晰、路径可穷举的场景</li>
                  <li>确定性强，便宜，易测试</li>
                  <li>遇到例外 → 直接失效</li>
                </ul>
              </div>
            </Fragment>
            <div className="vs">VS</div>
            <Fragment animation="fade-up" as="div" style={{ flex: 1 }}>
              <div className="side" style={{ borderColor: 'rgba(56,239,125,0.25)' }}>
                <h3 style={{ color: '#38ef7d', fontSize: '1.1em' }}>🔁 Agent</h3>
                <ul style={{ marginTop: '8px' }}>
                  <li>路径由 <strong>LLM 动态决定</strong></li>
                  <li>适合路径无法穷举的开放场景</li>
                  <li>灵活，能应对未知情况</li>
                  <li>行为不完全可预期 → 需要 Harness</li>
                </ul>
              </div>
            </Fragment>
          </div>
          <Fragment animation="fade-up" as="div">
            <div className="highlight-box" style={{ marginTop: '24px', textAlign: 'center' }}>
              两者没有高下 — <strong>选错工具比选错模型代价更大</strong>。
            </div>
          </Fragment>
        </Slide>

        {/* SLIDE 10: 形态 5 — 复合系统 */}
        <Slide
          className="form-slide"
          notes="豆包、ChatGPT 应用、文心这类产品，看起来是一个对话框，背后是多个子系统编排。最上层是产品界面，下面是路由层判断意图，核心层是 Agent Loop 加知识库，最底下是真实的工具和 API。每一层都对应前面讲过的某种形态。复合系统不是『更高级』，它只是把前面四种形态组合起来。最大的挑战：系统越复杂，调试越困难，责任越分散。"
        >
          <h2>形态 5 · 复合系统 <span style={{ color: 'var(--ai-dim)', fontSize: '0.6em', fontWeight: 400 }}>豆包这类产品的真实架构</span></h2>
          <div className="ai-two-col">
            <div className="ai-code-col">
              <h4>说明</h4>
              <div style={{ fontSize: '0.62em', lineHeight: 1.7, color: 'rgba(255,255,255,0.75)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <Fragment animation="fade-up">
                  <div>
                    <strong style={{ color: '#a29bfe' }}>① 产品界面层</strong><br />
                    用户看到的对话框 / App / 小程序
                  </div>
                </Fragment>
                <Fragment animation="fade-up">
                  <div>
                    <strong style={{ color: 'var(--ai-blue)' }}>② 路由 / 编排层</strong><br />
                    判断意图 → 分发到子系统（这一层就是「形态 2 · 工作流」）
                  </div>
                </Fragment>
                <Fragment animation="fade-up">
                  <div>
                    <strong style={{ color: '#38ef7d' }}>③ 核心执行层</strong><br />
                    Agent Loop + 知识库 + 记忆（形态 4）
                  </div>
                </Fragment>
                <Fragment animation="fade-up">
                  <div>
                    <strong style={{ color: 'var(--ai-red)' }}>④ 工具 / API 层</strong><br />
                    查数据、发消息、调外部服务（形态 3 提供的能力）
                  </div>
                </Fragment>
              </div>
            </div>
            <div className="ai-diagram-col">
              <h4>分层架构</h4>
              <div className="layer-arch">
                <Fragment animation="fade-up" as="div">
                  <div className="arch-layer ui">
                    <div className="arch-layer-label">① 产品界面</div>
                    <div className="arch-layer-desc">对话框 / App / 小程序</div>
                  </div>
                </Fragment>
                <div className="arch-arrow-down">↕</div>
                <Fragment animation="fade-up" as="div">
                  <div className="arch-layer router">
                    <div className="arch-layer-label">② 路由 / 编排</div>
                    <div className="arch-layer-desc">判断意图，分发任务</div>
                  </div>
                </Fragment>
                <div className="arch-arrow-down">↕</div>
                <Fragment animation="fade-up" as="div">
                  <div className="arch-layer core">
                    <div className="arch-sub">
                      <div className="arch-layer-label">③ Agent Loop</div>
                      <div className="arch-layer-desc">LLM + 工具 + 记忆</div>
                    </div>
                    <div className="arch-sub">
                      <div className="arch-layer-label">📚 知识库</div>
                      <div className="arch-layer-desc">RAG / 向量检索</div>
                    </div>
                  </div>
                </Fragment>
                <div className="arch-arrow-down">↕</div>
                <Fragment animation="fade-up" as="div">
                  <div className="arch-layer tools">
                    <div className="arch-layer-label">④ 工具 / API</div>
                    <div className="arch-layer-desc">查数据 · 发消息 · 改配置</div>
                  </div>
                </Fragment>
              </div>
            </div>
          </div>
          <Fragment animation="fade-up" as="div">
            <div className="ai-callout warn">
              <strong>挑战：</strong>系统越复杂 → 出问题时越难定位是哪一层的责任。这就是为什么需要更系统的工程方法。
            </div>
          </Fragment>
        </Slide>

        {/* SLIDE 11: Loop 本身不够 */}
        <Slide
          className="form-slide"
          notes="走到这里，前面 5 种形态的演进看起来很顺：每一步加一个能力，最终拼出一个完整 Agent。但真到生产环境，光有 Loop 是不够的。这一段的目标是把『为什么需要 Harness』说透。让大家看到：理想中是干净的循环，现实中是各种意外、重试、失控。这个 gap 就是 Harness 要填的。"
        >
          <h2>问题来了 — 光有 Loop <span style={{ color: 'var(--ai-red)' }}>不够</span></h2>
          <div className="ai-two-col">
            <div className="ai-code-col">
              <h4>同样的代码，放进生产环境</h4>
              <Code language="typescript">{CODE_LOOP_PROBLEMS}</Code>
            </div>
            <div className="ai-diagram-col">
              <h4>真实运行</h4>
              <div className="chaos-run">
                <div className="chaos-row ok"><span className="chaos-icon">✓</span> 第 1 次：成功</div>
                <Fragment animation="fade-up" as="div">
                  <div className="chaos-row ok"><span className="chaos-icon">✓</span> 第 2 次：成功</div>
                </Fragment>
                <Fragment animation="fade-up" as="div">
                  <div className="chaos-row err"><span className="chaos-icon">✗</span> 第 3 次：工具超时 — 重试？</div>
                </Fragment>
                <Fragment animation="fade-up" as="div">
                  <div className="chaos-row err"><span className="chaos-icon">✗</span> 第 4 次：无限重试 → 💸💸💸</div>
                </Fragment>
                <Fragment animation="fade-up" as="div">
                  <div className="chaos-row unk"><span className="chaos-icon">?</span> 第 5 次：输出对不对？不知道</div>
                </Fragment>
                <Fragment animation="fade-up" as="div">
                  <div className="chaos-row err"><span className="chaos-icon">✗</span> 第 6 次：崩了 — 从哪恢复？</div>
                </Fragment>
              </div>
            </div>
          </div>
          <Fragment animation="fade-up" as="div">
            <div className="ai-callout warn">
              <strong>这就是为什么需要 Harness</strong> — 围绕 Loop 的一整套基础设施，让它能在真实环境里稳定运行。
            </div>
          </Fragment>
        </Slide>

        {/* ============================================================ */}
        {/* PART 2 · 为什么 Harness 比模型更关键                            */}
        {/* ============================================================ */}

        {/* SLIDE 12: 什么是 Harness */}
        <Slide
          notes="Harness 这个词原本是『马具、挽具』的意思 — 套在马身上，让奔跑的马能被驾驭。给 Agent 也是一样：Loop 是引擎，Harness 是让引擎可控的一整套配套设施。四件套：验收基线（知道什么算对）、执行边界（知道什么不该做）、反馈信号（知道哪步出错）、回退手段（出错能恢复）。每一件都对应飞机上的一个东西 — 飞机不只是引擎，还有仪表盘、自动驾驶失效后的人工接管机制。"
        >
          <h2>什么是 Harness？<span style={{ color: 'var(--ai-dim)', fontSize: '0.55em', fontWeight: 400 }}>围绕 Agent Loop 的四件套</span></h2>
          <div className="harness-grid">
            <Fragment animation="fade-up" as="div">
              <div className="harness-card">
                <div className="harness-icon">📋</div>
                <div className="harness-title">① 验收基线</div>
                <div className="harness-desc">知道什么算「做对了」 — 测试用例 / 评估集 / 关键指标</div>
                <div className="harness-analogy">类比：飞行前检查清单</div>
              </div>
            </Fragment>
            <Fragment animation="fade-up" as="div">
              <div className="harness-card">
                <div className="harness-icon">🚧</div>
                <div className="harness-title">② 执行边界</div>
                <div className="harness-desc">知道什么「不该做」 — 权限隔离 / 操作白名单 / 人工确认</div>
                <div className="harness-analogy">类比：飞行禁区与限速</div>
              </div>
            </Fragment>
            <Fragment animation="fade-up" as="div">
              <div className="harness-card">
                <div className="harness-icon">📊</div>
                <div className="harness-title">③ 反馈信号</div>
                <div className="harness-desc">知道「哪步出错了」 — 完整 Trace / 日志 / 监控告警</div>
                <div className="harness-analogy">类比：飞行仪表盘</div>
              </div>
            </Fragment>
            <Fragment animation="fade-up" as="div">
              <div className="harness-card">
                <div className="harness-icon">↩️</div>
                <div className="harness-title">④ 回退手段</div>
                <div className="harness-desc">「出错了能恢复」 — 失败重试 / 任务回滚 / 人工接管</div>
                <div className="harness-analogy">类比：自动驾驶失效后的人工接管</div>
              </div>
            </Fragment>
          </div>
        </Slide>

        {/* SLIDE 13: 没有 Harness 会怎样 */}
        <Slide
          notes="把 11 张幻灯片那些『现实中』的混乱场景，逐个拿出来对比。同样的 Loop，没有 Harness 是无限重试烧 token，有 Harness 是触发回退机制。没有 Harness 是上下文被污染越走越偏，有 Harness 是反馈信号告警。这一张是核心对比，让听众形成『有 Harness vs 没 Harness 的差距比换模型大得多』的直觉。"
        >
          <h2>有 Harness vs 没 Harness</h2>
          <div className="compare-grid">
            <Fragment animation="fade-up" as="div">
              <div className="compare-col bad">
                <div className="compare-col-title">✗ 没有 Harness</div>
                <div className="compare-row"><span className="ci">💸</span><span>工具调用失败 → 无限重试，烧光 token</span></div>
                <div className="compare-row"><span className="ci">🌪️</span><span>上下文被污染 → 越走越偏，无从发现</span></div>
                <div className="compare-row"><span className="ci">🤷</span><span>新版上线 → 不知道比旧版好还是差</span></div>
                <div className="compare-row"><span className="ci">🔥</span><span>出问题 → 翻日志翻半天，不知道哪步错的</span></div>
                <div className="compare-row"><span className="ci">⚠️</span><span>误操作 → 直接生效，没有兜底</span></div>
              </div>
            </Fragment>
            <Fragment animation="fade-up" as="div">
              <div className="compare-col good">
                <div className="compare-col-title">✓ 有 Harness</div>
                <div className="compare-row"><span className="ci">🛡️</span><span>失败 → 触发回退机制，限制重试上限</span></div>
                <div className="compare-row"><span className="ci">📡</span><span>反馈信号实时告警，可见即可控</span></div>
                <div className="compare-row"><span className="ci">📐</span><span>验收基线 → 一跑就知道好了还是退化了</span></div>
                <div className="compare-row"><span className="ci">🔍</span><span>完整 Trace → 每步可追溯、可回放</span></div>
                <div className="compare-row"><span className="ci">✋</span><span>高风险操作 → 人工确认节点拦一刀</span></div>
              </div>
            </Fragment>
          </div>
          <Fragment animation="fade-up" as="div">
            <div className="highlight-box" style={{ marginTop: '20px', textAlign: 'center' }}>
              工程洞察：<strong>Harness 质量的影响，比模型质量更大</strong>。大多数「模型不稳定」的问题，根源在 Harness 缺失。
            </div>
          </Fragment>
        </Slide>

        {/* SLIDE 14: Claude Code / OpenClaw */}
        <Slide
          notes="举两个真实例子。Claude Code 之所以能做到稳定写代码、跑长任务，不是因为它用的模型比别人强。它用的就是 Anthropic 自己的 Claude，跟 Anthropic 网页版是同一个模型。区别在于一整套 Harness：任务边界、Worktree 隔离、钩子、人工确认、完整 Trace。OpenClaw 也是类似思路。这两个例子说明：成熟的 Agent 工具的核心壁垒，不在模型，在 Harness。"
        >
          <h2>看个真实例子 — Claude Code / OpenClaw</h2>
          <Fragment animation="fade-up" as="div">
            <p style={{ fontSize: '0.7em', color: 'rgba(255,255,255,0.75)', marginBottom: '12px' }}>
              这两个工具能稳定干长任务，不是因为模型更强 — 它们用的就是公开市面上的同款模型。<strong style={{ color: '#38ef7d' }}>差距在 Harness。</strong>
            </p>
          </Fragment>
          <div className="harness-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            <Fragment animation="fade-up" as="div">
              <div className="harness-card">
                <div className="harness-icon">🎯</div>
                <div className="harness-title">任务边界</div>
                <div className="harness-desc">明确每个任务的输入输出、能改什么、不能改什么</div>
              </div>
            </Fragment>
            <Fragment animation="fade-up" as="div">
              <div className="harness-card">
                <div className="harness-icon">🌳</div>
                <div className="harness-title">Worktree 隔离</div>
                <div className="harness-desc">每个任务独立环境，不污染主分支，可丢弃</div>
              </div>
            </Fragment>
            <Fragment animation="fade-up" as="div">
              <div className="harness-card">
                <div className="harness-icon">🪝</div>
                <div className="harness-title">钩子机制</div>
                <div className="harness-desc">关键节点插入校验、格式化、安全检查</div>
              </div>
            </Fragment>
            <Fragment animation="fade-up" as="div">
              <div className="harness-card">
                <div className="harness-icon">✋</div>
                <div className="harness-title">人工确认</div>
                <div className="harness-desc">高风险操作（删文件、推代码）暂停等待审批</div>
              </div>
            </Fragment>
            <Fragment animation="fade-up" as="div">
              <div className="harness-card">
                <div className="harness-icon">📜</div>
                <div className="harness-title">完整 Trace</div>
                <div className="harness-desc">每个工具调用、每个决策都记录，可追溯、可回放</div>
              </div>
            </Fragment>
            <Fragment animation="fade-up" as="div">
              <div className="harness-card">
                <div className="harness-icon">📐</div>
                <div className="harness-title">评测基线</div>
                <div className="harness-desc">改任何一处，先跑评测集 — 知道是变好了还是退化了</div>
              </div>
            </Fragment>
          </div>
        </Slide>

        {/* SLIDE 15: 换模型为什么没用 */}
        <Slide
          notes="这是反直觉的一张：很多人遇到 Agent 不稳定，第一反应是『换个更强的模型试试』。但 Anthropic 自己的研究显示，光是把工具描述写清楚（加正反例、明确边界），同一个模型的工具调用准确率能从 53% 涨到 85%。换模型解决不了这些根本问题。给一个优秀员工一本错误的操作手册，换个更聪明的员工只会让结果更糟。"
        >
          <h2>「换个更强的模型」<span style={{ color: 'var(--ai-red)' }}>为什么没用</span></h2>
          <Fragment animation="fade-up" as="div">
            <p style={{ fontSize: '0.7em', color: 'rgba(255,255,255,0.75)', marginTop: '8px' }}>
              同一个模型，只是把<strong>工具描述</strong>写得更清楚（加正反例、明确边界），调用准确率：
            </p>
          </Fragment>
          <Fragment animation="fade-up" as="div">
            <div className="big-stat-row" style={{ marginTop: '14px' }}>
              <div className="big-stat">
                <div className="big-stat-num" style={{ background: 'linear-gradient(135deg, #FF6B6B, #FFD93D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>53%</div>
                <div className="big-stat-label">工具描述模糊</div>
              </div>
              <div style={{ alignSelf: 'center', fontSize: '2em', color: 'var(--ai-dim)' }}>→</div>
              <div className="big-stat">
                <div className="big-stat-num">85%</div>
                <div className="big-stat-label">工具描述清晰 + 反例</div>
              </div>
            </div>
          </Fragment>
          <Fragment animation="fade-up" as="div">
            <p style={{ fontSize: '0.65em', color: 'rgba(255,255,255,0.7)', marginTop: '20px' }}>
              绝大多数 Agent 失控，根源是这些 — 跟模型强不强无关：
            </p>
          </Fragment>
          <div className="card-grid-3" style={{ marginTop: '12px' }}>
            <Fragment animation="fade-up" as="div">
              <div className="card">
                <div className="icon">📝</div>
                <h4>工具描述不准</h4>
                <p>LLM 不知道工具该用在什么场景，乱调或不调</p>
              </div>
            </Fragment>
            <Fragment animation="fade-up" as="div">
              <div className="card">
                <div className="icon">🌊</div>
                <h4>上下文设计不当</h4>
                <p>信息太多 = 信息等于没有，模型抓不到重点</p>
              </div>
            </Fragment>
            <Fragment animation="fade-up" as="div">
              <div className="card">
                <div className="icon">🎯</div>
                <h4>没有验收基线</h4>
                <p>不知道好不好 → 改了就乱改，改了也没人知道</p>
              </div>
            </Fragment>
          </div>
          <Fragment animation="fade-up" as="div">
            <div className="ai-callout warn" style={{ marginTop: '16px' }}>
              类比：给员工一本<strong>错误的操作手册</strong> — 换个更聪明的员工，结果只会更糟。
            </div>
          </Fragment>
        </Slide>

        {/* SLIDE 16: 核心结论 */}
        <Slide
          className="section-title"
          backgroundGradient="radial-gradient(ellipse at 50% 40%, rgba(17,153,142,0.15) 0%, transparent 60%)"
          notes="这一张是 Part 2 的总结，三句话。能力上限看工具集和数据访问权限 — Agent 能做多少事，取决于你给了它多少能力。稳定性看 Harness — 不是模型。风险看执行边界 — 边界不清晰，再厉害的 Agent 也是定时炸弹。"
        >
          <h2 style={{ marginBottom: '40px' }}>核心结论</h2>
          <div className="final-points">
            <Fragment animation="fade-up" as="div">
              <div className="final-point">
                <span className="final-point-icon">⚡</span>
                <span>Agent 的<strong style={{ color: '#38ef7d' }}>能力上限</strong> = 工具集 + 数据访问权限</span>
              </div>
            </Fragment>
            <Fragment animation="fade-up" as="div">
              <div className="final-point">
                <span className="final-point-icon">🛡️</span>
                <span>Agent 的<strong style={{ color: '#38ef7d' }}>稳定性</strong> = Harness 质量 — <span style={{ color: 'var(--ai-red)' }}>不是模型质量</span></span>
              </div>
            </Fragment>
            <Fragment animation="fade-up" as="div">
              <div className="final-point">
                <span className="final-point-icon">🚧</span>
                <span>Agent 的<strong style={{ color: '#38ef7d' }}>风险</strong> = 执行边界是否清晰</span>
              </div>
            </Fragment>
          </div>
        </Slide>

        {/* ============================================================ */}
        {/* PART 3 · 现在我们能做什么                                       */}
        {/* ============================================================ */}

        {/* SLIDE 17: 我们的场景在哪 */}
        <Slide
          notes="把视角拉回到我们公司的业务。游戏客服、内容审核、内部效率工具是优先级最高的 — 高频、规则相对清晰、容错大。智能 NPC 价值高但实施难度也高，可以放到中长期。重点：不是所有场景都适合 Agent，先看哪个路径最短、容错最大。"
        >
          <h2>我们的场景在哪</h2>
          <div className="biz-grid">
            <Fragment animation="fade-up" as="div">
              <div className="biz-row prio-3">
                <div className="biz-prio">⭐⭐⭐</div>
                <div className="biz-icon-cell">🎮</div>
                <div className="biz-text">
                  <div className="biz-name">游戏客服</div>
                  <div className="biz-desc">申诉处理 / 道具补偿 / BUG 核实 — 标准流程多，自动化收益大</div>
                </div>
              </div>
            </Fragment>
            <Fragment animation="fade-up" as="div">
              <div className="biz-row prio-3">
                <div className="biz-prio">⭐⭐⭐</div>
                <div className="biz-icon-cell">🛡️</div>
                <div className="biz-text">
                  <div className="biz-name">内容审核</div>
                  <div className="biz-desc">违规识别 + 分级处置，人工只处理灰色案例</div>
                </div>
              </div>
            </Fragment>
            <Fragment animation="fade-up" as="div">
              <div className="biz-row prio-3">
                <div className="biz-prio">⭐⭐⭐</div>
                <div className="biz-icon-cell">💻</div>
                <div className="biz-text">
                  <div className="biz-name">内部效率</div>
                  <div className="biz-desc">代码辅助 / 文档生成 / 数据查询 — 低风险，工程团队已在用</div>
                </div>
              </div>
            </Fragment>
            <Fragment animation="fade-up" as="div">
              <div className="biz-row prio-2">
                <div className="biz-prio">⭐⭐</div>
                <div className="biz-icon-cell">📊</div>
                <div className="biz-text">
                  <div className="biz-name">数据分析</div>
                  <div className="biz-desc">留存预警 / 异常监控 / 自动日报</div>
                </div>
              </div>
            </Fragment>
            <Fragment animation="fade-up" as="div">
              <div className="biz-row prio-2">
                <div className="biz-prio">⭐⭐</div>
                <div className="biz-icon-cell">📣</div>
                <div className="biz-text">
                  <div className="biz-name">精准推送</div>
                  <div className="biz-desc">基于行为的个性化推送，比群发更准</div>
                </div>
              </div>
            </Fragment>
            <Fragment animation="fade-up" as="div">
              <div className="biz-row prio-1">
                <div className="biz-prio">⭐</div>
                <div className="biz-icon-cell">🎭</div>
                <div className="biz-text">
                  <div className="biz-name">智能 NPC</div>
                  <div className="biz-desc">价值高但实施难度也高 — 中长期目标</div>
                </div>
              </div>
            </Fragment>
          </div>
          <Fragment animation="fade-up" as="div">
            <div className="ai-callout" style={{ marginTop: '16px' }}>
              <strong>关键：</strong>不是所有场景都适合 Agent — 先看哪个路径最短、容错最大、ROI 成立。
            </div>
          </Fragment>
        </Slide>

        {/* SLIDE 18: 4 个问题 */}
        <Slide
          notes="判断一个场景到底适不适合 Agent，问自己这四个问题。Q1：路径能穷举吗？能 → 用 Workflow 更便宜更稳。Q2：犯错代价多高？高 → 必须有人工确认节点。Q3：需要的工具能建吗？数据访问权限是能力上限。Q4：量够大吗？小量场景 ROI 不成立。这四个问题就是一个简单的决策框架，比『先看模型选哪个』更有用。"
        >
          <h2>判断一个场景 — 问 4 个问题</h2>
          <div className="four-q">
            <Fragment animation="fade-up" as="div">
              <div className="q-card">
                <div className="q-num">Q1</div>
                <div className="q-text">路径是否可穷举？</div>
                <div className="q-hint">能 → 用 <strong>Workflow</strong> 更便宜更稳。Agent 留给真的需要灵活应变的场景。</div>
              </div>
            </Fragment>
            <Fragment animation="fade-up" as="div">
              <div className="q-card">
                <div className="q-num">Q2</div>
                <div className="q-text">犯错代价多高？</div>
                <div className="q-hint">高 → 必须有 <strong>人工确认节点</strong>。封号、退款、发钱这种不能让 Agent 直接生效。</div>
              </div>
            </Fragment>
            <Fragment animation="fade-up" as="div">
              <div className="q-card">
                <div className="q-num">Q3</div>
                <div className="q-text">需要的工具是否可建？</div>
                <div className="q-hint">数据访问权限 = Agent 的<strong>能力上限</strong>。拿不到数据，模型再强也没用。</div>
              </div>
            </Fragment>
            <Fragment animation="fade-up" as="div">
              <div className="q-card">
                <div className="q-num">Q4</div>
                <div className="q-text">量是否够？</div>
                <div className="q-hint">量小 → ROI 不成立。Agent 适合<strong>高频重复</strong>任务，不适合一次性需求。</div>
              </div>
            </Fragment>
          </div>
        </Slide>

        {/* SLIDE 19: 完整例子 — 客服 Agent */}
        <Slide
          notes="把前面所有概念串起来：一个完整的游戏客服 Agent 怎么处理一次申诉。每一步都标注：用了哪个工具、Harness 的哪个组件在保护它。这一张让听众看到一个完整可落地的样子，不再是抽象概念。"
        >
          <h2>完整例子 · 游戏客服 Agent</h2>
          <div className="cs-flow">
            <div className="cs-step">
              <div className="cs-step-icon">👤</div>
              <div>
                <div className="cs-step-title">玩家发申诉</div>
                <div className="cs-step-detail">「我昨晚 11 点被封号了，我没有违规，求解封！」</div>
              </div>
            </div>

            <Fragment animation="fade-up" as="div">
              <div className="cs-connector">
                <div className="cs-conn-line" />
                <div className="cs-conn-tag">🔧 工具：query_account · 🛡️ Harness：Trace 记录</div>
              </div>
              <div className="cs-step">
                <div className="cs-step-icon">🔍</div>
                <div>
                  <div className="cs-step-title">Agent 查记录</div>
                  <div className="cs-step-detail">调用账号系统 → 行为日志 / 封号时间 / 触发规则</div>
                </div>
              </div>
            </Fragment>

            <Fragment animation="fade-up" as="div">
              <div className="cs-connector">
                <div className="cs-conn-line" />
                <div className="cs-conn-tag">🔧 工具：rule_check · 🛡️ Harness：评测基线</div>
              </div>
              <div className="cs-step">
                <div className="cs-step-icon">🧠</div>
                <div>
                  <div className="cs-step-title">Agent 判断</div>
                  <div className="cs-step-detail">行为数据 vs 封号规则 → 判定为系统误封</div>
                </div>
              </div>
            </Fragment>

            <Fragment animation="fade-up" as="div">
              <div className="cs-connector">
                <div className="cs-conn-line" />
                <div className="cs-conn-tag">🔧 工具：unban + grant_item · 🛡️ Harness：人工确认（高风险）</div>
              </div>
              <div className="cs-step">
                <div className="cs-step-icon">⚡</div>
                <div>
                  <div className="cs-step-title">Agent 执行</div>
                  <div className="cs-step-detail">解封 API + 200 金币补偿（金额超过阈值会触发人工确认）</div>
                </div>
              </div>
            </Fragment>

            <Fragment animation="fade-up" as="div">
              <div className="cs-connector">
                <div className="cs-conn-line" />
                <div className="cs-conn-tag">🛡️ Harness：完整 Trace 写入工单</div>
              </div>
              <div className="cs-step" style={{ borderColor: 'rgba(56,239,125,0.25)' }}>
                <div className="cs-step-icon">💬</div>
                <div>
                  <div className="cs-step-title">Agent 回复</div>
                  <div className="cs-step-detail">「经核实系统误封已解除，已为您补偿 200 金币。」 — 全程几秒，无需人工介入</div>
                </div>
              </div>
            </Fragment>
          </div>
        </Slide>

        {/* SLIDE 20: 0→1 正确方式 */}
        <Slide
          notes="最常见的失败模式：找最复杂的场景，试图一步到位，上线即崩。正确方式：找一个高频、规则清晰、容错大的小场景，第一版一定是烂的，建测试基线持续迭代。这是工程纪律 — 不是 Agent 特有的问题，但在 Agent 这里表现得特别明显。"
        >
          <h2>从 0 到 1 — 别上来就梭哈</h2>
          <div className="path-compare">
            <Fragment animation="fade-up" as="div">
              <div className="path-col wrong">
                <div className="path-title">✗ 错误路径</div>
                <div className="path-step"><span>1️⃣</span> 找最复杂、最有挑战的场景</div>
                <div className="path-step"><span>2️⃣</span> 追求一步到位，端到端打通</div>
                <div className="path-step"><span>3️⃣</span> 上线即崩 — 哪一步错的不知道</div>
                <div className="path-step"><span>4️⃣</span> 团队失去信心，项目搁置</div>
              </div>
            </Fragment>
            <Fragment animation="fade-up" as="div">
              <div className="path-col right">
                <div className="path-title">✓ 正确路径</div>
                <div className="path-step"><span>1️⃣</span> 找<strong>高频 + 规则清晰 + 容错大</strong>的小场景</div>
                <div className="path-step"><span>2️⃣</span> 快速出第一版（一定是烂的，正常）</div>
                <div className="path-step"><span>3️⃣</span> 建评测基线，知道每次迭代是好是差</div>
                <div className="path-step"><span>4️⃣</span> 持续迭代，<strong>不是重写</strong></div>
              </div>
            </Fragment>
          </div>
          <Fragment animation="fade-up" as="div">
            <div className="highlight-box" style={{ marginTop: '20px', textAlign: 'center' }}>
              第一版一定是烂的 — <strong>这是正常成本，不是失败</strong>。
            </div>
          </Fragment>
        </Slide>

        {/* SLIDE 21: 各岗位行动 */}
        <Slide
          notes="把概念转化为具体行动。工程师：现在就用起 Cursor / Copilot，建立直觉；学着写 Prompt 和工具描述。产品 / 运营：识别你负责流程里『高频 + 规则清晰』的环节，那就是第一个候选。管理层：支持一个小试点，允许第一版失败 — 这是必要的学习成本，不是浪费。三个角色都有事可做，今天就能开始。"
        >
          <h2>各岗位 — 现在就能做的事</h2>
          <div className="role-grid">
            <Fragment animation="fade-up" as="div">
              <div className="role-card">
                <div className="role-icon">💻</div>
                <div className="role-title">工程师</div>
                <ul className="role-items">
                  <li>用 Cursor / Copilot / Claude Code，感受 Agent 实际能力</li>
                  <li>积累 Prompt 和工具描述设计经验</li>
                  <li>在内部工具里小范围实验</li>
                  <li>关注 Harness 设计，不是只关注模型</li>
                </ul>
              </div>
            </Fragment>
            <Fragment animation="fade-up" as="div">
              <div className="role-card">
                <div className="role-icon">📋</div>
                <div className="role-title">产品 / 运营</div>
                <ul className="role-items">
                  <li>梳理你负责的流程，找「高频 + 规则清晰」的环节</li>
                  <li>用 4 问法判断哪个场景适合 Agent</li>
                  <li>找工程团队聊一个小试点</li>
                  <li>设计验收基线 — 怎样算做对了</li>
                </ul>
              </div>
            </Fragment>
            <Fragment animation="fade-up" as="div">
              <div className="role-card">
                <div className="role-icon">🎯</div>
                <div className="role-title">管理层</div>
                <ul className="role-items">
                  <li>支持一个小场景试点</li>
                  <li>允许第一版失败 — 这是必要成本</li>
                  <li>关注「能力上限 + 稳定性 + 风险」三件事</li>
                  <li>不要被「换更强模型」的话术带跑</li>
                </ul>
              </div>
            </Fragment>
          </div>
        </Slide>

        {/* ============================================================ */}
        {/* 结尾                                                            */}
        {/* ============================================================ */}

        {/* SLIDE 22: 今天讲了什么 */}
        <Slide
          notes="回顾整条主线：从听众自己用过的 Agent 出发，归类到 5 种形态，沿着进化链一路走到 Harness，讲清楚 Harness 比模型重要，最后落到我们自己的业务上能做什么。这条主线大家都走完了。"
        >
          <h2>今天讲了什么</h2>
          <Fragment animation="fade-up" as="div">
            <EvolutionChain litUntil={5} />
          </Fragment>
          <div className="final-points" style={{ marginTop: '24px' }}>
            <Fragment animation="fade-up" as="div">
              <div className="final-point">
                <span className="final-point-icon">①</span>
                <span>从 <strong style={{ color: '#38ef7d' }}>5 种 Agent 形态</strong> 看到工程成熟度的演进</span>
              </div>
            </Fragment>
            <Fragment animation="fade-up" as="div">
              <div className="final-point">
                <span className="final-point-icon">②</span>
                <span>光有 Loop 不够，<strong style={{ color: '#38ef7d' }}>Harness 才是稳定的关键</strong></span>
              </div>
            </Fragment>
            <Fragment animation="fade-up" as="div">
              <div className="final-point">
                <span className="final-point-icon">③</span>
                <span>我们的机会 — 客服 / 审核 / 内部效率，<strong style={{ color: '#38ef7d' }}>从小场景开始</strong></span>
              </div>
            </Fragment>
          </div>
        </Slide>

        {/* SLIDE 23: 想深入？ */}
        <Slide
          transition="zoom"
          className="final-slide"
          backgroundGradient="radial-gradient(ellipse at 50% 40%, rgba(17,153,142,0.15) 0%, transparent 60%)"
          notes="今天是入门版。如果想深入到工程细节 — Harness 四大组成、上下文工程、工具设计 ACI 原则、记忆系统、多 Agent 编排、评测体系 — 可以看技术深讲版（agent-slides）。谢谢大家。"
        >
          <div className="ai-big-emoji">🚀</div>
          <h2>想深入？</h2>
          <p style={{ fontSize: '0.85em', color: 'rgba(255,255,255,0.75)', maxWidth: '900px', textAlign: 'center', marginTop: '12px' }}>
            技术深讲版 <code>agent-slides</code> 涵盖 12 个工程主题
          </p>
          <Fragment animation="fade-up" as="div">
            <div className="ai-tag-row" style={{ flexWrap: 'wrap', justifyContent: 'center', maxWidth: '1100px', marginTop: '20px' }}>
              <span className="ai-tag">Agent Loop 详解</span>
              <span className="ai-tag">Harness 四大组成</span>
              <span className="ai-tag">上下文工程</span>
              <span className="ai-tag">Context Rot</span>
              <span className="ai-tag">工具设计 ACI</span>
              <span className="ai-tag">记忆系统</span>
              <span className="ai-tag">多 Agent 编排</span>
              <span className="ai-tag">评测体系</span>
              <span className="ai-tag">Prompt 工程</span>
              <span className="ai-tag">RAG 设计</span>
              <span className="ai-tag">成本优化</span>
              <span className="ai-tag">安全治理</span>
            </div>
          </Fragment>
          <Fragment animation="fade-up" as="div">
            <p style={{ fontSize: '1em', color: '#38ef7d', marginTop: '40px', fontWeight: 700 }}>
              谢谢
            </p>
          </Fragment>
        </Slide>
      </Deck>
    </>
  );
}
