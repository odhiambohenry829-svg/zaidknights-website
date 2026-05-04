import Layout from '../components/common/Layout';

export default function Admin() {
  return (
    <Layout title="Admin Dashboard | ZaidKnights Chess Club" description="Secure admin dashboard for managing members, events, posts, gallery, and analytics.">
      <section className="px-6 py-24 sm:px-10">
        <div className="mx-auto max-w-6xl space-y-10">
          <div className="rounded-[2rem] border border-white/10 bg-black/70 p-10 shadow-glass text-slate-300">
            <h1 className="text-5xl font-semibold text-white">Admin dashboard</h1>
            <p className="mt-4 text-lg">Manage users, approve applications, publish posts, and monitor analytics.</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {[
              { label: 'Members', value: '280', detail: 'Active membership' },
              { label: 'Pending applications', value: '14', detail: 'Review and approve' },
              { label: 'Live events', value: '3', detail: 'Open registrations' },
              { label: 'Posts', value: '12', detail: 'Published news articles' }
            ].map((item) => (
              <div key={item.label} className="glass-card rounded-3xl p-8">
                <p className="text-sm uppercase tracking-[0.3em] text-gold">{item.label}</p>
                <p className="mt-4 text-4xl font-semibold text-white">{item.value}</p>
                <p className="mt-2 text-slate-400">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
