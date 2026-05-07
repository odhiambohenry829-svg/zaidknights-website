import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gold?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className = '', hover = false, gold = false, onClick }: CardProps) {
  const base = 'rounded-xl border transition-all duration-300';
  const style = gold
    ? 'bg-yellow-500/10 border-yellow-500/20 backdrop-blur-md'
    : hover
    ? 'bg-white/5 border-white/10 backdrop-blur-md hover:bg-white/10 hover:border-yellow-500/30 hover:shadow-lg hover:shadow-yellow-500/10 cursor-pointer'
    : 'bg-white/5 border-white/10 backdrop-blur-md';

  return (
    <div className={`${base} ${style} p-6 ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}