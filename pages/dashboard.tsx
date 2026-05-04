import Layout from '../components/common/Layout';

export default function Dashboard() {
  return (
    <Layout title="Member Dashboard | ZaidKnights Chess Club" description="Personal member dashboard with profile, event status, and rankings.">
      <section className="px-6 py-24 sm:px-10">
        <div className="mx-auto max-w-6xl space-y-10">
          <div className="rounded-[2rem] border border-white/10 bg-black/70 p-10 shadow-glass text-slate-300">
            <h1 className="text-5xl font-semibold text-white">Member dashboard</h1>
            <p className="mt-4 text-lg">View your tournament registrations, ranking status, and upcoming club activity.</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="glass-card rounded-3xl p-8">
              <p className="text-sm uppercase tracking-[0.3em] text-gold">Profile</p>
              <p className="mt-4 text-3xl font-semibold text-white">Amina Mwangi</p>
              <p className="mt-2 text-slate-300">Master Knight • 1920 ELO</p>
            </div>
            <div className="glass-card rounded-3xl p-8">
              <p className="text-sm uppercase tracking-[0.3em] text-gold">Upcoming</p>
              <p className="mt-4 text-xl font-semibold text-white">Nairobi Rapid Open</p>
              <p className="mt-2 text-slate-300">Registered • 25 May 2026</p>
            </div>
            <div className="glass-card rounded-3xl p-8">
              <p className="text-sm uppercase tracking-[0.3em] text-gold">Performance</p>
              <p className="mt-4 text-3xl font-semibold text-white">8 / 10</p>
              <p className="mt-2 text-slate-300">Recent wins</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
