import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Real Zaid Knights photos from public/images/gallery
const SLIDES = [
  { src: '/images/gallery/20251019_161800.jpg', caption: 'Zaid Knights in action' },
  { src: '/images/gallery/20251019_161816.jpg', caption: 'Strategic minds at work' },
  { src: '/images/gallery/20251018_090240.jpg', caption: 'Club training session' },
  { src: '/images/gallery/20251014_171920.jpg', caption: 'Competitive chess at its finest' },
  { src: '/images/gallery/20251019_084248.jpg', caption: 'Our players representing Kenya' },
  { src: '/images/gallery/20251018_090305.jpg', caption: 'Sharpening great minds' },
  { src: '/images/gallery/20251014_172114.jpg', caption: 'Zaid Knights community' },
  { src: '/images/gallery/20251019_161839.jpg', caption: 'National level competition' },
];

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
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loadedSlides, setLoadedSlides] = useState<Set<number>>(new Set([0]));
  const [nextEvent, setNextEvent] = useState<NextEvent | null>(null);
  const slideTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-advance slideshow every 6 seconds (slower to reduce mobile load)
  useEffect(() => {
    slideTimer.current = setInterval(() => {
      setCurrentSlide(prev => {
        const next = (prev + 1) % SLIDES.length;
        setLoadedSlides(s => new Set(s).add(next));
        return next;
      });
    }, 6000);
    return () => { if (slideTimer.current) clearInterval(slideTimer.current); };
  }, []);

  // Defer non-critical event fetch until after first paint to avoid blocking
  useEffect(() => {
    const t = setTimeout(() => {
      fetch('/api/events?limit=1')
        .then(r => r.json())
        .then(data => {
          const events: NextEvent[] = data.events || [];
          if (events.length > 0) setNextEvent(events[0]);
        })
        .catch(() => {});
    }, 1500);
    return () => clearTimeout(t);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setLoadedSlides(s => new Set(s).add(index));
    if (slideTimer.current) clearInterval(slideTimer.current);
    slideTimer.current = setInterval(() => {
      setCurrentSlide(prev => {
        const next = (prev + 1) % SLIDES.length;
        setLoadedSlides(s => new Set(s).add(next));
        return next;
      });
    }, 6000);
  };

  const eventDate = nextEvent ? new Date(nextEvent.startDate) : null;
  const countdown = useCountdown(eventDate);

  return (
    <section className="relative min-h-[100vh] flex items-center overflow-hidden">

      {/* ── Slideshow Background ── */}
      <div className="absolute inset-0 z-0">
        {SLIDES.map((slide, i) => (
          <div
            key={slide.src}
            className={`absolute inset-0 transition-opacity duration-1000 ${i === currentSlide ? 'opacity-100' : 'opacity-0'}`}
          >
            {loadedSlides.has(i) && (
              <Image
                src={slide.src}
                alt={slide.caption}
                fill
                className="object-cover"
                priority={i === 0}
                loading={i === 0 ? 'eager' : 'lazy'}
                quality={70}
                sizes="(max-width: 768px) 100vw, 100vw"
              />
            )}
          </div>
        ))}
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/65 z-10" />
        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0A0A0F] to-transparent z-10" />
      </div>

      {/* ── Content ── */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left — Text */}
          <div className="animate-fade-in">
            {/* Logo */}
            <div className="mb-8">
              <Image
                src="/logo.png?v=2"
                alt="Zaid Knights"
                width={200}
                height={67}
                className="object-contain"
                priority
                sizes="200px"
              />
            </div>

            {/* Tag */}
            <div className="inline-flex items-center gap-2 badge-gold mb-6 py-1.5 px-4 text-sm">
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              Nairobi's Premier Chess Club
            </div>

            {/* Headline */}
            <h1
              className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              <span className="gold-gradient">Sharpening</span>
              <br />
              <span className="text-white">Great Minds</span>
            </h1>

            <p className="text-lg text-gray-300 mb-8 leading-relaxed max-w-lg">
              Join Zaid Knights Chess Club — where strategy meets community. Compete in tournaments,
              climb the rankings, and grow with Kenya's most passionate chess players.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mb-10">
              <Link href="/register" prefetch={false} className="btn-primary text-base px-8 py-4">
                Join the Club →
              </Link>
              <Link href="/events" prefetch={false} className="btn-secondary text-base px-8 py-4">
                View Events
              </Link>
            </div>

            {/* Countdown */}
            {nextEvent && eventDate && (
              <div>
                <p className="text-gray-400 text-xs mb-1 uppercase tracking-widest">Next Tournament</p>
                <p className="text-yellow-400/70 text-xs mb-3 truncate max-w-xs">{nextEvent.title}</p>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { label: 'Days',    value: countdown.days },
                    { label: 'Hours',   value: countdown.hours },
                    { label: 'Mins',    value: countdown.minutes },
                    { label: 'Secs',    value: countdown.seconds },
                  ].map(({ label, value }) => (
                    <div key={label} className="glass px-4 py-3 text-center min-w-[70px]">
                      <div className="text-2xl font-bold text-yellow-400 tabular-nums">
                        {String(value).padStart(2, '0')}
                      </div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right — Featured photo frame (desktop only — already hidden on mobile) */}
          <div className="hidden lg:block relative">
            <div className="relative rounded-2xl overflow-hidden border-2 border-yellow-500/30 shadow-2xl shadow-yellow-500/10" style={{ height: '500px' }}>
              {SLIDES.map((slide, i) => (
                <div
                  key={slide.src}
                  className={`absolute inset-0 transition-opacity duration-1000 ${i === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                >
                  {loadedSlides.has(i) && (
                    <Image
                      src={slide.src}
                      alt={slide.caption}
                      fill
                      className="object-cover"
                      loading="lazy"
                      quality={75}
                      sizes="(max-width: 1024px) 0px, 50vw"
                    />
                  )}
                </div>
              ))}
              {/* Caption */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 z-10">
                <p className="text-white text-sm font-medium">{SLIDES[currentSlide].caption}</p>
              </div>
            </div>

            {/* Slide dots */}
            <div className="flex justify-center gap-2 mt-4">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToSlide(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`w-2 h-2 rounded-full transition-all ${i === currentSlide ? 'bg-yellow-400 w-6' : 'bg-white/30'}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Slide indicators (mobile) ── */}
        <div className="flex justify-center gap-2 mt-8 lg:hidden">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`w-2 h-2 rounded-full transition-all ${i === currentSlide ? 'bg-yellow-400 w-6' : 'bg-white/30'}`}
            />
          ))}
        </div>

        {/* ── Stats bar ── */}
        <div className="grid grid-cols-3 gap-4 mt-16 max-w-lg">
          {[
            { number: '2025', label: 'Founded' },
            { number: 'Nairobi', label: 'Based In' },
            { number: 'National', label: 'Level Reached' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className="text-xl font-bold text-yellow-400">{stat.number}</div>
              <div className="text-gray-500 text-xs uppercase tracking-wide mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}