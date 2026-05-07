import Layout from '../components/common/Layout';

const events = [
  { title: 'Nairobi Rapid Open', date: '25 May 2026', location: 'Chess Academy Nairobi', status: 'Open' },
  { title: 'Youth Cup', date: '12 June 2026', location: 'ZaidKnights Arena', status: 'Registration' },
  { title: 'Masters Weekend', date: '03 July 2026', location: 'Premier Hotel Conference', status: 'Upcoming' }
];

export default function Events() {
  return (
    <Layout title="Events | ZaidKnights Chess Club" description="Browse tournaments, register for live events, and review past chess competitions.">
      <section className="px-6 py-24 sm:px-10">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="rounded-[2rem] border border-white/10 bg-black/70 p-10 shadow-glass text-slate-300">
            <h1 className="text-5xl font-semibold text-white">Events & tournaments</h1>
            <p className="mt-4 text-lg">Manage your tournament calendar, register teams, and follow live standings with our event platform.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {events.map((event) => (
              <div key={event.title} className="glass-card rounded-3xl p-7">
                <p className="text-sm uppercase tracking-[0.3em] text-gold">{event.status}</p>
                <h2 className="mt-4 text-2xl font-semibold text-white">{event.title}</h2>
                <p className="mt-2 text-slate-300">{event.date}</p>
                <p className="text-slate-400">{event.location}</p>
                <button className="mt-6 rounded-full bg-gold px-5 py-3 text-black transition hover:bg-gold/90">Register</button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
