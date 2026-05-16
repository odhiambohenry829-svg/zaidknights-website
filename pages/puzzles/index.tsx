import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import type { Square } from 'chess.js';
import Link from 'next/link';
import Layout from '../../components/common/Layout';
import { useAuth } from '../_app';

const Chessboard = dynamic(() => import('react-chessboard').then(m => m.Chessboard), { ssr: false });

interface Puzzle {
  id: string;
  fen: string;
  moves: string;
  rating: number;
  themes: string[];
}

type PuzzleState = 'idle' | 'playing' | 'solved' | 'failed';

export default function PuzzlesPage() {
  const { user } = useAuth();
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [daily, setDaily] = useState<{ puzzle: Puzzle; date: string } | null>(null);
  const [state, setState] = useState<PuzzleState>('idle');
  const [fen, setFen] = useState('start');
  const [hint, setHint] = useState('');
  const [moveIndex, setMoveIndex] = useState(0);
  const [puzzleMoves, setPuzzleMoves] = useState<string[]>([]);
  const chessRef = useRef<InstanceType<typeof import('chess.js').Chess> | null>(null);
  const [playerColor, setPlayerColor] = useState<'white' | 'black'>('white');
  const [stats, setStats] = useState({ solved: 0, attempted: 0 });
  const startTime = useRef<number>(0);

  useEffect(() => {
    import('chess.js').then(({ Chess }) => {
      chessRef.current = new Chess();
    });
  }, []);

  // Load daily puzzle
  useEffect(() => {
    fetch('/api/puzzles/daily').then(r => r.json()).then(d => {
      if (d.daily) setDaily({ puzzle: d.daily.puzzle, date: d.daily.date });
    });
  }, []);

  // Load puzzle stats for user
  useEffect(() => {
    if (!user) return;
    // approximate from attempts - just use session for now
  }, [user]);

  const loadPuzzle = useCallback(async (theme?: string) => {
    if (!chessRef.current) return;
    setState('idle');
    setPuzzle(null);
    setHint('');
    setMoveIndex(0);

    const url = theme ? `/api/puzzles?limit=1&theme=${theme}` : '/api/puzzles?limit=1';
    const res = await fetch(url);
    const data = await res.json();
    const p: Puzzle = data.puzzles?.[0];
    if (!p) return;

    const chess = chessRef.current;
    chess.load(p.fen);

    const moves = p.moves.split(' ').filter(Boolean);
    setPuzzleMoves(moves);
    setPuzzle(p);

    // puzzle starts with opponent making a move, then player responds
    const opponentMove = moves[0];
    if (opponentMove) {
      try {
        chess.move({ from: opponentMove.slice(0,2) as Square, to: opponentMove.slice(2,4) as Square, promotion: opponentMove[4] || 'q' });
      } catch {}
    }
    setFen(chess.fen());
    setPlayerColor(chess.turn() === 'w' ? 'white' : 'black');
    setMoveIndex(1);
    setState('playing');
    startTime.current = Date.now();
    setHint(`Find the best move for ${chess.turn() === 'w' ? 'White' : 'Black'}`);
  }, []);

  const loadDailyPuzzle = useCallback(() => {
    if (!daily || !chessRef.current) return;
    const p = daily.puzzle;
    const chess = chessRef.current;
    chess.load(p.fen);
    const moves = p.moves.split(' ').filter(Boolean);
    setPuzzleMoves(moves);
    setPuzzle(p);
    const opponentMove = moves[0];
    if (opponentMove) {
      try {
        chess.move({ from: opponentMove.slice(0,2) as Square, to: opponentMove.slice(2,4) as Square, promotion: opponentMove[4] || 'q' });
      } catch {}
    }
    setFen(chess.fen());
    setPlayerColor(chess.turn() === 'w' ? 'white' : 'black');
    setMoveIndex(1);
    setState('playing');
    startTime.current = Date.now();
    setHint(`Find the best move for ${chess.turn() === 'w' ? 'White' : 'Black'}`);
  }, [daily]);

  const onDrop = ({ sourceSquare, targetSquare, piece }: { piece: { pieceType: string }; sourceSquare: string; targetSquare: string | null }): boolean => {
    if (!chessRef.current || !puzzle || state !== 'playing' || !targetSquare) return false;
    const chess = chessRef.current;
    const isPromotion = piece.pieceType[1] === 'P' && ((playerColor === 'white' && targetSquare[1] === '8') || (playerColor === 'black' && targetSquare[1] === '1'));

    const moveAttempt = sourceSquare + targetSquare + (isPromotion ? 'q' : '');
    const expectedMove = puzzleMoves[moveIndex];

    if (moveAttempt !== expectedMove) {
      setHint('❌ Not the best move. Try again!');
      setState('failed');
      if (user) {
        fetch('/api/puzzles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ puzzleId: puzzle.id, solved: false }) });
      }
      return false;
    }

    try {
      chess.move({ from: sourceSquare as Square, to: targetSquare as Square, promotion: isPromotion ? 'q' : undefined });
    } catch { return false; }

    setFen(chess.fen());
    const nextIndex = moveIndex + 1;

    if (nextIndex >= puzzleMoves.length) {
      setState('solved');
      setHint('✅ Excellent! Puzzle solved!');
      const timeTaken = Math.floor((Date.now() - startTime.current) / 1000);
      if (user) {
        fetch('/api/puzzles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ puzzleId: puzzle.id, solved: true, timeTaken }) });
      }
      setStats(prev => ({ solved: prev.solved + 1, attempted: prev.attempted + 1 }));
      return true;
    }

    setMoveIndex(nextIndex + 1);
    const botMove = puzzleMoves[nextIndex];
    if (botMove) {
      setTimeout(() => {
        try {
          chess.move({ from: botMove.slice(0,2) as Square, to: botMove.slice(2,4) as Square, promotion: botMove[4] || 'q' });
          setFen(chess.fen());
        } catch {}
      }, 400);
    }
    setHint('Good! Keep going…');
    return true;
  };

  const THEMES = ['fork', 'pin', 'skewer', 'backRankMate', 'discoveredAttack', 'deflection', 'endgame'];

  return (
    <Layout title="Tactics Puzzles | Zaid Knights" description="Sharpen your chess with daily puzzles and tactics training.">
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-yellow-400 text-sm uppercase tracking-widest mb-2">Sharpen Your Tactics</p>
            <h1 className="text-4xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Chess Puzzles</h1>
            <p className="text-gray-400 mt-2">Solve tactical puzzles to improve your pattern recognition</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Board */}
            <div className="lg:col-span-2">
              {state === 'idle' ? (
                <div className="glass rounded-xl p-12 text-center">
                  <div className="text-8xl mb-6">🧩</div>
                  <h2 className="text-2xl font-bold text-white mb-4">Ready to train?</h2>
                  <p className="text-gray-400 mb-8">Choose a puzzle type or start with a random puzzle</p>
                  <div className="flex flex-wrap gap-3 justify-center mb-6">
                    {daily && (
                      <button onClick={loadDailyPuzzle} className="btn-primary px-6">
                        ☀️ Today's Puzzle
                      </button>
                    )}
                    <button onClick={() => loadPuzzle()} className="btn-secondary px-6">
                      🎲 Random Puzzle
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {THEMES.map(t => (
                      <button key={t} onClick={() => loadPuzzle(t)} className="px-3 py-1 text-xs rounded-full border border-white/10 text-gray-400 hover:border-yellow-500/30 hover:text-yellow-400 transition-colors capitalize">
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {hint && (
                    <div className={`p-3 rounded-xl mb-3 text-center text-sm font-medium ${
                      state === 'solved' ? 'bg-green-500/20 border border-green-500/30 text-green-400' :
                      state === 'failed' ? 'bg-red-500/20 border border-red-500/30 text-red-400' :
                      'glass text-gray-300'
                    }`}>{hint}</div>
                  )}
                  <div className="rounded-xl overflow-hidden border border-white/10">
                    <Chessboard
                      options={{
                        position: fen,
                        onPieceDrop: state === 'playing' ? onDrop : undefined,
                        boardOrientation: playerColor,
                        allowDragging: state === 'playing',
                        darkSquareStyle: { backgroundColor: '#4a3728' },
                        lightSquareStyle: { backgroundColor: '#f0d9b5' },
                      }}
                    />
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button onClick={() => loadPuzzle()} className="btn-primary flex-1 py-2 text-sm">Next Puzzle</button>
                    {state === 'failed' && (
                      <button onClick={() => {
                        setState('idle'); setTimeout(() => loadPuzzle(), 100);
                      }} className="btn-secondary px-4 py-2 text-sm">Try Again</button>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Daily Puzzle */}
              {daily && (
                <div className="glass-gold p-5 rounded-xl">
                  <p className="text-yellow-400 text-xs uppercase tracking-widest mb-1">☀️ Daily Puzzle</p>
                  <p className="text-white font-semibold">Today's Challenge</p>
                  <p className="text-gray-400 text-sm mt-1">Rating: {daily.puzzle.rating}</p>
                  <button onClick={loadDailyPuzzle} className="w-full btn-primary mt-3 py-2 text-sm">Solve It</button>
                </div>
              )}

              {/* Stats */}
              {user && (
                <div className="glass p-5 rounded-xl">
                  <h3 className="text-white font-semibold mb-3">Your Session</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-yellow-400">{stats.solved}</p>
                      <p className="text-xs text-gray-400">Solved</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-white">{stats.attempted}</p>
                      <p className="text-xs text-gray-400">Attempted</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Puzzle Rush */}
              <div className="glass p-5 rounded-xl text-center">
                <p className="text-3xl mb-2">⚡</p>
                <h3 className="text-white font-semibold">Puzzle Rush</h3>
                <p className="text-gray-400 text-sm mt-1 mb-4">Solve as many puzzles as possible in 3 minutes!</p>
                <Link href="/puzzles/rush" className="btn-primary w-full block text-sm py-2">Play Puzzle Rush</Link>
              </div>

              {/* Themes */}
              <div className="glass p-5 rounded-xl">
                <h3 className="text-white font-semibold mb-3">Practice by Theme</h3>
                <div className="flex flex-wrap gap-2">
                  {THEMES.map(t => (
                    <button key={t} onClick={() => loadPuzzle(t)} className="px-3 py-1 text-xs rounded-full border border-white/10 text-gray-400 hover:border-yellow-500/30 hover:text-yellow-400 transition-colors capitalize">
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Endgames CTA */}
              <div className="glass p-5 rounded-xl">
                <h3 className="text-white font-semibold mb-2">🏁 Endgame Drills</h3>
                <p className="text-gray-400 text-sm mb-3">Practice fundamental endgame techniques</p>
                <Link href="/endgames" className="btn-secondary block text-center text-sm py-2">Start Drills</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
