import { useEffect, useRef, useState } from 'react';

const stats = [
  { label: 'Active Members', value: 280, suffix: '+', icon: '♟' },
  { label: 'Tournaments Held', value: 24,  suffix: '',  icon: '🏆' },
  { label: 'Average ELO Rating', value: 1450, suffix: '', icon: '📈' },
  { label: 'Years Active', value: 5, suffix: '+', icon: '⭐' },
];

function AnimatedCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = Date.now();
        const tick = () => {
          const elapsed = Date.now() - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(eased * target));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

export default function StatsSection() {
  return (
    <section className="py-20 border-y border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(stat => (
            <div key={stat.label} className="glass-hover p-6 text-center rounded-xl">
              <div className="text-3xl mb-3">{stat.icon}</div>
              <div className="text-4xl font-bold text-yellow-400 mb-1">
                <AnimatedCounter target={stat.value} />
                {stat.suffix}
              </div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}