import { useState } from 'react';
import Layout from '../components/common/Layout';

const SUBJECTS = [
  'General Inquiry',
  'Membership',
  'Tournament',
  'Partnership',
  'Donation',
  'Junior Programme',
  'School Partnership',
];

const FAQS = [
  {
    question: 'How do I join Zaid Knights Chess Club?',
    answer: 'Simply click "Join the Club" on our homepage or visit zaidknights.org/register. Beginner membership is free! Fill in your details, choose a membership tier, and you\'re in. Our team will activate your account within 24 hours.',
  },
  {
    question: 'What are your training sessions like?',
    answer: 'We conduct house training sessions and partner with schools across Nairobi. Sessions include opening theory, tactics puzzles, endgame studies, and practice games with analysis. Beginners and advanced players are coached at their level.',
  },
  {
    question: 'Do you accept junior (under-18) members?',
    answer: 'Yes! We actively work with schools and young players. A parent or guardian must complete the registration form for minors. Please contact us at info@zaidknights.org or WhatsApp +254 726 027 966 for details. We take safeguarding very seriously.',
  },
  {
    question: 'Can my school partner with Zaid Knights?',
    answer: 'Absolutely! We actively partner with schools across Nairobi to bring chess to students. Email info@zaidknights.org or WhatsApp us to discuss how we can bring chess training to your school.',
  },
  {
    question: 'What level do I need to be to join?',
    answer: 'Any level! From complete beginners to experienced players — everyone is welcome at Zaid Knights. We have programmes suited for all skill levels and our coaches will help you improve regardless of where you start.',
  },
  {
    question: 'How do I donate to Zaid Knights?',
    answer: 'You can donate via M-Pesa Paybill 880100, Account 124498 (NCBA). Visit our donate page at zaidknights.org/donate for full details and payment options.',
  },
];

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: SUBJECTS[0], message: '' });
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send message');
      setStatus('success');
      setForm({ name: '', email: '', subject: SUBJECTS[0], message: '' });
    } catch (e: unknown) {
      setStatus('error');
      setErrorMsg(e instanceof Error ? e.message : 'Failed to send message. Please try again.');
    }
  };

  return (
    <Layout title="Contact | Zaid Knights Chess Club">

      {/* Hero */}
      <section className="py-20 px-4 chess-pattern">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Get in <span className="gold-gradient">Touch</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Questions, partnerships, membership inquiries — we'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Two-column */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Contact Form */}
          <div className="glass p-8 rounded-2xl">
            {status === 'success' ? (
              <div className="text-center py-6 space-y-5">
                <div className="text-6xl">✉️</div>
                <h2 className="text-xl font-bold text-white">Message Sent!</h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Thanks for reaching out. We'll reply to your email within 24 hours.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setStatus('idle'); setErrorMsg(''); }}
                    className="btn-secondary flex-1 py-2.5 text-sm"
                  >
                    Send Another Message
                  </button>
                  <a href="/" className="btn-primary flex-1 py-2.5 text-sm text-center">
                    Back to Home
                  </a>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-white mb-6">Send a Message</h2>
                {errorMsg && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-5">
                    {errorMsg}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Your Name *</label>
                      <input type="text" required className="input" placeholder="Full name"
                        value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div>
                      <label className="label">Email Address *</label>
                      <input type="email" required className="input" placeholder="you@example.com"
                        value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className="label">Subject</label>
                    <select className="input" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}>
                      {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Message *</label>
                    <textarea required rows={5} className="input resize-none" placeholder="How can we help you?"
                      value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
                  </div>
                  <button type="submit" disabled={status === 'loading'} className="btn-primary w-full">
                    {status === 'loading' ? 'Sending…' : 'Send Message →'}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Info Cards */}
          <div className="space-y-4">
            <div className="glass p-5 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-lg flex-shrink-0">📍</div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Location</h3>
                  <p className="text-gray-400 text-sm">Nairobi, Kenya</p>
                  <p className="text-gray-500 text-xs mt-1">We conduct house training sessions and partner with schools across Nairobi</p>
                </div>
              </div>
            </div>

            <div className="glass p-5 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-lg flex-shrink-0">✉️</div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Email</h3>
                  <a href="mailto:info@zaidknights.org" className="text-yellow-400 hover:text-yellow-300 text-sm transition-colors">
                    info@zaidknights.org
                  </a>
                  <p className="text-gray-500 text-xs mt-1">We reply within 24 hours on business days</p>
                </div>
              </div>
            </div>

            <div className="glass p-5 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center text-lg flex-shrink-0">📱</div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Phone / WhatsApp</h3>
                  <a href="https://wa.me/254726027966" target="_blank" rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-300 text-sm transition-colors">
                    +254 726 027 966
                  </a>
                  <p className="text-gray-500 text-xs mt-1">WhatsApp available weekdays 9am–5pm EAT</p>
                </div>
              </div>
            </div>

            <div className="glass p-5 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-lg flex-shrink-0">💳</div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Donations</h3>
                  <p className="text-gray-400 text-sm">M-Pesa Paybill: <span className="text-yellow-400 font-bold">880100</span></p>
                  <p className="text-gray-400 text-sm">Account: <span className="text-yellow-400 font-bold">124498</span></p>
                  <p className="text-gray-500 text-xs mt-1">NCBA Bank — Zaid Knights Chess Club</p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="glass p-5 rounded-xl">
              <h3 className="text-white font-semibold mb-3">Follow Us</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'X / Twitter', href: 'https://x.com/zaidknights?s=20', icon: '𝕏' },
                  { label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61575904767623', icon: 'f' },
                  { label: 'Instagram', href: 'https://www.instagram.com/zaidknights', icon: '◎' },
                  { label: 'WhatsApp', href: 'https://wa.me/254726027966', icon: '💬' },
                ].map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 glass rounded-lg text-sm text-gray-300 hover:text-yellow-400 hover:border-yellow-500/30 transition-all">
                    <span>{s.icon}</span>
                    <span>{s.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4" style={{ background: 'var(--dark-2)' }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
              Frequently Asked Questions
            </h2>
            <p className="text-gray-400">Quick answers to common questions</p>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="glass rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-6 py-4 flex items-center justify-between gap-4"
                >
                  <span className="text-white font-medium text-sm">{faq.question}</span>
                  <span className={`text-yellow-400 text-lg transition-transform ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-400 text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Junior / Parents Note */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="glass-gold p-6 rounded-xl">
            <div className="flex items-start gap-4">
              <span className="text-3xl">👨‍👩‍👧</span>
              <div>
                <h3 className="text-white font-bold mb-2">Parent / Guardian Information</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  For junior members (under 18), parent or guardian consent is required. Please email{' '}
                  <a href="mailto:info@zaidknights.org" className="text-yellow-400 hover:text-yellow-300">info@zaidknights.org</a>{' '}
                  or WhatsApp{' '}
                  <a href="https://wa.me/254726027966" className="text-green-400 hover:text-green-300" target="_blank" rel="noopener noreferrer">+254 726 027 966</a>{' '}
                  with your child's details. We take safeguarding very seriously and all coaches are vetted.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
