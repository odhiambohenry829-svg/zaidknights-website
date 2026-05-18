import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/common/Layout';
import ProtectedRoute from '../../components/common/ProtectedRoute';
import { useAuth } from '../_app';

const TIME_CONTROLS = [
  { label: '1+0', format: 'BULLET', time: 60, inc: 0, desc: 'Bullet' },
  { label: '1+1', format: 'BULLET', time: 60, inc: 1, desc: 'Bullet' },
  { label: '2+1', format: 'BULLET', time: 120, inc: 1, desc: 'Bullet' },
  { label: '3+0', format: 'BLITZ', time: 180, inc: 0, desc: 'Blitz' },
  { label: '3+2', format: 'BLITZ', time: 180, inc: 2, desc: 'Blitz' },
  { label: '5+0', format: 'BLITZ', time: 300, inc: 0, desc: 'Blitz' },
  { label: '5+3', format: 'BLITZ', time: 300, inc: 3, desc: 'Blitz' },
  { label: '10+0', format: 'BLITZ', time: 600, inc: 0, desc: 'Rapid' },
  { label: '15+10', format: 'BLITZ', time: 900, inc: 10, desc: 'Rapid' },
  { label: '1 day', format: 'DAILY', time: 86400, inc: 0, desc: 'Daily' },
  { label: '3 days', format: 'DAILY', time: 259200, inc: 0, desc: 'Daily' },
];

const FORMAT_ICONS: Record<string, string> = {
  BULLET: '⚡',
  BLITZ: '🔥',
  DAILY: '📅',
  Rapid: '⏱️',
};

export default function PlayPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [selected, setSelected] = useState(TIME_CONTROLS[5]);
  const [seeking, setSeeking] = useState(false);
  const [waitingGames, setWaitingGames] = useState<{ id: string; format: string; timeLimit: number; white: { name: string } }[]>([]);

  useEffect(() => {
    fetch('/api/games?status=WAITING&limit=10')
      .then(r => r.json())
      .then(d => setWaitingGames(d.games || []));
    const iv = setInterval(() => {
      fetch('/api/games?status=WAITING&limit=10')
        .then(r => r.json())
        .then(d => setWaitingGames(d.games || []));
    }, 5000);
    return () => clearInterval(iv);
  }, []);

  const handlePlay = async () => {
    if (!user) { router.push('/login'); return; }
    setSeeking(true);
    try {
      const res = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: selected.format, timeLimit: selected.time, increment: selected.inc }),
      });
      const data = await res.json();
      if (data.game) router.push(`/play/${data.game.id}`);
    } catch {
      setSeeking(false);
    }
  };

  const joinGame = async (gameId: string) => {
    setSeeking(true);
    try {
      const res = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId }),
      });
      const data = await res.json();
      if (data.game) router.push(`/play/${data.game.id}`);
    } catch {
      setSeeking(false);
    }
  };

  return (
    <ProtectedRoute>
      <Layout title="Play Chess | Zaid Knights" description="Play real-time chess against other Zaid Knights members.">
        <div className="min-h-screen py-12 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-yellow-400 text-sm uppercase tracking-widest mb-2">Online Arena</p>
              <h1 className="text-4xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Play Chess</h1>
              <p className="text-gray-400 mt-2">Challenge club members to rated blitz, bullet, or daily games</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Time control picker */}
              <div className="lg:col-span-2 glass p-6 rounded-xl">
                <h2 className="text-white font-semibold mb-4">Choose Time Control</h2>

                {(['BULLET', 'BLITZ', 'DAILY'] as const).map(fmt => {
                  const controls = TIME_CONTROLS.filter(tc =>
                    fmt === 'BLITZ' ? ['Blitz', 'Rapid'].includes(tc.desc) : tc.format === fmt
                  );
                  return (
                    <div key={fmt} className="mb-5">
                      <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">
                        {FORMAT_ICONS[fmt]} {fmt === 'BULLET' ? 'Bullet' : fmt === 'BLITZ' ? 'Blitz / Rapid' : 'Daily'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {controls.map(tc => (
                          <button
                            key={tc.label}
                            onClick={() => setSelected(tc)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                              selected.label === tc.label
                                ? 'bg-yellow-500 text-black border-yellow-400 shadow-lg shadow-yellow-500/30'
                                : 'border-white/10 text-gray-300 hover:border-yellow-500/30 hover:text-white'
                            }`}
                          >
                            {tc.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}

                <div className="mt-6 flex gap-4 flex-wrap">
                  <button
                    onClick={handlePlay}
                    disabled={seeking}
                    className="btn-primary flex-1 text-center py-4 text-lg"
                  >
                    {seeking ? 'Seeking opponent…' : `Play ${selected.label}`}
                  </button>
                  <Link href="/play/bot" className="btn-secondary px-8 py-4 flex items-center gap-2">
                    🤖 vs Bot
                  </Link>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-5">
                {/* Open games */}
                <div className="glass p-5 rounded-xl">
                  <h3 className="text-white font-semibold mb-3">Open Challenges</h3>
                  {waitingGames.length === 0 ? (
                    <p className="text-gray-500 text-sm">No open games. Be the first!</p>
                  ) : (
                    <div className="space-y-2">
                      {waitingGames.slice(0, 5).map(g => (
                        <div key={g.id} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                          <div>
                            <p className="text-white text-sm font-medium">{g.white?.name ?? 'Anonymous'}</p>
                            <p className="text-gray-400 text-xs">{g.format} · {Math.floor(g.timeLimit / 60)}min</p>
                          </div>
                          <button onClick={() => joinGame(g.id)} className="btn-primary text-xs px-3 py-1">Join</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick links */}
                <div className="glass p-5 rounded-xl space-y-2">
                  <h3 className="text-white font-semibold mb-3">Quick Access</h3>
                  {[
                    { href: '/puzzles', icon: '🧩', label: 'Daily Puzzle' },
                    { href: '/analysis', icon: '🔍', label: 'Game Analysis' },
                    { href: '/leaderboard', icon: '🏆', label: 'Online Leaderboard' },
                    { href: '/live', icon: '📺', label: 'Watch Live Games' },
                  ].map(item => (
                    <Link key={item.href} href={item.href} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-colors">
                      <span>{item.icon}</span>
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}