import Layout from '../components/common/Layout';
import MembershipTiers from '../components/sections/MembershipTiers';
import Link from 'next/link';

const benefits = [
  { icon: '🏆', title: 'Tournaments', desc: 'Compete in rated tournaments and build your ELO rating' },
  { icon: '📚', title: 'Coaching',    desc: 'Learn from experienced coaches through structured sessions' },
  { icon: '📊', title: 'Analytics',   desc: 'Track your progress with detailed stats and game analysis' },
  { icon: '🤝', title: 'Community',   desc: 'Connect with passionate chess players across Nairobi' },
  { icon: '🎽', title: 'Merchandise', desc: 'Master members receive exclusive club jersey and gear' },
  { icon: '🌍', title: 'National',    desc: 'Represent Zaid Knights at national-level competitions' },
];

export default function MembershipPage() {
  return (
    <Layout title="Membership | Zaid Knights Chess Club" description="Join Zaid Knights Chess Club. Choose from Beginner (free), Advanced (KES 2,500/yr), or Master (KES 5,500/yr) membership tiers.">
      {/* Header */}
      <section className="py-16 border-b border-white/10 chess-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Club <span className="gold-gradient">Membership</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Choose the tier that fits your journey. Upgrade anytime as you grow.
          </p>
        </div>
      </section>

      {/* Tiers */}
      <MembershipTiers />

      {/* Benefits */}
      <section className="py-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Why Join Zaid Knights?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map(b => (
              <div key={b.title} className="glass p-6 rounded-xl flex gap-4">
                <span className="text-3xl flex-shrink-0">{b.icon}</span>
                <div>
                  <h3 className="text-white font-semibold mb-1">{b.title}</h3>
                  <p className="text-gray-400 text-sm">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 border-t border-white/10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="section-title text-center mb-10">Frequently Asked Questions</h2>
          {[
            { q: 'Can I upgrade my membership later?', a: 'Yes! You can upgrade from Beginner to Advanced or Master at any time by contacting us or through your dashboard.' },
            { q: 'Is the Beginner tier really free?', a: 'Absolutely. The Beginner tier is free forever with no hidden fees. You get access to club meetings and basic training.' },
            { q: 'How is the ELO rating calculated?', a: 'We use the standard FIDE ELO system. Your rating changes after each rated game based on your opponent\'s rating and the result.' },
            { q: 'Do I need any experience to join?', a: 'Not at all! We welcome complete beginners. Our coaches will teach you from the basics.' },
          ].map(faq => (
            <div key={faq.q} className="glass mb-4 p-5 rounded-xl">
              <h3 className="text-white font-semibold mb-2">{faq.q}</h3>
              <p className="text-gray-400 text-sm">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center">
        <Link href="/register" className="btn-primary text-lg px-10 py-4">
          Join Now — It's Free to Start
        </Link>
      </section>
    </Layout>
  );
}