import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/common/Layout';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const validateForm = () => {
    if (!form.name.trim()) return 'Name is required';
    if (!form.email.includes('@')) return 'Enter a valid email';
    if (form.password.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error('Invalid server response');
      }

      if (!res.ok) {
        setError(data?.message || 'Registration failed.');
      } else {
        setSuccess('Account created successfully! Redirecting...');
        setTimeout(() => {
          router.push('/login?registered=true');
        }, 1500);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout
      title="Register | ZaidKnights Chess Club"
      description="Create a membership account and join ZaidKnights Chess Club."
    >
      <section className="flex min-h-[80vh] items-center justify-center px-6 py-24 sm:px-10">
        <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-black/70 p-10 shadow-glass text-slate-300">

          <h1 className="text-4xl font-semibold text-white">Create account</h1>
          <p className="mt-3 text-slate-400">
            Register to secure your membership, join tournaments, and access the member panel.
          </p>

          {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}
          {success && <p className="mt-4 text-green-400 text-sm">{success}</p>}

          <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
            
            <label className="block">
              <span>Name</span>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                disabled={loading}
                className="mt-2 w-full rounded-3xl border border-white/10 bg-black/60 px-4 py-3 text-white"
              />
            </label>

            <label className="block">
              <span>Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                disabled={loading}
                className="mt-2 w-full rounded-3xl border border-white/10 bg-black/60 px-4 py-3 text-white"
              />
            </label>

            <label className="block">
              <span>Password</span>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                disabled={loading}
                className="mt-2 w-full rounded-3xl border border-white/10 bg-black/60 px-4 py-3 text-white"
              />
            </label>

              <button
  disabled={loading}
  className="w-full rounded-full bg-brand-gold px-6 py-3 text-white transition hover:opacity-90 disabled:opacity-50"
>
  {loading ? 'Creating account...' : 'Create account'}
</button>
            </button>

          </form>
        </div>
      </section>
    </Layout>
  );
}