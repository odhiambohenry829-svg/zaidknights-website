import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../components/common/Layout';
import { useAuth } from './_app';

const TIERS = [
  { value: 'BEGINNER', label: 'Beginner',  price: 'Free',       desc: 'Perfect to start your journey' },
  { value: 'ADVANCED', label: 'Advanced',  price: 'KES 2,500',  desc: 'For competitive players' },
  { value: 'MASTER',   label: 'Master',    price: 'KES 5,500',  desc: 'Serious competitors only' },
];

export default function RegisterPage() {
  const router = useRouter();
  const initialTier = (router.query.tier as string) || 'BEGINNER';
  const { setUser } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    tier: initialTier,
    agreed: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!form.agreed) {
      setError('Please agree to the terms');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password, tier: form.tier }),
      });
      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        router.push('/dashboard');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Register | Zaid Knights Chess Club">
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 chess-pattern">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <span className="text-5xl">♞</span>
            <h1 className="text-2xl font-bold text-white mt-3">Join Zaid Knights</h1>
            <p className="text-gray-400 text-sm mt-1">Create your account and start playing</p>
          </div>

          <div className="glass p-8 rounded-2xl">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Your full name" className="input" />
              </div>

              <div>
                <label className="label">Email</label>
                <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="you@example.com" className="input" />
              </div>

              <div>
                <label className="label">Password</label>
                <input type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="At least 8 characters" className="input" />
              </div>

              <div>
                <label className="label">Confirm Password</label>
                <input type="password" required value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} placeholder="Repeat your password" className="input" />
              </div>

              {/* Tier Selection */}
              <div>
                <label className="label">Membership Tier</label>
                <div className="space-y-2 mt-1">
                  {TIERS.map(tier => (
                    <label key={tier.value} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${form.tier === tier.value ? 'border-yellow-500/50 bg-yellow-500/10' : 'border-white/10 hover:border-white/20'}`}>
                      <input type="radio" name="tier" value={tier.value} checked={form.tier === tier.value} onChange={e => setForm({...form, tier: e.target.value})} className="accent-yellow-500" />
                      <div className="flex-1">
                        <span className="text-white font-medium text-sm">{tier.label}</span>
                        <span className="text-gray-400 text-xs ml-2">— {tier.desc}</span>
                      </div>
                      <span className="text-yellow-400 text-sm font-semibold">{tier.price}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-2">
                <input type="checkbox" id="agreed" checked={form.agreed} onChange={e => setForm({...form, agreed: e.target.checked})} className="w-4 h-4 mt-0.5 accent-yellow-500" />
                <label htmlFor="agreed" className="text-sm text-gray-400">
                  I agree to the club rules and terms of membership
                </label>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-gray-500 text-sm mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-yellow-400 hover:text-yellow-300 font-medium">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}