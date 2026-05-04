import Layout from '../components/common/Layout';

const leaderboard = [
  { name: 'Amina Mwangi', rating: 1920, record: '18-3-1' },
  { name: 'David Okello', rating: 1865, record: '16-4-2' },
  { name: 'Sofia Kariuki', rating: 1810, record: '14-5-3' }
];

export default function Rankings() {
  return (
    <Layout title="Rankings | ZaidKnights Chess Club" description="View the official leaderboards, ELO standings, and individual player performance.">
      <section className="px-6 py-24 sm:px-10">
        <div className="mx-auto max-w-6xl space-y-10">
          <div className="rounded-[2rem] border border-white/10 bg-black/70 p-10 shadow-glass text-slate-300">
            <h1 className="text-5xl font-semibold text-white">Rankings & leaderboards</h1>
            <p className="mt-4 text-lg">Track club ratings, player performance, and win/loss history across events.</p>
          </div>
          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-glass">
            <table className="min-w-full text-left text-sm text-slate-300">
              <thead className="bg-black/70 text-slate-400">
                <tr>
                  <th className="px-6 py-4">Player</th>
                  <th className="px-6 py-4">ELO</th>
                  <th className="px-6 py-4">Record</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((player) => (
                  <tr key={player.name} className="border-t border-white/10 hover:bg-white/5">
                    <td className="px-6 py-4 font-medium text-white">{player.name}</td>
                    <td className="px-6 py-4">{player.rating}</td>
                    <td className="px-6 py-4">{player.record}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </Layout>
  );
}
