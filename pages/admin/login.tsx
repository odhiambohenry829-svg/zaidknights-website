import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../../components/common/Layout';
import { useAuth } from '../_app';

export default function AdminLoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, setUser, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'ADMIN') router.replace('/admin');
      else setError('Your account does not have admin access.');
    }
  }, [user, authLoading, router]);

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
        if (data.user.role !== 'ADMIN') {
          setError('This portal is for administrators only.');
          await fetch('/api/auth/logout');
          return;
        }
        setUser(data.user);
        router.push('/admin');
      } else {
        setError(data.error || 'Login failed.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;

  return (
    <Layout title="Admin Portal | Zaid Knights Chess Club">
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 chess-pattern">
        <div className="w-full max-w-md">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-yellow-500/20 border border-yellow-500/40 mb-4">
              <span className="text-3xl">♛</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
            <p className="text-gray-500 text-sm mt-1">Zaid Knights Club Management</p>
          </div>

          <div className="glass p-8 rounded-2xl border border-yellow-500/20">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Admin Email</label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="admin@zaidknights.org"
                  className="input mt-1"
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
                  className="input mt-1"
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
                {loading ? 'Signing in…' : 'Sign In to Admin →'}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-white/10 text-center space-y-2">
              <p className="text-gray-500 text-xs">
                Not an admin?{' '}
                <Link href="/login" className="text-gray-400 hover:text-white transition">
                  Member login
                </Link>
              </p>
              <p className="text-gray-600 text-xs">
                First time?{' '}
                <Link href="/admin/setup" className="text-yellow-500/70 hover:text-yellow-400 transition">
                  Set up admin account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
