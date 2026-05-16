import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import type { Square } from 'chess.js';
import Layout from '../components/common/Layout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import { useAuth } from './_app';

const Chessboard = dynamic(() => import('react-chessboard').then(m => m.Chessboard), { ssr: false });

interface Game {
  id: string;
  format: string;
  moves: string;
  fen: string;
  result: string | null;
  createdAt: string;
  white: { name: string };
  black: { name: string } | null;
}

interface MoveAnnotation {
  move: string;
  san: string;
  fen: string;
  classification: 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder';
  note?: string;
}

const CLASSIFICATION_COLORS: Record<string, string> = {
  best: 'text-green-400',
  good: 'text-blue-400',
  inaccuracy: 'text-yellow-400',
  mistake: 'text-orange-400',
  blunder: 'text-red-400',
};

const CLASSIFICATION_ICONS: Record<string, string> = {
  best: '✨', good: '✓', inaccuracy: '?!', mistake: '?', blunder: '??',
};

export default function AnalysisPage() {
  const { user } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [annotations, setAnnotations] = useState<MoveAnnotation[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fen, setFen] = useState('start');
  const [analysing, setAnalysing] = useState(false);
  const [pgn, setPgn] = useState('');
  const [pgnError, setPgnError] = useState('');
  const chessRef = useRef<InstanceType<typeof import('chess.js').Chess> | null>(null);
  const [userNotes, setUserNotes] = useState<Record<number, string>>({});
  const [noteInput, setNoteInput] = useState('');

  useEffect(() => {
    import('chess.js').then(({ Chess }) => { chessRef.current = new Chess(); });
  }, []);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/games?userId=${user.id}&status=COMPLETED&limit=10`)
      .then(r => r.json()).then(d => setGames(d.games || []));
  }, [user]);

  const buildAnnotations = useCallback((moveStr: string): MoveAnnotation[] => {
    if (!chessRef.current) return [];
    const chess = chessRef.current;
    chess.reset();
    const moves = moveStr.trim().split(' ').filter(Boolean);
    const result: MoveAnnotation[] = [];

    for (let i = 0; i < moves.length; i++) {
      const m = moves[i];
      try {
        const move = chess.move({ from: m.slice(0,2) as Square, to: m.slice(2,4) as Square, promotion: m[4] || 'q' });
        if (!move) continue;

        // Simple heuristic classification (real analysis needs Stockfish)
        let classification: MoveAnnotation['classification'] = 'good';
        if (chess.isCheckmate()) classification = 'best';
        else if (chess.isCheck()) classification = 'best';

        result.push({
          move: m,
          san: move.san,
          fen: chess.fen(),
          classification,
        });
      } catch { break; }
    }
    return result;
  }, []);

  const loadGame = (game: Game) => {
    setSelectedGame(game);
    const anns = buildAnnotations(game.moves);
    setAnnotations(anns);
    setCurrentIndex(0);
    if (!chessRef.current) return;
    chessRef.current.reset();
    setFen('start');
    setUserNotes({});
    setNoteInput('');
  };

  const goToMove = (index: number) => {
    if (!chessRef.current || annotations.length === 0) return;
    if (index < 0) { chessRef.current.reset(); setFen('start'); setCurrentIndex(-1); return; }
    if (index >= annotations.length) return;
    setFen(annotations[index].fen);
    setCurrentIndex(index);
    setNoteInput(userNotes[index] || '');
  };

  const analysePgn = () => {
    if (!chessRef.current || !pgn.trim()) return;
    setPgnError('');
    try {
      const chess = chessRef.current;
      chess.loadPgn(pgn);
      const history = chess.history({ verbose: true });
      chess.reset();
      const fakeMoves = history.map(m => m.from + m.to + (m.promotion || '')).join(' ');
      const anns = buildAnnotations(fakeMoves);
      setAnnotations(anns);
      setCurrentIndex(0);
      setFen('start');
      setSelectedGame(null);
      setAnalysing(false);
    } catch {
      setPgnError('Invalid PGN. Please check the format.');
    }
  };

  const saveNote = () => {
    if (currentIndex < 0) return;
    setUserNotes(prev => ({ ...prev, [currentIndex]: noteInput }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') goToMove(currentIndex + 1);
    if (e.key === 'ArrowLeft') goToMove(currentIndex - 1);
  };

  return (
    <ProtectedRoute>
      <Layout title="Game Analysis | Zaid Knights" description="Analyse your chess games with AI-powered insights.">
        <div className="min-h-screen py-12 px-4" onKeyDown={handleKeyDown} tabIndex={0}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-yellow-400 text-sm uppercase tracking-widest mb-2">Post-Game Review</p>
              <h1 className="text-4xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Game Analysis</h1>
              <p className="text-gray-400 mt-2">Review your games, spot mistakes, and learn from every position</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left panel */}
              <div className="space-y-5">
                {/* Recent games */}
                <div className="glass p-5 rounded-xl">
                  <h3 className="text-white font-semibold mb-3">Recent Games</h3>
                  {games.length === 0 ? (
                    <p className="text-gray-500 text-sm">Play some games to analyse them here.</p>
                  ) : (
                    <div className="space-y-2">
                      {games.map(g => (
                        <button key={g.id} onClick={() => loadGame(g)}
                          className={`w-full text-left p-3 rounded-lg text-sm border transition-all ${selectedGame?.id === g.id ? 'border-yellow-500/30 bg-yellow-500/10' : 'border-white/5 hover:bg-white/5'}`}>
                          <p className="text-white">{g.white?.name} vs {g.black?.name ?? 'Bot'}</p>
                          <p className="text-gray-400 text-xs mt-0.5">{g.format} · {g.result ?? '—'} · {new Date(g.createdAt).toLocaleDateString()}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* PGN import */}
                <div className="glass p-5 rounded-xl">
                  <h3 className="text-white font-semibold mb-3">Import PGN</h3>
                  <textarea
                    value={pgn}
                    onChange={e => setPgn(e.target.value)}
                    placeholder="Paste PGN here…"
                    rows={5}
                    className="input text-xs font-mono resize-none"
                  />
                  {pgnError && <p className="text-red-400 text-xs mt-1">{pgnError}</p>}
                  <button onClick={analysePgn} className="w-full btn-primary mt-3 text-sm py-2">Analyse PGN</button>
                </div>
              </div>

              {/* Board & Analysis */}
              <div className="lg:col-span-2">
                <div className="rounded-xl overflow-hidden border border-white/10 mb-4">
                  <Chessboard
                    options={{
                      position: fen,
                      allowDragging: false,
                      darkSquareStyle: { backgroundColor: '#4a3728' },
                      lightSquareStyle: { backgroundColor: '#f0d9b5' },
                    }}
                  />
                </div>

                {/* Navigation */}
                <div className="glass p-4 rounded-xl mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-xs">Use ← → arrow keys to navigate</span>
                    <div className="flex gap-2">
                      <button onClick={() => goToMove(-1)} className="btn-ghost text-xs px-2 py-1">|←</button>
                      <button onClick={() => goToMove(currentIndex - 1)} disabled={currentIndex < 0} className="btn-ghost text-xs px-2 py-1">←</button>
                      <button onClick={() => goToMove(currentIndex + 1)} disabled={currentIndex >= annotations.length - 1} className="btn-ghost text-xs px-2 py-1">→</button>
                      <button onClick={() => goToMove(annotations.length - 1)} className="btn-ghost text-xs px-2 py-1">→|</button>
                    </div>
                  </div>

                  {annotations.length > 0 ? (
                    <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                      {annotations.map((ann, i) => (
                        <button key={i}
                          onClick={() => goToMove(i)}
                          className={`px-2 py-1 rounded text-xs font-mono transition-all ${
                            i === currentIndex ? 'bg-yellow-500/30 border border-yellow-500/50 text-yellow-400' :
                            'hover:bg-white/5 ' + CLASSIFICATION_COLORS[ann.classification]
                          }`}
                        >
                          {i % 2 === 0 && <span className="text-gray-600 mr-0.5">{Math.floor(i/2)+1}.</span>}
                          {ann.san}
                          {userNotes[i] && <span className="ml-1 text-yellow-400">📝</span>}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Select a game or import a PGN to start analysis</p>
                  )}
                </div>

                {/* Classification legend & notes */}
                {annotations.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass p-4 rounded-xl">
                      <h4 className="text-white text-sm font-semibold mb-2">Move Quality</h4>
                      <div className="space-y-1 text-xs">
                        {Object.entries(CLASSIFICATION_ICONS).map(([cls, icon]) => (
                          <div key={cls} className="flex items-center gap-2">
                            <span className={CLASSIFICATION_COLORS[cls]}>{icon}</span>
                            <span className={CLASSIFICATION_COLORS[cls] + ' capitalize'}>{cls}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="glass p-4 rounded-xl">
                      <h4 className="text-white text-sm font-semibold mb-2">📝 Your Notes</h4>
                      <textarea
                        value={noteInput}
                        onChange={e => setNoteInput(e.target.value)}
                        placeholder="Add a note for this position…"
                        rows={3}
                        className="input text-xs resize-none w-full"
                        disabled={currentIndex < 0}
                      />
                      <button onClick={saveNote} disabled={currentIndex < 0} className="btn-primary text-xs px-3 py-1 mt-2">Save Note</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
