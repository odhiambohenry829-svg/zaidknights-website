import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (router.query.error === 'google_cancelled') setError('Google sign-in was cancelled.');
    if (router.query.error === 'google_failed')    setError('Google sign-in failed. Please try email instead.');
  }, [router.query.error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res  = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
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

            {/* Google sign-in */}
            <a
              href="/api/auth/google"
              className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-all mb-5"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908C16.658 14.013 17.64 11.705 17.64 9.2z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </a>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-gray-600 text-xs">or with email</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

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
                  className="input mt-1"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="label !mb-0">Password</label>
                  <Link href="/forgot-password" className="text-xs text-gray-500 hover:text-yellow-400 transition">
                    Forgot password?
                  </Link>
                </div>
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
              <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-1">
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-white/10 text-center space-y-2">
              <p className="text-gray-500 text-sm">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-yellow-400 hover:text-yellow-300 font-medium">Join the club</Link>
              </p>
              <p className="text-gray-600 text-xs">
                Admin?{' '}
                <Link href="/admin/login" className="text-gray-500 hover:text-white transition">Admin portal →</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
