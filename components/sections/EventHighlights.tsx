import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Event {
  id: string;
  title: string;
  location: string;
  startDate: string;
  type: string;
  capacity: number;
  _count?: { registrations: number };
}

export default function EventHighlights() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/events?limit=3')
      .then(r => r.json())
      .then(data => setEvents(data.events || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-20 chess-pattern">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="section-title">Upcoming Events</h2>
            <p className="text-gray-400 mt-2">Don't miss our next tournaments and training sessions</p>
          </div>
          <Link href="/events" className="btn-ghost text-sm hidden sm:block">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton h-64 rounded-xl" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 glass rounded-xl">
            <p className="text-4xl mb-3">♟</p>
            <p className="text-gray-400">No upcoming events yet. Check back soon!</p>
            <p className="text-gray-500 text-sm mt-2">Follow us on social media for updates.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map(event => {
              const date = new Date(event.startDate);
              const spotsLeft = event.capacity - (event._count?.registrations || 0);
              return (
                <div key={event.id} className="glass-hover rounded-xl overflow-hidden">
                  <div className="bg-yellow-500/20 border-b border-yellow-500/20 px-5 py-3 flex items-center gap-3">
                    <div className="text-center">
                      <div className="text-yellow-400 font-bold text-lg leading-none">
                        {date.getDate()}
                      </div>
                      <div className="text-yellow-600 text-xs uppercase">
                        {date.toLocaleString('default', { month: 'short' })}
                      </div>
                    </div>
                    <div className="h-8 w-px bg-yellow-500/20" />
                    <span className="badge-gold text-xs">{event.type}</span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-white font-semibold mb-2">{event.title}</h3>
                    <p className="text-gray-400 text-sm mb-4 flex items-center gap-1">
                      <span>📍</span> {event.location}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${spotsLeft < 5 ? 'text-red-400' : 'text-gray-500'}`}>
                        {spotsLeft} spots left
                      </span>
                      <Link href="/events" className="text-yellow-400 text-sm hover:text-yellow-300 transition-colors">
                        Register →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="text-center mt-8 sm:hidden">
          <Link href="/events" className="btn-secondary">View All Events</Link>
        </div>
      </div>
    </section>
  );
}
