import { useState } from 'react';
import Layout from '../components/common/Layout';
import { useAuth } from './_app';

type Step = 'form' | 'payment' | 'pending' | 'success' | 'error';

const CATEGORIES = [
  { value: 'GENERAL_FUND',        label: 'General Fund',        icon: '♟',  desc: 'Support overall club operations' },
  { value: 'TOURNAMENTS',         label: 'Tournaments',         icon: '🏆', desc: 'Fund tournament prizes & hosting' },
  { value: 'TRAINING_EQUIPMENT',  label: 'Training Equipment',  icon: '📚', desc: 'Chess sets, clocks, boards' },
  { value: 'TRAVEL_SUPPORT',      label: 'Travel Support',      icon: '✈️', desc: 'Help members travel to competitions' },
];

const DONOR_TYPES = [
  { value: 'INDIVIDUAL', label: 'Individual' },
  { value: 'COMPANY',    label: 'Company / Organization' },
  { value: 'ALUMNI',     label: 'Club Alumni' },
];

const AMOUNTS = [500, 1000, 2500, 5000, 10000];

export default function DonatePage() {
  const { user } = useAuth();

  const [donorName,   setDonorName]   = useState(user?.name  ?? '');
  const [donorEmail,  setDonorEmail]  = useState(user?.email ?? '');
  const [donorType,   setDonorType]   = useState('INDIVIDUAL');
  const [category,    setCategory]    = useState('GENERAL_FUND');
  const [amount,      setAmount]      = useState<number | ''>('');
  const [customAmt,   setCustomAmt]   = useState('');
  const [message,     setMessage]     = useState('');
  const [dedication,  setDedication]  = useState('');
  const [anonymous,   setAnonymous]   = useState(false);
  const [taxReceipt,  setTaxReceipt]  = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  const [step,          setStep]          = useState<Step>('form');
  const [donationId,    setDonationId]    = useState('');
  const [txId,          setTxId]          = useState('');
  const [checkoutReqId, setCheckoutReqId] = useState('');
  const [error,         setError]         = useState('');

  const finalAmount = amount === '' ? parseFloat(customAmt) : amount;

  // Step 1 — create donation record
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!donorName || !donorEmail) { setError('Name and email are required.'); return; }
    if (!finalAmount || finalAmount < 10) { setError('Minimum donation is KES 10.'); return; }

    setStep('payment');
    try {
      const res = await fetch('/api/donations', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donorName, donorEmail, donorType, category, amount: finalAmount, message, dedication, anonymous, taxReceipt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDonationId(data.donation.id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create donation.');
      setStep('form');
    }
  };

  // Step 2 — initiate MPESA STK Push
  const handleMpesaPay = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!phoneNumber) { setError('Phone number is required.'); return; }

    try {
      const res = await fetch('/api/payments/mpesa/initiate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, amount: finalAmount, type: 'donation', referenceId: donationId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTxId(data.transactionId);
      setCheckoutReqId(data.checkoutRequestId);
      setStep('pending');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Payment initiation failed.');
    }
  };

  return (
    <Layout title="Donate | ZaidKnights Chess Club" description="Support ZaidKnights Chess Club with a donation. Help fund tournaments, training, and player development.">
      {/* Hero */}
      <section className="py-16 border-b border-white/10 chess-pattern">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-yellow-400 text-sm uppercase tracking-widest mb-3">Support the Club</p>
          <h1 className="text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Make a <span className="gold-gradient">Donation</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Your contribution helps us run tournaments, buy equipment, and support talented players across Kenya.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">

          {/* ─── Step: Form ─── */}
          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-8">

              {/* Donor Type */}
              <div>
                <h2 className="text-white font-semibold text-lg mb-4">I am donating as</h2>
                <div className="flex gap-3 flex-wrap">
                  {DONOR_TYPES.map(dt => (
                    <button key={dt.value} type="button"
                      onClick={() => setDonorType(dt.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                        donorType === dt.value
                          ? 'bg-yellow-500/20 border-yellow-500/60 text-yellow-400'
                          : 'glass border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >{dt.label}</button>
                  ))}
                </div>
              </div>

              {/* Donor Info */}
              <div className="glass rounded-xl p-6 space-y-4">
                <h2 className="text-white font-semibold">Your Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="label">Name *</span>
                    <input className="input mt-1" value={donorName} onChange={e => setDonorName(e.target.value)} placeholder="Full name" required />
                  </label>
                  <label className="block">
                    <span className="label">Email *</span>
                    <input type="email" className="input mt-1" value={donorEmail} onChange={e => setDonorEmail(e.target.value)} placeholder="you@example.com" required />
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="anon" checked={anonymous} onChange={e => setAnonymous(e.target.checked)} className="w-4 h-4 accent-yellow-500" />
                  <label htmlFor="anon" className="text-gray-300 text-sm cursor-pointer">Donate anonymously (your name won't appear on the leaderboard)</label>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="tax" checked={taxReceipt} onChange={e => setTaxReceipt(e.target.checked)} className="w-4 h-4 accent-yellow-500" />
                  <label htmlFor="tax" className="text-gray-300 text-sm cursor-pointer">I need a tax receipt (organizations only)</label>
                </div>
              </div>

              {/* Category */}
              <div>
                <h2 className="text-white font-semibold mb-4">Donation Category</h2>
                <div className="grid grid-cols-2 gap-3">
                  {CATEGORIES.map(cat => (
                    <button key={cat.value} type="button"
                      onClick={() => setCategory(cat.value)}
                      className={`text-left p-4 rounded-xl border transition-all ${
                        category === cat.value
                          ? 'bg-yellow-500/10 border-yellow-500/50'
                          : 'glass border-white/10 hover:border-white/20'
                      }`}
                    >
                      <span className="text-2xl">{cat.icon}</span>
                      <p className={`font-semibold text-sm mt-1 ${category === cat.value ? 'text-yellow-400' : 'text-white'}`}>{cat.label}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{cat.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div>
                <h2 className="text-white font-semibold mb-4">Amount (KES)</h2>
                <div className="flex gap-3 flex-wrap mb-4">
                  {AMOUNTS.map(a => (
                    <button key={a} type="button"
                      onClick={() => { setAmount(a); setCustomAmt(''); }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                        amount === a
                          ? 'bg-yellow-500/20 border-yellow-500/60 text-yellow-400'
                          : 'glass border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >KES {a.toLocaleString()}</button>
                  ))}
                  <button type="button"
                    onClick={() => setAmount('')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                      amount === ''
                        ? 'bg-yellow-500/20 border-yellow-500/60 text-yellow-400'
                        : 'glass border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >Custom</button>
                </div>
                {amount === '' && (
                  <input
                    type="number" min="10"
                    className="input"
                    value={customAmt}
                    onChange={e => setCustomAmt(e.target.value)}
                    placeholder="Enter amount in KES"
                  />
                )}
              </div>

              {/* Message */}
              <div className="glass rounded-xl p-6 space-y-4">
                <h2 className="text-white font-semibold">Optional Message</h2>
                <label className="block">
                  <span className="label">Message to the club</span>
                  <textarea rows={3} className="input mt-1" value={message} onChange={e => setMessage(e.target.value)} placeholder="Words of encouragement, feedback..." />
                </label>
                <label className="block">
                  <span className="label">Dedication (e.g. "In memory of...")</span>
                  <input className="input mt-1" value={dedication} onChange={e => setDedication(e.target.value)} placeholder="Optional dedication" />
                </label>
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button type="submit" className="w-full btn-primary py-4 text-lg font-semibold rounded-xl">
                Continue to Payment →
              </button>
            </form>
          )}

          {/* ─── Step: MPESA Payment ─── */}
          {step === 'payment' && (
            <div className="glass rounded-xl p-8">
              <h2 className="text-white font-bold text-2xl mb-2">Pay via M-PESA</h2>
              <p className="text-gray-400 mb-6">Enter your phone number to receive an M-PESA push notification.</p>

              <div className="glass-gold rounded-xl p-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Donation Amount</span>
                  <span className="text-yellow-400 font-bold text-lg">KES {finalAmount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-400">Category</span>
                  <span className="text-white">{CATEGORIES.find(c => c.value === category)?.label}</span>
                </div>
              </div>

              <form onSubmit={handleMpesaPay} className="space-y-4">
                <label className="block">
                  <span className="label">M-PESA Phone Number</span>
                  <input
                    className="input mt-1"
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    placeholder="0712345678 or 254712345678"
                    required
                  />
                </label>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button type="submit" className="w-full btn-primary py-3 font-semibold rounded-xl">
                  Send M-PESA Push
                </button>
                <button type="button" onClick={() => setStep('form')} className="w-full btn-ghost py-3 rounded-xl text-sm">
                  ← Back
                </button>
              </form>
            </div>
          )}

          {/* ─── Step: Pending ─── */}
          {step === 'pending' && (
            <div className="glass rounded-xl p-10 text-center">
              <div className="text-5xl mb-4 animate-pulse">📱</div>
              <h2 className="text-white font-bold text-2xl mb-3">Check Your Phone</h2>
              <p className="text-gray-400 mb-2">An M-PESA payment request has been sent to <strong className="text-white">{phoneNumber}</strong>.</p>
              <p className="text-gray-500 text-sm mb-8">Enter your M-PESA PIN to complete the donation. This page will confirm once payment is processed.</p>
              <div className="glass rounded-xl p-4 mb-6 inline-block text-left">
                <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Request ID</p>
                <p className="text-yellow-400 font-mono text-sm">{checkoutReqId}</p>
              </div>
              <p className="text-gray-600 text-xs">A receipt will be sent to <strong className="text-gray-400">{donorEmail}</strong> after payment.</p>
              <div className="mt-8 flex gap-3 justify-center">
                <button onClick={() => setStep('success')} className="btn-secondary text-sm rounded-xl px-4 py-2">
                  I've completed payment
                </button>
                <button onClick={() => setStep('error')} className="text-red-400 text-sm hover:text-red-300 transition">
                  Payment failed
                </button>
              </div>
            </div>
          )}

          {/* ─── Step: Success ─── */}
          {step === 'success' && (
            <div className="glass rounded-xl p-10 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-white font-bold text-2xl mb-3">Thank You!</h2>
              <p className="text-gray-400 mb-6">Your donation is being processed. A receipt will be emailed to <strong className="text-white">{donorEmail}</strong> once confirmed.</p>
              <button onClick={() => window.location.href = '/'} className="btn-primary rounded-xl px-8 py-3">
                Back to Home
              </button>
            </div>
          )}

          {/* ─── Step: Error ─── */}
          {step === 'error' && (
            <div className="glass rounded-xl p-10 text-center">
              <div className="text-5xl mb-4">❌</div>
              <h2 className="text-white font-bold text-2xl mb-3">Payment Failed</h2>
              <p className="text-gray-400 mb-6">Something went wrong with your payment. Please try again or contact us.</p>
              <button onClick={() => { setStep('payment'); setError(''); }} className="btn-primary rounded-xl px-8 py-3">
                Try Again
              </button>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
