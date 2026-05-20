import { useEffect, useRef, useState } from 'react';

const stats = [
  { label: 'Year Founded', value: 2025, suffix: '', icon: '♟' },
  { label: 'Partner Schools', value: 10, suffix: '+', icon: '🏫' },
  { label: 'National Level', value: 1, suffix: '', icon: '🏆', display: 'National' },
  { label: 'Based In', value: 1, suffix: '', icon: '📍', display: 'Nairobi' },
];

function CountUp({ target, suffix, display }: { target: number; suffix: string; display?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          if (display) { setCount(target); return; }
          let start = 0;
          const step = Math.ceil(target / 50);
          const timer = setInterval(() => {
            start += step;
            if (start >= target) { setCount(target); clearInterval(timer); }
            else setCount(start);
          }, 30);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, display]);

  if (display) return <div ref={ref} className="text-4xl md:text-5xl font-bold text-yellow-400">{display}</div>;
  return <div ref={ref} className="text-4xl md:text-5xl font-bold text-yellow-400">{count.toLocaleString()}{suffix}</div>;
}

export default function StatsSection() {
  return (
    <section className="py-16" style={{ background: 'var(--dark-2)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(stat => (
            <div key={stat.label} className="glass p-6 rounded-xl text-center">
              <div className="text-3xl mb-3">{stat.icon}</div>
              <CountUp target={stat.value} suffix={stat.suffix} display={stat.display} />
              <div className="text-gray-400 text-sm mt-2">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
