import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../components/common/Layout';
import { useAuth } from './_app';

export default function LoginPage() {
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const { setUser } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        // ?redirect= takes priority, then the role-based redirectTo from the API
        const redirect = (router.query.redirect as string) || data.redirectTo || '/dashboard';
        router.push(redirect);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Login | Zaid Knights Chess Club">
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 chess-pattern">
        <div className="w-full max-w-md">

          <div className="text-center mb-8">
            <span className="text-5xl">♞</span>
            <h1 className="text-2xl font-bold text-white mt-3">Welcome back</h1>
            <p className="text-gray-400 text-sm mt-1">Sign in to your Zaid Knights account</p>
          </div>

          <div className="glass p-8 rounded-2xl">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Email address</label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="input"
                />
              </div>

              <div>
                <label className="label">Password</label>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="input"
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-white/10 text-center space-y-2">
              <p className="text-gray-500 text-sm">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-yellow-400 hover:text-yellow-300 font-medium">
                  Join the club
                </Link>
              </p>
              <p className="text-gray-600 text-xs">
                Admin?{' '}
                <Link href="/admin/login" className="text-gray-500 hover:text-white transition">
                  Admin portal →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
