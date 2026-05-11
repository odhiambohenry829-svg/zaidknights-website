import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/common/Layout';
import { useAuth } from './_app';

interface Membership {
  id: string;
  plan: string;
  tier: string;
  status: string;
  startDate: string;
  endDate: string;
  amount: number;
}

interface DashboardData {
  member: {
    level: string;
    tier: string;
    rating: number;
    status: string;
    joinedAt: string;
    profilePhoto?: string;
    trainingGroup?: string;
    autoRenew: boolean;
    memberships: Membership[];
  } | null;
  registrations: Array<{
    id: string;
    status: string;
    event: { title: string; startDate: string; location: string };
  }>;
  results: Array<{
    id: string;
    score: number;
    wins: number;
    losses: number;
    draws: number;
    event: { title: string };
  }>;
}

function memberStatusColor(status: string) {
  if (status === 'ACTIVE')          return 'badge-green';
  if (status === 'EXPIRED')         return 'badge-red';
  if (status === 'PENDING_PAYMENT') return 'badge-gold';
  if (status === 'SUSPENDED')       return 'badge-red';
  return 'badge-gray';
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data,    setData]    = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [tab,     setTab]     = useState<'overview' | 'events' | 'results' | 'profile'>('overview');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/dashboard');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    fetch('/api/dashboard/stats')
      .then(r => r.json())
      .then(setData)
      .catch(() => setError('Failed to load dashboard data. Please refresh the page.'))
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading || !user) return null;

  const activeMembership = data?.member?.memberships?.find(m => m.status === 'ACTIVE');
  const membershipExpired = data?.member?.status === 'EXPIRED' || data?.member?.status === 'PENDING_PAYMENT';
  const daysUntilExpiry  = activeMembership
    ? Math.max(0, Math.ceil((new Date(activeMembership.endDate).getTime() - Date.now()) / 86400000))
    : 0;
  const renewalWarning = activeMembership && daysUntilExpiry <= 14;

  return (
    <Layout title="Dashboard | Zaid Knights Chess Club">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            {data?.member?.profilePhoto ? (
              <img src={data.member.profilePhoto} alt={user.name} className="w-14 h-14 rounded-full object-cover border-2 border-yellow-500/50" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-yellow-500/20 border-2 border-yellow-500/30 flex items-center justify-center text-yellow-400 text-xl font-bold">
                {user.name?.charAt(0) ?? '?'}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-white">Welcome back, <span className="text-yellow-400">{user.name}</span></h1>
              <p className="text-gray-400 text-sm">
                {data?.member?.tier ? data.member.tier.replace(/_/g, ' ') : 'Member'} · {data?.member?.trainingGroup ?? 'No group assigned'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/renew" className="btn-primary text-sm rounded-xl px-4 py-2">Renew Membership</Link>
            <Link href="/donate" className="btn-secondary text-sm rounded-xl px-4 py-2">Donate</Link>
          </div>
        </div>

        {/* Renewal / expiry warnings */}
        {membershipExpired && (
          <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-red-400 font-semibold">Your membership has expired or needs payment</p>
              <p className="text-gray-400 text-sm mt-0.5">Renew now to continue accessing club features and events.</p>
            </div>
            <Link href="/renew" className="btn-primary text-sm rounded-xl px-4 py-2 whitespace-nowrap">Renew Now →</Link>
          </div>
        )}

        {renewalWarning && !membershipExpired && (
          <div className="mb-6 rounded-xl border border-yellow-500/40 bg-yellow-500/10 px-5 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-yellow-400 font-semibold">Membership expiring in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}</p>
              <p className="text-gray-400 text-sm mt-0.5">Expires on {new Date(activeMembership!.endDate).toLocaleDateString('en-KE')}.</p>
            </div>
            <Link href="/renew" className="btn-secondary text-sm rounded-xl px-4 py-2 whitespace-nowrap">Renew →</Link>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400 text-sm">{error}</div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className="skeleton h-32 rounded-xl" />)}
          </div>
        ) : (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'ELO Rating',  value: data?.member?.rating ?? 1200, icon: '📈', color: 'text-yellow-400' },
                { label: 'Level',       value: (data?.member?.level ?? 'BEGINNER').replace(/_/g, ' '), icon: '♟', color: 'text-blue-400' },
                { label: 'Status',      value: data?.member?.status ?? 'PENDING', icon: '✓', color: memberStatusColor(data?.member?.status ?? '') },
                { label: 'Events',      value: data?.registrations?.length ?? 0, icon: '🏆', color: 'text-purple-400' },
              ].map(stat => (
                <div key={stat.label} className="glass p-5 rounded-xl">
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <div className={`text-xl font-bold ${stat.color} capitalize`}>{stat.value}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-white/10 pb-3">
              {(['overview', 'events', 'results', 'profile'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${tab === t ? 'bg-yellow-500 text-black' : 'glass text-gray-400 hover:text-white'}`}
                >{t}</button>
              ))}
            </div>

            {/* ─── Overview ─── */}
            {tab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Membership Card */}
                <div className="glass-gold rounded-xl p-6">
                  <h2 className="text-white font-semibold mb-4">Membership</h2>
                  {activeMembership ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-400">Tier</span><span className="text-yellow-400 font-semibold capitalize">{activeMembership.tier.replace(/_/g, ' ').toLowerCase()}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Plan</span><span className="text-white capitalize">{activeMembership.plan.toLowerCase()}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Valid Until</span><span className="text-white">{new Date(activeMembership.endDate).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Status</span><span className={`badge text-xs ${memberStatusColor(activeMembership.status)}`}>{activeMembership.status}</span></div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500 text-sm mb-3">No active membership found</p>
                      <Link href="/renew" className="btn-primary text-sm rounded-xl px-4 py-2">Get Membership →</Link>
                    </div>
                  )}
                </div>

                {/* Recent Events */}
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
                            <p className="text-gray-500 text-xs mt-0.5">📅 {new Date(reg.event.startDate).toLocaleDateString('en-KE')} · {reg.event.location}</p>
                          </div>
                          <span className={`badge text-xs ml-2 flex-shrink-0 ${reg.status === 'CONFIRMED' ? 'badge-green' : reg.status === 'CANCELLED' ? 'badge-red' : 'badge-gold'}`}>
                            {reg.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ─── Events ─── */}
            {tab === 'events' && (
              <div className="glass rounded-xl p-6">
                <h2 className="text-white font-semibold mb-4 flex justify-between items-center">
                  Registered Events
                  <Link href="/events" className="text-yellow-400 text-sm hover:text-yellow-300">Find Events →</Link>
                </h2>
                {(data?.registrations?.length ?? 0) === 0 ? (
                  <p className="text-gray-500 text-sm">You haven't registered for any events yet.</p>
                ) : (
                  <div className="space-y-3">
                    {data?.registrations?.map(reg => (
                      <div key={reg.id} className="flex items-start justify-between py-3 border-b border-white/5 last:border-0">
                        <div>
                          <p className="text-white font-medium">{reg.event.title}</p>
                          <p className="text-gray-500 text-xs mt-0.5">📅 {new Date(reg.event.startDate).toLocaleDateString('en-KE')} · 📍 {reg.event.location}</p>
                        </div>
                        <span className={`badge text-xs ml-3 flex-shrink-0 ${reg.status === 'CONFIRMED' ? 'badge-green' : reg.status === 'CANCELLED' ? 'badge-red' : 'badge-gold'}`}>
                          {reg.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── Results ─── */}
            {tab === 'results' && (
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
            )}

            {/* ─── Profile ─── */}
            {tab === 'profile' && (
              <div className="space-y-6">
                <div className="glass-gold p-6 rounded-xl">
                  <h2 className="text-white font-semibold mb-4">Account Info</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div><p className="text-gray-500">Name</p><p className="text-white">{user.name}</p></div>
                    <div><p className="text-gray-500">Email</p><p className="text-white">{user.email}</p></div>
                    <div>
                      <p className="text-gray-500">Member Since</p>
                      <p className="text-white">
                        {data?.member?.joinedAt ? new Date(data.member.joinedAt).toLocaleDateString('en-KE', { month: 'long', year: 'numeric' }) : '—'}
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
                            <p className="text-white font-medium capitalize">{m.tier.replace(/_/g, ' ').toLowerCase()} · {m.plan.toLowerCase()}</p>
                            <p className="text-gray-500 text-xs mt-0.5">{new Date(m.startDate).toLocaleDateString('en-KE')} → {new Date(m.endDate).toLocaleDateString('en-KE')}</p>
                          </div>
                          <div className="text-right">
                            <span className={`badge text-xs ${memberStatusColor(m.status)}`}>{m.status}</span>
                            <p className="text-gray-500 text-xs mt-1">KES {m.amount.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <Link href="/renew" className="mt-4 inline-block btn-primary text-sm rounded-xl px-4 py-2">Renew / Upgrade →</Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
