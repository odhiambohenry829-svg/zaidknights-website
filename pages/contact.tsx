import { useState } from 'react';
import Layout from '../components/common/Layout';
import Toast from '../components/ui/Toast';
import Accordion from '../components/ui/Accordion';
import type { AccordionItem } from '../components/ui/Accordion';

const SUBJECTS = [
  'General Inquiry',
  'Membership',
  'Tournament',
  'Partnership',
  'Donation',
  'Junior Programme',
];

const FAQS: AccordionItem[] = [
  { question: 'How do I join Zaid Knights Chess Club?', answer: 'Simply click "Join the Club" on our homepage or visit zaidknights.org/register. Beginner membership is free! Fill in your details, choose a membership tier, and you\'re in. Our team will activate your account within 24 hours.' },
  { question: 'What are your training sessions like?', answer: 'We run sessions every Saturday from 10am–4pm at our Nairobi facility. Sessions include opening theory, tactics puzzles, endgame studies, and practice games with analysis. Beginners and advanced players train in separate groups.' },
  { question: 'Do you accept junior (under-18) members?', answer: 'Yes! We have a dedicated Junior Knights programme for players aged 8–18. A parent or guardian must complete the registration form. For minors, we require an emergency contact. Please contact us at info@zaidknights.org for details.' },
  { question: 'How are ELO ratings calculated?', answer: 'We use the standard FIDE ELO system. Ratings are updated after each official club tournament based on your performance against opponents and their current ratings. New members start at 1200.' },
  { question: 'Can my school or company partner with Zaid Knights?', answer: 'Absolutely! We actively partner with schools, companies, and academies across Kenya. Visit our Organizations page or email info@zaidknights.org to discuss partnership opportunities including training programs and tournament hosting.' },
];

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '', email: '', subject: SUBJECTS[0], message: '',
  });
  const [status, setStatus] = useState<Status>('idle');
  const [toast,  setToast]  = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send message');
      setStatus('success');
      setForm({ name: '', email: '', subject: SUBJECTS[0], message: '' });
      setToast({ message: "Message sent! We'll reply within 24 hours.", type: 'success' });
    } catch (e: unknown) {
      setStatus('error');
      setToast({ message: e instanceof Error ? e.message : 'Failed to send message.', type: 'error' });
    } finally {
      setStatus('idle');
    }
  };

  return (
    <Layout title="Contact | Zaid Knights Chess Club">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Hero */}
      <section className="py-20 px-4 chess-pattern">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Get in <span className="gold-gradient">Touch</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Questions, partnerships, membership inquiries — we&apos;d love to hear from you.
          </p>
        </div>
      </section>

      {/* Two-column */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Contact Form */}
          <div className="glass p-8 rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
              Send a Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Your Name *</label>
                  <input
                    type="text"
                    required
                    className="input"
                    placeholder="Full name"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Email Address *</label>
                  <input
                    type="email"
                    required
                    className="input"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="label">Subject</label>
                <select
                  className="input"
                  value={form.subject}
                  onChange={e => setForm({ ...form, subject: e.target.value })}
                >
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Message *</label>
                <textarea
                  required
                  rows={5}
                  className="input resize-none"
                  placeholder="How can we help you?"
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                />
              </div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="btn-primary w-full"
              >
                {status === 'loading' ? 'Sending…' : 'Send Message →'}
              </button>
            </form>
          </div>

          {/* Info Cards */}
          <div className="space-y-4">
            {/* Location */}
            <div className="glass p-5 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-lg flex-shrink-0">
                  📍
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Location</h3>
                  <p className="text-gray-400 text-sm">Nairobi, Kenya</p>
                  <p className="text-gray-500 text-xs mt-1">Our facility is centrally located in Nairobi — exact address shared upon membership activation</p>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="glass p-5 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-lg flex-shrink-0">
                  ✉️
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Email</h3>
                  <a href="mailto:info@zaidknights.org" className="text-yellow-400 hover:text-yellow-300 text-sm transition-colors">
                    info@zaidknights.org
                  </a>
                  <p className="text-gray-500 text-xs mt-1">We reply within 24 hours on business days</p>
                </div>
              </div>
            </div>

            {/* Phone / WhatsApp */}
            <div className="glass p-5 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center text-lg flex-shrink-0">
                  📱
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Phone / WhatsApp</h3>
                  <a
                    href="https://wa.me/254726027960"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-300 text-sm transition-colors"
                  >
                    +254 726 027 960
                  </a>
                  <p className="text-gray-500 text-xs mt-1">WhatsApp available weekdays 9am–5pm EAT</p>
                </div>
              </div>
            </div>

            {/* Meeting Times */}
            <div className="glass p-5 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-lg flex-shrink-0">
                  🕐
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Training Sessions</h3>
                  <p className="text-yellow-400 text-sm font-medium">Saturdays 10am – 4pm</p>
                  <p className="text-gray-500 text-xs mt-1">All skill levels welcome · Nairobi facility</p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="glass p-5 rounded-xl">
              <h3 className="text-white font-semibold mb-3">Follow Us</h3>
              <div className="flex gap-3 flex-wrap">
                {[
                  { label: 'Twitter/X',  href: 'https://twitter.com/zaidknights',       icon: '𝕏' },
                  { label: 'Facebook',   href: 'https://facebook.com/zaidknights',       icon: 'f' },
                  { label: 'Instagram',  href: 'https://instagram.com/zaidknights',      icon: '◎' },
                  { label: 'WhatsApp',   href: 'https://wa.me/254726027960',             icon: '💬' },
                ].map(s => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 glass rounded-lg text-sm text-gray-300 hover:text-yellow-400 hover:border-yellow-500/30 transition-all"
                  >
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
          <Accordion items={FAQS} />
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
                  <a href="https://wa.me/254726027960" className="text-green-400 hover:text-green-300" target="_blank" rel="noopener noreferrer">+254 726 027 960</a>{' '}
                  with your child&apos;s details. We take safeguarding very seriously and all coaches are vetted.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
