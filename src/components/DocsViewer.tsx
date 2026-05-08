import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/monokai.css';

export interface DocFile {
  name: string;
  content: string;
}

interface DocsViewerProps {
  docs: DocFile[];
  onClose: () => void;
}

export function DocsViewer({ docs, onClose }: DocsViewerProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', handleKey, true);
    return () => document.removeEventListener('keydown', handleKey, true);
  }, [onClose]);

  const active = docs[activeIndex];

  return createPortal(
    <div
      className="docs-viewer-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="docs-viewer-modal">
        <aside className="docs-viewer-list">
          <div className="docs-viewer-list-title">文档</div>
          {docs.map((doc, i) => (
            <button
              key={doc.name}
              className={`docs-viewer-list-item ${i === activeIndex ? 'is-active' : ''}`}
              onClick={() => setActiveIndex(i)}
              title={doc.name}
            >
              {doc.name}
            </button>
          ))}
        </aside>
        <div className="docs-viewer-main">
          <div className="docs-viewer-header">
            <div className="docs-viewer-header-name">{active?.name}</div>
            <button
              className="docs-viewer-close"
              onClick={onClose}
              title="关闭 (Esc)"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="docs-viewer-content">
            {active && (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
              >
                {active.content}
              </ReactMarkdown>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
