import { useEffect, useState } from 'react';
import Layout from '../components/common/Layout';

interface RankedMember {
  id: string;
  rating: number;
  level: string;
  wins: number;
  losses: number;
  draws: number;
  user: { name: string; email: string };
}

const LEVEL_BADGE: Record<string, string> = {
  BEGINNER: 'badge-gray',
  ADVANCED: 'badge-gold',
  MASTER:   'badge-green',
};

const MEDAL: Record<number, string> = { 0: '🥇', 1: '🥈', 2: '🥉' };

export default function RankingsPage() {
  const [members, setMembers] = useState<RankedMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/members')
      .then(r => r.json())
      .then(data => setMembers(data.members || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = members
    .filter(m => m.user.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.rating - a.rating);

  return (
    <Layout title="Rankings | Zaid Knights Chess Club" description="ELO ratings and win/loss records for Zaid Knights Chess Club members.">
      {/* Header */}
      <section className="py-16 border-b border-white/10 chess-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold text-white mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            Club <span className="gold-gradient">Rankings</span>
          </h1>
          <p className="text-gray-400">ELO-based leaderboard updated after each tournament</p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search player..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input max-w-sm"
            />
          </div>

          {/* Table */}
          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)}
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Player</th>
                    <th>Level</th>
                    <th>Rating</th>
                    <th>W</th>
                    <th>D</th>
                    <th>L</th>
                    <th>Score %</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((member, idx) => {
                    const total = member.wins + member.losses + member.draws;
                    const score = total > 0
                      ? (((member.wins + member.draws * 0.5) / total) * 100).toFixed(1)
                      : '—';

                    return (
                      <tr key={member.id}>
                        <td>
                          <span className="font-bold">
                            {MEDAL[idx] ?? idx + 1}
                          </span>
                        </td>
                        <td>
                          <span className="text-white font-medium">{member.user.name}</span>
                        </td>
                        <td>
                          <span className={`badge capitalize text-xs ${LEVEL_BADGE[member.level]}`}>
                            {member.level.toLowerCase()}
                          </span>
                        </td>
                        <td>
                          <span className="text-yellow-400 font-bold tabular-nums">{member.rating}</span>
                        </td>
                        <td><span className="text-green-400">{member.wins}</span></td>
                        <td><span className="text-gray-400">{member.draws}</span></td>
                        <td><span className="text-red-400">{member.losses}</span></td>
                        <td><span className="text-gray-300">{score}{score !== '—' ? '%' : ''}</span></td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-gray-500">No players found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}