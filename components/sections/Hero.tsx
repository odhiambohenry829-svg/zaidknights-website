import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-6 py-24 sm:px-10">
      <div className="absolute inset-0 opacity-30">
        <div className="gradient-board h-full w-full bg-cover bg-center" />
      </div>
      <div className="relative mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr]"
        >
          <div className="space-y-6 text-white">
            <span className="inline-flex rounded-full border border-gold/50 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.25em] text-gold">
              Join the next chess movement
            </span>
            <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
              ZaidKnights Chess Club
            </h1>
            <p className="max-w-2xl text-lg text-slate-300">Strategy. Discipline. Excellence. A full chess ecosystem for members, tournaments, coaches, and champions.</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/membership" className="rounded-full bg-gold px-6 py-3 text-black transition hover:bg-gold/90">
                Join the Club
              </Link>
              <Link href="/events" className="rounded-full border border-white/20 px-6 py-3 text-white transition hover:border-gold hover:text-gold">
                View Tournaments
              </Link>
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-8 shadow-glass">
            <div className="mb-8 rounded-3xl border border-white/10 bg-black/70 p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Next event</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">Nairobi Rapid Open</h2>
              <p className="mt-2 text-slate-300">May 25, 2026 · Nairobi Chess Academy</p>
              <div className="mt-6 grid grid-cols-2 gap-4 text-center text-white">
                <div className="rounded-3xl bg-white/5 p-4">
                  <p className="text-3xl font-semibold">12</p>
                  <p className="text-sm text-slate-400">Days</p>
                </div>
                <div className="rounded-3xl bg-white/5 p-4">
                  <p className="text-3xl font-semibold">4</p>
                  <p className="text-sm text-slate-400">Hours</p>
                </div>
              </div>
            </div>
            <div className="space-y-4 text-slate-300">
              <p className="text-sm uppercase tracking-[0.2em] text-gold">Featured Champions</p>
              <div className="grid gap-3">
                {['Amina Mwangi', 'David Okello', 'Sofia Kariuki'].map((name) => (
                  <div key={name} className="rounded-3xl bg-white/5 p-4">
                    <p className="text-base font-semibold text-white">{name}</p>
                    <p className="text-sm text-slate-400">Elite Knight • 1830 ELO</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
