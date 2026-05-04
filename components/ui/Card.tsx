import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
  return <div className={`glass-card rounded-3xl p-6 shadow-glass ${className}`}>{children}</div>;
}
