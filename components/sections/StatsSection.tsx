export default function StatsSection() {
  return (
    <section className="bg-white/5 px-6 py-24 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { label: 'Members', value: '280+' },
            { label: 'Tournaments', value: '24 this year' },
            { label: 'Average ELO', value: '1575' }
          ].map((stat) => (
            <div key={stat.label} className="glass-card rounded-3xl p-8 text-center">
              <p className="text-5xl font-semibold text-gold">{stat.value}</p>
              <p className="mt-4 text-sm uppercase tracking-[0.3em] text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
