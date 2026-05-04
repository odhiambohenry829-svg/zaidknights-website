import Card from '../ui/Card';

const events = [
  { title: 'Champions Blitz', date: 'June 12, 2026', location: 'Nairobi Chess Lounge' },
  { title: 'Youth Circuit', date: 'July 8, 2026', location: 'ZaidKnights Arena' },
  { title: 'Annual Open', date: 'August 20, 2026', location: 'Nairobi Chess Academy' }
];

export default function EventHighlights() {
  return (
    <section className="px-6 py-24 sm:px-10">
      <div className="mx-auto max-w-6xl text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-gold">Events & tournaments</p>
        <h2 className="mt-4 text-4xl font-semibold text-white">Live events, registrations, and archives</h2>
        <p className="mx-auto mt-4 max-w-2xl text-slate-300">Track tournament schedules, join brackets, and relive championship highlights.</p>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {events.map((event) => (
          <Card key={event.title} className="space-y-4">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Upcoming</p>
            <h3 className="text-2xl font-semibold text-white">{event.title}</h3>
            <p className="text-slate-300">{event.date}</p>
            <p className="text-slate-400">Location: {event.location}</p>
            <button className="rounded-full bg-gold px-5 py-3 text-black transition hover:bg-gold/90">
              Register
            </button>
          </Card>
        ))}
      </div>
    </section>
  );
}
