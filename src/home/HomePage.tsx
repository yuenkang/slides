import { Particles } from '../components/Particles';

interface Project {
  id: string;
  icon: string;
  title: string;
  description: string;
  tags: string[];
  gradient: string;
}

const projects: Project[] = [
  {
    id: 'agent-slides',
    icon: '🤖',
    title: '你不知道的 Agent',
    description: '原理、架构与工程实践 — 基于 Tw93 文章的技术分享，涵盖 Agent Loop、Harness、上下文工程、工具设计等 12 个主题。',
    tags: ['AI Agent', 'Architecture', 'Engineering'],
    gradient: 'linear-gradient(135deg, #6C63FF, #00D2FF)',
  },
  {
    id: 'playground',
    icon: '🎨',
    title: 'Slide Playground',
    description: '幻灯片视觉效果与布局灵感集 — 渐变文字、玻璃拟态卡片、数据仪表盘、时间线、对比布局、辐射图等 10 种演示模板。',
    tags: ['Design', 'Layout', 'Inspiration'],
    gradient: 'linear-gradient(135deg, #FF6B6B, #FFD93D)',
  },
];

interface HomePageProps {
  onSelect: (projectId: string) => void;
}

export function HomePage({ onSelect }: HomePageProps) {
  return (
    <div className="home-page">
      <Particles />
      <div className="home-content">
        <header className="home-header">
          <h1 className="home-title">Slides</h1>
          <p className="home-subtitle">技术分享与演示集合</p>
        </header>

        <div className="project-grid">
          {projects.map((project) => {
            const isAvailable = !project.id.startsWith('coming-soon');
            return (
              <div
                key={project.id}
                className={`project-card ${!isAvailable ? 'project-card--disabled' : ''}`}
                onClick={() => isAvailable && onSelect(project.id)}
                role={isAvailable ? 'button' : undefined}
                tabIndex={isAvailable ? 0 : undefined}
                onKeyDown={(e) => {
                  if (isAvailable && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onSelect(project.id);
                  }
                }}
              >
                <div className="project-card__accent" style={{ background: project.gradient }} />
                <div className="project-card__icon">{project.icon}</div>
                <h3 className="project-card__title">{project.title}</h3>
                <p className="project-card__desc">{project.description}</p>
                <div className="project-card__tags">
                  {project.tags.map((tag) => (
                    <span key={tag} className="project-card__tag">{tag}</span>
                  ))}
                </div>
                {isAvailable && (
                  <div className="project-card__arrow">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
