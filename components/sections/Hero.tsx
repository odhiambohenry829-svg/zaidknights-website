import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

interface NextEvent {
  title: string;
  startDate: string;
}

function useCountdown(target: Date | null) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!target) return;
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) { setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
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

export default function Hero() {
  const [nextEvent,    setNextEvent]    = useState<NextEvent | null>(null);
  const [heroTitle,    setHeroTitle]    = useState('Master the Game of Kings');
  const [heroSubtitle, setHeroSubtitle] = useState(
    'Join Zaid Knights Chess Club — where strategy meets community. Compete in tournaments, climb the rankings, and grow with Kenya\'s most passionate chess players.'
  );

  useEffect(() => {
    fetch('/api/events?limit=1')
      .then(r => r.json())
      .then(data => {
        const events: NextEvent[] = data.events || [];
        if (events.length > 0) setNextEvent(events[0]);
      })
      .catch(() => {});

    fetch('/api/site-settings')
      .then(r => r.json())
      .then(data => {
        if (data.settings?.heroTitle)    setHeroTitle(data.settings.heroTitle);
        if (data.settings?.heroSubtitle) setHeroSubtitle(data.settings.heroSubtitle);
      })
      .catch(() => {});
  }, []);

  const eventDate = nextEvent ? new Date(nextEvent.startDate) : null;
  const countdown = useCountdown(eventDate);

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden chess-pattern">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-yellow-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-yellow-500/3 rounded-full blur-3xl" />
      </div>

      {/* Decorative chess piece */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 text-[20rem] opacity-5 select-none pointer-events-none hidden lg:block">
        ♞
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-3xl animate-fade-in">

          {/* Tag */}
          <div className="inline-flex items-center gap-2 badge-gold mb-6 py-1.5 px-4 text-sm">
            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            Nairobi's Premier Chess Club
          </div>

          {/* Headline */}
          <h1
            className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            <span className="gold-gradient">{heroTitle}</span>
          </h1>

          <p className="text-xl text-gray-400 mb-10 leading-relaxed">
            {heroSubtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 mb-14">
            <Link href="/register" className="btn-primary text-base px-8 py-4">
              Join the Club →
            </Link>
            <Link href="/events" className="btn-secondary text-base px-8 py-4">
              View Events
            </Link>
          </div>

          {/* Countdown — only shown when there's a real upcoming event */}
          {nextEvent && eventDate && (
            <div>
              <p className="text-gray-500 text-sm mb-1 uppercase tracking-widest">Next Tournament</p>
              <p className="text-yellow-400/70 text-xs mb-3 truncate max-w-xs">{nextEvent.title}</p>
              <div className="flex gap-4 flex-wrap">
                {[
                  { label: 'Days',    value: countdown.days },
                  { label: 'Hours',   value: countdown.hours },
                  { label: 'Minutes', value: countdown.minutes },
                  { label: 'Seconds', value: countdown.seconds },
                ].map(({ label, value }) => (
                  <div key={label} className="glass px-5 py-4 text-center min-w-[80px]">
                    <div className="text-3xl font-bold text-yellow-400 tabular-nums">
                      {String(value).padStart(2, '0')}
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
