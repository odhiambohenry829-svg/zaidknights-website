import Link from 'next/link';
import { useState } from 'react';
import Layout from '../components/common/Layout';
import { useAuth } from './_app';

const TIERS = [
  {
    id:      'BEGINNER',
    label:   'Free',
    color:   'border-white/20',
    popular: false,
    features: [
      '✓ Club membership card',
      '✓ View public events',
      '✓ Basic training materials',
      '✓ Club newsletter',
      '✗ Play online games',
      '✗ Puzzles & tactics training',
      '✗ Tournament registration',
      '✗ Coaching sessions',
    ],
  },
  {
    id:      'INTERMEDIATE',
    label:   'Intermediate',
    color:   'border-yellow-500/40',
    popular: true,
    features: [
      '✓ Everything in Free',
      '✓ Play online & vs Bot',
      '✓ Daily puzzles & tactics',
      '✓ Opening Explorer',
      '✓ Endgame Drills',
      '✓ Game Analysis',
      '✓ Priority tournament registration',
      '✓ Group coaching',
      '✓ ELO ranking on leaderboard',
      '✓ Event discounts (10%)',
    ],
  },
  {
    id:      'ADVANCED',
    label:   'Advanced',
    color:   'border-blue-500/40',
    popular: false,
    features: [
      '✓ Everything in Intermediate',
      '✓ Personal coaching',
      '✓ FIDE rating support',
      '✓ National team consideration',
      '✓ Live game streaming',
      '✓ Video lesson library',
      '✓ Event discounts (20%)',
    ],
  },
  {
    id:      'COMPETITIVE_SQUAD',
    label:   'Competitive Squad',
    color:   'border-purple-500/40',
    popular: false,
    features: [
      '✓ Everything in Advanced',
      '✓ x personal coaching/month',
      '✓ Travel support for nationals',
      '✓ Sponsored tournament entries',
      '✓ Full kit & training gear',
      '✓ All events free',
      '✓ Direct coach WhatsApp access',
      '✓ Priority national team selection',
    ],
  },
];

const PLANS = [
  {
    id: 'MONTHLY', label: 'Monthly', duration: 'per month',
    prices: { BEGINNER: 0, INTERMEDIATE: 2999, ADVANCED: 6999, COMPETITIVE_SQUAD: 9999 },
    badge: null,
  },
  {
    id: 'TERM', label: 'Per Term', duration: 'per term (~4 months)',
    prices: { BEGINNER: 0, INTERMEDIATE: 8999, ADVANCED: 19999, COMPETITIVE_SQUAD: 27999 },
    badge: 'Save 25%',
  },
  {
    id: 'ANNUAL', label: 'Annual', duration: 'per year',
    prices: { BEGINNER: 0, INTERMEDIATE: 29999, ADVANCED: 69999, COMPETITIVE_SQUAD: 99999 },
    badge: 'Best Value',
  },
];

const BENEFITS = [
  { icon: '🏆', title: 'Competitive Tournaments', desc: 'Enter club and inter-club tournaments representing Zaid Knights at every level.' },
  { icon: '🎓', title: 'Expert Coaching', desc: 'Learn from coaches Henry Odhiambo & Gerrishom Samuel who have guided players to nationals.' },
  { icon: '📊', title: 'ELO Rating System', desc: 'Track your progress with our club ELO system, updated after every tournament.' },
  { icon: '🌍', title: 'National Representation', desc: 'Top performers get the chance to represent Kenya at regional and national championships.' },
  { icon: '🏠', title: 'House Training', desc: 'Personalised house training sessions brought directly to you across Nairobi.' },
  { icon: '🏫', title: 'School Partnerships', desc: 'Access to our school partnership network — develop chess in your school community.' },
];

const FAQS = [
  { q: 'Can I upgrade my membership tier later?', a: 'Yes! You can upgrade at any time from your dashboard. Your new tier benefits activate immediately after payment.' },
  { q: 'Is Free membership really free?', a: 'Yes. Free membership has no hidden charges. You get basic access to view events, training materials and the newsletter. Paid tiers unlock the full platform.' },
  { q: 'How do I pay for a paid plan?', a: 'You can pay via M-Pesa Paybill 880100, Account 124498 (NCBA Bank), or via our secure online payment on the registration page. Contact us on WhatsApp +254 726 027 960 after paying.' },
  { q: 'Can I get a refund if not satisfied?', a: 'We offer a 7-day satisfaction guarantee on paid memberships. Contact info@zaidknights.org within 7 days and we will process a full refund.' },
  { q: 'Do you offer student discounts?', a: 'Students with a valid student ID receive a 15% discount on all paid tiers. Email info@zaidknights.org with a photo of your student card.' },
  { q: 'Can I cancel my membership?', a: 'Yes. Email info@zaidknights.org or WhatsApp us and we will cancel your membership within 24 hours.' },
];

export default function MembershipPage() {
  const { user } = useAuth();
  const [activePlan, setActivePlan] = useState('MONTHLY');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
            <button key={p.id} onClick={() => setActivePlan(p.id)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all relative ${
                activePlan === p.id ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-white'
              }`}>
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
              const plan  = PLANS.find(p => p.id === activePlan)!;
              const price = plan.prices[tier.id as keyof typeof plan.prices];
              return (
                <div key={tier.id}
                  className={`glass rounded-2xl p-6 border-2 flex flex-col ${tier.color} relative`}>
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-yellow-500 text-black text-xs font-bold px-4 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <div className="mb-5">
                    <h3 className="text-white font-bold text-lg mb-2">{tier.label}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-yellow-400">
                        {price === 0 ? 'Free' : `KES ${price.toLocaleString()}`}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs mt-1">{plan.duration}</p>
                  </div>
                  <ul className="space-y-2 flex-1 mb-6">
                    {tier.features.map((f, i) => (
                      <li key={i} className={`text-xs flex items-start gap-1.5 ${f.startsWith('✓') ? 'text-gray-300' : 'text-gray-600'}`}>
                        <span className={f.startsWith('✓') ? 'text-green-400' : 'text-gray-600'}>
                          {f.startsWith('✓') ? '✓' : '✗'}
                        </span>
                        {f.slice(2)}
                      </li>
                    ))}
                  </ul>
                  {user ? (
                    <Link href={tier.id === 'BEGINNER' ? '/dashboard' : `/renew?tier=${tier.id}&plan=${activePlan}`}
                      className={`w-full text-center py-2.5 rounded-lg text-sm font-semibold transition-all block ${
                        tier.popular ? 'btn-primary' : 'btn-secondary'
                      }`}>
                      {tier.id === 'BEGINNER' ? 'Go to Dashboard' : 'Upgrade Plan'}
                    </Link>
                  ) : (
                    <Link href={`/register?tier=${tier.id}`}
                      className={`w-full text-center py-2.5 rounded-lg text-sm font-semibold transition-all block ${
                        tier.popular ? 'btn-primary' : 'btn-secondary'
                      }`}>
                      {tier.id === 'BEGINNER' ? 'Join Free' : 'Get Started'}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-center text-gray-500 text-sm mt-6">
            Pay via <span className="text-yellow-400">M-Pesa Paybill 880100</span>, Account <span className="text-yellow-400">124498</span> · WhatsApp <span className="text-green-400">+254 726 027 960</span> after payment
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4">
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

      {/* FAQ */}
      <section className="py-16 px-4" style={{ background: 'var(--dark-2)' }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10" style={{ fontFamily: 'Playfair Display, serif' }}>
            Membership FAQ
          </h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="glass rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-6 py-4 flex items-center justify-between gap-4">
                  <span className="text-white font-medium text-sm">{faq.q}</span>
                  <span className={`text-yellow-400 text-lg transition-transform flex-shrink-0 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Join Free Today
          </h2>
          <p className="text-gray-400 text-lg mb-10">
            Start your chess journey with a free membership — no credit card required.
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