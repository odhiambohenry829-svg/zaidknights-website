import type { ReactNode } from 'react';

export type BadgeVariant = 'gold' | 'green' | 'red' | 'gray' | 'blue' | 'purple' | 'orange';

interface BadgeProps {
  variant?:   BadgeVariant;
  children:   ReactNode;
  className?: string;
}

const STYLES: Record<BadgeVariant, string> = {
  gold:   'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  green:  'bg-green-500/20 text-green-400 border-green-500/30',
  red:    'bg-red-500/20 text-red-400 border-red-500/30',
  gray:   'bg-gray-500/20 text-gray-400 border-gray-500/30',
  blue:   'bg-blue-500/20 text-blue-400 border-blue-500/30',
  purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

export default function Badge({ variant = 'gray', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs
        font-medium border ${STYLES[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
