import { useReveal } from '@revealjs/react';
import { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export function SlideControls() {
  const reveal = useReveal();
  const fullscreenBtnRef = useRef<HTMLButtonElement>(null);

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
      <button
        ref={fullscreenBtnRef}
        className="slide-control-btn"
        title="网页全屏"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M21 8V5a2 2 0 0 0-2-2h-3" /><path d="M3 16v3a2 2 0 0 0 2 2h3" /><path d="M16 21h3a2 2 0 0 0 2-2v-3" />
        </svg>
      </button>
    </div>,
    document.body
  );
}
