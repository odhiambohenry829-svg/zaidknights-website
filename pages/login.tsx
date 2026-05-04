import { useState } from 'react';
import Layout from '../components/common/Layout';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <Layout title="Login | ZaidKnights Chess Club" description="Member and admin login portal for ZaidKnights Chess Club.">
      <section className="flex min-h-[80vh] items-center justify-center px-6 py-24 sm:px-10">
        <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-black/70 p-10 shadow-glass text-slate-300">
          <h1 className="text-4xl font-semibold text-white">Member login</h1>
          <p className="mt-3 text-slate-400">Access your dashboard, tournament registrations, and member benefits.</p>
          <form className="mt-10 space-y-6" onSubmit={(e) => e.preventDefault()}>
            <label className="block">
              <span>Email</span>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="mt-2 w-full rounded-3xl border border-white/10 bg-black/60 px-4 py-3 text-white" />
            </label>
            <label className="block">
              <span>Password</span>
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="mt-2 w-full rounded-3xl border border-white/10 bg-black/60 px-4 py-3 text-white" />
            </label>
            <button className="w-full rounded-full bg-gold px-6 py-3 text-black transition hover:bg-gold/90">Sign in</button>
          </form>
          <p className="mt-6 text-sm text-slate-400">New to the club? <Link href="/register" className="text-gold">Create account</Link></p>
        </div>
      </section>
    </Layout>
  );
}
