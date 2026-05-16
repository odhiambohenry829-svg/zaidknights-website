import { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import Link from 'next/link';

interface Member { id: string; user: { name: string; id: string }; rating: number; level: string; status: string }
interface OnlineRating { userId: string; rating: number; games: number; wins: number; losses: number; draws: number; user: { name: string; member: { level: string } | null } }

const LEVEL_BADGE: Record<string, string> = {
  BEGINNER: 'bg-green-500/20 text-green-400',
  INTERMEDIATE: 'bg-blue-500/20 text-blue-400',
  ADVANCED: 'bg-purple-500/20 text-purple-400',
  COMPETITIVE_SQUAD: 'bg-yellow-500/20 text-yellow-400',
};

const LEVEL_SHORT: Record<string, string> = {
  BEGINNER: 'Beg', INTERMEDIATE: 'Int', ADVANCED: 'Adv', COMPETITIVE_SQUAD: 'Elite',
};

export default function LeaderboardPage() {
  const [tab, setTab] = useState<'club' | 'bullet' | 'blitz' | 'daily'>('club');
  const [members, setMembers] = useState<Member[]>([]);
  const [onlineRatings, setOnlineRatings] = useState<OnlineRating[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (tab === 'club') {
      fetch('/api/members?status=ACTIVE')
        .then(r => r.json())
        .then(d => { setMembers(d.members || []); setLoading(false); });
    } else {
      const fmt = tab.toUpperCase();
      fetch(`/api/online-ratings?format=${fmt}&limit=50`)
        .then(r => r.json())
        .then(d => { setOnlineRatings(d.ratings || []); setLoading(false); });
    }
  }, [tab]);

  const TABS = [
    { key: 'club', label: '🏛️ Club ELO', desc: 'Official over-the-board ratings' },
    { key: 'bullet', label: '⚡ Bullet', desc: '1–2 minute games' },
    { key: 'blitz', label: '🔥 Blitz', desc: '3–15 minute games' },
    { key: 'daily', label: '📅 Daily', desc: 'Correspondence chess' },
  ] as const;

  return (
    <Layout title="Leaderboard | Zaid Knights" description="Club ELO and online chess ratings for Zaid Knights members.">
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-yellow-400 text-sm uppercase tracking-widest mb-2">Rankings</p>
            <h1 className="text-4xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Leaderboard</h1>
            <p className="text-gray-400 mt-2">Track club and online ratings for all Zaid Knights members</p>
          </div>

          {/* Top 3 spotlight (club tab only) */}
          {tab === 'club' && members.length >= 3 && (
            <div className="grid grid-cols-3 gap-4 mb-10">
              {[members[1], members[0], members[2]].map((m, pos) => {
                const rank = [2, 1, 3][pos];
                return (
                  <div key={m.user.id} className={`glass p-5 rounded-xl text-center ${rank === 1 ? 'ring-2 ring-yellow-500/50' : ''}`}>
                    <div className={`text-3xl mb-2 ${rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-gray-300' : 'text-orange-400'}`}>
                      {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
                    </div>
                    <p className="text-white font-semibold text-sm">{m.user?.name}</p>
                    <p className="text-yellow-400 font-bold text-xl mt-1">{m.rating}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${LEVEL_BADGE[m.level]}`}>{LEVEL_SHORT[m.level]}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab switcher */}
          <div className="flex flex-wrap gap-2 mb-8">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium border transition-all ${tab === t.key ? 'bg-yellow-500 text-black border-yellow-400' : 'border-white/10 text-gray-300 hover:border-yellow-500/30'}`}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="glass rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-white/10">
                <tr>
                  <th className="text-left py-3 px-4 text-gray-400 text-xs uppercase tracking-widest w-12">#</th>
                  <th className="text-left py-3 px-4 text-gray-400 text-xs uppercase tracking-widest">Player</th>
                  <th className="text-right py-3 px-4 text-gray-400 text-xs uppercase tracking-widest">Rating</th>
                  {tab !== 'club' && (
                    <>
                      <th className="text-right py-3 px-4 text-gray-400 text-xs uppercase tracking-widest hidden md:table-cell">W</th>
                      <th className="text-right py-3 px-4 text-gray-400 text-xs uppercase tracking-widest hidden md:table-cell">L</th>
                      <th className="text-right py-3 px-4 text-gray-400 text-xs uppercase tracking-widest hidden md:table-cell">D</th>
                      <th className="text-right py-3 px-4 text-gray-400 text-xs uppercase tracking-widest hidden md:table-cell">Games</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(10)].map((_, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="py-3 px-4"><div className="h-4 w-4 bg-white/10 rounded animate-pulse" /></td>
                      <td className="py-3 px-4"><div className="h-4 w-32 bg-white/10 rounded animate-pulse" /></td>
                      <td className="py-3 px-4"><div className="h-4 w-12 bg-white/10 rounded animate-pulse ml-auto" /></td>
                    </tr>
                  ))
                ) : tab === 'club' ? (
                  members.map((m, i) => (
                    <tr key={m.user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4">
                        <span className={`font-bold text-sm ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-orange-400' : 'text-gray-500'}`}>
                          {i === 0 ? '♛' : i + 1}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{m.user?.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full hidden sm:inline ${LEVEL_BADGE[m.level]}`}>{LEVEL_SHORT[m.level]}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-yellow-400 font-bold">{m.rating}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  onlineRatings.map((r, i) => (
                    <tr key={r.userId} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4">
                        <span className={`font-bold text-sm ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-orange-400' : 'text-gray-500'}`}>
                          {i === 0 ? '♛' : i + 1}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{r.user?.name}</span>
                          {r.user?.member?.level && (
                            <span className={`text-xs px-2 py-0.5 rounded-full hidden sm:inline ${LEVEL_BADGE[r.user.member.level]}`}>{LEVEL_SHORT[r.user.member.level]}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-yellow-400 font-bold">{r.rating}</span>
                      </td>
                      <td className="py-3 px-4 text-right hidden md:table-cell text-green-400 text-sm">{r.wins}</td>
                      <td className="py-3 px-4 text-right hidden md:table-cell text-red-400 text-sm">{r.losses}</td>
                      <td className="py-3 px-4 text-right hidden md:table-cell text-gray-400 text-sm">{r.draws}</td>
                      <td className="py-3 px-4 text-right hidden md:table-cell text-gray-400 text-sm">{r.games}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {!loading && (tab === 'club' ? members : onlineRatings).length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p>No ratings yet for this format.</p>
                {tab !== 'club' && <Link href="/play" className="text-yellow-400 hover:underline text-sm mt-2 block">Play some games to appear here →</Link>}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
