import Layout from '../components/common/Layout';

const posts = [
  { title: 'Mastering the London System', excerpt: 'A step-by-step strategy guide for club players.', slug: 'london-system' },
  { title: 'How to Prepare for Rapid Tournaments', excerpt: 'Practical tips for opening preparation and time management.', slug: 'rapid-tournament' },
  { title: 'Evaluating Your Game with Post-Match Analysis', excerpt: 'Build a habit of reviewing games and tracking progress.', slug: 'post-match-analysis' }
];

export default function Blog() {
  return (
    <Layout title="Blog | ZaidKnights Chess Club" description="Chess articles, opening guides, training tips, and club news.">
      <section className="px-6 py-24 sm:px-10">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="rounded-[2rem] border border-white/10 bg-black/70 p-10 shadow-glass text-slate-300">
            <h1 className="text-5xl font-semibold text-white">Chess insights & news</h1>
            <p className="mt-4 text-lg">Club-written articles, opening guides, and tactical training posts for every player.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {posts.map((post) => (
              <article key={post.slug} className="glass-card rounded-3xl p-8">
                <h2 className="text-2xl font-semibold text-white">{post.title}</h2>
                <p className="mt-4 text-slate-300">{post.excerpt}</p>
                <button className="mt-6 rounded-full bg-gold px-5 py-3 text-black transition hover:bg-gold/90">Read article</button>
              </article>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
