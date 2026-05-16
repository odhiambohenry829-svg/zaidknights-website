import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Layout from '../../components/common/Layout';
import { supabase } from '../../lib/supabase';

const Chessboard = dynamic(() => import('react-chessboard').then(m => m.Chessboard), { ssr: false });

interface LiveGame {
  id: string;
  format: string;
  fen: string;
  moves: string;
  status: string;
  createdAt: string;
  white: { id: string; name: string };
  black: { id: string; name: string } | null;
  whiteRating: number | null;
  blackRating: number | null;
}

export default function LivePage() {
  const [games, setGames] = useState<LiveGame[]>([]);
  const [selected, setSelected] = useState<LiveGame | null>(null);
  const [loading, setLoading] = useState(true);

  const loadGames = useCallback(async () => {
    const res = await fetch('/api/games?status=ACTIVE&limit=20');
    const data = await res.json();
    setGames(data.games || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadGames();
    const iv = setInterval(loadGames, 5000);
    return () => clearInterval(iv);
  }, [loadGames]);

  // Subscribe to Supabase Realtime for live updates
  useEffect(() => {
    const channel = supabase
      .channel('live-games')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'OnlineGame' }, () => {
        loadGames();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadGames]);

  useEffect(() => {
    if (!selected) return;
    const updated = games.find(g => g.id === selected.id);
    if (updated) setSelected(updated);
  }, [games, selected?.id]);

  const completedGames = games.filter(g => g.status === 'COMPLETED');

  return (
    <Layout title="Live Games | Zaid Knights" description="Watch ongoing club chess games live.">
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
            <div>
              <p className="text-yellow-400 text-sm uppercase tracking-widest mb-2">📺 Streaming</p>
              <h1 className="text-4xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Live Games</h1>
              <p className="text-gray-400 mt-2">Watch Zaid Knights members play in real time</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-sm font-medium">{games.length} game{games.length !== 1 ? 's' : ''} live</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Game list */}
            <div>
              <h2 className="text-white font-semibold mb-4">Active Games</h2>
              {loading ? (
                <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="glass rounded-xl h-24 animate-pulse" />)}</div>
              ) : games.length === 0 ? (
                <div className="glass rounded-xl p-8 text-center">
                  <p className="text-gray-400">No games live right now.</p>
                  <p className="text-gray-500 text-sm mt-2">Check back later or challenge a member to a game!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {games.map(g => (
                    <button
                      key={g.id}
                      onClick={() => setSelected(g)}
                      className={`w-full text-left glass-hover rounded-xl p-4 transition-all ${selected?.id === g.id ? 'border border-yellow-500/40' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs px-2 py-0.5 rounded-full border border-white/10 text-gray-400">{g.format}</span>
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-white text-sm font-medium">♔ {g.white?.name}</p>
                          {g.whiteRating && <span className="text-gray-400 text-xs">{g.whiteRating}</span>}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-gray-300 text-sm">♚ {g.black?.name ?? 'Waiting…'}</p>
                          {g.blackRating && <span className="text-gray-400 text-xs">{g.blackRating}</span>}
                        </div>
                      </div>
                      <p className="text-gray-500 text-xs mt-2">{g.moves.split(' ').filter(Boolean).length} moves</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Board viewer */}
            <div className="lg:col-span-2">
              {!selected ? (
                <div className="glass rounded-xl p-12 text-center">
                  <div className="text-7xl mb-4">♛</div>
                  <h2 className="text-2xl font-bold text-white mb-2">Select a Game</h2>
                  <p className="text-gray-400">Choose a live game from the list to watch it</p>
                </div>
              ) : (
                <>
                  <div className="glass p-4 rounded-xl mb-4 flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <h3 className="text-white font-semibold">
                        {selected.white?.name} vs {selected.black?.name ?? 'Opponent'}
                      </h3>
                      <p className="text-gray-400 text-sm">{selected.format} · {selected.moves.split(' ').filter(Boolean).length} moves played</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-green-400 text-sm">Live</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* White's perspective */}
                    <div>
                      <p className="text-gray-400 text-xs mb-2 text-center">White's view — {selected.white?.name}</p>
                      <div className="rounded-xl overflow-hidden border border-white/10">
                        <Chessboard
                          options={{
                            position: selected.fen || 'start',
                            allowDragging: false,
                            boardOrientation: 'white',
                            darkSquareStyle: { backgroundColor: '#4a3728' },
                            lightSquareStyle: { backgroundColor: '#f0d9b5' },
                          }}
                        />
                      </div>
                    </div>
                    {/* Black's perspective */}
                    <div>
                      <p className="text-gray-400 text-xs mb-2 text-center">Black's view — {selected.black?.name ?? '…'}</p>
                      <div className="rounded-xl overflow-hidden border border-white/10">
                        <Chessboard
                          options={{
                            position: selected.fen || 'start',
                            allowDragging: false,
                            boardOrientation: 'black',
                            darkSquareStyle: { backgroundColor: '#4a3728' },
                            lightSquareStyle: { backgroundColor: '#f0d9b5' },
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Move list */}
                  <div className="glass p-4 rounded-xl mt-4">
                    <h4 className="text-white font-medium text-sm mb-2">Moves</h4>
                    <div className="text-sm font-mono text-gray-400 max-h-24 overflow-y-auto">
                      {selected.moves.split(' ').filter(Boolean).join(' ') || 'Game starting…'}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
