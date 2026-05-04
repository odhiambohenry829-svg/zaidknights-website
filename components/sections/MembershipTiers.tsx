import Card from '../ui/Card';

const tiers = [
  { title: 'Beginner Knight', price: 'Free Trial', benefits: ['Weekly lessons', 'Community access', 'Rating support'] },
  { title: 'Advanced Knight', price: 'KES 2,500/mo', benefits: ['Tournament prep', 'Coach review', 'Priority registration'] },
  { title: 'Master Knight', price: 'KES 5,500/mo', benefits: ['Personal coach', 'Elite events', 'Sponsorship guidance'] }
];

export default function MembershipTiers() {
  return (
    <section className="px-6 py-24 sm:px-10">
      <div className="mx-auto max-w-6xl text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-gold">Membership tiers</p>
        <h2 className="mt-4 text-4xl font-semibold text-white">Choose your path as a knight</h2>
        <p className="mx-auto mt-4 max-w-2xl text-slate-300">Flexible membership packages for new learners, active competitors, and elite club members.</p>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {tiers.map((tier) => (
          <Card key={tier.title} className="space-y-5">
            <div>
              <p className="text-lg font-semibold text-gold">{tier.title}</p>
              <p className="mt-2 text-2xl font-bold text-white">{tier.price}</p>
            </div>
            <ul className="space-y-3 text-slate-300">
              {tier.benefits.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-gold" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <button className="w-full rounded-full bg-white px-5 py-3 text-black transition hover:bg-gold/90 hover:text-white">
              Register
            </button>
          </Card>
        ))}
      </div>
    </section>
  );
}
