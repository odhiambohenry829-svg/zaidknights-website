import Link from 'next/link';
import { useState } from 'react';
import Layout from '../components/common/Layout';
import Accordion from '../components/ui/Accordion';
import Badge from '../components/ui/Badge';
import { useAuth } from './_app';

const TIERS = [
  {
    id:       'BEGINNER',
    label:    'Beginner',
    price:    'Free',
    sub:      'Forever free',
    color:    'border-white/20',
    badge:    'gray' as const,
    popular:  false,
    features: [
      '✓ Club membership card',
      '✓ Access to Saturday sessions',
      '✓ Basic training materials',
      '✓ Club newsletter',
      '✗ Tournament priority registration',
      '✗ Personal coaching sessions',
      '✗ National team consideration',
    ],
  },
  {
    id:       'INTERMEDIATE',
    label:    'Intermediate',
    price:    'KES 1,200',
    sub:      'per school term',
    color:    'border-yellow-500/40',
    badge:    'gold' as const,
    popular:  true,
    features: [
      '✓ Everything in Beginner',
      '✓ Priority tournament registration',
      '✓ Group coaching sessions (2/month)',
      '✓ Tactics & strategy workbooks',
      '✓ Club ranking on leaderboard',
      '✓ Event discounts (10%)',
      '✗ National team consideration',
    ],
  },
  {
    id:       'ADVANCED',
    label:    'Advanced',
    price:    'KES 2,500',
    sub:      'per term',
    color:    'border-blue-500/40',
    badge:    'blue' as const,
    popular:  false,
    features: [
      '✓ Everything in Intermediate',
      '✓ Personal coaching sessions (1/month)',
      '✓ FIDE rating registration support',
      '✓ Advanced opening preparation',
      '✓ Inter-club tournament entries',
      '✓ Event discounts (20%)',
      '✓ National team consideration',
    ],
  },
  {
    id:       'COMPETITIVE_SQUAD',
    label:    'Competitive Squad',
    price:    'KES 5,500',
    sub:      'per year',
    color:    'border-purple-500/40',
    badge:    'purple' as const,
    popular:  false,
    features: [
      '✓ Everything in Advanced',
      '✓ 4× personal coaching per month',
      '✓ Travel support for nationals',
      '✓ Sponsored tournament entries',
      '✓ Full kit & training gear',
      '✓ All events free',
      '✓ Priority national team selection',
    ],
  },
];

const PLANS = [
  { id: 'MONTHLY', label: 'Monthly',     duration: '1 month',   prices: { BEGINNER: 0, INTERMEDIATE: 400, ADVANCED: 1200, COMPETITIVE_SQUAD: 2000 }, badge: null },
  { id: 'TERM',    label: 'School Term', duration: '~4 months', prices: { BEGINNER: 0, INTERMEDIATE: 1200, ADVANCED: 3000, COMPETITIVE_SQUAD: 5000 }, badge: 'Most Popular' },
  { id: 'ANNUAL',  label: 'Annual',      duration: '12 months', prices: { BEGINNER: 0, INTERMEDIATE: 4000, ADVANCED: 10000, COMPETITIVE_SQUAD: 16000 }, badge: 'Best Value' },
];

const BENEFITS = [
  { icon: '🏆', title: 'Competitive Tournaments',   desc: 'Enter club and inter-club tournaments representing Zaid Knights at every level.' },
  { icon: '🎓', title: 'Expert Coaching',           desc: 'Learn from FIDE-trained coaches who have guided national champions.' },
  { icon: '📊', title: 'ELO Rating System',         desc: 'Track your progress with our club ELO system, updated after every tournament.' },
  { icon: '🌍', title: 'National Representation',   desc: 'Top performers get the chance to represent Kenya at regional championships.' },
  { icon: '👥', title: 'Vibrant Community',         desc: 'Join a network of 500+ chess players, from beginners to grandmasters-in-the-making.' },
  { icon: '📚', title: 'Training Materials',        desc: 'Access curated training books, online resources, and video content.' },
];

const TESTIMONIALS = [
  { name: 'Brian Omondi',     tier: 'Advanced',          quote: 'Joining Zaid Knights was the best chess decision I ever made. The coaching is world-class and the community is incredible.' },
  { name: 'Faith Njeri',      tier: 'Competitive Squad', quote: 'From a beginner to representing Kenya in 2 years — Zaid Knights made that possible. The structured training is unmatched.' },
  { name: 'Ahmed Al-Hassan',  tier: 'Intermediate',      quote: 'Even as an Intermediate member, the resources and support I get here beat any chess club I\'ve been part of before.' },
];

const FAQS = [
  { question: 'Can I upgrade my membership tier later?', answer: 'Yes! You can upgrade at any time from your dashboard under Membership → Renew/Upgrade. Your new tier benefits activate immediately after payment is confirmed.' },
  { question: 'Is Beginner membership really free?', answer: 'Yes. Beginner membership is completely free with no hidden charges. You get access to Saturday sessions, basic training materials, and the club newsletter.' },
  { question: 'How does the school term billing work?', answer: 'Kenya has three school terms per year. A "Term" subscription covers one full term (roughly 3–4 months) regardless of when you subscribe. This is the most popular option as it aligns with the academic calendar.' },
  { question: 'Can I get a refund if I\'m not satisfied?', answer: 'We offer a 7-day satisfaction guarantee on paid memberships. Contact info@zaidknights.org within 7 days of payment and we\'ll process a full refund.' },
  { question: 'Do you offer student discounts?', answer: 'Students (with valid student ID) receive a 15% discount on all paid tiers. Show your ID at the Saturday session or email info@zaidknights.org with a photo of your student card.' },
  { question: 'How do I cancel auto-renewal?', answer: 'Log in to your dashboard, go to Settings → Membership, and toggle off Auto-Renew. You can also email us and we\'ll handle it within 24 hours.' },
];

export default function MembershipPage() {
  const { user } = useAuth();
  const [activePlan, setActivePlan] = useState('TERM');

  return (
    <Layout title="Membership | Zaid Knights Chess Club">
      {/* Hero */}
      <section className="py-24 px-4 chess-pattern">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Club <span className="gold-gradient">Membership</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Choose the plan that fits your chess journey. Start free and upgrade as you grow.
          </p>
        </div>
      </section>

      {/* Plan Toggle */}
      <div className="py-8 px-4 flex justify-center" style={{ background: 'var(--dark-2)' }}>
        <div className="glass p-1.5 rounded-xl flex gap-1">
          {PLANS.map(p => (
            <button
              key={p.id}
              onClick={() => setActivePlan(p.id)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all relative ${
                activePlan === p.id
                  ? 'bg-yellow-500 text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {p.label}
              {p.badge && activePlan !== p.id && (
                <span className="absolute -top-2.5 -right-1 text-xs bg-green-500 text-white px-1.5 py-0.5 rounded-full font-medium leading-none">
                  {p.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tier Cards */}
      <section className="py-16 px-4" style={{ background: 'var(--dark-2)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TIERS.map(tier => {
              const plan       = PLANS.find(p => p.id === activePlan)!;
              const price      = plan.prices[tier.id as keyof typeof plan.prices];
              const isSelected = user?.role === 'MEMBER';

              return (
                <div
                  key={tier.id}
                  className={`glass rounded-2xl p-6 border-2 flex flex-col ${tier.color} relative`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-yellow-500 text-black text-xs font-bold px-4 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <div className="mb-5">
                    <Badge variant={tier.badge} className="mb-3">{tier.label}</Badge>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-white">
                        {price === 0 ? 'Free' : `KES ${price.toLocaleString()}`}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs mt-1">{plan.duration}</p>
                  </div>
                  <ul className="space-y-2 flex-1 mb-6">
                    {tier.features.map((f, i) => (
                      <li
                        key={i}
                        className={`text-xs ${f.startsWith('✓') ? 'text-gray-300' : 'text-gray-600'}`}
                      >
                        {f}
                      </li>
                    ))}
                  </ul>
                  {user ? (
                    <Link
                      href={tier.id === 'BEGINNER' ? '/dashboard' : `/renew?tier=${tier.id}&plan=${activePlan}`}
                      className={`w-full text-center py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        tier.popular
                          ? 'btn-primary'
                          : 'btn-secondary'
                      }`}
                    >
                      {isSelected ? 'Upgrade' : tier.id === 'BEGINNER' ? 'Get Started' : 'Select Plan'}
                    </Link>
                  ) : (
                    <Link
                      href={`/register?tier=${tier.id}`}
                      className={`w-full text-center py-2.5 rounded-lg text-sm font-semibold transition-all block ${
                        tier.popular ? 'btn-primary' : 'btn-secondary'
                      }`}
                    >
                      {tier.id === 'BEGINNER' ? 'Join Free' : 'Get Started'}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>

          {/* Plan Duration note */}
          <div className="mt-6 text-center text-gray-500 text-sm">
            {PLANS.find(p => p.id === activePlan)?.badge && (
              <span className="text-green-400 mr-2">★</span>
            )}
            {activePlan === 'TERM' && 'Save vs. paying monthly · Aligns with Kenya school calendar'}
            {activePlan === 'ANNUAL' && 'Best value — save up to 30% vs. monthly billing'}
            {activePlan === 'MONTHLY' && 'Flexible month-to-month, cancel any time'}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10" style={{ fontFamily: 'Playfair Display, serif' }}>
            Full Feature Comparison
          </h2>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th className="text-left">Feature</th>
                  {TIERS.map(t => (
                    <th key={t.id} className="text-center">{t.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Club membership',          vals: [true, true, true, true] },
                  { feature: 'Saturday sessions',        vals: [true, true, true, true] },
                  { feature: 'Basic training materials', vals: [true, true, true, true] },
                  { feature: 'Club newsletter',          vals: [true, true, true, true] },
                  { feature: 'ELO ranking',              vals: [false, true, true, true] },
                  { feature: 'Tournament registration',  vals: [false, true, true, true] },
                  { feature: 'Group coaching (2/mo)',    vals: [false, true, true, true] },
                  { feature: 'Event discounts',          vals: [false, '10%', '20%', '100%'] },
                  { feature: 'Personal coaching',        vals: [false, false, '1/mo', '4/mo'] },
                  { feature: 'FIDE rating support',      vals: [false, false, true, true] },
                  { feature: 'National team eligible',   vals: [false, false, true, true] },
                  { feature: 'Travel support',           vals: [false, false, false, true] },
                  { feature: 'Sponsored entries',        vals: [false, false, false, true] },
                ].map(row => (
                  <tr key={row.feature}>
                    <td className="text-gray-300 text-sm">{row.feature}</td>
                    {row.vals.map((v, i) => (
                      <td key={i} className="text-center text-sm">
                        {v === true
                          ? <span className="text-green-400">✓</span>
                          : v === false
                            ? <span className="text-gray-600">—</span>
                            : <span className="text-yellow-400 font-medium">{v}</span>
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4" style={{ background: 'var(--dark-2)' }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10" style={{ fontFamily: 'Playfair Display, serif' }}>
            Why Join Zaid Knights?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map(b => (
              <div key={b.title} className="glass-hover p-6 rounded-xl">
                <div className="text-4xl mb-4">{b.icon}</div>
                <h3 className="text-white font-bold mb-2">{b.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10" style={{ fontFamily: 'Playfair Display, serif' }}>
            What Our Members Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="glass p-6 rounded-xl flex flex-col">
                <p className="text-gray-300 text-sm leading-relaxed italic flex-1 mb-4">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                  <div className="w-9 h-9 rounded-full bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center text-yellow-400 text-sm font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{t.name}</p>
                    <p className="text-gray-500 text-xs">{t.tier} Member</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4" style={{ background: 'var(--dark-2)' }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10" style={{ fontFamily: 'Playfair Display, serif' }}>
            Membership FAQ
          </h2>
          <Accordion items={FAQS} />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Join Free Today
          </h2>
          <p className="text-gray-400 text-lg mb-10">
            Start your chess journey with a free Beginner membership — no credit card required.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/register" className="btn-primary">Join Free →</Link>
            <Link href="/contact" className="btn-secondary">Ask a Question</Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
