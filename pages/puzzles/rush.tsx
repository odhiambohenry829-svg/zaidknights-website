import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import type { Square } from 'chess.js';
import Layout from '../../components/common/Layout';
import ProtectedRoute from '../../components/common/ProtectedRoute';
import { useAuth } from '../_app';

const Chessboard = dynamic(() => import('react-chessboard').then(m => m.Chessboard), { ssr: false });

interface Puzzle { id: string; fen: string; moves: string; rating: number; themes: string[] }
interface LeaderboardEntry { userId: string; score: number; user: { name: string } }

const DURATION = 180;

export default function PuzzleRushPage() {
  const { user } = useAuth();
  const [phase, setPhase] = useState<'lobby' | 'playing' | 'done'>('lobby');
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [fen, setFen] = useState('start');
  const [playerColor, setPlayerColor] = useState<'white' | 'black'>('white');
  const [puzzleMoves, setPuzzleMoves] = useState<string[]>([]);
  const [moveIndex, setMoveIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [attempted, setAttempted] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [feedback, setFeedback] = useState('');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const chessRef = useRef<InstanceType<typeof import('chess.js').Chess> | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    import('chess.js').then(({ Chess }) => { chessRef.current = new Chess(); });
  }, []);

  useEffect(() => {
    fetch('/api/puzzles/rush').then(r => r.json()).then(d => setLeaderboard(d.leaderboard || []));
  }, [phase]);

  const loadNextPuzzle = useCallback(async (excludeId?: string) => {
    if (!chessRef.current) return;
    const url = excludeId ? `/api/puzzles?limit=1&exclude=${excludeId}` : '/api/puzzles?limit=1';
    const res = await fetch(url);
    const data = await res.json();
    const p: Puzzle = data.puzzles?.[0];
    if (!p) return;

    const chess = chessRef.current;
    chess.load(p.fen);
    const moves = p.moves.split(' ').filter(Boolean);
    if (moves[0]) {
      try { chess.move({ from: moves[0].slice(0,2) as Square, to: moves[0].slice(2,4) as Square, promotion: moves[0][4] || 'q' }); } catch {}
    }
    setPuzzle(p);
    setPuzzleMoves(moves);
    setMoveIndex(1);
    setFen(chess.fen());
    setPlayerColor(chess.turn() === 'w' ? 'white' : 'black');
    setFeedback('');
  }, []);

  const startRush = async () => {
    setScore(0);
    setAttempted(0);
    setTimeLeft(DURATION);
    setPhase('playing');
    await loadNextPuzzle();
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current!); endRush(); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const endRush = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase('done');
    if (user) {
      await fetch('/api/puzzles/rush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score, solved: score, attempted, duration: DURATION }),
      });
    }
  }, [score, attempted, user]);

  useEffect(() => {
    if (timeLeft === 0 && phase === 'playing') endRush();
  }, [timeLeft, phase, endRush]);

  const onDrop = ({ sourceSquare, targetSquare, piece }: { piece: { pieceType: string }; sourceSquare: string; targetSquare: string | null }): boolean => {
    if (!chessRef.current || !puzzle || phase !== 'playing' || !targetSquare) return false;
    const chess = chessRef.current;
    const isPromotion = piece.pieceType[1] === 'P' && ((playerColor === 'white' && targetSquare[1] === '8') || (playerColor === 'black' && targetSquare[1] === '1'));
    const moveAttempt = sourceSquare + targetSquare + (isPromotion ? 'q' : '');
    const expected = puzzleMoves[moveIndex];

    if (moveAttempt !== expected) {
      setFeedback('❌');
      setAttempted(a => a + 1);
      setTimeout(() => loadNextPuzzle(puzzle.id), 600);
      return false;
    }

    try {
      chess.move({ from: sourceSquare as Square, to: targetSquare as Square, promotion: isPromotion ? 'q' : undefined });
    } catch { return false; }
    setFen(chess.fen());

    const nextIdx = moveIndex + 1;
    if (nextIdx >= puzzleMoves.length) {
      setFeedback('✅');
      setScore(s => s + 1);
      setAttempted(a => a + 1);
      setTimeout(() => loadNextPuzzle(puzzle.id), 400);
      return true;
    }

    setMoveIndex(nextIdx + 1);
    const botMove = puzzleMoves[nextIdx];
    if (botMove) {
      setTimeout(() => {
        try {
          chess.move({ from: botMove.slice(0,2) as Square, to: botMove.slice(2,4) as Square, promotion: botMove[4] || 'q' });
          setFen(chess.fen());
        } catch {}
      }, 300);
    }
    return true;
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeColor = timeLeft <= 30 ? 'text-red-400' : timeLeft <= 60 ? 'text-yellow-400' : 'text-white';

  return (
    <ProtectedRoute>
      <Layout title="Puzzle Rush | Zaid Knights" description="Solve as many chess puzzles as possible before time runs out!">
        <div className="min-h-screen py-12 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <p className="text-yellow-400 text-sm uppercase tracking-widest mb-2">⚡ Speed Training</p>
              <h1 className="text-4xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Puzzle Rush</h1>
              <p className="text-gray-400 mt-2">Solve as many puzzles as possible in 3 minutes</p>
            </div>

            {phase === 'lobby' && (
              <div className="max-w-lg mx-auto text-center">
                <div className="glass p-8 rounded-xl mb-6">
                  <div className="text-6xl mb-4">⚡</div>
                  <h2 className="text-2xl font-bold text-white mb-2">Ready for the Rush?</h2>
                  <p className="text-gray-400 mb-6">You have 3 minutes. Each correct move keeps the streak alive. One wrong move — next puzzle!</p>
                  <button onClick={startRush} className="btn-primary px-12 py-4 text-lg">Start Rush</button>
                </div>
                <div className="glass p-6 rounded-xl">
                  <h3 className="text-white font-semibold mb-4">🏆 All-Time Leaderboard</h3>
                  {leaderboard.length === 0 ? (
                    <p className="text-gray-500 text-sm">No scores yet. Be the first!</p>
                  ) : (
                    <div className="space-y-2">
                      {leaderboard.slice(0, 10).map((e, i) => (
                        <div key={e.userId} className="flex items-center justify-between text-sm py-2 border-b border-white/5">
                          <div className="flex items-center gap-3">
                            <span className={`font-bold ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-orange-400' : 'text-gray-500'}`}>#{i+1}</span>
                            <span className="text-white">{e.user?.name ?? 'Anonymous'}</span>
                          </div>
                          <span className="text-yellow-400 font-bold">{e.score}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {phase === 'playing' && puzzle && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className={`p-4 rounded-xl mb-3 flex items-center justify-between ${feedback === '✅' ? 'bg-green-500/20 border border-green-500/30' : feedback === '❌' ? 'bg-red-500/20 border border-red-500/30' : 'glass'}`}>
                    <span className={`text-2xl font-bold ${timeColor}`}>{minutes}:{seconds.toString().padStart(2, '0')}</span>
                    <span className="text-3xl">{feedback || '♟️'}</span>
                    <span className="text-white font-bold text-xl">Score: {score}</span>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-white/10">
                    <Chessboard
                      position={fen}
                      onPieceDrop={onDrop}
                      boardOrientation={playerColor}
                      arePiecesDraggable={true}
                      customDarkSquareStyle={{ backgroundColor: '#4a3728' }}
                      customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
                    />
                  </div>
                </div>
                <div className="glass p-5 rounded-xl text-center">
                  <p className="text-gray-400 text-sm mb-2">Time Remaining</p>
                  <p className={`text-5xl font-bold font-mono mb-4 ${timeColor}`}>{minutes}:{seconds.toString().padStart(2, '0')}</p>
                  <p className="text-gray-400 text-sm mb-2">Score</p>
                  <p className="text-4xl font-bold text-yellow-400 mb-4">{score}</p>
                  <p className="text-gray-400 text-sm">Attempted: {attempted}</p>
                  <button onClick={endRush} className="w-full btn-secondary mt-6 text-sm py-2">End Rush</button>
                </div>
              </div>
            )}

            {phase === 'done' && (
              <div className="max-w-md mx-auto text-center">
                <div className="glass-gold p-8 rounded-xl mb-6">
                  <div className="text-6xl mb-4">🏆</div>
                  <h2 className="text-3xl font-bold text-white mb-2">Rush Complete!</h2>
                  <p className="text-yellow-400 text-5xl font-bold my-4">{score}</p>
                  <p className="text-gray-400">puzzles solved out of {attempted} attempted</p>
                </div>
                <div className="flex gap-4">
                  <button onClick={startRush} className="flex-1 btn-primary py-3">Play Again</button>
                  <button onClick={() => setPhase('lobby')} className="flex-1 btn-secondary py-3">Leaderboard</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}