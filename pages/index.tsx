import Layout from '../components/common/Layout';
import Hero from '../components/sections/Hero';
import MembershipTiers from '../components/sections/MembershipTiers';
import EventHighlights from '../components/sections/EventHighlights';
import StatsSection from '../components/sections/StatsSection';

export default function Home() {
  return (
    <Layout>
      <Hero />
      <StatsSection />
      <MembershipTiers />
      <EventHighlights />
      <section className="px-6 pb-24 sm:px-10">
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-white/10 bg-black/70 p-10 shadow-glass text-slate-300">
          <h2 className="text-3xl font-semibold text-white">Latest announcements</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {['Next masterclass on strategy', 'Registration open for July Open', 'New member portal launched'].map((item) => (
              <div key={item} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <p className="text-sm uppercase tracking-[0.2em] text-gold">Update</p>
                <p className="mt-4 text-base text-slate-200">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
