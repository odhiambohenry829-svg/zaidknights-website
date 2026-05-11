import { useState } from 'react';
import Layout from '../components/common/Layout';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setStatus('loading');
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send message.');
      }
      setStatus('success');
      setName('');
      setEmail('');
      setMessage('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setStatus('error');
    }
  };

  return (
    <Layout title="Contact | ZaidKnights Chess Club" description="Contact ZaidKnights Chess Club for membership, tournaments, and coaching.">
      <section className="px-6 py-24 sm:px-10">
        <div className="mx-auto max-w-6xl grid gap-12 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="rounded-[2rem] border border-white/10 bg-black/70 p-10 shadow-glass text-slate-300">
            <h1 className="text-5xl font-semibold text-white">Contact us</h1>
            <p className="mt-4 text-lg">Send a message, ask about membership, or join our next event.</p>

            {status === 'success' ? (
              <div className="mt-10 rounded-2xl border border-green-500/30 bg-green-500/10 p-6 text-green-400">
                <p className="font-semibold text-lg">Message sent!</p>
                <p className="mt-1 text-sm">We'll get back to you as soon as possible.</p>
                <button
                  onClick={() => setStatus('idle')}
                  className="mt-4 text-sm text-green-300 hover:text-white transition"
                >
                  Send another message →
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-10 space-y-6">
                <label className="block">
                  <span>Name</span>
                  <input
                    className="mt-2 w-full rounded-3xl border border-white/10 bg-black/60 px-4 py-3 text-white"
                    placeholder="Your name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    disabled={status === 'loading'}
                  />
                </label>
                <label className="block">
                  <span>Email</span>
                  <input
                    type="email"
                    className="mt-2 w-full rounded-3xl border border-white/10 bg-black/60 px-4 py-3 text-white"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={status === 'loading'}
                  />
                </label>
                <label className="block">
                  <span>Message</span>
                  <textarea
                    rows={5}
                    className="mt-2 w-full rounded-3xl border border-white/10 bg-black/60 px-4 py-3 text-white"
                    placeholder="How can we help?"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    disabled={status === 'loading'}
                  />
                </label>
                {error && (
                  <p className="text-red-400 text-sm">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="rounded-full bg-gold px-6 py-3 text-black transition hover:bg-gold/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? 'Sending…' : 'Send message'}
                </button>
              </form>
            )}
          </div>

          <div className="space-y-8 rounded-[2rem] border border-white/10 bg-white/5 p-10 shadow-glass text-slate-300">
            <div>
              <h2 className="text-3xl font-semibold text-white">Reach us</h2>
              <p className="mt-4">Nairobi Chess Academy, Nairobi, Kenya</p>
            </div>
            <div className="space-y-4 text-slate-300">
              <p><span className="font-semibold text-white">Email:</span> hello@zaidknights.com</p>
              <p><span className="font-semibold text-white">WhatsApp:</span> +254 700 000 000</p>
              <p><span className="font-semibold text-white">Social:</span> Instagram · TikTok</p>
            </div>
            <div className="rounded-3xl bg-black/60 p-6 text-slate-300">
              <p className="text-sm uppercase tracking-[0.3em] text-gold">Location</p>
              <p className="mt-4">Nairobi Chess Academy, Langata Road, Nairobi, Kenya</p>
              <p className="mt-4 text-xs text-slate-500">Google Maps integration is available on the live deployment.</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
