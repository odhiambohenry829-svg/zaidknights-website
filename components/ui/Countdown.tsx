import { useState, useEffect } from 'react';

interface CountdownProps {
  target:     Date;
  label?:     string;
  compact?:   boolean;
}

interface TimeLeft {
  days:    number;
  hours:   number;
  mins:    number;
  secs:    number;
  expired: boolean;
}

function calc(target: Date): TimeLeft {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0, expired: true };
  return {
    days:    Math.floor(diff / 86400000),
    hours:   Math.floor((diff % 86400000) / 3600000),
    mins:    Math.floor((diff % 3600000) / 60000),
    secs:    Math.floor((diff % 60000) / 1000),
    expired: false,
  };
}

export default function Countdown({ target, label, compact = false }: CountdownProps) {
  const [time, setTime] = useState<TimeLeft>(() => calc(target));

  useEffect(() => {
    setTime(calc(target));
    const id = setInterval(() => setTime(calc(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (time.expired) return null;

  const units: [string, number][] = [
    ['Days', time.days],
    ['Hours', time.hours],
    ['Mins', time.mins],
    ['Secs', time.secs],
  ];

  if (compact) {
    return (
      <span className="text-yellow-400 font-mono text-sm tabular-nums">
        {String(time.days).padStart(2, '0')}d{' '}
        {String(time.hours).padStart(2, '0')}h{' '}
        {String(time.mins).padStart(2, '0')}m
      </span>
    );
  }

  return (
    <div>
      {label && <p className="text-gray-400 text-xs mb-3 text-center">{label}</p>}
      <div className="grid grid-cols-4 gap-2 text-center">
        {units.map(([unit, val]) => (
          <div key={unit} className="bg-white/5 rounded-lg p-2">
            <div className="text-2xl font-bold text-yellow-400 tabular-nums leading-none mb-1">
              {String(val).padStart(2, '0')}
            </div>
            <div className="text-gray-500 text-xs">{unit}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
