import { useState } from 'react';
import Layout from '../components/common/Layout';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <Layout title="Register | ZaidKnights Chess Club" description="Create a membership account and join ZaidKnights Chess Club.">
      <section className="flex min-h-[80vh] items-center justify-center px-6 py-24 sm:px-10">
        <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-black/70 p-10 shadow-glass text-slate-300">
          <h1 className="text-4xl font-semibold text-white">Create account</h1>
          <p className="mt-3 text-slate-400">Register to secure your membership, join tournaments, and access the member panel.</p>
          <form className="mt-10 space-y-6" onSubmit={(e) => e.preventDefault()}>
            <label className="block">
              <span>Name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-3xl border border-white/10 bg-black/60 px-4 py-3 text-white" />
            </label>
            <label className="block">
              <span>Email</span>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="mt-2 w-full rounded-3xl border border-white/10 bg-black/60 px-4 py-3 text-white" />
            </label>
            <label className="block">
              <span>Password</span>
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="mt-2 w-full rounded-3xl border border-white/10 bg-black/60 px-4 py-3 text-white" />
            </label>
            <button className="w-full rounded-full bg-gold px-6 py-3 text-black transition hover:bg-gold/90">Create account</button>
          </form>
        </div>
      </section>
    </Layout>
  );
}
