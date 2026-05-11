import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/common/Layout';
import { useAuth } from './_app';

interface DashboardData {
  member: {
    level: string;
    rating: number;
    status: string;
    joinedAt: string;
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

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  return (
    <Layout title="Dashboard | Zaid Knights Chess Club">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            Welcome back, <span className="text-yellow-400">{user.name}</span>
          </h1>
          <p className="text-gray-400 mt-1">Here's your chess journey at a glance</p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className="skeleton h-32 rounded-xl" />)}
          </div>
        ) : (
          <>
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'ELO Rating',   value: data?.member?.rating ?? 1200,  icon: '📈', color: 'text-yellow-400' },
                { label: 'Level',        value: data?.member?.level ?? 'BEGINNER', icon: '♟', color: 'text-blue-400' },
                { label: 'Status',       value: data?.member?.status ?? 'PENDING', icon: '✓', color: 'text-green-400' },
                { label: 'Events',       value: data?.registrations?.length ?? 0, icon: '🏆', color: 'text-purple-400' },
              ].map(stat => (
                <div key={stat.label} className="glass p-5 rounded-xl">
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <div className={`text-xl font-bold ${stat.color} capitalize`}>{stat.value}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Registered Events */}
              <div className="glass rounded-xl p-6">
                <h2 className="text-white font-semibold mb-4 flex items-center justify-between">
                  My Events
                  <Link href="/events" className="text-yellow-400 text-sm hover:text-yellow-300">Browse →</Link>
                </h2>
                {data?.registrations?.length === 0 ? (
                  <p className="text-gray-500 text-sm">You haven't registered for any events yet.</p>
                ) : (
                  <div className="space-y-3">
                    {data?.registrations?.map(reg => (
                      <div key={reg.id} className="flex items-start justify-between py-2 border-b border-white/5 last:border-0">
                        <div>
                          <p className="text-white text-sm font-medium">{reg.event.title}</p>
                          <p className="text-gray-500 text-xs mt-0.5">
                            📅 {new Date(reg.event.startDate).toLocaleDateString('en-KE')} · {reg.event.location}
                          </p>
                        </div>
                        <span className={`badge text-xs ml-2 flex-shrink-0 ${reg.status === 'CONFIRMED' ? 'badge-green' : reg.status === 'CANCELLED' ? 'badge-red' : 'badge-gold'}`}>
                          {reg.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Results */}
              <div className="glass rounded-xl p-6">
                <h2 className="text-white font-semibold mb-4">My Results</h2>
                {data?.results?.length === 0 ? (
                  <p className="text-gray-500 text-sm">No results yet. Participate in a tournament to get started!</p>
                ) : (
                  <div className="space-y-3">
                    {data?.results?.map(result => (
                      <div key={result.id} className="py-2 border-b border-white/5 last:border-0">
                        <p className="text-white text-sm font-medium mb-1">{result.event.title}</p>
                        <div className="flex gap-3 text-xs">
                          <span className="text-green-400">W: {result.wins}</span>
                          <span className="text-gray-400">D: {result.draws}</span>
                          <span className="text-red-400">L: {result.losses}</span>
                          <span className="text-yellow-400">Score: {result.score}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Profile Card */}
            <div className="glass-gold mt-6 p-6 rounded-xl">
              <h2 className="text-white font-semibold mb-4">Account Info</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Name</p>
                  <p className="text-white">{user.name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="text-white">{user.email}</p>
                </div>
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
          </>
        )}
      </div>
    </Layout>
  );
}