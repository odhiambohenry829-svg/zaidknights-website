type BarColor = 'gold' | 'green' | 'blue' | 'red';

interface ProgressBarProps {
  value:        number;
  max:          number;
  label?:       string;
  showPercent?: boolean;
  showValues?:  boolean;
  color?:       BarColor;
  className?:   string;
}

const COLOR_MAP: Record<BarColor, string> = {
  gold:  'bg-yellow-500',
  green: 'bg-green-500',
  blue:  'bg-blue-500',
  red:   'bg-red-500',
};

export default function ProgressBar({
  value, max, label, showPercent = true, showValues = false,
  color = 'gold', className = '',
}: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  return (
    <div className={className}>
      {(label || showPercent || showValues) && (
        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
          {label && <span>{label}</span>}
          {showValues && !showPercent && (
            <span>
              KES {value.toLocaleString()} / {max.toLocaleString()}
            </span>
          )}
          {showPercent && <span className="font-medium text-gray-300">{pct}%</span>}
        </div>
      )}
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full ${COLOR_MAP[color]} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
