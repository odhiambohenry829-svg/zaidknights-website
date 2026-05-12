import { useEffect, useState, useMemo, useCallback } from 'react';
import Layout from '../components/common/Layout';
import Modal from '../components/ui/Modal';
import SkeletonCard from '../components/ui/SkeletonCard';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';
import Accordion from '../components/ui/Accordion';
import { useAuth } from './_app';

interface RankedMember {
  id:          string;
  rank:        number;
  rating:      number;
  level:       string;
  status:      string;
  wins:        number;
  losses:      number;
  draws:       number;
  total:       number;
  score:       number;
  ratingDelta: number;
  user:        { name: string | null; email: string };
}

type SortKey  = 'rank' | 'rating' | 'wins' | 'score';
type SortDir  = 'asc' | 'desc';
type LevelFilter = 'all' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'COMPETITIVE_SQUAD';

const LEVEL_LABELS: Record<string, string> = {
  BEGINNER:          'Beginner',
  INTERMEDIATE:      'Intermediate',
  ADVANCED:          'Advanced',
  COMPETITIVE_SQUAD: 'Competitive',
};

const LEVEL_COLORS: Record<string, 'gray' | 'blue' | 'gold' | 'purple'> = {
  BEGINNER:          'gray',
  INTERMEDIATE:      'blue',
  ADVANCED:          'gold',
  COMPETITIVE_SQUAD: 'purple',
};

const ELO_FAQS = [
  { question: 'How is ELO calculated?', answer: 'ELO is a relative rating system. When you win, you gain points from your opponent proportional to how highly they were rated. If you beat a stronger player, you gain more. Draws award half-points. New members start at 1200.' },
  { question: 'When does my rating update?', answer: 'Ratings are recalculated and published within 48 hours after each official club tournament concludes.' },
  { question: 'What does the trend arrow (↑↓) show?', answer: 'The arrow shows whether your rating has gone up or down compared to your rating 30 days ago. Green ↑ = improved, Red ↓ = declined, Gray = no change.' },
  { question: 'Can I dispute a rating calculation?', answer: 'Yes — contact your club administrator or email info@zaidknights.org with your member ID and the event in question. We review all disputes within 7 days.' },
];

export default function RankingsPage() {
  const { user } = useAuth();

  const [members,   setMembers]   = useState<RankedMember[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [updatedAt, setUpdatedAt] = useState('');
  const [search,    setSearch]    = useState('');
  const [level,     setLevel]     = useState<LevelFilter>('all');
  const [sortKey,   setSortKey]   = useState<SortKey>('rank');
  const [sortDir,   setSortDir]   = useState<SortDir>('asc');
  const [selected,  setSelected]  = useState<RankedMember | null>(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res  = await fetch('/api/members');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load rankings');
      setMembers(data.members ?? []);
      setUpdatedAt(new Date().toLocaleString('en-KE'));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load rankings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir(key === 'rank' ? 'asc' : 'desc');
    }
  };

  const filtered = useMemo(() => {
    let rows = [...members];
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(m => (m.user.name ?? '').toLowerCase().includes(q));
    }
    if (level !== 'all') {
      rows = rows.filter(m => m.level === level);
    }
    rows.sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      return sortDir === 'asc' ? av - bv : bv - av;
    });
    return rows;
  }, [members, search, level, sortKey, sortDir]);

  const top3    = members.slice(0, 3);
  const myEntry = user ? members.find(m => m.user.email === user.email) : null;

  const LEVEL_FILTERS: LevelFilter[] = ['all', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'COMPETITIVE_SQUAD'];

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <span className="text-gray-600 ml-1">↕</span>;
    return <span className="text-yellow-400 ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  }

  return (
    <Layout title="Rankings | Zaid Knights Chess Club">
      {/* Hero */}
      <section className="py-20 px-4 chess-pattern">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Club <span className="gold-gradient">Rankings</span>
          </h1>
          <p className="text-gray-400 text-lg">ELO leaderboard for all active Zaid Knights members</p>
          {updatedAt && <p className="text-gray-600 text-xs mt-2">Last updated: {updatedAt}</p>}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* My Ranking Card */}
        {myEntry && (
          <div className="glass-gold p-5 rounded-xl mb-10 flex flex-wrap items-center gap-6">
            <div>
              <p className="text-gray-400 text-xs mb-1">Your Ranking</p>
              <p className="text-4xl font-bold text-yellow-400">#{myEntry.rank}</p>
            </div>
            <div className="w-px h-12 bg-white/10 hidden sm:block" />
            <div>
              <p className="text-gray-400 text-xs mb-1">Rating</p>
              <p className="text-2xl font-bold text-white">{myEntry.rating}</p>
            </div>
            <div className="w-px h-12 bg-white/10 hidden sm:block" />
            <div>
              <p className="text-gray-400 text-xs mb-1">30-day change</p>
              <p className={`text-xl font-bold ${myEntry.ratingDelta > 0 ? 'text-green-400' : myEntry.ratingDelta < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                {myEntry.ratingDelta > 0 ? `+${myEntry.ratingDelta}` : myEntry.ratingDelta}
              </p>
            </div>
            <div className="w-px h-12 bg-white/10 hidden sm:block" />
            <div>
              <p className="text-gray-400 text-xs mb-1">Record</p>
              <p className="text-white font-semibold">{myEntry.wins}W · {myEntry.draws}D · {myEntry.losses}L</p>
            </div>
            <div className="ml-auto">
              <Badge variant={LEVEL_COLORS[myEntry.level] ?? 'gray'}>
                {LEVEL_LABELS[myEntry.level] ?? myEntry.level}
              </Badge>
            </div>
          </div>
        )}

        {/* Top 3 Podium */}
        {!loading && top3.length >= 3 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold text-white text-center mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
              Top Players
            </h2>
            <div className="flex items-end justify-center gap-4">
              {/* 2nd */}
              <div className="flex flex-col items-center w-28">
                <div className="w-16 h-16 rounded-full bg-gray-400/20 border-2 border-gray-400/40 flex items-center justify-center text-2xl font-bold text-gray-300 mb-2">
                  {(top3[1]?.user.name ?? 'P2')[0]}
                </div>
                <p className="text-white text-xs font-medium text-center mb-1 truncate w-full text-center">
                  {top3[1]?.user.name ?? '—'}
                </p>
                <p className="text-gray-300 text-sm font-bold">{top3[1]?.rating}</p>
                <div className="w-full h-16 bg-gray-400/20 rounded-t-lg flex items-center justify-center mt-2">
                  <span className="text-3xl">🥈</span>
                </div>
              </div>
              {/* 1st */}
              <div className="flex flex-col items-center w-32">
                <div className="w-20 h-20 rounded-full bg-yellow-500/20 border-2 border-yellow-500/50 flex items-center justify-center text-3xl font-bold text-yellow-400 mb-2 shadow-lg shadow-yellow-500/20">
                  {(top3[0]?.user.name ?? 'P1')[0]}
                </div>
                <p className="text-white text-sm font-bold text-center mb-1 truncate w-full text-center">
                  {top3[0]?.user.name ?? '—'}
                </p>
                <p className="text-yellow-400 text-lg font-bold">{top3[0]?.rating}</p>
                <div className="w-full h-24 bg-yellow-500/20 rounded-t-lg flex items-center justify-center mt-2">
                  <span className="text-4xl">🥇</span>
                </div>
              </div>
              {/* 3rd */}
              <div className="flex flex-col items-center w-28">
                <div className="w-14 h-14 rounded-full bg-orange-400/20 border-2 border-orange-400/40 flex items-center justify-center text-xl font-bold text-orange-300 mb-2">
                  {(top3[2]?.user.name ?? 'P3')[0]}
                </div>
                <p className="text-white text-xs font-medium text-center mb-1 truncate w-full text-center">
                  {top3[2]?.user.name ?? '—'}
                </p>
                <p className="text-orange-300 text-sm font-bold">{top3[2]?.rating}</p>
                <div className="w-full h-10 bg-orange-400/20 rounded-t-lg flex items-center justify-center mt-2">
                  <span className="text-2xl">🥉</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="search"
            placeholder="Search by name…"
            className="input flex-1"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="flex gap-2 overflow-x-auto flex-shrink-0">
            {LEVEL_FILTERS.map(lf => (
              <button
                key={lf}
                onClick={() => setLevel(lf)}
                className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  level === lf
                    ? 'bg-yellow-500 text-black'
                    : 'text-gray-400 hover:text-white bg-white/5 hover:bg-white/10'
                }`}
              >
                {lf === 'all' ? 'All Levels' : LEVEL_LABELS[lf]}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard Table */}
        {error ? (
          <div className="text-center py-16">
            <p className="text-red-400 mb-4">{error}</p>
            <button onClick={fetchMembers} className="btn-secondary">Try Again</button>
          </div>
        ) : loading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} rows={1} height="h-4" className="py-3" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="♟"
            title="No members found"
            message="Try adjusting your search or level filter."
          />
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th className="cursor-pointer select-none" onClick={() => handleSort('rank')}>
                    Rank <SortIcon col="rank" />
                  </th>
                  <th>Player</th>
                  <th>Level</th>
                  <th className="cursor-pointer select-none text-right" onClick={() => handleSort('rating')}>
                    ELO <SortIcon col="rating" />
                  </th>
                  <th className="cursor-pointer select-none text-right" onClick={() => handleSort('wins')}>
                    W <SortIcon col="wins" />
                  </th>
                  <th className="text-right">D</th>
                  <th className="text-right">L</th>
                  <th className="cursor-pointer select-none text-right" onClick={() => handleSort('score')}>
                    Score% <SortIcon col="score" />
                  </th>
                  <th className="text-right">Trend</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, i) => {
                  const isMe = user?.email === m.user.email;
                  return (
                    <tr
                      key={m.id}
                      onClick={() => setSelected(m)}
                      className={`cursor-pointer ${isMe ? 'bg-yellow-500/5 hover:bg-yellow-500/10' : ''}`}
                    >
                      <td>
                        <span className={`font-bold ${i < 3 ? 'text-yellow-400' : 'text-gray-400'}`}>
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${m.rank}`}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isMe ? 'bg-yellow-500/20 border border-yellow-500/40 text-yellow-400' : 'bg-white/10 text-gray-300'}`}>
                            {(m.user.name ?? 'U')[0]}
                          </div>
                          <span className={`font-medium text-sm ${isMe ? 'text-yellow-400' : 'text-white'}`}>
                            {m.user.name ?? 'Unknown'}
                            {isMe && <span className="text-xs ml-2 text-yellow-400/60">(You)</span>}
                          </span>
                        </div>
                      </td>
                      <td>
                        <Badge variant={LEVEL_COLORS[m.level] ?? 'gray'}>
                          {LEVEL_LABELS[m.level] ?? m.level}
                        </Badge>
                      </td>
                      <td className="text-right font-bold text-white">{m.rating}</td>
                      <td className="text-right text-green-400">{m.wins}</td>
                      <td className="text-right text-gray-400">{m.draws}</td>
                      <td className="text-right text-red-400">{m.losses}</td>
                      <td className="text-right text-gray-300">{m.score}%</td>
                      <td className="text-right">
                        {m.ratingDelta > 0
                          ? <span className="text-green-400 font-medium text-xs">↑ +{m.ratingDelta}</span>
                          : m.ratingDelta < 0
                            ? <span className="text-red-400 font-medium text-xs">↓ {m.ratingDelta}</span>
                            : <span className="text-gray-600 text-xs">—</span>
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ELO FAQ */}
        <div className="mt-16">
          <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
            How is ELO Calculated?
          </h2>
          <Accordion items={ELO_FAQS} />
        </div>
      </div>

      {/* Player Profile Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Player Profile">
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-yellow-500/20 border-2 border-yellow-500/30 flex items-center justify-center text-2xl font-bold text-yellow-400">
                {(selected.user.name ?? 'U')[0]}
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">{selected.user.name ?? 'Unknown Player'}</h3>
                <Badge variant={LEVEL_COLORS[selected.level] ?? 'gray'}>
                  {LEVEL_LABELS[selected.level] ?? selected.level}
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                ['Ranking',   `#${selected.rank}`],
                ['ELO Rating', String(selected.rating)],
                ['Wins',      String(selected.wins)],
                ['Draws',     String(selected.draws)],
                ['Losses',    String(selected.losses)],
                ['Score %',   `${selected.score}%`],
                ['Games',     String(selected.total)],
                ['30d Change', selected.ratingDelta > 0 ? `+${selected.ratingDelta}` : String(selected.ratingDelta)],
              ].map(([label, val]) => (
                <div key={label} className="glass p-3 rounded-lg text-center">
                  <p className="text-gray-500 text-xs mb-1">{label}</p>
                  <p className="text-white font-bold">{val}</p>
                </div>
              ))}
            </div>
            {user?.email === selected.user.email && (
              <a href="/dashboard" className="btn-primary w-full text-center block">
                View My Dashboard →
              </a>
            )}
          </div>
        )}
      </Modal>
    </Layout>
  );
}
