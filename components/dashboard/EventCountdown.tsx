import { useEffect, useRef, useState } from 'react';

interface EventCountdownProps {
  event: {
    title:     string;
    startDate: string;
    location:  string;
    type?:     string;
  };
}

function useCountdown(target: Date) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        if (ref.current) clearInterval(ref.current);
        return;
      }
      setTimeLeft({
        days:    Math.floor(diff / 86400000),
        hours:   Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    ref.current = setInterval(tick, 1000);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [target]);

  return timeLeft;
}

export default function EventCountdown({ event }: EventCountdownProps) {
  const targetDate = new Date(event.startDate);
  const countdown  = useCountdown(targetDate);
  const isPast     = targetDate < new Date();

  if (isPast) return null;

  const units = [
    { label: 'Days',    value: countdown.days },
    { label: 'Hours',   value: countdown.hours },
    { label: 'Mins',    value: countdown.minutes },
    { label: 'Secs',    value: countdown.seconds },
  ];

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-yellow-400/70 text-xs uppercase tracking-widest">Next Event</span>
        {event.type && (
          <span className="badge badge-gray text-xs capitalize">{event.type}</span>
        )}
      </div>
      <p className="text-white font-semibold mb-4 leading-snug">{event.title}</p>

      <div className="grid grid-cols-4 gap-2">
        {units.map(({ label, value }) => (
          <div key={label} className="bg-white/5 border border-white/10 rounded-lg py-3 text-center">
            <div className="text-2xl font-bold text-yellow-400 tabular-nums">
              {String(value).padStart(2, '0')}
            </div>
            <div className="text-gray-500 text-xs mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <p className="text-gray-500 text-xs mt-3">
        📅 {new Date(event.startDate).toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short' })}
        {'  ·  '}
        📍 {event.location}
      </p>
    </div>
  );
}
