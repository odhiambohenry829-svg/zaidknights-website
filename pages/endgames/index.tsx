import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import type { Square } from 'chess.js';
import Layout from '../../components/common/Layout';

const Chessboard = dynamic(() => import('react-chessboard').then(m => m.Chessboard), { ssr: false });

interface EndgameDrill {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  concept: string;
  fen: string;
  solution: string;
  tip: string;
}

const DRILLS: EndgameDrill[] = [
  { id: '1', title: 'Queen vs King', description: 'Mate with Queen and King', difficulty: 'Beginner', concept: 'Basic Checkmates', fen: '8/8/8/4k3/8/8/8/3QK3 w - - 0 1', solution: 'd1d5', tip: 'Use your Queen to cut off the enemy King. Drive it to the edge, then deliver checkmate with King support.' },
  { id: '2', title: 'Rook vs King — Philidor Position', description: 'Hold the draw with King and Rook vs King', difficulty: 'Intermediate', concept: 'Rook Endgames', fen: '8/8/8/3k4/8/8/8/3RK3 w - - 0 1', solution: 'd1d6', tip: 'The Rook cuts off the enemy King on the 6th rank. Keep the distance!' },
  { id: '3', title: 'King & Pawn vs King — Opposition', description: 'Win with King and Pawn against King', difficulty: 'Beginner', concept: 'Pawn Endgames', fen: '8/8/8/8/3k4/8/3P4/3K4 w - - 0 1', solution: 'd1c2', tip: 'The key is opposition. Put your King directly in front of the pawn, then advance together.' },
  { id: '4', title: 'Lucena Position', description: 'Win with Rook and Pawn vs Rook', difficulty: 'Intermediate', concept: 'Rook Endgames', fen: '1K1k4/1P6/8/8/8/8/8/R3r3 w - - 0 1', solution: 'a1a4', tip: 'Build a bridge! Use the rook to cut off checks, then support the King out of the box.' },
  { id: '5', title: 'Shouldering — King Triangulation', description: 'Use King triangulation to win a pawn endgame', difficulty: 'Advanced', concept: 'Pawn Endgames', fen: '8/8/5k2/8/3KP3/8/8/8 w - - 0 1', solution: 'd4e3', tip: 'Triangulate! Lose a tempo with your King to gain the opposition and push the pawn through.' },
  { id: '6', title: 'Rook Behind Passed Pawn', description: 'Correctly place your Rook behind a passed pawn', difficulty: 'Beginner', concept: 'Rook Endgames', fen: '8/8/8/6k1/8/8/6P1/R5K1 w - - 0 1', solution: 'a1a8', tip: 'Always place the Rook BEHIND the passed pawn — yours or your opponent\'s. This is one of the most important principles.' },
  { id: '7', title: 'Bishop vs Knight — Open Position', description: 'Exploit the long-range Bishop in an open endgame', difficulty: 'Intermediate', concept: 'Minor Piece Endgames', fen: '8/3b4/8/3k4/8/8/3B4/3K4 w - - 0 1', solution: 'd2g5', tip: 'Bishops dominate Knights in open positions with pawns on both sides. Keep the position open!' },
  { id: '8', title: 'Two Bishops vs King', description: 'Force checkmate with two Bishops', difficulty: 'Intermediate', concept: 'Basic Checkmates', fen: '8/8/8/4k3/8/8/8/3BBK2 w - - 0 1', solution: 'd1d2', tip: 'Use the two Bishops to drive the King to a corner. They create a diagonal corridor the King cannot cross.' },
  { id: '9', title: 'Pawn Race — Who Promotes First?', description: 'Calculate who queens first when both sides have passed pawns', difficulty: 'Beginner', concept: 'Pawn Endgames', fen: '8/6p1/8/8/8/8/2P5/8 w - - 0 1', solution: 'c2c4', tip: 'Count the moves carefully! In a pawn race, every tempo counts. Sometimes it\'s a draw, sometimes it\'s a win by one move.' },
  { id: '10', title: 'Rook Cutoff — 6th Rank', description: 'Cut off the King with your Rook to win', difficulty: 'Intermediate', concept: 'Rook Endgames', fen: '8/8/8/8/3k4/8/3P4/3RK3 w - - 0 1', solution: 'd1d6', tip: 'Cutting off the King with a Rook on the 6th rank (or 3rd if you are Black) is winning in most cases.' },
];

const CONCEPTS = ['All', 'Basic Checkmates', 'Pawn Endgames', 'Rook Endgames', 'Minor Piece Endgames'];
const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export default function EndgamesPage() {
  const [drill, setDrill] = useState<EndgameDrill | null>(null);
  const [filterConcept, setFilterConcept] = useState('All');
  const [filterDiff, setFilterDiff] = useState('All');
  const [fen, setFen] = useState('start');
  const [state, setState] = useState<'idle' | 'playing' | 'correct' | 'done'>('idle');
  const [hint, setHint] = useState('');
  const [playerColor, setPlayerColor] = useState<'white' | 'black'>('white');
  const chessRef = useRef<InstanceType<typeof import('chess.js').Chess> | null>(null);

  useEffect(() => {
    import('chess.js').then(({ Chess }) => { chessRef.current = new Chess(); });
  }, []);

  const startDrill = (d: EndgameDrill) => {
    if (!chessRef.current) return;
    const chess = chessRef.current;
    chess.load(d.fen);
    setDrill(d);
    setFen(chess.fen());
    setPlayerColor(chess.turn() === 'w' ? 'white' : 'black');
    setState('playing');
    setHint('');
  };

  const onDrop = (sourceSquare: Square, targetSquare: Square): boolean => {
    if (!chessRef.current || !drill || state !== 'playing') return false;
    const chess = chessRef.current;
    const moveAttempt = sourceSquare + targetSquare;

    try {
      const move = chess.move({ from: sourceSquare as Square, to: targetSquare as Square, promotion: 'q' });
      if (!move) return false;
      setFen(chess.fen());

      if (moveAttempt === drill.solution) {
        setState('correct');
        setHint('✅ Correct! ' + drill.tip);
      } else {
        setHint('💡 That\'s one approach. The key idea: ' + drill.tip);
      }
      return true;
    } catch { return false; }
  };

  const filtered = DRILLS.filter(d => {
    if (filterConcept !== 'All' && d.concept !== filterConcept) return false;
    if (filterDiff !== 'All' && d.difficulty !== filterDiff) return false;
    return true;
  });

  return (
    <Layout title="Endgame Drills | Zaid Knights" description="Practice fundamental endgame techniques with interactive drills.">
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-yellow-400 text-sm uppercase tracking-widest mb-2">🏁 Master the Endgame</p>
            <h1 className="text-4xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Endgame Drills</h1>
            <p className="text-gray-400 mt-2">Practice the positions every club player must know</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {DIFFICULTIES.map(d => (
                  <button type="button" key={d} onClick={() => setFilterDiff(d)}
                    className={`px-3 py-1 rounded-full text-xs border transition-all ${filterDiff === d ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400' : 'border-white/10 text-gray-400'}`}>
                    {d}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {CONCEPTS.map(c => (
                  <button type="button" key={c} onClick={() => setFilterConcept(c)}
                    className={`px-3 py-1 rounded-full text-xs border transition-all ${filterConcept === c ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'border-white/10 text-gray-400'}`}>
                    {c}
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                {filtered.map(d => (
                  <button type="button" key={d.id} onClick={() => startDrill(d)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${drill?.id === d.id ? 'bg-yellow-500/20 border-yellow-500/30' : 'glass hover:border-yellow-500/20'}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-white font-medium text-sm">{d.title}</p>
                        <p className="text-gray-400 text-xs mt-0.5">{d.concept}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ml-2 ${
                        d.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                        d.difficulty === 'Intermediate' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>{d.difficulty}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2">
              {!drill ? (
                <div className="glass rounded-xl p-12 text-center">
                  <div className="text-8xl mb-4">🏁</div>
                  <h2 className="text-2xl font-bold text-white mb-2">Select a Drill</h2>
                  <p className="text-gray-400">Choose an endgame position from the list to start practicing</p>
                </div>
              ) : (
                <>
                  <div className="glass-gold p-4 rounded-xl mb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-yellow-400 font-semibold">{drill.title}</h3>
                        <p className="text-gray-300 text-sm mt-1">{drill.description}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ml-3 ${
                        drill.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                        drill.difficulty === 'Intermediate' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>{drill.difficulty}</span>
                    </div>
                  </div>

                  {hint && (
                    <div className={`p-3 rounded-xl mb-4 text-sm ${state === 'correct' ? 'bg-green-500/20 border border-green-500/30 text-green-300' : 'glass text-gray-300'}`}>
                      {hint}
                    </div>
                  )}

                  <div className="rounded-xl overflow-hidden border border-white/10">
                    <Chessboard
                      position={fen}
                      onPieceDrop={state === 'playing' ? onDrop : undefined}
                      boardOrientation={playerColor}
                      arePiecesDraggable={state === 'playing'}
                      customDarkSquareStyle={{ backgroundColor: '#4a3728' }}
                      customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
                    />
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button type="button" onClick={() => startDrill(drill)} className="btn-secondary flex-1 py-2 text-sm">Reset</button>
                    <button type="button" onClick={() => { setHint(drill.tip); }} className="btn-secondary flex-1 py-2 text-sm">💡 Hint</button>
                  </div>

                  {drill.tip && (
                    <div className="glass p-4 rounded-xl mt-4">
                      <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Key Concept</p>
                      <p className="text-gray-300 text-sm">{drill.tip}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}