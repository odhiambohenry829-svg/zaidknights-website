import Layout from '../components/common/Layout';
import Hero from '../components/sections/Hero';
import StatsSection from '../components/sections/StatsSection';
import MembershipTiers from '../components/sections/MembershipTiers';
import EventHighlights from '../components/sections/EventHighlights';
import Link from 'next/link';

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
