import { useMemo } from 'react';

const COLORS = ['#6C63FF', '#00D2FF', '#FF6B6B', '#FFD93D'];

interface ParticleData {
  id: number;
  left: string;
  duration: string;
  delay: string;
  size: string;
  color: string;
}

interface ParticlesProps {
  count?: number;
}

export function Particles({ count = 30 }: ParticlesProps) {
  const particles = useMemo<ParticleData[]>(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      duration: `${8 + Math.random() * 12}s`,
      delay: `${Math.random() * 10}s`,
      size: `${2 + Math.random() * 3}px`,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    })), [count]
  );

  return (
    <div className="particles">
      {particles.map(p => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            animationDuration: p.duration,
            animationDelay: p.delay,
            width: p.size,
            height: p.size,
            background: p.color,
          }}
        />
      ))}
    </div>
  );
}
