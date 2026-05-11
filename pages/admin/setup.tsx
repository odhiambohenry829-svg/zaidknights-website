import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../../components/common/Layout';

export default function AdminSetupPage() {
  const [adminExists, setAdminExists] = useState<boolean | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', setupKey: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/setup')
      .then(r => r.json())
      .then(d => setAdminExists(d.adminExists))
      .catch(() => setAdminExists(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/admin/setup', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          name:     form.name,
          email:    form.email,
          password: form.password,
          setupKey: form.setupKey,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setDone(true);
      } else {
        setError(data.error || 'Setup failed.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (adminExists === null) return null;

  return (
    <Layout title="Admin Setup | Zaid Knights Chess Club">
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 chess-pattern">
        <div className="w-full max-w-md">

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-yellow-500/20 border border-yellow-500/40 mb-4">
              <span className="text-3xl">♛</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Setup</h1>
            <p className="text-gray-500 text-sm mt-1">Create the first administrator account</p>
          </div>

          {adminExists ? (
            <div className="glass p-8 rounded-2xl border border-yellow-500/20 text-center">
              <p className="text-5xl mb-4">🔒</p>
              <h2 className="text-white font-bold text-lg mb-2">Setup Already Complete</h2>
              <p className="text-gray-400 text-sm mb-6">An admin account already exists. Please log in through the admin portal.</p>
              <Link href="/admin/login" className="btn-primary rounded-xl px-6 py-3 inline-block">
                Go to Admin Login →
              </Link>
            </div>
          ) : done ? (
            <div className="glass p-8 rounded-2xl border border-yellow-500/20 text-center">
              <p className="text-5xl mb-4">🎉</p>
              <h2 className="text-white font-bold text-lg mb-2">Admin Account Created!</h2>
              <p className="text-gray-400 text-sm mb-6">You can now log in to the admin portal with your credentials.</p>
              <Link href="/admin/login" className="btn-primary rounded-xl px-6 py-3 inline-block">
                Go to Admin Login →
              </Link>
            </div>
          ) : (
            <div className="glass p-8 rounded-2xl border border-yellow-500/20">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-5">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Full Name *</label>
                  <input required className="input mt-1" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Club Administrator" />
                </div>
                <div>
                  <label className="label">Email Address *</label>
                  <input required type="email" className="input mt-1" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="admin@zaidknights.org" />
                </div>
                <div>
                  <label className="label">Password *</label>
                  <input required type="password" className="input mt-1" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min. 8 characters" />
                </div>
                <div>
                  <label className="label">Confirm Password *</label>
                  <input required type="password" className="input mt-1" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} placeholder="Repeat password" />
                </div>
                <div>
                  <label className="label">Setup Key <span className="text-gray-600">(if configured)</span></label>
                  <input type="password" className="input mt-1" value={form.setupKey} onChange={e => setForm({ ...form, setupKey: e.target.value })} placeholder="Optional setup key" />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
                  {loading ? 'Creating account…' : 'Create Admin Account →'}
                </button>
              </form>

              <p className="text-center text-gray-600 text-xs mt-5">
                Already have an account?{' '}
                <Link href="/admin/login" className="text-gray-500 hover:text-white transition">Login here</Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
