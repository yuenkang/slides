import { useState, useCallback, useEffect } from 'react';
import { HomePage } from './home/HomePage';
import { AgentPresentation } from './presentations/agent/AgentPresentation';
import { PlaygroundPresentation } from './presentations/playground/PlaygroundPresentation';

type Page = 'home' | 'agent-slides' | 'playground';

function getInitialPage(): Page {
  const params = new URLSearchParams(window.location.search);
  const deck = params.get('deck');
  if (deck === 'agent-slides' || deck === 'playground') return deck;
  return 'home';
}

export function App() {
  const [page, setPage] = useState<Page>(getInitialPage);

  const navigateTo = useCallback((newPage: Page) => {
    const url = new URL(window.location.href);
    if (newPage === 'home') {
      url.searchParams.delete('deck');
      url.hash = '';
    } else {
      url.searchParams.set('deck', newPage);
    }
    window.history.pushState(null, '', url.toString());
    setPage(newPage);
  }, []);

  useEffect(() => {
    const handlePopState = () => setPage(getInitialPage());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (page === 'agent-slides') {
    return <AgentPresentation onBack={() => navigateTo('home')} />;
  }
  if (page === 'playground') {
    return <PlaygroundPresentation onBack={() => navigateTo('home')} />;
  }

  return <HomePage onSelect={(id: string) => navigateTo(id as Page)} />;
}
