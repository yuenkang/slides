import { useReveal } from '@revealjs/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DocsViewer, type DocFile } from './DocsViewer';

interface SlideControlsProps {
  /**
   * 当前演示的 docs 文件，传入 `import.meta.glob('./docs/*.md', { query: '?raw', import: 'default', eager: true })` 即可。
   * 用相对路径让 Vite 在构建时把目录绑定到当前演示文件，重命名目录路径自动跟随。
   */
  docs?: Record<string, string>;
}

export function SlideControls({ docs: docsRaw }: SlideControlsProps = {}) {
  const reveal = useReveal();
  const fullscreenBtnRef = useRef<HTMLButtonElement>(null);
  const [docsOpen, setDocsOpen] = useState(false);

  const docs = useMemo<DocFile[]>(() => {
    if (!docsRaw) return [];
    return Object.entries(docsRaw)
      .map(([p, content]) => ({ name: p.split('/').pop()!, content }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [docsRaw]);

  const toggleOverview = useCallback(() => {
    reveal?.toggleOverview();
  }, [reveal]);

  const openSpeakerNotes = useCallback(() => {
    if (reveal) {
      const notesPlugin = reveal.getPlugin('notes') as { open?: () => void } | undefined;
      if (notesPlugin?.open) {
        notesPlugin.open();
      }
    }
  }, [reveal]);

  const exportPdf = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('print-pdf', '1');
    url.searchParams.set('autoprint', '1');
    url.hash = '';
    window.open(url.toString(), '_blank');
  }, []);

  // 使用原生事件监听，确保 Chrome 识别为用户手势
  useEffect(() => {
    const btn = fullscreenBtnRef.current;
    if (!btn) return;

    const handleFullscreen = () => {
      const doc = document as Document & { webkitFullscreenElement?: Element; webkitExitFullscreen?: () => void };
      const el = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => void };

      if (!doc.fullscreenElement && !doc.webkitFullscreenElement) {
        if (el.requestFullscreen) {
          el.requestFullscreen();
        } else if (el.webkitRequestFullscreen) {
          el.webkitRequestFullscreen();
        }
      } else {
        if (doc.exitFullscreen) {
          doc.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          doc.webkitExitFullscreen();
        }
      }
    };

    btn.addEventListener('click', handleFullscreen);
    return () => btn.removeEventListener('click', handleFullscreen);
  }, []);

  return createPortal(
    <>
    <div className="slide-controls">
      <button
        className="slide-control-btn"
        onClick={toggleOverview}
        title="幻灯片总览 (Esc)"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
        </svg>
      </button>
      <button
        className="slide-control-btn"
        onClick={openSpeakerNotes}
        title="演讲者笔记 (S)"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" />
        </svg>
      </button>
      {docs.length > 0 && (
        <button
          className="slide-control-btn"
          onClick={() => setDocsOpen(true)}
          title={`查看文档 (${docs.length})`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        </button>
      )}
      <button
        className="slide-control-btn"
        onClick={exportPdf}
        title="导出 PDF（在新窗口按 Cmd/Ctrl+P 保存）"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><path d="M12 18v-6" /><path d="M9 15l3 3 3-3" />
        </svg>
      </button>
      <button
        ref={fullscreenBtnRef}
        className="slide-control-btn"
        title="网页全屏"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M21 8V5a2 2 0 0 0-2-2h-3" /><path d="M3 16v3a2 2 0 0 0 2 2h3" /><path d="M16 21h3a2 2 0 0 0 2-2v-3" />
        </svg>
      </button>
    </div>
    {docsOpen && docs.length > 0 && (
      <DocsViewer docs={docs} onClose={() => setDocsOpen(false)} />
    )}
    </>,
    document.body
  );
}
