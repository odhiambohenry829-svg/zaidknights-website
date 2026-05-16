import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import Layout from '../../components/common/Layout';

const Chessboard = dynamic(() => import('react-chessboard').then(m => m.Chessboard), { ssr: false });

const DIFFICULTY_LABELS = [
  '', 'Martin (Beginner)', 'Nelson (Novice)', 'Kohai (Amateur)',
  'Sven (Casual)', 'Antoni (Intermediate)', 'Boris (Club)', 'Max (Advanced)',
  'Magnus (Expert)', 'Hikaru (Master)', 'Stockfish (Elite)',
];

export default function PlayBotPage() {
  const [difficulty, setDifficulty] = useState(3);
  const [playerColor, setPlayerColor] = useState<'white' | 'black'>('white');
  const [started, setStarted] = useState(false);
  const [fen, setFen] = useState('start');
  const [moveList, setMoveList] = useState<string[]>([]);
  const [gameOver, setGameOver] = useState<string | null>(null);
  const chessRef = useRef<InstanceType<typeof import('chess.js').Chess> | null>(null);

  useEffect(() => {
    import('chess.js').then(({ Chess }) => { chessRef.current = new Chess(); });
  }, []);

  const evaluateBoard = (c: InstanceType<typeof import('chess.js').Chess>): number => {
    const pv: Record<string, number> = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };
    let score = 0;
    for (const row of c.board()) {
      for (const sq of row) {
        if (!sq) continue;
        const val = pv[sq.type] ?? 0;
        score += sq.color === 'w' ? val : -val;
      }
    }
    return score;
  };

  const minimax = useCallback((c: InstanceType<typeof import('chess.js').Chess>, depth: number, alpha: number, beta: number, isMax: boolean): number => {
    if (depth === 0 || c.isGameOver()) return evaluateBoard(c);
    if (isMax) {
      let best = -Infinity;
      for (const m of c.moves()) { c.move(m); best = Math.max(best, minimax(c, depth-1, alpha, beta, false)); c.undo(); alpha = Math.max(alpha, best); if (beta <= alpha) break; }
      return best;
    } else {
      let best = Infinity;
      for (const m of c.moves()) { c.move(m); best = Math.min(best, minimax(c, depth-1, alpha, beta, true)); c.undo(); beta = Math.min(beta, best); if (beta <= alpha) break; }
      return best;
    }
  }, []);

  const getBotMove = useCallback((c: InstanceType<typeof import('chess.js').Chess>) => {
    const moves = c.moves({ verbose: true });
    if (!moves.length) return null;
    if (Math.random() < Math.max(0, (6 - difficulty) * 0.15)) return moves[Math.floor(Math.random() * moves.length)];
    const depth = Math.min(1 + Math.floor(difficulty / 3), 3);
    const botIsWhite = playerColor === 'black';
    let best = botIsWhite ? -Infinity : Infinity;
    let bestMove = moves[0];
    for (const m of [...moves].sort(() => Math.random() - 0.5)) {
      c.move(m.san);
      const score = minimax(c, depth - 1, -Infinity, Infinity, !botIsWhite);
      c.undo();
      if (botIsWhite ? score > best : score < best) { best = score; bestMove = m; }
    }
    return bestMove;
  }, [difficulty, playerColor, minimax]);

  const checkOver = (c: InstanceType<typeof import('chess.js').Chess>) => {
    if (c.isCheckmate()) return c.turn() === 'w' ? 'Black wins by checkmate' : 'White wins by checkmate';
    if (c.isDraw()) return 'Draw';
    return null;
  };

  const doBotMove = useCallback(() => {
    if (!chessRef.current) return;
    const c = chessRef.current;
    if (c.isGameOver()) return;
    const botTurn = playerColor === 'white' ? 'b' : 'w';
    if (c.turn() !== botTurn) return;
    setTimeout(() => {
      const move = getBotMove(c);
      if (!move) return;
      c.move(move.san ?? move);
      setFen(c.fen());
      setMoveList(c.history());
      const over = checkOver(c);
      if (over) setGameOver(over);
    }, 200 + Math.random() * 300);
  }, [playerColor, getBotMove]);

  useEffect(() => {
    if (!started || !chessRef.current) return;
    const c = chessRef.current;
    if ((playerColor === 'white' && c.turn() === 'b') || (playerColor === 'black' && c.turn() === 'w')) doBotMove();
  }, [started, fen, playerColor, doBotMove]);

  const startGame = () => {
    if (!chessRef.current) return;
    chessRef.current.reset();
    setFen('start'); setMoveList([]); setGameOver(null); setStarted(true);
    if (playerColor === 'black') setTimeout(() => doBotMove(), 500);
  };

  const onPieceDrop = ({ sourceSquare, targetSquare, piece }: { piece: { pieceType: string }; sourceSquare: string; targetSquare: string | null }): boolean => {
    if (!chessRef.current || !started || gameOver || !targetSquare) return false;
    const c = chessRef.current;
    const playerTurn = playerColor === 'white' ? 'w' : 'b';
    if (c.turn() !== playerTurn) return false;
    const isPromotion = piece.pieceType[1] === 'P' && ((playerColor === 'white' && targetSquare[1] === '8') || (playerColor === 'black' && targetSquare[1] === '1'));
    try {
      const move = c.move({ from: sourceSquare, to: targetSquare, promotion: isPromotion ? 'q' : undefined } as Parameters<typeof c.move>[0]);
      if (!move) return false;
      setFen(c.fen()); setMoveList(c.history());
      const over = checkOver(c);
      if (over) { setGameOver(over); return true; }
      doBotMove();
      return true;
    } catch { return false; }
  };

  return (
    <Layout title="Play vs Bot | Zaid Knights">
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-yellow-400 text-sm uppercase tracking-widest mb-2">Computer Opponents</p>
            <h1 className="text-4xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Play vs Bot</h1>
            <p className="text-gray-400 mt-2">Train against AI opponents from beginner to elite level</p>
          </div>

          {!started ? (
            <div className="max-w-md mx-auto glass p-8 rounded-xl">
              <div className="mb-6">
                <label className="label">Bot Difficulty</label>
                <input type="range" min={1} max={10} value={difficulty} onChange={e => setDifficulty(parseInt(e.target.value))} className="w-full accent-yellow-500" />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">Beginner</span>
                  <span className="text-yellow-400 font-semibold text-sm">{DIFFICULTY_LABELS[difficulty]}</span>
                  <span className="text-xs text-gray-500">Elite</span>
                </div>
              </div>
              <div className="mb-8">
                <label className="label">Play As</label>
                <div className="flex gap-3">
                  {(['white', 'black'] as const).map(c => (
                    <button key={c} onClick={() => setPlayerColor(c)}
                      className={`flex-1 py-3 rounded-lg border capitalize transition-all ${playerColor === c ? 'bg-yellow-500 text-black border-yellow-400' : 'border-white/10 text-gray-300'}`}>
                      {c === 'white' ? '♔' : '♚'} {c}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={startGame} className="w-full btn-primary py-4 text-lg">Start Game</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="glass p-3 rounded-xl mb-2 flex items-center gap-3">
                  <span className="text-2xl">🤖</span>
                  <p className="text-white font-medium">{DIFFICULTY_LABELS[difficulty]}</p>
                </div>
                <div className="rounded-xl overflow-hidden border border-white/10">
                  <Chessboard
                    options={{
                      position: fen,
                      onPieceDrop: !gameOver ? onPieceDrop : undefined,
                      boardOrientation: playerColor,
                      allowDragging: !gameOver,
                      darkSquareStyle: { backgroundColor: '#4a3728' },
                      lightSquareStyle: { backgroundColor: '#f0d9b5' },
                    }}
                  />
                </div>
                <div className="glass p-3 rounded-xl mt-2 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-yellow-600 flex items-center justify-center text-white text-sm font-bold">You</div>
                  <p className="text-white font-medium">You ({playerColor})</p>
                </div>
              </div>
              <div className="space-y-4">
                {gameOver && <div className="glass-gold p-4 rounded-xl text-center"><p className="text-yellow-400 font-semibold text-lg">{gameOver}</p></div>}
                <div className="glass p-4 rounded-xl">
                  <h3 className="text-white font-semibold mb-2 text-sm">Moves</h3>
                  <div className="max-h-60 overflow-y-auto text-sm font-mono">
                    {moveList.length === 0 ? <p className="text-gray-500">Game starts…</p> : (
                      moveList.reduce((rows: string[][], move, i) => {
                        if (i % 2 === 0) rows.push([move]); else rows[rows.length - 1].push(move); return rows;
                      }, []).map((pair, i) => (
                        <div key={i} className="grid grid-cols-[1.5rem_1fr_1fr] gap-1">
                          <span className="text-gray-600">{i+1}.</span>
                          <span className="text-gray-200">{pair[0]}</span>
                          <span className="text-gray-400">{pair[1] ?? ''}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <button onClick={startGame} className="w-full btn-primary text-sm py-2">New Game</button>
                  <button onClick={() => setStarted(false)} className="w-full btn-secondary text-sm py-2">Change Settings</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
