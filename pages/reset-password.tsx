import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../components/common/Layout';

type Stage = 'form' | 'success';

export default function ResetPasswordPage() {
  const router  = useRouter();
  const token   = router.query.token as string | undefined;

  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [stage,     setStage]     = useState<Stage>('form');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 8)  { setError('Password must be at least 8 characters'); return; }
    if (!token)               { setError('Invalid reset link'); return; }

    setLoading(true);
    try {
      const res  = await fetch('/api/auth/reset-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed');
      setStage('success');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Reset Password | Zaid Knights Chess Club">
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 chess-pattern">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <span className="text-5xl">♞</span>
            <h1 className="text-2xl font-bold text-white mt-3">Set New Password</h1>
            <p className="text-gray-400 text-sm mt-1">Choose a strong password</p>
          </div>

          <div className="glass p-8 rounded-2xl">
            {stage === 'form' ? (
              <>
                {!token && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-5">
                    Invalid or missing reset token. Please request a new reset link.
                  </div>
                )}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-5">
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="label">New Password</label>
                    <input
                      type="password"
                      required
                      className="input mt-1"
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label">Confirm Password</label>
                    <input
                      type="password"
                      required
                      className="input mt-1"
                      placeholder="Repeat your new password"
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                    />
                  </div>
                  <button type="submit" disabled={loading || !token} className="btn-primary w-full py-3">
                    {loading ? 'Updating…' : 'Update Password →'}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center space-y-4">
                <div className="text-5xl">🎉</div>
                <h2 className="text-white font-bold text-lg">Password Updated!</h2>
                <p className="text-gray-400 text-sm">You can now sign in with your new password.</p>
                <Link href="/login" className="btn-primary w-full py-3 block text-center">
                  Sign In →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
