interface SkeletonCardProps {
  rows?:   number;
  height?: string;
  className?: string;
}

export default function SkeletonCard({ rows = 3, height = 'h-4', className = '' }: SkeletonCardProps) {
  return (
    <div className={`glass p-6 rounded-xl space-y-4 ${className}`}>
      <div className="skeleton h-5 w-2/3 rounded" />
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={`skeleton ${height} rounded`}
          style={{ width: `${65 + (i % 4) * 9}%` }}
        />
      ))}
    </div>
  );
}
