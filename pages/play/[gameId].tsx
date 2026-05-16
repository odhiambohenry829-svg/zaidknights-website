import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import Layout from '../../components/common/Layout';
import ProtectedRoute from '../../components/common/ProtectedRoute';
import { useAuth } from '../_app';
import { supabase } from '../../lib/supabase';

const Chessboard = dynamic(() => import('react-chessboard').then(m => m.Chessboard), { ssr: false });

interface GameData {
  id: string; whiteId: string; blackId: string | null; format: string;
  timeLimit: number; increment: number; moves: string; fen: string; status: string;
  result: string | null; termination: string | null;
  whiteRating: number | null; blackRating: number | null;
  whiteRatingDelta: number | null; blackRatingDelta: number | null;
  white: { id: string; name: string };
  black: { id: string; name: string } | null;
}

export default function GamePage() {
  const router = useRouter();
  const { gameId } = router.query;
  const { user } = useAuth();
  const [game, setGame] = useState<GameData | null>(null);
  const [fen, setFen] = useState('start');
  const [moveList, setMoveList] = useState<string[]>([]);
  const [status, setStatus] = useState<string>('');
  const chessRef = useRef<InstanceType<typeof import('chess.js').Chess> | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    import('chess.js').then(({ Chess }) => { chessRef.current = new Chess(); });
  }, []);

  const loadGame = useCallback(async () => {
    if (!gameId) return;
    const res = await fetch(`/api/games/${gameId}`);
    if (!res.ok) return;
    const data = await res.json();
    const g: GameData = data.game;
    setGame(g);

    if (chessRef.current && g.moves) {
      const chess = chessRef.current;
      chess.reset();
      const moves = g.moves.trim().split(' ').filter(Boolean);
      for (const m of moves) {
        try { chess.move({ from: m.slice(0,2), to: m.slice(2,4), promotion: m[4] || 'q' } as Parameters<typeof chess.move>[0]); } catch {}
      }
      setFen(chess.fen());
      setMoveList(chess.history());
    }

    if (g.status === 'WAITING') setStatus('Waiting for opponent…');
    else if (g.status === 'COMPLETED') {
      if (g.result === '1-0') setStatus(`${g.white?.name} wins`);
      else if (g.result === '0-1') setStatus(`${g.black?.name ?? 'Black'} wins`);
      else setStatus('Draw');
    } else if (g.status === 'ABORTED') setStatus('Game aborted');
    else setStatus('');
  }, [gameId]);

  useEffect(() => { loadGame(); }, [loadGame]);

  useEffect(() => {
    if (!game || game.status === 'COMPLETED' || game.status === 'ABORTED') return;
    pollRef.current = setInterval(loadGame, 2000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [game?.status, loadGame]);

  useEffect(() => {
    if (!gameId || typeof gameId !== 'string') return;
    const channel = supabase
      .channel(`game-${gameId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'OnlineGame', filter: `id=eq.${gameId}` }, () => { loadGame(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [gameId, loadGame]);

  const myColor = game ? (game.whiteId === user?.id ? 'white' : game.blackId === user?.id ? 'black' : null) : null;
  const isMyTurn = chessRef.current ? (myColor === 'white' ? chessRef.current.turn() === 'w' : chessRef.current.turn() === 'b') : false;
  const isOver = game?.status === 'COMPLETED' || game?.status === 'ABORTED';

  const onPieceDrop = ({ sourceSquare, targetSquare, piece }: { piece: { pieceType: string }; sourceSquare: string; targetSquare: string | null }): boolean => {
    if (!chessRef.current || !game || !myColor || !isMyTurn || game.status !== 'ACTIVE' || !targetSquare) return false;
    const chess = chessRef.current;
    const isPromotion = piece.pieceType[1] === 'P' && ((myColor === 'white' && targetSquare[1] === '8') || (myColor === 'black' && targetSquare[1] === '1'));

    try {
      const move = chess.move({ from: sourceSquare, to: targetSquare, promotion: isPromotion ? 'q' : undefined } as Parameters<typeof chess.move>[0]);
      if (!move) return false;
      const newFen = chess.fen();
      const uciMove = sourceSquare + targetSquare + (isPromotion ? 'q' : '');
      const newMoves = (game.moves ? game.moves + ' ' : '') + uciMove;
      setFen(newFen);
      setMoveList(chess.history());

      let newStatus = game.status;
      let result: string | undefined;
      let termination: string | undefined;
      if (chess.isCheckmate()) { newStatus = 'COMPLETED'; result = myColor === 'white' ? '1-0' : '0-1'; termination = 'checkmate'; }
      else if (chess.isDraw()) { newStatus = 'COMPLETED'; result = '1/2-1/2'; termination = 'draw'; }

      fetch(`/api/games/${game.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moves: newMoves.trim(), fen: newFen, ...(newStatus !== game.status && { status: newStatus, result, termination }) }),
      });
      return true;
    } catch { return false; }
  };

  const resign = async () => {
    if (!game || !myColor) return;
    const result = myColor === 'white' ? '0-1' : '1-0';
    await fetch(`/api/games/${game.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'COMPLETED', result, termination: 'resignation' }),
    });
    loadGame();
  };

  return (
    <ProtectedRoute>
      <Layout title="Chess Game | Zaid Knights">
        <div className="min-h-screen py-8 px-4">
          <div className="max-w-5xl mx-auto">
            {!game ? (
              <div className="text-center py-20 text-gray-400">Loading game…</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="flex items-center gap-3 glass p-3 rounded-xl mb-2">
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-sm font-bold">
                      {(game.black?.name ?? 'Bot')[0]}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{game.black?.name ?? 'Waiting…'}</p>
                      {game.blackRating && <p className="text-gray-400 text-xs">{game.blackRating}</p>}
                    </div>
                  </div>

                  <div className="rounded-xl overflow-hidden border border-white/10">
                    <Chessboard
                      options={{
                        position: fen,
                        onPieceDrop: !!myColor && isMyTurn && !isOver ? onPieceDrop : undefined,
                        boardOrientation: myColor === 'black' ? 'black' : 'white',
                        allowDragging: !!myColor && isMyTurn && !isOver,
                        darkSquareStyle: { backgroundColor: '#4a3728' },
                        lightSquareStyle: { backgroundColor: '#f0d9b5' },
                      }}
                    />
                  </div>

                  <div className="flex items-center gap-3 glass p-3 rounded-xl mt-2">
                    <div className="w-8 h-8 rounded-full bg-yellow-600 flex items-center justify-center text-white text-sm font-bold">
                      {(game.white?.name ?? 'You')[0]}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{game.white?.name} {game.whiteId === user?.id && '(You)'}</p>
                      {game.whiteRating && <p className="text-gray-400 text-xs">{game.whiteRating}</p>}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {status && (
                    <div className="glass-gold p-4 rounded-xl text-center">
                      <p className="text-yellow-400 font-semibold">{status}</p>
                      {game.whiteRatingDelta !== null && (
                        <p className="text-gray-400 text-sm mt-1">
                          Rating: {(game.whiteId === user?.id ? game.whiteRatingDelta : game.blackRatingDelta) ?? 0 > 0 ? '+' : ''}
                          {game.whiteId === user?.id ? game.whiteRatingDelta : game.blackRatingDelta}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="glass p-4 rounded-xl">
                    <h3 className="text-white font-semibold mb-3 text-sm">Moves</h3>
                    <div className="max-h-48 overflow-y-auto text-sm font-mono">
                      {moveList.length === 0 ? <p className="text-gray-500">Game starts…</p> : (
                        <div className="space-y-0.5">
                          {moveList.reduce((rows: string[][], move, i) => {
                            if (i % 2 === 0) rows.push([move]); else rows[rows.length - 1].push(move);
                            return rows;
                          }, []).map((pair, i) => (
                            <div key={i} className="grid grid-cols-[1.5rem_1fr_1fr] gap-1 py-0.5">
                              <span className="text-gray-600">{i + 1}.</span>
                              <span className="text-gray-200">{pair[0]}</span>
                              <span className="text-gray-400">{pair[1] ?? ''}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {!isOver && myColor && (
                    <button onClick={resign} className="w-full btn-secondary text-sm py-2">🏳️ Resign</button>
                  )}
                  {isOver && (
                    <div className="space-y-2">
                      <button onClick={() => router.push('/play')} className="w-full btn-primary text-sm py-2">New Game</button>
                      <button onClick={() => router.push(`/analysis?game=${game.id}`)} className="w-full btn-secondary text-sm py-2">🔍 Analyse Game</button>
                    </div>
                  )}
                  {game.status === 'WAITING' && (
                    <div className="glass p-4 rounded-xl text-center">
                      <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">Waiting for an opponent…</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
