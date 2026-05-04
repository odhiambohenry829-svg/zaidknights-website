import Layout from '../components/common/Layout';

export default function Membership() {
  return (
    <Layout title="Membership | ZaidKnights Chess Club" description="Register for membership tiers, review benefits, and access the member dashboard.">
      <section className="px-6 py-24 sm:px-10">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="rounded-[2rem] border border-white/10 bg-black/70 p-10 shadow-glass text-slate-300">
            <h1 className="text-5xl font-semibold text-white">Become a member</h1>
            <p className="mt-4 text-lg">Secure your spot with a membership tier designed for every level of chess ambition.</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-10 shadow-glass">
              <h2 className="text-3xl font-semibold text-white">Register now</h2>
              <form className="mt-8 space-y-6 text-slate-300">
                <label className="block">
                  <span>Name</span>
                  <input className="mt-2 w-full rounded-3xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none focus:border-gold" placeholder="Your full name" />
                </label>
                <label className="block">
                  <span>Email</span>
                  <input type="email" className="mt-2 w-full rounded-3xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none focus:border-gold" placeholder="you@example.com" />
                </label>
                <label className="block">
                  <span>Membership tier</span>
                  <select className="mt-2 w-full rounded-3xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none focus:border-gold">
                    <option>Beginner Knight</option>
                    <option>Advanced Knight</option>
                    <option>Master Knight</option>
                  </select>
                </label>
                <button className="w-full rounded-full bg-gold px-6 py-3 text-black transition hover:bg-gold/90">Submit application</button>
              </form>
            </div>
            <div className="space-y-6 rounded-[2rem] border border-white/10 bg-white/5 p-10 shadow-glass text-slate-300">
              <h2 className="text-3xl font-semibold text-white">Membership benefits</h2>
              <ul className="space-y-4">
                <li>Access training sessions and chess camps</li>
                <li>Priority event registration</li>
                <li>Personal ranking dashboard</li>
                <li>Member-only chess insights and news</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
