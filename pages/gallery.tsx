import Layout from '../components/common/Layout';

const gallery = [
  { title: 'Champions Ceremony', caption: '2025 awards night' },
  { title: 'Team Training', caption: 'Weekly strategy session' },
  { title: 'Open Tournament', caption: 'Nairobi Rapid Open' }
];

export default function Gallery() {
  return (
    <Layout title="Gallery | ZaidKnights Chess Club" description="Browse photos from club tournaments, training sessions, and member events.">
      <section className="px-6 py-24 sm:px-10">
        <div className="mx-auto max-w-6xl space-y-10">
          <div className="rounded-[2rem] border border-white/10 bg-black/70 p-10 shadow-glass text-slate-300">
            <h1 className="text-5xl font-semibold text-white">Gallery</h1>
            <p className="mt-4 text-lg">Visual highlights from our tournaments, training classes, and championship celebrations.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.map((item) => (
              <div key={item.title} className="glass-card rounded-3xl overflow-hidden p-6">
                <div className="mb-6 h-52 rounded-3xl bg-white/5" />
                <h2 className="text-2xl font-semibold text-white">{item.title}</h2>
                <p className="mt-3 text-slate-400">{item.caption}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
