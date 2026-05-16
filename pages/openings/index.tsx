import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import type { Square, Move } from 'chess.js';
import Layout from '../../components/common/Layout';

const Chessboard = dynamic(() => import('react-chessboard').then(m => m.Chessboard), { ssr: false });

interface OpeningNode {
  name: string;
  moves: string[];
  children: Record<string, OpeningNode>;
}

// Curated opening tree (ECO codes)
const OPENINGS_TREE: Record<string, OpeningNode> = {
  e2e4: { name: '1.e4 — King\'s Pawn', moves: ['e4'], children: {
    e7e5: { name: 'Open Game', moves: ['e4','e5'], children: {
      g1f3: { name: 'King\'s Knight Opening', moves: ['e4','e5','Nf3'], children: {
        b8c6: { name: 'Three Knights / Ruy Lopez / Italian', moves: ['e4','e5','Nf3','Nc6'], children: {
          f1b5: { name: 'Ruy Lopez (Spanish Game)', moves: ['e4','e5','Nf3','Nc6','Bb5'], children: {} },
          f1c4: { name: 'Italian Game', moves: ['e4','e5','Nf3','Nc6','Bc4'], children: {
            g8f6: { name: 'Two Knights Defense', moves: ['e4','e5','Nf3','Nc6','Bc4','Nf6'], children: {} },
            f8c5: { name: 'Giuoco Piano', moves: ['e4','e5','Nf3','Nc6','Bc4','Bc5'], children: {} },
          }},
        }},
      }},
    }},
    c7c5: { name: 'Sicilian Defense', moves: ['e4','c5'], children: {
      g1f3: { name: 'Sicilian — Open', moves: ['e4','c5','Nf3'], children: {
        d7d6: { name: 'Sicilian Najdorf setup', moves: ['e4','c5','Nf3','d6'], children: {} },
        b8c6: { name: 'Sicilian — Classical', moves: ['e4','c5','Nf3','Nc6'], children: {} },
      }},
      b1c3: { name: 'Sicilian — Closed', moves: ['e4','c5','Nc3'], children: {} },
    }},
    e7e6: { name: 'French Defense', moves: ['e4','e6'], children: {
      d2d4: { name: 'French Main Lines', moves: ['e4','e6','d4'], children: {
        d7d5: { name: 'French Defense Proper', moves: ['e4','e6','d4','d5'], children: {
          b1c3: { name: 'French — Classical', moves: ['e4','e6','d4','d5','Nc3'], children: {} },
          e4e5: { name: 'French — Advance', moves: ['e4','e6','d4','d5','e5'], children: {} },
          e4d5: { name: 'French — Exchange', moves: ['e4','e6','d4','d5','exd5'], children: {} },
        }},
      }},
    }},
    c7c6: { name: 'Caro-Kann Defense', moves: ['e4','c6'], children: {} },
  }},
  d2d4: { name: '1.d4 — Queen\'s Pawn', moves: ['d4'], children: {
    d7d5: { name: 'Queen\'s Gambit', moves: ['d4','d5'], children: {
      c2c4: { name: 'Queen\'s Gambit', moves: ['d4','d5','c4'], children: {
        d5c4: { name: 'Queen\'s Gambit Accepted', moves: ['d4','d5','c4','dxc4'], children: {} },
        e7e6: { name: 'Queen\'s Gambit Declined', moves: ['d4','d5','c4','e6'], children: {} },
        c7c6: { name: 'Slav Defense', moves: ['d4','d5','c4','c6'], children: {} },
      }},
    }},
    g8f6: { name: 'Indian Defenses', moves: ['d4','Nf6'], children: {
      c2c4: { name: 'Indian Defense (various)', moves: ['d4','Nf6','c4'], children: {
        g7g6: { name: 'King\'s Indian / Grünfeld', moves: ['d4','Nf6','c4','g6'], children: {} },
        e7e6: { name: 'Nimzo / Queen\'s Indian', moves: ['d4','Nf6','c4','e6'], children: {
          b1c3: { name: 'Nimzo-Indian Defense', moves: ['d4','Nf6','c4','e6','Nc3'], children: {} },
        }},
      }},
    }},
  }},
  c2c4: { name: '1.c4 — English Opening', moves: ['c4'], children: {} },
  g1f3: { name: '1.Nf3 — Réti Opening', moves: ['Nf3'], children: {} },
};

function flattenTree(node: Record<string, OpeningNode>, depth = 0): { key: string; node: OpeningNode; depth: number }[] {
  const result: { key: string; node: OpeningNode; depth: number }[] = [];
  for (const [key, child] of Object.entries(node)) {
    result.push({ key, node: child, depth });
    if (Object.keys(child.children).length > 0) result.push(...flattenTree(child.children, depth + 1));
  }
  return result;
}

export default function OpeningsPage() {
  const [fen, setFen] = useState('start');
  const [moves, setMoves] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [selected, setSelected] = useState<OpeningNode | null>(null);
  const chessRef = useRef<InstanceType<typeof import('chess.js').Chess> | null>(null);
  const [legalMoves, setLegalMoves] = useState<Move[]>([]);

  useEffect(() => {
    import('chess.js').then(({ Chess }) => {
      chessRef.current = new Chess();
      setLegalMoves(chessRef.current.moves({ verbose: true }));
    });
  }, []);

  const navigateTo = useCallback((targetMoves: string[]) => {
    if (!chessRef.current) return;
    const chess = chessRef.current;
    chess.reset();
    for (const m of targetMoves) {
      try { chess.move(m); } catch {}
    }
    setFen(chess.fen());
    setMoves(chess.history());
    setLegalMoves(chess.moves({ verbose: true }));
  }, []);

  const handleOpeningSelect = (node: OpeningNode) => {
    setSelected(node);
    navigateTo(node.moves);
    setCurrentPath(node.moves);
  };

  const onDrop = ({ sourceSquare, targetSquare }: { piece: { pieceType: string }; sourceSquare: string; targetSquare: string | null }): boolean => {
    if (!chessRef.current || !targetSquare) return false;
    const chess = chessRef.current;
    try {
      const move = chess.move({ from: sourceSquare as Square, to: targetSquare as Square, promotion: 'q' });
      if (!move) return false;
      setFen(chess.fen());
      setMoves(chess.history());
      setLegalMoves(chess.moves({ verbose: true }));
      return true;
    } catch { return false; }
  };

  const goBack = () => {
    if (!chessRef.current || moves.length === 0) return;
    chessRef.current.undo();
    setFen(chessRef.current.fen());
    setMoves(chessRef.current.history());
    setLegalMoves(chessRef.current.moves({ verbose: true }));
  };

  const reset = () => {
    if (!chessRef.current) return;
    chessRef.current.reset();
    setFen('start');
    setMoves([]);
    setSelected(null);
    setCurrentPath([]);
    setLegalMoves(chessRef.current.moves({ verbose: true }));
  };

  const topLevel = Object.entries(OPENINGS_TREE);

  return (
    <Layout title="Opening Explorer | Zaid Knights" description="Study chess openings with an interactive move tree.">
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-yellow-400 text-sm uppercase tracking-widest mb-2">Opening Theory</p>
            <h1 className="text-4xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Opening Explorer</h1>
            <p className="text-gray-400 mt-2">Study openings interactively — click an opening or move pieces on the board</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar - Opening Tree */}
            <div className="glass rounded-xl p-5 max-h-[600px] overflow-y-auto order-2 lg:order-1">
              <h2 className="text-white font-semibold mb-4">Opening Library</h2>
              {topLevel.map(([key, node]) => (
                <div key={key} className="mb-2">
                  <button
                    onClick={() => handleOpeningSelect(node)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${selected?.name === node.name ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
                  >
                    <span className="font-medium">{node.name}</span>
                  </button>
                  {Object.entries(node.children).map(([ck, child]) => (
                    <div key={ck} className="ml-3">
                      <button
                        onClick={() => handleOpeningSelect(child)}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-all ${selected?.name === child.name ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                      >
                        {child.name}
                      </button>
                      {Object.entries(child.children).map(([gk, grand]) => (
                        <button
                          key={gk}
                          onClick={() => handleOpeningSelect(grand)}
                          className={`w-full text-left px-3 py-1 rounded-lg text-xs ml-3 transition-all ${selected?.name === grand.name ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}
                        >
                          └ {grand.name}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Board */}
            <div className="order-1 lg:order-2 lg:col-span-2">
              {selected && (
                <div className="glass-gold p-4 rounded-xl mb-4">
                  <h3 className="text-yellow-400 font-semibold">{selected.name}</h3>
                  <p className="text-gray-300 text-sm mt-1">Moves: {selected.moves.join(' ')}</p>
                </div>
              )}

              <div className="rounded-xl overflow-hidden border border-white/10">
                <Chessboard
                  options={{
                    position: fen,
                    onPieceDrop: onDrop,
                    darkSquareStyle: { backgroundColor: '#4a3728' },
                    lightSquareStyle: { backgroundColor: '#f0d9b5' },
                  }}
                />
              </div>

              {/* Move navigation */}
              <div className="glass p-4 rounded-xl mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold text-sm">Move List</h3>
                  <div className="flex gap-2">
                    <button onClick={goBack} disabled={moves.length === 0} className="btn-secondary text-xs px-3 py-1 disabled:opacity-40">← Back</button>
                    <button onClick={reset} className="btn-secondary text-xs px-3 py-1">Reset</button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-sm font-mono min-h-[2rem]">
                  {moves.length === 0 ? (
                    <span className="text-gray-500">Make a move or select an opening</span>
                  ) : (
                    moves.map((m, i) => (
                      <span key={i} className={i % 2 === 0 ? 'text-gray-200' : 'text-gray-400'}>
                        {i % 2 === 0 && <span className="text-gray-600 mr-1">{Math.floor(i/2)+1}.</span>}
                        {m}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
