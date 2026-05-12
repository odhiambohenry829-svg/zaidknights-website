import Link from 'next/link';

interface EmptyStateProps {
  icon?:      string;
  title:      string;
  message:    string;
  ctaLabel?:  string;
  ctaHref?:   string;
  className?: string;
}

export default function EmptyState({
  icon = '♟', title, message, ctaLabel, ctaHref, className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-20 text-center px-4 ${className}`}>
      <div className="text-7xl opacity-10 mb-6 select-none">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 max-w-sm text-sm leading-relaxed mb-6">{message}</p>
      {ctaLabel && ctaHref && (
        <Link href={ctaHref} className="btn-primary">
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
