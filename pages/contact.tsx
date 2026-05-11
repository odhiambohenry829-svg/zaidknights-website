import { useState } from 'react';
import Layout from '../components/common/Layout';

type Status = 'idle' | 'loading' | 'success' | 'error';

const socialLinks = [
  { label: 'X / Twitter', href: 'https://x.com/zaidknights?s=20',                                                                       icon: '𝕏' },
  { label: 'Facebook',    href: 'https://www.facebook.com/profile.php?id=61575904767623&sk',                                             icon: 'f' },
  { label: 'Instagram',   href: 'https://www.instagram.com/zaidknights?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==',      icon: '◎' },
];

const hours = [
  { day: 'Monday – Friday', time: '4:00 PM – 8:00 PM' },
  { day: 'Saturday',        time: '9:00 AM – 6:00 PM' },
  { day: 'Sunday',          time: 'Tournament Days Only' },
];

export default function ContactPage() {
  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status,  setStatus]  = useState<Status>('idle');
  const [error,   setError]   = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    setStatus('loading');
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send message.');
      }
      setStatus('success');
      setName(''); setEmail(''); setSubject(''); setMessage('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setStatus('error');
    }
  };

  return (
    <Layout
      title="Contact | Zaid Knights Chess Club"
      description="Contact Zaid Knights Chess Club for membership enquiries, tournament info, and coaching."
    >
      {/* Header */}
      <section className="py-16 border-b border-white/10 chess-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold text-white mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            Contact <span className="gold-gradient">Us</span>
          </h1>
          <p className="text-gray-400">Get in touch — we'd love to hear from you</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

            {/* ── Contact Form ── */}
            <div className="glass rounded-2xl p-8">
              <h2 className="text-white font-semibold text-xl mb-6">Send a Message</h2>

              {status === 'success' ? (
                <div className="text-center py-10">
                  <div className="text-5xl mb-4">✉️</div>
                  <h3 className="text-white font-bold text-xl mb-2">Message Sent!</h3>
                  <p className="text-gray-400 mb-6">We'll get back to you as soon as possible.</p>
                  <button onClick={() => setStatus('idle')} className="btn-secondary rounded-xl px-6 py-2">
                    Send another →
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="block">
                      <span className="label">Name *</span>
                      <input
                        className="input mt-1"
                        placeholder="Your name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        disabled={status === 'loading'}
                        required
                      />
                    </label>
                    <label className="block">
                      <span className="label">Email *</span>
                      <input
                        type="email"
                        className="input mt-1"
                        placeholder="you@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        disabled={status === 'loading'}
                        required
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="label">Subject</span>
                    <input
                      className="input mt-1"
                      placeholder="What is this about?"
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      disabled={status === 'loading'}
                    />
                  </label>

                  <label className="block">
                    <span className="label">Message *</span>
                    <textarea
                      rows={5}
                      className="input mt-1 resize-none"
                      placeholder="How can we help you?"
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      disabled={status === 'loading'}
                      required
                    />
                  </label>

                  {error && <p className="text-red-400 text-sm">{error}</p>}

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full btn-primary py-3 rounded-lg disabled:opacity-50"
                  >
                    {status === 'loading' ? 'Sending…' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>

            {/* ── Info Sidebar ── */}
            <div className="space-y-6">

              {/* Reach us */}
              <div className="glass rounded-2xl p-6">
                <h2 className="text-white font-semibold text-xl mb-5">Reach Us</h2>
                <div className="space-y-4">
                  {[
                    { icon: '📍', label: 'Address',  value: 'Nairobi Chess Academy, Langata Road, Nairobi, Kenya', href: undefined },
                    { icon: '✉️', label: 'Email',    value: 'info@zaidknights.org',  href: 'mailto:info@zaidknights.org' },
                    { icon: '📱', label: 'WhatsApp', value: '+254 700 000 000',       href: 'https://wa.me/254700000000' },
                  ].map(item => (
                    <div key={item.label} className="flex items-start gap-3">
                      <span className="text-xl mt-0.5 flex-shrink-0">{item.icon}</span>
                      <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wide mb-0.5">{item.label}</p>
                        {item.href ? (
                          <a href={item.href} className="text-white hover:text-yellow-400 transition-colors text-sm">
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-white text-sm">{item.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social */}
              <div className="glass rounded-2xl p-6">
                <h2 className="text-white font-semibold text-xl mb-4">Follow Us</h2>
                <div className="flex flex-wrap gap-3">
                  {socialLinks.map(s => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="flex items-center gap-2 px-4 py-2.5 glass rounded-xl text-gray-400 hover:text-yellow-400 hover:border-yellow-500/30 transition-all text-sm font-medium"
                    >
                      <span className="font-bold">{s.icon}</span>
                      {s.label}
                    </a>
                  ))}
                </div>
              </div>

              {/* Club Hours */}
              <div className="glass rounded-2xl p-6">
                <h2 className="text-white font-semibold text-xl mb-4">Club Hours</h2>
                <div className="space-y-3">
                  {hours.map(row => (
                    <div key={row.day} className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0 last:pb-0">
                      <span className="text-gray-400">{row.day}</span>
                      <span className="text-white font-medium">{row.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
