import { useState } from 'react';
import { HomePage } from './home/HomePage';
import { AgentPresentation } from './presentations/agent/AgentPresentation';
import { PlaygroundPresentation } from './presentations/playground/PlaygroundPresentation';

type Page = 'home' | 'agent-slides' | 'playground';

export function App() {
  const [page, setPage] = useState<Page>('home');

  if (page === 'agent-slides') {
    return <AgentPresentation onBack={() => setPage('home')} />;
  }
  if (page === 'playground') {
    return <PlaygroundPresentation onBack={() => setPage('home')} />;
  }

  return <HomePage onSelect={(id: string) => setPage(id as Page)} />;
}
