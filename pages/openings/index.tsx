import { useState } from 'react';
import dynamic from 'next/dynamic';
import Layout from '../../components/common/Layout';

const Chessboard = dynamic(() => import('react-chessboard').then(m => m.Chessboard), { ssr: false });

interface Opening {
  id: string;
  name: string;
  moves: string;
  fen: string;
  category: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

const OPENINGS: Opening[] = [
  { id: '1', name: 'Ruy Lopez (Spanish Game)', moves: '1.e4 e5 2.Nf3 Nc6 3.Bb5', fen: 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4', category: '1.e4 Openings', description: 'One of the oldest and most classical openings. White attacks the knight defending the e5 pawn, fighting for central control.', difficulty: 'Intermediate' },
  { id: '2', name: 'Italian Game', moves: '1.e4 e5 2.Nf3 Nc6 3.Bc4', fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4', category: '1.e4 Openings', description: 'White places the bishop on c4 targeting f7, the weakest point in Black\'s camp. A principled and aggressive opening.', difficulty: 'Beginner' },
  { id: '3', name: 'Sicilian Defense', moves: '1.e4 c5', fen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2', category: '1.e4 Openings', description: 'The most popular and combative response to 1.e4. Black immediately fights for the centre asymmetrically, creating imbalanced positions.', difficulty: 'Intermediate' },
  { id: '4', name: 'French Defense', moves: '1.e4 e6 2.d4 d5', fen: 'rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq d6 0 3', category: '1.e4 Openings', description: 'Black counters in the centre with ...e6 and ...d5. Leads to solid, strategic play where Black aims to undermine White\'s centre.', difficulty: 'Intermediate' },
  { id: '5', name: 'Caro-Kann Defense', moves: '1.e4 c6 2.d4 d5', fen: 'rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq d6 0 3', category: '1.e4 Openings', description: 'A solid, resilient defense. Black challenges the centre with ...c6 and ...d5, keeping the light-squared bishop outside the pawn chain.', difficulty: 'Beginner' },
  { id: '6', name: "King's Gambit", moves: '1.e4 e5 2.f4', fen: 'rnbqkbnr/pppp1ppp/8/4p3/4PP2/8/PPPP2PP/RNBQKBNR b KQkq f3 0 2', category: '1.e4 Openings', description: 'An aggressive, romantic opening. White sacrifices a pawn to open the f-file and gain rapid development and attacking chances.', difficulty: 'Advanced' },
  { id: '7', name: "Queen's Gambit", moves: '1.d4 d5 2.c4', fen: 'rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2', category: '1.d4 Openings', description: 'A classic positional opening. White offers a pawn to gain central space. One of the most studied openings at all levels.', difficulty: 'Beginner' },
  { id: '8', name: "King's Indian Defense", moves: '1.d4 Nf6 2.c4 g6 3.Nc3 Bg7', fen: 'rnbq1rk1/ppppppbp/5np1/8/2PP4/2N5/PP2PPPP/R1BQKBNR w KQ - 2 4', category: '1.d4 Openings', description: 'Black allows White to build a strong pawn centre, then strikes back with ...e5 or ...c5. Highly tactical and double-edged.', difficulty: 'Advanced' },
  { id: '9', name: 'Nimzo-Indian Defense', moves: '1.d4 Nf6 2.c4 e6 3.Nc3 Bb4', fen: 'rnbqk2r/pppp1ppp/4pn2/8/1bPP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4', category: '1.d4 Openings', description: 'Black pins the knight on c3 with the bishop. A highly principled defense that creates structural pressure and active piece play.', difficulty: 'Intermediate' },
  { id: '10', name: 'London System', moves: '1.d4 d5 2.Nf3 Nf6 3.Bf4', fen: 'rnbqkb1r/ppp1pppp/5n2/3p4/3P1B2/5N2/PPP1PPPP/RN1QKB1R b KQkq - 2 3', category: '1.d4 Openings', description: 'A solid, simple setup for White. Easy to learn and hard to face. White develops quickly and maintains a safe, stable position.', difficulty: 'Beginner' },
  { id: '11', name: 'English Opening', moves: '1.c4', fen: 'rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b KQkq c3 0 1', category: 'Flank Openings', description: 'White controls d5 from the flank with the c-pawn. Flexible and transpositional — can lead to Queen\'s Gambit or independent lines.', difficulty: 'Intermediate' },
  { id: '12', name: 'Réti Opening', moves: '1.Nf3 d5 2.c4', fen: 'rnbqkbnr/ppp1pppp/8/3p4/2P5/5N2/PP1PPPPP/RNBQKB1R b KQkq c3 0 2', category: 'Flank Openings', description: 'A hypermodern approach. White delays central pawn play and instead undermines Black\'s centre with pieces and flank pawns.', difficulty: 'Advanced' },
];

const CATEGORIES = ['All', '1.e4 Openings', '1.d4 Openings', 'Flank Openings'];

export default function OpeningsPage() {
  const [selected, setSelected] = useState<Opening>(OPENINGS[0]);
  const [filter, setFilter] = useState('All');

  const filtered = filter === 'All' ? OPENINGS : OPENINGS.filter(o => o.category === filter);

  return (
    <Layout title="Chess Openings | Zaid Knights" description="Study essential chess openings with interactive board positions.">
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-yellow-400 text-sm uppercase tracking-widest mb-2">♟ Opening Theory</p>
            <h1 className="text-4xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Chess Openings</h1>
            <p className="text-gray-400 mt-2">Study the most important openings every club player should know</p>
          </div>

          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {CATEGORIES.map(c => (
              <button
                type="button"
                key={c}
                onClick={() => setFilter(c)}
                className={`px-4 py-1.5 rounded-full text-sm border transition-all ${filter === c ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400' : 'border-white/10 text-gray-400 hover:border-white/20'}`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-2">
              {filtered.map(o => (
                <button
                  type="button"
                  key={o.id}
                  onClick={() => setSelected(o)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${selected.id === o.id ? 'bg-yellow-500/20 border-yellow-500/30' : 'glass hover:border-yellow-500/20'}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-white font-medium text-sm">{o.name}</p>
                      <p className="text-gray-500 text-xs mt-0.5 font-mono">{o.moves}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                      o.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                      o.difficulty === 'Intermediate' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-purple-500/20 text-purple-400'
                    }`}>{o.difficulty}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="lg:col-span-2">
              <div className="glass-gold p-5 rounded-xl mb-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-yellow-400/70 uppercase tracking-widest mb-1">{selected.category}</p>
                    <h2 className="text-xl font-bold text-white">{selected.name}</h2>
                    <p className="text-yellow-400 font-mono text-sm mt-1">{selected.moves}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full flex-shrink-0 ${
                    selected.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    selected.difficulty === 'Intermediate' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                    'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  }`}>{selected.difficulty}</span>
                </div>
                <p className="text-gray-300 text-sm mt-3">{selected.description}</p>
              </div>

              <div className="rounded-xl overflow-hidden border border-white/10">
                <Chessboard
                  position={selected.fen}
                  arePiecesDraggable={false}
                  customDarkSquareStyle={{ backgroundColor: '#4a3728' }}
                  customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
                />
              </div>

              <div className="glass p-4 rounded-xl mt-4">
                <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Key Ideas</p>
                <p className="text-gray-300 text-sm">{selected.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
