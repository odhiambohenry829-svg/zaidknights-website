import { useState } from 'react';
import Layout from '../components/common/Layout';
import Image from 'next/image';

const PRESET_AMOUNTS = [100, 500, 1000, 2500, 5000, 10000];

const IMPACT = [
  { amount: 'KES 100',    icon: '♟',  desc: 'Buys a chess set for a junior player' },
  { amount: 'KES 500',    icon: '📚', desc: 'Funds a week of training materials' },
  { amount: 'KES 1,000',  icon: '🏆', desc: 'Covers a tournament entry fee' },
  { amount: 'KES 2,500',  icon: '🚌', desc: 'Transport for a student to nationals' },
  { amount: 'KES 5,000',  icon: '🎓', desc: 'Sponsors a full term of coaching' },
  { amount: 'KES 10,000', icon: '🌍', desc: 'Funds a player to represent Kenya' },
];

type Step = 'amount' | 'details' | 'processing';

export default function DonatePage() {
  const [step,       setStep]       = useState<Step>('amount');
  const [amount,     setAmount]     = useState('');
  const [custom,     setCustom]     = useState(false);
  const [error,      setError]      = useState('');
  const [form,       setForm]       = useState({
    firstName: '', lastName: '', email: '', phone: '',
  });

  const selectedAmount = parseInt(amount) || 0;

  const handleAmountSelect = (val: number) => {
    setAmount(String(val));
    setCustom(false);
    setError('');
  };

  const handleNext = () => {
    if (!selectedAmount || selectedAmount < 10) {
      setError('Please enter a valid amount (minimum KES 10)');
      return;
    }
    setError('');
    setStep('details');
  };

  const handlePay = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.phone) {
      setError('Please fill in all fields');
      return;
    }
    if (!/^\+?[\d\s-]{9,}$/.test(form.phone)) {
      setError('Please enter a valid phone number');
      return;
    }

    setError('');
    setStep('processing');

    try {
      const res = await fetch('/api/payments/pesapal/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: selectedAmount,
          currency: 'KES',
          firstName: form.firstName,
          lastName:  form.lastName,
          email:     form.email,
          phone:     form.phone.replace(/\s/g, ''),
          description: `Donation to Zaid Knights Chess Club — KES ${selectedAmount}`,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.redirectUrl) {
        throw new Error(data.error || 'Payment failed. Please try again.');
      }

      // Redirect to Pesapal payment page
      window.location.href = data.redirectUrl;

    } catch (err: unknown) {
      setStep('details');
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

  return (
    <Layout title="Donate | Zaid Knights Chess Club" description="Support Zaid Knights Chess Club — help us develop chess talent in Kenya.">

      {/* Hero */}
      <section className="relative py-20 px-4 chess-pattern overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/5 to-transparent" />
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="mb-6">
            <Image src="/logo.png" alt="Zaid Knights" width={160} height={54} className="object-contain mx-auto" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Support <span className="gold-gradient">Zaid Knights</span>
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed">
            Your donation helps us develop chess talent, fund tournaments, and send Kenyan players to national and international competitions.
          </p>
          <p className="text-yellow-400 italic mt-3">"Sharpening Great Minds"</p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

            {/* ── Donation Form ── */}
            <div className="glass p-8 rounded-2xl">

              {/* Progress indicator */}
              <div className="flex items-center gap-3 mb-8">
                {['amount', 'details', 'processing'].map((s, i) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      step === s ? 'bg-yellow-500 text-black' :
                      ['amount', 'details', 'processing'].indexOf(step) > i ? 'bg-green-500 text-white' :
                      'bg-white/10 text-gray-500'
                    }`}>
                      {['amount', 'details', 'processing'].indexOf(step) > i ? '✓' : i + 1}
                    </div>
                    {i < 2 && <div className={`flex-1 h-0.5 w-8 ${['amount', 'details', 'processing'].indexOf(step) > i ? 'bg-green-500' : 'bg-white/10'}`} />}
                  </div>
                ))}
                <span className="text-gray-400 text-sm ml-1 capitalize">{step}</span>
              </div>

              {/* ── STEP 1: Amount ── */}
              {step === 'amount' && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">Choose Amount</h2>
                  <p className="text-gray-400 text-sm mb-6">Select a preset amount or enter your own</p>

                  <div className="grid grid-cols-3 gap-3 mb-5">
                    {PRESET_AMOUNTS.map(val => (
                      <button
                        key={val}
                        onClick={() => handleAmountSelect(val)}
                        className={`py-3 rounded-xl text-sm font-bold transition-all border ${
                          amount === String(val) && !custom
                            ? 'bg-yellow-500 text-black border-yellow-400 shadow-lg shadow-yellow-500/30'
                            : 'border-white/10 text-gray-300 hover:border-yellow-500/40 hover:text-white'
                        }`}
                      >
                        KES {val.toLocaleString()}
                      </button>
                    ))}
                  </div>

                  <div className="mb-6">
                    <label className="label">Or enter custom amount (KES)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">KES</span>
                      <input
                        type="number"
                        min="10"
                        placeholder="Enter amount"
                        className="input pl-12"
                        value={custom ? amount : ''}
                        onChange={e => { setAmount(e.target.value); setCustom(true); setError(''); }}
                        onFocus={() => setCustom(true)}
                      />
                    </div>
                  </div>

                  {selectedAmount > 0 && (
                    <div className="glass-gold p-4 rounded-xl mb-5 text-center">
                      <p className="text-gray-400 text-sm">You are donating</p>
                      <p className="text-3xl font-bold text-yellow-400">KES {selectedAmount.toLocaleString()}</p>
                    </div>
                  )}

                  {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

                  <button onClick={handleNext} className="btn-primary w-full py-4 text-base">
                    Continue →
                  </button>
                </div>
              )}

              {/* ── STEP 2: Details ── */}
              {step === 'details' && (
                <div>
                  <button onClick={() => setStep('amount')} className="text-gray-400 text-sm mb-4 hover:text-white flex items-center gap-1">
                    ← Back
                  </button>
                  <h2 className="text-xl font-bold text-white mb-2">Your Details</h2>
                  <p className="text-gray-400 text-sm mb-6">
                    Donating <span className="text-yellow-400 font-bold">KES {selectedAmount.toLocaleString()}</span> — these details appear on your receipt
                  </p>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="label">First Name *</label>
                        <input type="text" className="input" placeholder="John"
                          value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
                      </div>
                      <div>
                        <label className="label">Last Name *</label>
                        <input type="text" className="input" placeholder="Doe"
                          value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <label className="label">Email Address *</label>
                      <input type="email" className="input" placeholder="you@example.com"
                        value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                      <p className="text-gray-500 text-xs mt-1">Your receipt will be sent here</p>
                    </div>
                    <div>
                      <label className="label">Phone Number *</label>
                      <input type="tel" className="input" placeholder="+254 7XX XXX XXX"
                        value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                      <p className="text-gray-500 text-xs mt-1">For M-Pesa payments, use your Safaricom number</p>
                    </div>
                  </div>

                  {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

                  <button onClick={handlePay} className="btn-primary w-full py-4 text-base mt-6">
                    Proceed to Pay KES {selectedAmount.toLocaleString()} →
                  </button>

                  <p className="text-gray-500 text-xs text-center mt-3">
                    🔒 Secured by Pesapal. Supports M-Pesa, Visa, Mastercard & more.
                  </p>
                </div>
              )}

              {/* ── STEP 3: Processing ── */}
              {step === 'processing' && (
                <div className="text-center py-10">
                  <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                  <h2 className="text-xl font-bold text-white mb-2">Redirecting to payment...</h2>
                  <p className="text-gray-400 text-sm">
                    You'll be taken to a secure Pesapal payment page where you can pay via M-Pesa, card, or bank transfer.
                  </p>
                </div>
              )}
            </div>

            {/* ── Right side info ── */}
            <div className="space-y-6">

              {/* Payment methods */}
              <div className="glass p-6 rounded-xl">
                <h3 className="text-white font-semibold mb-4">Accepted Payment Methods</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: '📱', name: 'M-Pesa',       desc: 'STK Push to your phone' },
                    { icon: '💳', name: 'Visa/Mastercard', desc: 'Credit & debit cards' },
                    { icon: '🏦', name: 'Bank Transfer', desc: 'Direct bank payment' },
                    { icon: '📲', name: 'Airtel Money',  desc: 'Airtel mobile money' },
                  ].map(m => (
                    <div key={m.name} className="bg-white/5 rounded-lg p-3">
                      <div className="text-2xl mb-1">{m.icon}</div>
                      <p className="text-white text-sm font-medium">{m.name}</p>
                      <p className="text-gray-500 text-xs">{m.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <span className="text-green-400">🔒</span>
                  <p className="text-green-400 text-xs">All payments are secured and encrypted by Pesapal</p>
                </div>
              </div>

              {/* Direct payment alternative */}
              <div className="glass p-6 rounded-xl">
                <h3 className="text-white font-semibold mb-4">Alternative — Direct M-Pesa</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-gray-400 text-sm">Paybill</span>
                    <span className="text-yellow-400 font-bold">880100</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-gray-400 text-sm">Account No.</span>
                    <span className="text-yellow-400 font-bold">124498</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-400 text-sm">Bank</span>
                    <span className="text-white text-sm">NCBA Bank Kenya</span>
                  </div>
                </div>
                <p className="text-gray-500 text-xs mt-3">After paying via Paybill, WhatsApp us on +254 726 027 960 with your M-Pesa confirmation code.</p>
              </div>

              {/* Your impact */}
              <div className="glass p-6 rounded-xl">
                <h3 className="text-white font-semibold mb-4">Your Impact</h3>
                <div className="space-y-3">
                  {IMPACT.map(item => (
                    <div key={item.amount} className="flex items-start gap-3">
                      <span className="text-xl">{item.icon}</span>
                      <div>
                        <span className="text-yellow-400 font-bold text-sm">{item.amount}</span>
                        <p className="text-gray-400 text-xs">{item.desc}</p>
                      </div>
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
