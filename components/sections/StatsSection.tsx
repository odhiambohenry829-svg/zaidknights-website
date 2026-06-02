import { useEffect, useRef, useState } from 'react';

const stats = [
  { label: 'Year Founded',        value: 2025,      suffix: '',  icon: '♟',  isText: false },
  { label: 'School Partnerships', value: 'Active',  suffix: '',  icon: '🏫', isText: true  },
  { label: 'Qualified for Nationals',   value: 'National', suffix: '',  icon: '🏆', isText: true  },
  { label: 'Based In',            value: 'Nairobi',  suffix: '',  icon: '📍', isText: true  },
];

function CountUp({ target, suffix, isText }: { target: number | string; suffix: string; isText: boolean }) {
  const [display, setDisplay] = useState<string>(isText ? String(target) : '0');
  const ref    = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (isText) { setDisplay(String(target)); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const end  = Number(target);
        const step = Math.ceil(end / 50);
        let cur  = 0;
        const timer = setInterval(() => {
          cur += step;
          if (cur >= end) { setDisplay(String(end) + suffix); clearInterval(timer); }
          else setDisplay(String(cur) + suffix);
        }, 30);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, suffix, isText]);

  return (
    <div ref={ref} className="text-4xl md:text-5xl font-bold text-yellow-400">
      {display}{!isText && suffix && !display.endsWith(suffix) ? suffix : ''}
    </div>
  );
}

export default function StatsSection() {
  return (
    <section className="py-16" style={{ background: 'var(--dark-2)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(stat => (
            <div key={stat.label} className="glass p-6 rounded-xl text-center">
              <div className="text-3xl mb-3">{stat.icon}</div>
              <CountUp target={stat.value} suffix={stat.suffix} isText={stat.isText} />
              <div className="text-gray-400 text-sm mt-2">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
