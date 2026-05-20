import Link from 'next/link';

const tiers = [
  {
    name: 'Free',
    level: 'BEGINNER',
    price: 'Free',
    priceNote: 'forever',
    description: 'Get started with Zaid Knights — limited access.',
    features: [
      'View public events',
      'Access community forum',
      'Newsletter subscription',
      'Basic club information',
    ],
    locked: [
      'Play online games',
      'Puzzles & training',
      'Coaching sessions',
      'Tournament registration',
    ],
    cta: 'Get Started Free',
    href: '/register',
    highlight: false,
  },
  {
    name: 'Intermediate',
    level: 'INTERMEDIATE',
    price: 'KES 2,999',
    priceNote: 'per month',
    description: 'For players developing their game.',
    features: [
      'Everything in Free',
      'Play online & vs Bot',
      'Daily puzzles & tactics',
      'Opening Explorer',
      'Endgame Drills',
      'Game Analysis',
      'Priority tournament registration',
      'Group coaching (2/month)',
      'ELO ranking on leaderboard',
      'Event discounts (10%)',
    ],
    locked: [],
    cta: 'Join Intermediate',
    href: '/register?tier=INTERMEDIATE',
    highlight: true,
  },
  {
    name: 'Advanced',
    level: 'ADVANCED',
    price: 'KES 6,999',
    priceNote: 'per month',
    description: 'Step up your game with competitive play.',
    features: [
      'Everything in Intermediate',
      'Personal coaching (1/month)',
      'FIDE rating support',
      'National team consideration',
      'Live game streaming',
      'Video lesson library',
      'Event discounts (20%)',
    ],
    locked: [],
    cta: 'Join Advanced',
    href: '/register?tier=ADVANCED',
    highlight: false,
  },
  {
    name: 'Competitive Squad',
    level: 'COMPETITIVE_SQUAD',
    price: 'KES 9,999',
    priceNote: 'per month',
    description: 'For serious competitors aiming for the top.',
    features: [
      'Everything in Advanced',
      '4x personal coaching/month',
      'Travel support for nationals',
      'Sponsored tournament entries',
      'Full kit & training gear',
      'Direct coach WhatsApp access',
      'Custom training program',
    ],
    locked: [],
    cta: 'Join Squad',
    href: '/register?tier=COMPETITIVE_SQUAD',
    highlight: false,
  },
];

export default function MembershipTiers() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="section-title">Membership Plans</h2>
          <p className="section-subtitle mx-auto mt-3">
            Choose the plan that matches your chess ambitions
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {tiers.map(tier => (
            <div
              key={tier.name}
              className={`rounded-2xl border flex flex-col transition-all duration-300 ${
                tier.highlight
                  ? 'bg-yellow-500/10 border-yellow-500/40 shadow-xl shadow-yellow-500/10 scale-105'
                  : 'bg-white/5 border-white/10 hover:border-yellow-500/20'
              }`}
            >
              {tier.highlight && (
                <div className="bg-yellow-500 text-black text-xs font-bold text-center py-1.5 rounded-t-2xl tracking-wider uppercase">
                  Most Popular
                </div>
              )}

              <div className="p-7 flex flex-col flex-1">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white mb-1">{tier.name}</h3>
                  <p className="text-gray-400 text-sm">{tier.description}</p>
                </div>

                <div className="mb-6">
                  <span className="text-3xl font-bold text-yellow-400">{tier.price}</span>
                  <span className="text-gray-500 text-sm ml-2">/ {tier.priceNote}</span>
                </div>

                <ul className="space-y-2 flex-1 mb-4">
                  {tier.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                  {tier.locked.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-gray-600 mt-0.5 flex-shrink-0">✗</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={tier.href}
                  className={`block text-center py-3 px-6 rounded-lg font-semibold transition-all duration-200 mt-auto ${
                    tier.highlight
                      ? 'bg-yellow-500 text-black hover:bg-yellow-400'
                      : 'border border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10'
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-500 text-sm mt-8">
          All paid plans include a <span className="text-yellow-400">7-day free trial</span>. Cancel anytime. Contact us on WhatsApp +254 726 027 960 to pay via M-Pesa.
        </p>
      </div>
    </section>
  );
}
