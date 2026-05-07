import { useEffect, useState } from 'react';
import Layout from '../components/common/Layout';
import { useAuth } from './_app';

interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  capacity: number;
  type: string;
  imageUrl?: string;
  _count?: { registrations: number };
}

const EVENT_TYPES = ['All', 'tournament', 'training', 'blitz', 'rapid', 'classical'];

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [registering, setRegistering] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetch('/api/events')
      .then(r => r.json())
      .then(data => setEvents(data.events || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'All' ? events : events.filter(e => e.type === filter);

  const handleRegister = async (eventId: string) => {
    if (!user) { window.location.href = '/login'; return; }
    setRegistering(eventId);
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', eventId }),
      });
      const data = await res.json();
      if (res.ok) alert('Successfully registered!');
      else alert(data.error || 'Registration failed');
    } catch {
      alert('Something went wrong');
    } finally {
      setRegistering(null);
    }
  };

  return (
    <Layout title="Events | Zaid Knights Chess Club" description="Upcoming chess tournaments and training events at Zaid Knights Chess Club, Nairobi.">
      {/* Header */}
      <section className="py-16 border-b border-white/10 chess-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold text-white mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            Events <span className="gold-gradient">& Tournaments</span>
          </h1>
          <p className="text-gray-400">Compete, learn, and grow with the Zaid Knights community</p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter Tabs */}
          <div className="flex gap-2 flex-wrap mb-10">
            {EVENT_TYPES.map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                  filter === type
                    ? 'bg-yellow-500 text-black'
                    : 'glass text-gray-400 hover:text-white hover:border-yellow-500/30'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Events Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-72 rounded-xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 glass rounded-xl">
              <p className="text-5xl mb-4">♟</p>
              <p className="text-gray-400 text-lg">No events found for this filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(event => {
                const start = new Date(event.startDate);
                const end = new Date(event.endDate);
                const spotsLeft = event.capacity - (event._count?.registrations || 0);
                const isFull = spotsLeft <= 0;

                return (
                  <div key={event.id} className="glass-hover rounded-xl flex flex-col overflow-hidden">
                    {/* Top color bar */}
                    <div className="h-1 bg-gradient-to-r from-yellow-500 to-yellow-700" />

                    <div className="p-6 flex flex-col flex-1">
                      {/* Meta */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="badge-gold capitalize">{event.type}</span>
                        <span className={`badge text-xs ${isFull ? 'badge-red' : spotsLeft < 5 ? 'badge-gold' : 'badge-green'}`}>
                          {isFull ? 'Full' : `${spotsLeft} spots`}
                        </span>
                      </div>

                      <h3 className="text-white font-bold text-lg mb-2">{event.title}</h3>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-1">{event.description}</p>

                      {/* Details */}
                      <div className="space-y-2 text-sm text-gray-400 mb-5">
                        <div className="flex items-center gap-2">
                          <span>📅</span>
                          <span>{start.toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                        {start.toDateString() !== end.toDateString() && (
                          <div className="flex items-center gap-2">
                            <span>🏁</span>
                            <span>Ends {end.toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span>📍</span>
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>👥</span>
                          <span>{event.capacity} capacity</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRegister(event.id)}
                        disabled={isFull || registering === event.id}
                        className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all ${
                          isFull
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            : 'btn-primary'
                        }`}
                      >
                        {registering === event.id ? 'Registering...' : isFull ? 'Event Full' : 'Register Now'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}