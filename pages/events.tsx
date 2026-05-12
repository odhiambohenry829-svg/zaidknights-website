import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Layout from '../components/common/Layout';
import SkeletonCard from '../components/ui/SkeletonCard';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import Toast from '../components/ui/Toast';
import Badge from '../components/ui/Badge';
import Countdown from '../components/ui/Countdown';
import type { BadgeVariant } from '../components/ui/Badge';
import { useAuth } from './_app';

interface Event {
  id:          string;
  title:       string;
  slug:        string;
  description: string;
  location:    string;
  startDate:   string;
  endDate:     string;
  capacity:    number;
  type:        string;
  _count:      { registrations: number };
}

type EventType = 'all' | 'tournament' | 'training' | 'blitz' | 'rapid' | 'classical';

const EVENT_COLORS: Record<string, BadgeVariant> = {
  tournament: 'gold',
  training:   'blue',
  blitz:      'green',
  rapid:      'purple',
  classical:  'orange',
};

function typeColor(t: string): BadgeVariant {
  return EVENT_COLORS[t.toLowerCase()] ?? 'gray';
}

function spotsLeft(event: Event) {
  return event.capacity - event._count.registrations;
}

export default function EventsPage() {
  const { user } = useAuth();

  const [events,      setEvents]      = useState<Event[]>([]);
  const [past,        setPast]        = useState<Event[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [loadingPast, setLoadingPast] = useState(false);
  const [error,       setError]       = useState('');
  const [filter,      setFilter]      = useState<EventType>('all');
  const [showPast,    setShowPast]    = useState(false);
  const [selected,    setSelected]    = useState<Event | null>(null);
  const [registering, setRegistering] = useState<string | null>(null);
  const [registered,  setRegistered]  = useState<Set<string>>(new Set());
  const [toast,       setToast]       = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.set('type', filter);
      const res  = await fetch(`/api/events?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load events');
      setEvents(data.events ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const fetchPast = async () => {
    if (past.length > 0) { setShowPast(true); return; }
    setLoadingPast(true);
    try {
      const res  = await fetch('/api/events?past=true');
      const data = await res.json();
      setPast(data.events ?? []);
      setShowPast(true);
    } catch { /* ignore */ } finally {
      setLoadingPast(false);
    }
  };

  const handleRegister = async (eventId: string) => {
    if (!user) {
      window.location.href = `/login?redirect=/events`;
      return;
    }
    setRegistering(eventId);
    try {
      const res  = await fetch('/api/events', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action: 'register', eventId }),
      });
      const data = await res.json();
      if (res.status === 409) {
        setRegistered(prev => new Set([...prev, eventId]));
        setToast({ message: 'You\'re already registered for this event!', type: 'info' });
        return;
      }
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      setRegistered(prev => new Set([...prev, eventId]));
      setToast({ message: 'Registered! Check your dashboard for details.', type: 'success' });
      setSelected(null);
    } catch (e: unknown) {
      setToast({ message: e instanceof Error ? e.message : 'Registration failed.', type: 'error' });
    } finally {
      setRegistering(null);
    }
  };

  const filtered = events.filter(e =>
    filter === 'all' || e.type.toLowerCase() === filter
  );

  const FILTERS: EventType[] = ['all', 'tournament', 'training', 'blitz', 'rapid', 'classical'];

  const EventCard = ({ event }: { event: Event }) => {
    const spots     = spotsLeft(event);
    const isFull    = spots <= 0;
    const isReg     = registered.has(event.id);
    const startDate = new Date(event.startDate);

    return (
      <div
        className="glass-hover rounded-xl overflow-hidden cursor-pointer flex flex-col"
        onClick={() => setSelected(event)}
      >
        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-2 mb-3">
            <Badge variant={typeColor(event.type)} className="capitalize">{event.type}</Badge>
            {spots <= 5 && !isFull && (
              <span className="text-red-400 text-xs font-medium">{spots} spots left</span>
            )}
            {isFull && <span className="text-red-400 text-xs font-medium">Full</span>}
          </div>
          <h3 className="text-white font-semibold mb-2 flex-1">{event.title}</h3>
          <div className="space-y-1 text-gray-400 text-xs mb-4">
            <p>📅 {startDate.toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</p>
            <p>📍 {event.location}</p>
            <p>👥 {event._count.registrations}/{event.capacity} registered</p>
          </div>
          <p className="text-gray-500 text-xs line-clamp-2 mb-4">{event.description}</p>
          <button
            onClick={e => { e.stopPropagation(); handleRegister(event.id); }}
            disabled={isFull || !!registering || isReg}
            className={`w-full py-2 rounded-lg text-sm font-semibold transition-all ${
              isReg
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : isFull
                  ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                  : 'btn-primary'
            }`}
          >
            {isReg ? '✓ Registered' : isFull ? 'Event Full' : registering === event.id ? 'Registering…' : 'Register →'}
          </button>
        </div>
        {startDate > new Date() && (
          <div className="px-5 pb-5">
            <Countdown target={startDate} label="Starts in" />
          </div>
        )}
      </div>
    );
  };

  return (
    <Layout title="Events | Zaid Knights Chess Club">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* Hero */}
      <section className="py-20 px-4 chess-pattern">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Events & <span className="gold-gradient">Tournaments</span>
          </h1>
          <p className="text-gray-400 text-lg">Compete, train, and sharpen your game at Zaid Knights events</p>
        </div>
      </section>

      {/* Filter Bar */}
      <div className="sticky top-16 z-30 bg-[var(--dark)]/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto py-3">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${
                  filter === f
                    ? 'bg-yellow-500 text-black'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {f === 'all' ? 'All Events' : f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {error ? (
          <div className="text-center py-16">
            <p className="text-red-400 mb-4">{error}</p>
            <button onClick={fetchEvents} className="btn-secondary">Try Again</button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} rows={4} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="🏆"
            title="No upcoming events"
            message="No events match your filter. Check back soon or try a different category."
            ctaLabel="View All Events"
            ctaHref="/events"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(event => <EventCard key={event.id} event={event} />)}
          </div>
        )}

        {/* Past Events */}
        <div className="mt-16 border-t border-white/10 pt-10">
          <button
            onClick={showPast ? () => setShowPast(false) : fetchPast}
            disabled={loadingPast}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium mx-auto"
          >
            <span>{showPast ? '▲ Hide Past Events' : '▼ Show Past Events'}</span>
            {loadingPast && <span className="text-xs">(loading…)</span>}
          </button>
          {showPast && past.length > 0 && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-70">
              {past.map(event => (
                <div key={event.id} className="glass rounded-xl p-5">
                  <Badge variant={typeColor(event.type)} className="capitalize mb-3">{event.type}</Badge>
                  <h3 className="text-white font-semibold mb-2">{event.title}</h3>
                  <p className="text-gray-500 text-xs">
                    📅 {new Date(event.startDate).toLocaleDateString('en-KE')} · 📍 {event.location}
                  </p>
                  <p className="text-gray-600 text-xs mt-2">{event._count.registrations} participants</p>
                </div>
              ))}
            </div>
          )}
          {showPast && past.length === 0 && (
            <p className="text-center text-gray-500 mt-6 text-sm">No past events found.</p>
          )}
        </div>

        {!user && (
          <div className="mt-12 glass-gold p-6 rounded-xl text-center">
            <p className="text-gray-300 mb-4">Sign in to register for events and track your participation</p>
            <Link href="/login?redirect=/events" className="btn-primary">Sign In to Register</Link>
          </div>
        )}
      </div>

      {/* Event Detail Modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.title}
      >
        {selected && (() => {
          const spots  = spotsLeft(selected);
          const isFull = spots <= 0;
          const isReg  = registered.has(selected.id);
          return (
            <div className="space-y-5">
              <div className="flex flex-wrap gap-3">
                <Badge variant={typeColor(selected.type)} className="capitalize">{selected.type}</Badge>
                {isFull
                  ? <Badge variant="red">Event Full</Badge>
                  : spots <= 5
                    ? <Badge variant="red">{spots} spots left</Badge>
                    : <Badge variant="green">{spots} spots available</Badge>
                }
              </div>
              <div className="space-y-2 text-sm text-gray-300">
                <p>📅 <strong>Start:</strong> {new Date(selected.startDate).toLocaleString('en-KE')}</p>
                <p>🏁 <strong>End:</strong> {new Date(selected.endDate).toLocaleString('en-KE')}</p>
                <p>📍 <strong>Location:</strong> {selected.location}</p>
                <p>👥 <strong>Capacity:</strong> {selected._count.registrations}/{selected.capacity}</p>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">{selected.description}</p>
              {new Date(selected.startDate) > new Date() && (
                <Countdown target={new Date(selected.startDate)} label="Tournament starts in" />
              )}
              <button
                onClick={() => handleRegister(selected.id)}
                disabled={isFull || !!registering || isReg}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  isReg
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : isFull
                      ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                      : 'btn-primary'
                }`}
              >
                {isReg ? '✓ Registered!' : isFull ? 'Event Full' : registering === selected.id ? 'Registering…' : 'Register for This Event →'}
              </button>
              {!user && (
                <p className="text-center text-xs text-gray-500">
                  <Link href={`/login?redirect=/events`} className="text-yellow-400 hover:text-yellow-300">Sign in</Link> to register
                </p>
              )}
            </div>
          );
        })()}
      </Modal>
    </Layout>
  );
}
