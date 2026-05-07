import Layout from '../components/common/Layout';
import Hero from '../components/sections/Hero';
import StatsSection from '../components/sections/StatsSection';
import MembershipTiers from '../components/sections/MembershipTiers';
import EventHighlights from '../components/sections/EventHighlights';
import Link from 'next/link';

export default function HomePage() {
  return (
    <Layout>
      <Hero />
      <StatsSection />
      <EventHighlights />
      <MembershipTiers />

      {/* Latest Announcements CTA */}
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
              <Link href="/about" className="btn-secondary">Learn More</Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}