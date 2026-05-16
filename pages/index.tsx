import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Layout from '../components/common/Layout';
import Hero from '../components/sections/Hero';
import StatsSection from '../components/sections/StatsSection';
import MembershipTiers from '../components/sections/MembershipTiers';
import EventHighlights from '../components/sections/EventHighlights';
import Link from 'next/link';

const Chessboard = dynamic(() => import('react-chessboard').then(m => m.Chessboard), { ssr: false });

interface DailyPuzzleData {
  puzzle: { id: string; fen: string; moves: string; rating: number; themes: string[] };
  date: string;
}

function DailyPuzzleWidget() {
  const [daily, setDaily] = useState<DailyPuzzleData | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [fen, setFen] = useState('start');

  useEffect(() => {
    fetch('/api/puzzles/daily').then(r => r.json()).then(d => {
      if (d.daily?.puzzle) {
        setDaily({ puzzle: d.daily.puzzle, date: d.daily.date });
        // load initial position (after opponent's first move)
        import('chess.js').then(({ Chess }) => {
          const chess = new Chess();
          chess.load(d.daily.puzzle.fen);
          const moves = d.daily.puzzle.moves.split(' ').filter(Boolean);
          if (moves[0]) {
            try { chess.move({ from: moves[0].slice(0,2), to: moves[0].slice(2,4), promotion: moves[0][4] || 'q' }); } catch {}
          }
          setFen(chess.fen());
        });
      }
    });
  }, []);

  if (!daily) return null;

  return (
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="glass-gold rounded-2xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            <div className="p-8 flex flex-col justify-center">
              <p className="text-yellow-400 text-sm uppercase tracking-widest mb-2">☀️ Daily Puzzle</p>
              <h2 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                Today's Challenge
              </h2>
              <p className="text-gray-400 mb-2">Rating: <span className="text-yellow-400 font-bold">{daily.puzzle.rating}</span></p>
              <div className="flex flex-wrap gap-2 mb-6">
                {daily.puzzle.themes.map(t => (
                  <span key={t} className="text-xs px-2 py-0.5 rounded-full border border-white/10 text-gray-400 capitalize">{t}</span>
                ))}
              </div>
              {!revealed ? (
                <div className="space-y-3">
                  <Link href="/puzzles" className="block btn-primary text-center">
                    Solve the Puzzle →
                  </Link>
                  <button onClick={() => setRevealed(true)} className="w-full btn-secondary text-sm py-2">Peek at Position</button>
                </div>
              ) : (
                <Link href="/puzzles" className="btn-primary text-center block">
                  Solve on Puzzle Page →
                </Link>
              )}
            </div>
            <div className="relative bg-black/20">
              {revealed ? (
                <div className="p-4">
                  <Chessboard
                    options={{
                      position: fen,
                      allowDragging: false,
                      darkSquareStyle: { backgroundColor: '#4a3728' },
                      lightSquareStyle: { backgroundColor: '#f0d9b5' },
                    }}
                  />
                </div>
              ) : (
                <div className="h-full flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="text-7xl mb-4 opacity-30">♟️</div>
                    <p className="text-gray-500 text-sm">Click "Peek at Position" to preview</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <Layout>

      {/* ── Donate Banner ───────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-yellow-900/60 via-yellow-800/30 to-yellow-900/60 border-b border-yellow-500/30">
        {/* subtle chess pattern overlay */}
        <div className="absolute inset-0 chess-pattern opacity-20 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* pulsing icon */}
            <div className="w-11 h-11 rounded-xl bg-yellow-500/25 border border-yellow-500/50 flex items-center justify-center text-2xl animate-pulse-gold flex-shrink-0">
              ♛
            </div>
            <div className="text-center sm:text-left">
              <p className="text-white font-bold text-base leading-tight">Support Zaid Knights</p>
              <p className="text-yellow-200/60 text-sm mt-0.5">
                Help fund tournaments, training, and player development in Kenya
              </p>
            </div>
          </div>

          <Link
            href="/donate"
            className="flex-shrink-0 bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-600 text-black font-bold text-sm px-8 py-3 rounded-full transition-all duration-200 shadow-lg shadow-yellow-500/40 hover:shadow-yellow-400/50 hover:scale-105 whitespace-nowrap"
          >
            Donate Now →
          </Link>
        </div>
      </div>
      {/* ──────────────────────────────────────────────────────────────── */}

      <Hero />
      <StatsSection />
      <DailyPuzzleWidget />

      {/* Play Now Banner */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { href: '/play', icon: '⚡', label: 'Play Online', desc: 'Blitz & Bullet' },
              { href: '/play/bot', icon: '🤖', label: 'vs Computer', desc: '10 difficulty levels' },
              { href: '/puzzles', icon: '🧩', label: 'Puzzles', desc: 'Daily tactics' },
              { href: '/lessons', icon: '🎥', label: 'Lessons', desc: 'Video library' },
            ].map(item => (
              <Link key={item.href} href={item.href} className="glass-hover p-4 rounded-xl text-center group">
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{item.icon}</div>
                <p className="text-white font-semibold text-sm">{item.label}</p>
                <p className="text-gray-400 text-xs mt-0.5">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <EventHighlights />
      <MembershipTiers />

      {/* Join CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="glass-gold p-12 rounded-2xl">
            <p className="text-yellow-400 text-sm uppercase tracking-widest mb-3">Ready to play?</p>
            <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Join Zaid Knights Today
            </h2>
            <p className="text-gray-400 mb-8">
              Become part of Nairobi's fastest-growing chess community. Free to start, no experience needed.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/register" className="btn-primary">Create Account</Link>
              <Link href="/about"    className="btn-secondary">Learn More</Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
