import Link from 'next/link';

const tiers = [
  {
    name: 'Beginner',
    level: 'BEGINNER',
    price: 'Free',
    priceNote: 'Forever',
    description: 'Start your chess journey with us.',
    features: [
      'Access to club meetings',
      'Basic training sessions',
      'Community forum access',
      'Newsletter subscription',
    ],
    cta: 'Get Started',
    href: '/register',
    highlight: false,
  },
  {
    name: 'Advanced',
    level: 'ADVANCED',
    price: 'KES 2,500',
    priceNote: 'per year',
    description: 'Step up your game with competitive play.',
    features: [
      'Everything in Beginner',
      'Tournament participation',
      'ELO rating tracking',
      'Coaching sessions (2/month)',
      'Priority event registration',
    ],
    cta: 'Join Advanced',
    href: '/register?tier=ADVANCED',
    highlight: true,
  },
  {
    name: 'Master',
    level: 'MASTER',
    price: 'KES 5,500',
    priceNote: 'per year',
    description: 'For serious competitors aiming for the top.',
    features: [
      'Everything in Advanced',
      'Unlimited coaching sessions',
      'National tournament eligibility',
      'Club jersey & merchandise',
      'VIP event seating',
      'Personal game analysis',
    ],
    cta: 'Go Master',
    href: '/register?tier=MASTER',
    highlight: false,
  },
];

export default function MembershipTiers() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="section-title">Membership Tiers</h2>
          <p className="section-subtitle mx-auto mt-3">
            Choose the plan that matches your chess ambitions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {tiers.map(tier => (
            <div
              key={tier.name}
              className={`rounded-2xl border flex flex-col transition-all duration-300 ${
                tier.highlight
                  ? 'bg-yellow-500/10 border-yellow-500/40 shadow-xl shadow-yellow-500/10 scale-105'
                  : 'bg-white/5 border-white/10 hover:border-yellow-500/20 hover:bg-white/8'
              }`}
            >
              {tier.highlight && (
                <div className="bg-yellow-500 text-black text-xs font-bold text-center py-1.5 rounded-t-2xl tracking-wider uppercase">
                  Most Popular
                </div>
              )}

              <div className="p-7 flex flex-col flex-1">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-1">{tier.name}</h3>
                  <p className="text-gray-400 text-sm">{tier.description}</p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-yellow-400">{tier.price}</span>
                  <span className="text-gray-500 text-sm ml-2">/ {tier.priceNote}</span>
                </div>

                <ul className="space-y-3 flex-1 mb-8">
                  {tier.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-yellow-400 mt-0.5 flex-shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={tier.href}
                  className={`block text-center py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
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
      </div>
    </section>
  );
}