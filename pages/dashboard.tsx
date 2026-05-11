import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/common/Layout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import StatusBanner from '../components/dashboard/StatusBanner';
import RenewalBanner from '../components/dashboard/RenewalBanner';
import EventCountdown from '../components/dashboard/EventCountdown';
import MemberStats from '../components/dashboard/MemberStats';
import OnboardingFlow from '../components/onboarding/OnboardingFlow';
import { useAuth } from './_app';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Membership {
  id:        string;
  plan:      string;
  tier:      string;
  status:    string;
  startDate: string;
  endDate:   string;
  amount:    number;
}

interface UpcomingEvent {
  id:       string;
  title:    string;
  startDate: string;
  endDate:  string;
  location: string;
  type:     string;
  capacity: number;
  _count:   { registrations: number };
}

interface DashboardData {
  member: {
    level:            string;
    tier:             string;
    rating:           number;
    status:           string;
    joinedAt:         string;
    profilePhoto:     string | null;
    trainingGroup:    string | null;
    emergencyContact: string | null;
    autoRenew:        boolean;
    memberships:      Membership[];
  } | null;
  registrations: Array<{
    id:     string;
    status: string;
    event:  { title: string; startDate: string; location: string };
  }>;
  results: Array<{
    id:     string;
    score:  number;
    wins:   number;
    losses: number;
    draws:  number;
    event:  { title: string };
  }>;
  upcomingEvents:  UpcomingEvent[];
  rankingPosition: number;
  attendedCount:   number;
  attendanceTotal: number;
}

// ── State detection ──────────────────────────────────────────────────────────
type MemberState = 'A' | 'B' | 'C' | 'D' | 'E' | 'LOADING';

function deriveMemberState(data: DashboardData | null): MemberState {
  if (!data?.member) return 'LOADING';
  const { status, level } = data.member;
  if (status === 'PENDING')                                                    return 'A';
  if (status === 'SUSPENDED')                                                  return 'E';
  if (status === 'EXPIRED' || status === 'PENDING_PAYMENT')                   return 'D';
  if (status === 'ACTIVE' && (level === 'ADVANCED' || level === 'COMPETITIVE_SQUAD')) return 'C';
  return 'B';
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function getActiveMembership(data: DashboardData | null) {
  return data?.member?.memberships?.find(m => m.status === 'ACTIVE') ?? null;
}

function totalResults(data: DashboardData | null) {
  return (data?.results ?? []).reduce(
    (acc, r) => ({ wins: acc.wins + r.wins, losses: acc.losses + r.losses, draws: acc.draws + r.draws }),
    { wins: 0, losses: 0, draws: 0 },
  );
}

function badgeClass(status: string) {
  if (status === 'CONFIRMED') return 'badge-green';
  if (status === 'CANCELLED') return 'badge-red';
  return 'badge-gold';
}

// ── Locked overlay (State D) ─────────────────────────────────────────────────
function LockedOverlay() {
  return (
    <div className="absolute inset-0 bg-[#0A0A0F]/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center z-10">
      <span className="text-4xl mb-2">🔒</span>
      <p className="text-gray-400 text-sm">Renew to unlock</p>
    </div>
  );
}

// ── Dashboard inner (requires user in scope) ──────────────────────────────────
function DashboardContent() {
  const { user } = useAuth();
  const router   = useRouter();
  const showOnboarding = router.query.onboarding === 'true';

  const [data,    setData]    = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [tab,     setTab]     = useState<'overview' | 'events' | 'results' | 'profile'>('overview');

  useEffect(() => {
    if (!user) return;
    fetch('/api/dashboard/stats')
      .then(r => r.json())
      .then(setData)
      .catch(() => setError('Failed to load dashboard data. Please refresh the page.'))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  const memberState      = loading ? 'LOADING' : deriveMemberState(data);
  const activeMembership = getActiveMembership(data);
  const totals           = totalResults(data);
  const isLocked         = memberState === 'D';
  const isSuspended      = memberState === 'E';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Status banners */}
      {!loading && data?.member && (
        <StatusBanner
          status={data.member.status}
          expiredAt={activeMembership?.endDate ?? null}
        />
      )}
      {!loading && activeMembership && memberState !== 'D' && (
        <RenewalBanner endDate={activeMembership.endDate} />
      )}
      {error && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400 text-sm">{error}</div>
      )}

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          {data?.member?.profilePhoto ? (
            <img
              src={data.member.profilePhoto}
              alt={user.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-yellow-500/50"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-yellow-500/20 border-2 border-yellow-500/30 flex items-center justify-center text-yellow-400 text-xl font-bold flex-shrink-0">
              {user.name?.charAt(0) ?? '?'}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
              {memberState === 'A' ? '👋 Welcome, ' : 'Welcome back, '}
              <span className="text-yellow-400">{user.name}</span>
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {data?.member?.tier
                ? data.member.tier.replace(/_/g, ' ')
                : 'Member'}
              {data?.member?.trainingGroup ? ` · ${data.member.trainingGroup} Group` : ''}
              {data?.member?.status && (
                <span className={`ml-2 badge text-xs ${
                  data.member.status === 'ACTIVE'    ? 'badge-green' :
                  data.member.status === 'PENDING'   ? 'badge-gold'  :
                  data.member.status === 'EXPIRED'   ? 'badge-red'   :
                  data.member.status === 'SUSPENDED' ? 'badge-red'   : 'badge-gray'
                }`}>
                  {data.member.status}
                </span>
              )}
            </p>
          </div>
        </div>

        {!isSuspended && (
          <div className="flex gap-2 flex-wrap">
            {!isLocked && <Link href="/renew" className="btn-primary text-sm rounded-xl px-4 py-2">Renew</Link>}
            {isLocked   && <Link href="/renew" className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm rounded-xl px-5 py-2">Renew Now →</Link>}
            <Link href="/donate" className="btn-secondary text-sm rounded-xl px-4 py-2">Donate</Link>
          </div>
        )}
      </div>

      {/* ── Stats row ──────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-28 rounded-xl" />)}
        </div>
      ) : data?.member && (
        <div className="mb-8">
          <MemberStats
            rating={data.member.rating}
            level={data.member.level}
            status={data.member.status}
            rankingPosition={data.rankingPosition}
            wins={totals.wins}
            losses={totals.losses}
            draws={totals.draws}
            attendedCount={data.attendedCount}
            attendanceTotal={data.attendanceTotal}
            eventsCount={data.registrations.length}
            showFull={memberState === 'C'}
          />
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          STATE A — Pending / Onboarding
          ─────────────────────────────────────────────────────────────────── */}
      {memberState === 'A' && !loading && (
        <div className="space-y-8">
          {/* Onboarding checklist banner */}
          {(showOnboarding || true) && data?.member && (
            <OnboardingFlow
              userId={user.id}
              userName={user.name}
              memberTier={data.member.tier}
              upcomingEvents={data.upcomingEvents}
            />
          )}

          {/* Upcoming events preview */}
          {(data?.upcomingEvents?.length ?? 0) > 0 && (
            <div>
              <h2 className="text-white font-semibold mb-4 flex items-center justify-between">
                Upcoming Events
                <Link href="/events" className="text-yellow-400 text-sm hover:text-yellow-300">View all →</Link>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data!.upcomingEvents.slice(0, 2).map(ev => (
                  <EventCountdown key={ev.id} event={ev} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          STATE B — Active Beginner / Intermediate
          ─────────────────────────────────────────────────────────────────── */}
      {memberState === 'B' && !loading && (
        <div className="space-y-6">
          {/* Next event countdown */}
          {(data?.upcomingEvents?.length ?? 0) > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data!.upcomingEvents.slice(0, 2).map(ev => (
                <EventCountdown key={ev.id} event={ev} />
              ))}
            </div>
          )}

          {/* Upgrade prompt */}
          <div className="glass-gold rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-yellow-400 font-semibold">Ready to level up?</p>
              <p className="text-gray-400 text-sm mt-0.5">
                Upgrade to Advanced or Competitive Squad to unlock coaching sessions and national tournaments.
              </p>
            </div>
            <Link href="/membership" className="flex-shrink-0 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm px-5 py-2.5 rounded-lg transition-all whitespace-nowrap">
              Upgrade →
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-white/10 pb-3">
            {(['overview', 'events', 'results', 'profile'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${tab === t ? 'bg-yellow-500 text-black' : 'glass text-gray-400 hover:text-white'}`}
              >{t}</button>
            ))}
          </div>

          {renderTabContent(tab, user, data, activeMembership, false)}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          STATE C — Active Advanced / Competitive Squad
          ─────────────────────────────────────────────────────────────────── */}
      {memberState === 'C' && !loading && (
        <div className="space-y-6">
          {/* Event countdowns */}
          {(data?.upcomingEvents?.length ?? 0) > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data!.upcomingEvents.slice(0, 3).map(ev => (
                <EventCountdown key={ev.id} event={ev} />
              ))}
            </div>
          )}

          {/* Coaching schedule placeholder */}
          <div className="glass rounded-xl p-6">
            <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span>🎓</span> Coaching Sessions
            </h2>
            <p className="text-gray-400 text-sm">
              {data?.member?.trainingGroup
                ? `You are assigned to the ${data.member.trainingGroup} group.`
                : 'No training group assigned yet. Contact admin to be scheduled.'}
            </p>
            {!data?.member?.trainingGroup && (
              <a href="mailto:info@zaidknights.org" className="mt-3 inline-block text-yellow-400 text-sm hover:text-yellow-300 transition-colors">
                Contact admin →
              </a>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-white/10 pb-3 overflow-x-auto">
            {(['overview', 'events', 'results', 'profile'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-all ${tab === t ? 'bg-yellow-500 text-black' : 'glass text-gray-400 hover:text-white'}`}
              >{t}</button>
            ))}
          </div>

          {renderTabContent(tab, user, data, activeMembership, true)}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          STATE D — Expired
          ─────────────────────────────────────────────────────────────────── */}
      {memberState === 'D' && !loading && (
        <div className="space-y-6">
          <div className="relative">
            <LockedOverlay />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pointer-events-none select-none blur-sm opacity-40">
              <div className="glass rounded-xl p-6 h-40" />
              <div className="glass rounded-xl p-6 h-40" />
            </div>
          </div>
          <div className="glass-gold rounded-xl p-8 text-center">
            <span className="text-5xl">♟</span>
            <h2 className="text-white font-bold text-xl mt-4 mb-2">Your game is paused</h2>
            <p className="text-gray-400 mb-6">Renew your membership to regain full access to events, rankings, and coaching.</p>
            <Link href="/renew" className="inline-block bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-10 py-3 rounded-xl transition-all shadow-lg shadow-yellow-500/30">
              Renew Membership →
            </Link>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          STATE E — Suspended
          ─────────────────────────────────────────────────────────────────── */}
      {memberState === 'E' && !loading && (
        <div className="glass rounded-xl p-10 text-center border border-red-500/30">
          <span className="text-5xl">⚠️</span>
          <h2 className="text-white font-bold text-xl mt-4 mb-2">Account Suspended</h2>
          <p className="text-gray-400 mb-4 max-w-md mx-auto">
            Your account has been suspended by an administrator. Please reach out to us to resolve this issue.
          </p>
          <a
            href="mailto:info@zaidknights.org"
            className="inline-block border border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 px-8 py-3 rounded-xl transition-all"
          >
            Contact Us: info@zaidknights.org
          </a>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="skeleton h-64 rounded-xl" />
          <div className="skeleton h-64 rounded-xl" />
        </div>
      )}
    </div>
  );
}

// ── Shared tab content (used by states B and C) ───────────────────────────────
function renderTabContent(
  tab:              'overview' | 'events' | 'results' | 'profile',
  user:             { name: string; email: string },
  data:             DashboardData | null,
  activeMembership: Membership | null,
  isAdvanced:       boolean,
) {
  const totals = totalResults(data);

  if (tab === 'overview') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Membership card */}
        <div className="glass-gold rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4">Membership</h2>
          {activeMembership ? (
            <div className="space-y-2 text-sm">
              <Row label="Tier"        value={activeMembership.tier.replace(/_/g, ' ').toLowerCase()} gold />
              <Row label="Plan"        value={activeMembership.plan.toLowerCase()} />
              <Row label="Valid Until" value={new Date(activeMembership.endDate).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })} />
              <Row label="Status"      value={activeMembership.status} badge />
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm mb-3">No active membership</p>
              <Link href="/renew" className="btn-primary text-sm rounded-xl px-4 py-2">Get Membership →</Link>
            </div>
          )}
        </div>

        {/* Recent events */}
        <div className="glass rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4 flex items-center justify-between">
            My Events
            <Link href="/events" className="text-yellow-400 text-sm hover:text-yellow-300">Browse →</Link>
          </h2>
          {(data?.registrations?.length ?? 0) === 0 ? (
            <p className="text-gray-500 text-sm">No events registered yet.</p>
          ) : (
            <div className="space-y-3">
              {data?.registrations?.slice(0, 3).map(reg => (
                <div key={reg.id} className="flex items-start justify-between py-2 border-b border-white/5 last:border-0">
                  <div>
                    <p className="text-white text-sm font-medium">{reg.event.title}</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      📅 {new Date(reg.event.startDate).toLocaleDateString('en-KE')} · {reg.event.location}
                    </p>
                  </div>
                  <span className={`badge text-xs ml-2 flex-shrink-0 ${badgeClass(reg.status)}`}>{reg.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats summary (advanced only) */}
        {isAdvanced && (
          <div className="glass rounded-xl p-6 lg:col-span-2">
            <h2 className="text-white font-semibold mb-4">Performance Summary</h2>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-green-400">{totals.wins}</div>
                <div className="text-gray-500 text-xs mt-1">Wins</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-400">{totals.draws}</div>
                <div className="text-gray-500 text-xs mt-1">Draws</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-red-400">{totals.losses}</div>
                <div className="text-gray-500 text-xs mt-1">Losses</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (tab === 'events') {
    return (
      <div className="glass rounded-xl p-6">
        <h2 className="text-white font-semibold mb-4 flex justify-between items-center">
          Registered Events
          <Link href="/events" className="text-yellow-400 text-sm hover:text-yellow-300">Find Events →</Link>
        </h2>
        {(data?.registrations?.length ?? 0) === 0 ? (
          <p className="text-gray-500 text-sm">You haven&apos;t registered for any events yet.</p>
        ) : (
          <div className="space-y-3">
            {data?.registrations?.map(reg => (
              <div key={reg.id} className="flex items-start justify-between py-3 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-white font-medium">{reg.event.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    📅 {new Date(reg.event.startDate).toLocaleDateString('en-KE')} · 📍 {reg.event.location}
                  </p>
                </div>
                <span className={`badge text-xs ml-3 flex-shrink-0 ${badgeClass(reg.status)}`}>{reg.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (tab === 'results') {
    return (
      <div className="glass rounded-xl p-6">
        <h2 className="text-white font-semibold mb-4">Tournament Results</h2>
        {(data?.results?.length ?? 0) === 0 ? (
          <p className="text-gray-500 text-sm">No results yet. Participate in a tournament to get started!</p>
        ) : (
          <div className="space-y-3">
            {data?.results?.map(result => (
              <div key={result.id} className="py-3 border-b border-white/5 last:border-0">
                <p className="text-white font-medium mb-2">{result.event.title}</p>
                <div className="flex gap-4 text-sm">
                  <span className="text-green-400">W: {result.wins}</span>
                  <span className="text-gray-400">D: {result.draws}</span>
                  <span className="text-red-400">L: {result.losses}</span>
                  <span className="text-yellow-400 font-semibold">Score: {result.score}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // profile tab
  return (
    <div className="space-y-6">
      <div className="glass-gold p-6 rounded-xl">
        <h2 className="text-white font-semibold mb-4">Account Info</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div><p className="text-gray-500">Name</p><p className="text-white">{user.name}</p></div>
          <div><p className="text-gray-500">Email</p><p className="text-white">{user.email}</p></div>
          <div>
            <p className="text-gray-500">Member Since</p>
            <p className="text-white">
              {data?.member?.joinedAt
                ? new Date(data.member.joinedAt).toLocaleDateString('en-KE', { month: 'long', year: 'numeric' })
                : '—'}
            </p>
          </div>
        </div>
      </div>

      <div className="glass p-6 rounded-xl">
        <h2 className="text-white font-semibold mb-4">Chess Profile</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div><p className="text-gray-500">ELO Rating</p><p className="text-yellow-400 font-bold text-lg">{data?.member?.rating ?? 1200}</p></div>
          <div><p className="text-gray-500">Level</p><p className="text-white capitalize">{(data?.member?.level ?? '—').replace(/_/g, ' ').toLowerCase()}</p></div>
          <div><p className="text-gray-500">Tier</p><p className="text-white capitalize">{(data?.member?.tier ?? '—').replace(/_/g, ' ').toLowerCase()}</p></div>
          <div><p className="text-gray-500">Training Group</p><p className="text-white">{data?.member?.trainingGroup ?? 'Not assigned'}</p></div>
        </div>
        {data?.member?.emergencyContact && (
          <div className="mt-4 pt-4 border-t border-white/10 text-sm">
            <p className="text-gray-500">Emergency Contact</p>
            <p className="text-white mt-0.5">{data.member.emergencyContact}</p>
          </div>
        )}
      </div>

      <div className="glass p-6 rounded-xl">
        <h2 className="text-white font-semibold mb-4">Membership History</h2>
        {(data?.member?.memberships?.length ?? 0) === 0 ? (
          <p className="text-gray-500 text-sm">No membership records.</p>
        ) : (
          <div className="space-y-3">
            {data?.member?.memberships?.map(m => (
              <div key={m.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 text-sm">
                <div>
                  <p className="text-white font-medium capitalize">
                    {m.tier.replace(/_/g, ' ').toLowerCase()} · {m.plan.toLowerCase()}
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {new Date(m.startDate).toLocaleDateString('en-KE')} → {new Date(m.endDate).toLocaleDateString('en-KE')}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`badge text-xs ${m.status === 'ACTIVE' ? 'badge-green' : m.status === 'EXPIRED' ? 'badge-red' : 'badge-gold'}`}>
                    {m.status}
                  </span>
                  <p className="text-gray-500 text-xs mt-1">KES {m.amount.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        <Link href="/renew" className="mt-4 inline-block btn-primary text-sm rounded-xl px-4 py-2">Renew / Upgrade →</Link>
      </div>
    </div>
  );
}

// ── Small helper component ────────────────────────────────────────────────────
function Row({ label, value, gold, badge }: { label: string; value: string; gold?: boolean; badge?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-400">{label}</span>
      {badge ? (
        <span className={`badge text-xs ${value === 'ACTIVE' ? 'badge-green' : value === 'EXPIRED' ? 'badge-red' : 'badge-gold'}`}>
          {value}
        </span>
      ) : (
        <span className={`capitalize ${gold ? 'text-yellow-400 font-semibold' : 'text-white'}`}>{value}</span>
      )}
    </div>
  );
}

// ── Page export ───────────────────────────────────────────────────────────────
export default function DashboardPage() {
  return (
    <Layout title="Dashboard | Zaid Knights Chess Club">
      <ProtectedRoute allowedRoles={['MEMBER', 'COACH', 'ADMIN', 'ORG_ADMIN', 'GUEST']}>
        <DashboardContent />
      </ProtectedRoute>
    </Layout>
  );
}
