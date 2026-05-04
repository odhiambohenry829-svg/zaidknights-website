import Layout from '../components/common/Layout';

export default function About() {
  return (
    <Layout title="About | ZaidKnights Chess Club" description="History, mission, leadership, and achievements of ZaidKnights Chess Club.">
      <section className="px-6 py-24 sm:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="space-y-6 rounded-[2rem] border border-white/10 bg-black/70 p-10 shadow-glass">
            <p className="text-sm uppercase tracking-[0.3em] text-gold">About us</p>
            <h1 className="text-5xl font-semibold text-white">Club history, mission, and leadership</h1>
            <p className="text-lg text-slate-300">At ZaidKnights, we build a strong chess community in Nairobi and beyond. We support players from beginner to master, host professional tournaments, and publish chess content designed to improve strategy and performance.</p>
          </div>
          <div className="mt-16 grid gap-10 lg:grid-cols-2">
            <div className="space-y-6 rounded-[2rem] border border-white/10 bg-white/5 p-10 text-slate-300 shadow-glass">
              <h2 className="text-3xl font-semibold text-white">Mission & vision</h2>
              <p>To empower Kenyan players with world-class coaching, tournament exposure, and a modern chess platform that connects talent, training, and competition.</p>
              <ul className="space-y-3">
                <li>Grow a national chess culture</li>
                <li>Support youth and community engagement</li>
                <li>Offer transparent rankings and analytics</li>
              </ul>
            </div>
            <div className="space-y-6 rounded-[2rem] border border-white/10 bg-white/5 p-10 text-slate-300 shadow-glass">
              <h2 className="text-3xl font-semibold text-white">Leadership team</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xl font-semibold text-white">Zaid Kimani</p>
                  <p className="text-slate-400">Founder & Head Coach</p>
                </div>
                <div>
                  <p className="text-xl font-semibold text-white">Amina Mwangi</p>
                  <p className="text-slate-400">Tournaments Director</p>
                </div>
                <div>
                  <p className="text-xl font-semibold text-white">James Ochieng</p>
                  <p className="text-slate-400">Membership & Communications</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
