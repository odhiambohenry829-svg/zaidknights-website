import { useState } from 'react';
import Link from 'next/link';
import Layout from '../../components/common/Layout';

type Status = 'idle' | 'loading' | 'success' | 'error';

const ORG_TYPES = [
  { value: 'SCHOOL',  label: 'School',       icon: '🏫' },
  { value: 'COMPANY', label: 'Company',       icon: '🏢' },
  { value: 'ACADEMY', label: 'Chess Academy', icon: '🎓' },
  { value: 'CLUB',    label: 'Chess Club',    icon: '♟' },
];

const CHESS_INTEREST = [
  { value: 'BEGINNER_INTEREST',     label: 'Beginner',     desc: 'Introducing chess to members' },
  { value: 'ACTIVE_INTEREST',       label: 'Active',       desc: 'Regular club activity' },
  { value: 'COMPETITIVE_INTEREST',  label: 'Competitive',  desc: 'Tournament participation' },
];

const PARTICIPATION_TYPES = [
  { value: 'TRAINING_PARTNERSHIP',   label: 'Training Partnership',    desc: 'Access ZaidKnights coaching programs' },
  { value: 'TOURNAMENT_ENTRY',       label: 'Tournament Entry',        desc: 'Enter teams in our tournaments' },
  { value: 'MEMBERSHIP_AFFILIATION', label: 'Membership Affiliation',  desc: 'Full club affiliation and membership' },
];

export default function RegisterOrganizationPage() {
  const [type,              setType]              = useState('SCHOOL');
  const [name,              setName]              = useState('');
  const [registrationNum,   setRegistrationNum]   = useState('');
  const [location,          setLocation]          = useState('');
  const [county,            setCounty]            = useState('');
  const [contactPerson,     setContactPerson]     = useState('');
  const [contactRole,       setContactRole]       = useState('');
  const [email,             setEmail]             = useState('');
  const [phone,             setPhone]             = useState('');
  const [memberCount,       setMemberCount]       = useState('');
  const [chessInterest,     setChessInterest]     = useState('ACTIVE_INTEREST');
  const [participationType, setParticipationType] = useState('MEMBERSHIP_AFFILIATION');
  const [notes,             setNotes]             = useState('');

  const [status, setStatus] = useState<Status>('idle');
  const [error,  setError]  = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatus('loading');
    try {
      const res = await fetch('/api/organizations', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, type, registrationNumber: registrationNum, location, county,
          contactPerson, contactRole, email, phone,
          memberCount: parseInt(memberCount) || 0,
          chessInterest, participationType, notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatus('success');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <Layout title="Registration Submitted | ZaidKnights">
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="glass rounded-2xl p-12 text-center max-w-lg">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-white font-bold text-2xl mb-3">Registration Submitted!</h1>
            <p className="text-gray-400 mb-6">
              Thank you for registering your organization. Our team will review your application and send a confirmation to <strong className="text-white">{email}</strong> within 2–3 business days.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/organizations" className="btn-secondary rounded-xl px-5 py-2 text-sm">View Organizations</Link>
              <Link href="/" className="btn-ghost rounded-xl px-5 py-2 text-sm">Back to Home</Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Register Organization | ZaidKnights Chess Club" description="Register your school, company, or chess club with ZaidKnights Chess Club.">
      {/* Hero */}
      <section className="py-16 border-b border-white/10 chess-pattern">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Link href="/organizations" className="text-gray-500 hover:text-yellow-400 text-sm transition-colors mb-4 inline-block">← Back to Organizations</Link>
          <h1 className="text-4xl font-bold text-white mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            Register Your <span className="gold-gradient">Organization</span>
          </h1>
          <p className="text-gray-400">Partner with ZaidKnights Chess Club for training, tournaments, and membership.</p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Organization Type */}
            <div>
              <h2 className="text-white font-semibold mb-4">Organization Type *</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {ORG_TYPES.map(ot => (
                  <button key={ot.value} type="button"
                    onClick={() => setType(ot.value)}
                    className={`text-center p-4 rounded-xl border transition-all ${
                      type === ot.value
                        ? 'bg-yellow-500/10 border-yellow-500/50'
                        : 'glass border-white/10 hover:border-white/20'
                    }`}
                  >
                    <span className="text-2xl">{ot.icon}</span>
                    <p className={`text-sm font-medium mt-1 ${type === ot.value ? 'text-yellow-400' : 'text-white'}`}>{ot.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Basic Info */}
            <div className="glass rounded-xl p-6 space-y-4">
              <h2 className="text-white font-semibold">Organization Details</h2>
              <label className="block">
                <span className="label">Organization Name *</span>
                <input className="input mt-1" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Nairobi Academy" required />
              </label>
              <label className="block">
                <span className="label">Registration Number (optional)</span>
                <input className="input mt-1" value={registrationNum} onChange={e => setRegistrationNum(e.target.value)} placeholder="e.g. ORG/2024/001" />
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="label">Location / Address *</span>
                  <input className="input mt-1" value={location} onChange={e => setLocation(e.target.value)} placeholder="Street or area" required />
                </label>
                <label className="block">
                  <span className="label">County</span>
                  <input className="input mt-1" value={county} onChange={e => setCounty(e.target.value)} placeholder="e.g. Nairobi" />
                </label>
              </div>
              <label className="block">
                <span className="label">Number of Members / Students</span>
                <input type="number" min="1" className="input mt-1" value={memberCount} onChange={e => setMemberCount(e.target.value)} placeholder="e.g. 50" />
              </label>
            </div>

            {/* Contact */}
            <div className="glass rounded-xl p-6 space-y-4">
              <h2 className="text-white font-semibold">Contact Person</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="label">Full Name *</span>
                  <input className="input mt-1" value={contactPerson} onChange={e => setContactPerson(e.target.value)} placeholder="e.g. Jane Doe" required />
                </label>
                <label className="block">
                  <span className="label">Role / Title</span>
                  <input className="input mt-1" value={contactRole} onChange={e => setContactRole(e.target.value)} placeholder="e.g. Head of Sports" />
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="label">Email Address *</span>
                  <input type="email" className="input mt-1" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@school.ac.ke" required />
                </label>
                <label className="block">
                  <span className="label">Phone Number *</span>
                  <input type="tel" className="input mt-1" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+254 700 000 000" required />
                </label>
              </div>
            </div>

            {/* Chess Interest */}
            <div>
              <h2 className="text-white font-semibold mb-4">Chess Activity Level</h2>
              <div className="grid grid-cols-3 gap-3">
                {CHESS_INTEREST.map(ci => (
                  <button key={ci.value} type="button"
                    onClick={() => setChessInterest(ci.value)}
                    className={`text-center p-4 rounded-xl border transition-all ${
                      chessInterest === ci.value
                        ? 'bg-yellow-500/10 border-yellow-500/50'
                        : 'glass border-white/10'
                    }`}
                  >
                    <p className={`font-semibold text-sm ${chessInterest === ci.value ? 'text-yellow-400' : 'text-white'}`}>{ci.label}</p>
                    <p className="text-gray-500 text-xs mt-1">{ci.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Participation */}
            <div>
              <h2 className="text-white font-semibold mb-4">Participation Type</h2>
              <div className="space-y-3">
                {PARTICIPATION_TYPES.map(pt => (
                  <button key={pt.value} type="button"
                    onClick={() => setParticipationType(pt.value)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      participationType === pt.value
                        ? 'bg-yellow-500/10 border-yellow-500/50'
                        : 'glass border-white/10'
                    }`}
                  >
                    <p className={`font-semibold text-sm ${participationType === pt.value ? 'text-yellow-400' : 'text-white'}`}>{pt.label}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{pt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <label className="block">
              <span className="label">Additional Notes (optional)</span>
              <textarea rows={3} className="input mt-1" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Preferred training schedule, special requirements..." />
            </label>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full btn-primary py-4 text-lg font-semibold rounded-xl disabled:opacity-50"
            >
              {status === 'loading' ? 'Submitting…' : 'Submit Registration'}
            </button>
          </form>
        </div>
      </section>
    </Layout>
  );
}
