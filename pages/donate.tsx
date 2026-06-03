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

type Step = 'amount' | 'payment' | 'confirmation' | 'success';

export default function DonatePage() {
  const [step, setStep] = useState<Step>('amount');
  const [amount, setAmount] = useState('');
  const [custom, setCustom] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [form, setForm] = useState({
    donorName: '',
    donorEmail: '',
    paymentMethod: 'mpesa-send' as 'bank' | 'mpesa-paybill' | 'mpesa-send',
    mpesaReceiptNo: '',
    transactionCode: '',
    message: '',
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
    setStep('payment');
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConfirm = () => {
    if (!form.donorName || !form.donorEmail) {
      setError('Please fill in your name and email');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.donorEmail)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!form.mpesaReceiptNo && !form.transactionCode) {
      setError('Please provide your M-Pesa receipt number or transaction code');
      return;
    }
    setError('');
    setStep('confirmation');
  };

  const handleSubmit = async () => {
    setError('');
    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorName: form.donorName,
          donorEmail: form.donorEmail,
          amount: selectedAmount,
          category: 'GENERAL',
          donorType: 'INDIVIDUAL',
          anonymous: false,
          message: form.message || undefined,
          dedication: form.mpesaReceiptNo || form.transactionCode,
          taxReceipt: false,
          campaign: 'MANUAL_PAYMENT',
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit donation confirmation');
      }

      setSuccessMessage(`Thank you for your donation of KES ${selectedAmount.toLocaleString()}! We've recorded your payment and will send a receipt to ${form.donorEmail}.`);
      setStep('success');

      // Reset form after 2 seconds
      setTimeout(() => {
        setStep('amount');
        setAmount('');
        setForm({
          donorName: '',
          donorEmail: '',
          paymentMethod: 'mpesa-send',
          mpesaReceiptNo: '',
          transactionCode: '',
          message: '',
        });
      }, 2000);
    } catch (err: unknown) {
      setStep('confirmation');
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
                {['amount', 'payment', 'confirmation', 'success'].map((s, i) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      step === s ? 'bg-yellow-500 text-black' :
                      ['amount', 'payment', 'confirmation', 'success'].indexOf(step) > i ? 'bg-green-500 text-white' :
                      'bg-white/10 text-gray-500'
                    }`}>
                      {['amount', 'payment', 'confirmation', 'success'].indexOf(step) > i ? '✓' : i + 1}
                    </div>
                    {i < 3 && <div className={`flex-1 h-0.5 w-8 ${['amount', 'payment', 'confirmation', 'success'].indexOf(step) > i ? 'bg-green-500' : 'bg-white/10'}`} />}
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

              {/* ── STEP 2: Payment Details ── */}
              {step === 'payment' && (
                <div>
                  <button onClick={() => setStep('amount')} className="text-gray-400 text-sm mb-4 hover:text-white flex items-center gap-1">
                    ← Back
                  </button>
                  <h2 className="text-xl font-bold text-white mb-2">Payment Instructions</h2>
                  <p className="text-gray-400 text-sm mb-6">
                    Donating <span className="text-yellow-400 font-bold">KES {selectedAmount.toLocaleString()}</span> — choose your payment method below
                  </p>

                  <div className="space-y-4 mb-6">
                    {/* Bank Transfer */}
                    <label className="block">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="bank"
                        checked={form.paymentMethod === 'bank'}
                        onChange={e => setForm({ ...form, paymentMethod: 'bank' as const })}
                        className="mr-3"
                      />
                      <span className="text-white font-medium">Bank Transfer (NCBA)</span>
                    </label>
                    {form.paymentMethod === 'bank' && (
                      <div className="ml-6 bg-white/5 p-4 rounded-lg space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-white/10">
                          <span className="text-gray-400 text-sm">Account Name</span>
                          <div className="flex items-center gap-2">
                            <span className="text-yellow-400 font-bold text-sm">Zaid Knights Chess Club</span>
                            <button
                              onClick={() => handleCopy('Zaid Knights Chess Club', 'bank-name')}
                              className="text-xs text-gray-400 hover:text-yellow-400 transition"
                            >
                              {copiedField === 'bank-name' ? '✓ Copied' : '📋 Copy'}
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/10">
                          <span className="text-gray-400 text-sm">Account Number</span>
                          <div className="flex items-center gap-2">
                            <span className="text-yellow-400 font-bold text-sm">100063394827</span>
                            <button
                              onClick={() => handleCopy('100063394827', 'bank-number')}
                              className="text-xs text-gray-400 hover:text-yellow-400 transition"
                            >
                              {copiedField === 'bank-number' ? '✓ Copied' : '📋 Copy'}
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-400 text-sm">Bank</span>
                          <span className="text-white text-sm font-medium">NCBA Bank Kenya</span>
                        </div>
                      </div>
                    )}

                    {/* M-Pesa Paybill */}
                    <label className="block">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="mpesa-paybill"
                        checked={form.paymentMethod === 'mpesa-paybill'}
                        onChange={e => setForm({ ...form, paymentMethod: 'mpesa-paybill' as const })}
                        className="mr-3"
                      />
                      <span className="text-white font-medium">M-Pesa Paybill</span>
                    </label>
                    {form.paymentMethod === 'mpesa-paybill' && (
                      <div className="ml-6 bg-white/5 p-4 rounded-lg space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-white/10">
                          <span className="text-gray-400 text-sm">Paybill Number</span>
                          <div className="flex items-center gap-2">
                            <span className="text-yellow-400 font-bold text-sm">880100</span>
                            <button
                              onClick={() => handleCopy('880100', 'paybill')}
                              className="text-xs text-gray-400 hover:text-yellow-400 transition"
                            >
                              {copiedField === 'paybill' ? '✓ Copied' : '📋 Copy'}
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-400 text-sm">Account Number</span>
                          <div className="flex items-center gap-2">
                            <span className="text-yellow-400 font-bold text-sm">124498</span>
                            <button
                              onClick={() => handleCopy('124498', 'account')}
                              className="text-xs text-gray-400 hover:text-yellow-400 transition"
                            >
                              {copiedField === 'account' ? '✓ Copied' : '📋 Copy'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* M-Pesa Send Money */}
                    <label className="block">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="mpesa-send"
                        checked={form.paymentMethod === 'mpesa-send'}
                        onChange={e => setForm({ ...form, paymentMethod: 'mpesa-send' as const })}
                        className="mr-3"
                      />
                      <span className="text-white font-medium">M-Pesa Send Money (Direct)</span>
                    </label>
                    {form.paymentMethod === 'mpesa-send' && (
                      <div className="ml-6 bg-white/5 p-4 rounded-lg space-y-3">
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-400 text-sm">Phone Number</span>
                          <div className="flex items-center gap-2">
                            <span className="text-yellow-400 font-bold text-sm">0726027966</span>
                            <button
                              onClick={() => handleCopy('0726027966', 'phone')}
                              className="text-xs text-gray-400 hover:text-yellow-400 transition"
                            >
                              {copiedField === 'phone' ? '✓ Copied' : '📋 Copy'}
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-500 text-xs mt-2">Use "Send Money" on your M-Pesa menu, then confirm payment below.</p>
                      </div>
                    )}
                  </div>

                  <button onClick={() => setStep('confirmation')} className="btn-primary w-full py-4 text-base">
                    I've Made Payment →
                  </button>
                </div>
              )}

              {/* ── STEP 3: Confirmation Form ── */}
              {step === 'confirmation' && (
                <div>
                  <button onClick={() => setStep('payment')} className="text-gray-400 text-sm mb-4 hover:text-white flex items-center gap-1">
                    ← Back
                  </button>
                  <h2 className="text-xl font-bold text-white mb-2">Confirm Payment</h2>
                  <p className="text-gray-400 text-sm mb-6">
                    Please provide your details and M-Pesa confirmation
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="label">Your Name *</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="John Doe"
                        value={form.donorName}
                        onChange={e => setForm({ ...form, donorName: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="label">Email Address *</label>
                      <input
                        type="email"
                        className="input"
                        placeholder="you@example.com"
                        value={form.donorEmail}
                        onChange={e => setForm({ ...form, donorEmail: e.target.value })}
                      />
                      <p className="text-gray-500 text-xs mt-1">Your receipt will be sent here</p>
                    </div>

                    <div>
                      <label className="label">M-Pesa Receipt/Transaction Code *</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="e.g., ZK123ABC or transaction code"
                        value={form.mpesaReceiptNo || form.transactionCode}
                        onChange={e => setForm({ ...form, mpesaReceiptNo: e.target.value })}
                      />
                      <p className="text-gray-500 text-xs mt-1">This confirms your payment</p>
                    </div>

                    <div>
                      <label className="label">Message (Optional)</label>
                      <textarea
                        className="input"
                        placeholder="Add a message or dedication"
                        rows={3}
                        value={form.message}
                        onChange={e => setForm({ ...form, message: e.target.value })}
                      />
                    </div>
                  </div>

                  {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

                  <button onClick={handleSubmit} className="btn-primary w-full py-4 text-base mt-6">
                    Submit & Confirm Donation →
                  </button>

                  <p className="text-gray-500 text-xs text-center mt-3">
                    🔒 Your information is secure and will only be used for donation receipts.
                  </p>
                </div>
              )}

              {/* ── STEP 4: Success ── */}
              {step === 'success' && (
                <div className="text-center py-10">
                  <div className="text-6xl mb-6">✓</div>
                  <h2 className="text-2xl font-bold text-green-400 mb-4">Thank You!</h2>
                  <p className="text-gray-300 mb-4">{successMessage}</p>
                  <p className="text-gray-400 text-sm">Redirecting you back...</p>
                </div>
              )}
            </div>

            {/* ── Right side info ── */}
            <div className="space-y-6">

              {/* Payment methods summary */}
              <div className="glass p-6 rounded-xl">
                <h3 className="text-white font-semibold mb-4">Payment Methods</h3>
                <div className="space-y-3">
                  {[
                    { icon: '🏦', name: 'Bank Transfer', desc: 'NCBA Bank Kenya' },
                    { icon: '📱', name: 'M-Pesa Paybill', desc: 'Paybill 880100' },
                    { icon: '💳', name: 'M-Pesa Send Money', desc: 'Direct to phone' },
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
                  <p className="text-green-400 text-xs">All payments are manual and secure</p>
                </div>
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

              {/* FAQ */}
              <div className="glass p-6 rounded-xl">
                <h3 className="text-white font-semibold mb-4">Questions?</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Need help? Contact us at <span className="text-yellow-400">+254 726 027 960</span> or email us.
                </p>
                <p className="text-gray-500 text-xs">
                  We're here to assist with any payment questions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
