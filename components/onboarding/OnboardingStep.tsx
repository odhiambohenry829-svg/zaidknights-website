interface OnboardingStepProps {
  stepNumber: number;
  title:      string;
  completed:  boolean;
  active:     boolean;
  children:   React.ReactNode;
  onSkip?:    () => void;
}

export default function OnboardingStep({
  stepNumber, title, completed, active, children, onSkip,
}: OnboardingStepProps) {
  return (
    <div
      className={`rounded-xl border transition-all duration-300 ${
        active
          ? 'border-yellow-500/40 bg-yellow-500/5'
          : completed
            ? 'border-green-500/30 bg-green-500/5'
            : 'border-white/10 bg-white/3 opacity-60'
      }`}
    >
      {/* Step Header */}
      <div className="flex items-center gap-4 p-5">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
            completed
              ? 'bg-green-500 text-white'
              : active
                ? 'bg-yellow-500 text-black'
                : 'bg-white/10 text-gray-500'
          }`}
        >
          {completed ? '✓' : stepNumber}
        </div>
        <div className="flex-1">
          <p className={`font-semibold text-sm ${active ? 'text-white' : completed ? 'text-green-400' : 'text-gray-500'}`}>
            {title}
          </p>
          {completed && !active && (
            <p className="text-green-500/70 text-xs mt-0.5">Completed</p>
          )}
        </div>
        {onSkip && active && !completed && (
          <button
            onClick={onSkip}
            className="text-gray-600 hover:text-gray-400 text-xs transition-colors"
          >
            Skip for now
          </button>
        )}
      </div>

      {/* Step Body — only visible when active */}
      {active && (
        <div className="px-5 pb-5 border-t border-white/10 pt-4">
          {children}
        </div>
      )}
    </div>
  );
}
