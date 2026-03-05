import type { ReactNode } from 'react';

export default function GradientBackground({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gradient-top to-gradient-bottom">
      {children}
    </div>
  );
}
