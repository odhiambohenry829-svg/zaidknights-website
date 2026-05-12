import { useState } from 'react';
import Link from 'next/link';
import Layout from '../components/common/Layout';

type Stage = 'form' | 'sent';

export default function ForgotPasswordPage() {
  const [email,  setEmail]  = useState('');
  const [stage,  setStage]  = useState<Stage>('form');
  const [loading, setLoading] = useState(false);
  const [error,  setError]  = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await fetch('/api/auth/forgot-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      });
      setStage('sent');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Forgot Password | Zaid Knights Chess Club">
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 chess-pattern">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <span className="text-5xl">♞</span>
            <h1 className="text-2xl font-bold text-white mt-3">Reset Password</h1>
            <p className="text-gray-400 text-sm mt-1">We'll send a reset link to your email</p>
          </div>

          <div className="glass p-8 rounded-2xl">
            {stage === 'form' ? (
              <>
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
                      className="input mt-1"
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                    {loading ? 'Sending…' : 'Send Reset Link →'}
                  </button>
                </form>
                <p className="text-center text-gray-500 text-sm mt-5">
                  <Link href="/login" className="text-yellow-400 hover:text-yellow-300">← Back to login</Link>
                </p>
              </>
            ) : (
              <div className="text-center space-y-4">
                <div className="text-5xl">📬</div>
                <h2 className="text-white font-bold text-lg">Check your email</h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  If <strong className="text-white">{email}</strong> is registered, you'll receive
                  a password reset link within a few minutes.
                </p>
                <p className="text-gray-500 text-xs">Check your spam folder if you don't see it.</p>
                <div className="pt-4 space-y-2">
                  <button
                    onClick={() => { setStage('form'); setEmail(''); }}
                    className="btn-secondary w-full py-2.5 text-sm"
                  >
                    Try a different email
                  </button>
                  <Link href="/login" className="block text-yellow-400 text-sm hover:text-yellow-300 text-center pt-1">
                    Back to login
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
