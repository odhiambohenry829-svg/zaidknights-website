import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../components/common/Layout';
import ProgressBar from '../components/ui/ProgressBar';
import Toast from '../components/ui/Toast';
import MpesaPrompt from '../components/payment/MpesaPrompt';
import { useAuth } from './_app';

type PaymentMethod = 'MPESA' | 'CARD' | 'BANK_TRANSFER';
type DonorType     = 'INDIVIDUAL' | 'COMPANY' | 'ALUMNI';
type Category      = 'GENERAL_FUND' | 'TRAINING_EQUIPMENT' | 'TOURNAMENTS' | 'TRAVEL_SUPPORT';

interface LeaderEntry {
  rank:  number;
  name:  string;
  total: number;
}

const PRESET_AMOUNTS = [500, 1000, 2500, 5000, 10000];

const CATEGORY_LABELS: Record<Category, string> = {
  GENERAL_FUND:        'General Fund',
  TRAINING_EQUIPMENT:  'Training Equipment',
  TOURNAMENTS:         'Tournament Support',
  TRAVEL_SUPPORT:      'Travel Support',
};

const IMPACT_MAP: Record<number, string> = {
  500:   'Buys a chess set for a junior player',
  1000:  'Covers a tournament entry fee',
  2500:  'Sponsors training materials for one month',
  5000:  'Funds travel to a regional championship',
  10000: 'Sponsors a full training programme for one term',
};

export default function DonatePage() {
  const { user } = useAuth();

  const [amount,      setAmount]      = useState<number | ''>('');
  const [custom,      setCustom]      = useState('');
  const [category,    setCategory]    = useState<Category>('GENERAL_FUND');
  const [donorType,   setDonorType]   = useState<DonorType>('INDIVIDUAL');
  const [payment,     setPayment]     = useState<PaymentMethod>('MPESA');
  const [anonymous,   setAnonymous]   = useState(false);
  const [dedication,  setDedication]  = useState('');
  const [taxReceipt,  setTaxReceipt]  = useState(false);
  const [donorName,   setDonorName]   = useState(user?.name ?? '');
  const [donorEmail,  setDonorEmail]  = useState(user?.email ?? '');
  const [loading,     setLoading]     = useState(false);
  const [success,     setSuccess]     = useState<{ id: string; ref: string } | null>(null);
  const [mpesaState,  setMpesaState]  = useState<{ donationId: string; amount: number; ref: string } | null>(null);
  const [toast,       setToast]       = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>([]);
  const [monthly,     setMonthly]     = useState(0);

  useEffect(() => {
    fetch('/api/donations/leaderboard')
      .then(r => r.json())
      .then(d => {
        setLeaderboard(d.leaderboard ?? []);
        setMonthly(d.monthlyTotal ?? 0);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user) {
      setDonorName(user.name ?? '');
      setDonorEmail(user.email ?? '');
    }
  }, [user]);

  const effectiveAmount = amount !== '' ? amount : (parseFloat(custom) || 0);

  const handlePreset = (v: number) => {
    setAmount(v);
    setCustom('');
  };

  const handleCustom = (v: string) => {
    setCustom(v);
    setAmount('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (effectiveAmount < 10) {
      setToast({ message: 'Minimum donation is KES 10', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/donations', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          donorName:  anonymous ? 'Anonymous' : donorName,
          donorEmail: anonymous ? 'anon@zaidknights.org' : donorEmail,
          amount:     effectiveAmount,
          category,
          donorType,
          anonymous,
          dedication: dedication || undefined,
          taxReceipt,
          campaign:   'general',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Donation failed');
      const ref = `ZK-${data.donation.id.slice(0, 8).toUpperCase()}`;
      if (payment === 'MPESA') {
        setMpesaState({ donationId: data.donation.id, amount: effectiveAmount, ref });
      } else {
        setSuccess({ id: data.donation.id, ref });
      }
    } catch (e: unknown) {
      setToast({ message: e instanceof Error ? e.message : 'Donation failed.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!success) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`
      <html><head><title>Donation Receipt — Zaid Knights</title>
      <style>body{font-family:Arial,sans-serif;padding:40px;max-width:600px;margin:0 auto}
      h1{color:#D4AF37}table{width:100%;border-collapse:collapse}
      td{padding:8px;border-bottom:1px solid #eee}strong{color:#333}</style></head>
      <body>
      <h1>♞ Zaid Knights Chess Club</h1>
      <h2>Donation Receipt</h2>
      <table>
        <tr><td>Reference:</td><td><strong>${success.ref}</strong></td></tr>
        <tr><td>Donor:</td><td>${anonymous ? 'Anonymous' : donorName}</td></tr>
        <tr><td>Amount:</td><td><strong>KES ${effectiveAmount.toLocaleString()}</strong></td></tr>
        <tr><td>Category:</td><td>${CATEGORY_LABELS[category]}</td></tr>
        <tr><td>Date:</td><td>${new Date().toLocaleDateString('en-KE', { dateStyle: 'full' })}</td></tr>
      </table>
      <p style="margin-top:40px;color:#666;font-size:13px">
        Thank you for your generous support of chess in Kenya.<br/>
        Zaid Knights Chess Club · Nairobi, Kenya · info@zaidknights.org
      </p>
      <script>window.print()</script>
      </body></html>
    `);
    w.document.close();
  };

  if (success) {
    return (
      <Layout title="Thank You | Zaid Knights Chess Club">
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
          <div className="max-w-lg w-full glass p-10 rounded-2xl text-center border border-green-500/30">
            <div className="text-6xl mb-4">🙏</div>
            <h1 className="text-3xl font-bold text-white mb-3 font-playfair">Thank you!</h1>
            <p className="text-gray-400 mb-6">
              Your donation of{' '}
              <span className="text-yellow-400 font-bold">KES {effectiveAmount.toLocaleString()}</span>{' '}
              {payment === 'MPESA' ? 'has been confirmed.' : 'has been recorded. Complete your payment to finalise.'}
            </p>

            <div className="glass-gold p-4 rounded-xl mb-6">
              <p className="text-gray-400 text-xs mb-1">Reference Number</p>
              <p className="text-yellow-400 font-mono font-bold text-xl">{success.ref}</p>
            </div>

            {payment === 'BANK_TRANSFER' && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5 text-sm text-gray-300 space-y-2 mb-6 text-left">
                <p className="text-blue-300 font-semibold mb-2">Complete Bank Transfer</p>
                <div className="flex justify-between"><span className="text-gray-500">Bank</span><strong>Equity Bank Kenya</strong></div>
                <div className="flex justify-between"><span className="text-gray-500">Account Name</span><strong>Zaid Knights Chess Club</strong></div>
                <div className="flex justify-between"><span className="text-gray-500">Account No</span><strong className="text-yellow-400 font-mono">1006394827</strong></div>
                <div className="flex justify-between"><span className="text-gray-500">Reference</span><strong>{success.ref}</strong></div>
              </div>
            )}

            <div className="flex gap-3 justify-center flex-wrap">
              <button type="button" onClick={handlePrint} className="btn-primary">Download Receipt 🖨</button>
              <button type="button" onClick={() => { setSuccess(null); setAmount(''); setCustom(''); }} className="btn-secondary">
                Donate Again
              </button>
              <Link href="/" className="btn-secondary">Back to Home</Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      {mpesaState && (
        <MpesaPrompt
          amount={mpesaState.amount}
          type="donation"
          referenceId={mpesaState.donationId}
          onSuccess={() => {
            const snap = mpesaState;
            setMpesaState(null);
            setSuccess({ id: snap.donationId, ref: snap.ref });
          }}
          onCancel={() => {
            setMpesaState(null);
            setToast({ message: 'Donation recorded. Complete M-Pesa payment when ready.', type: 'info' });
          }}
        />
      )}
    <Layout title="Donate | Zaid Knights Chess Club">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Hero */}
      <section className="py-20 px-4 chess-pattern">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Support <span className="gold-gradient">Zaid Knights</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Your donation funds chess equipment, tournament entries, and travel support for players
            across Nairobi. Every shilling matters.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Donation Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Amount */}
              <div className="glass p-6 rounded-xl">
                <h2 className="text-white font-bold mb-4">Choose Amount (KES)</h2>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4">
                  {PRESET_AMOUNTS.map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => handlePreset(v)}
                      className={`py-3 rounded-lg text-sm font-bold transition-all border ${
                        amount === v
                          ? 'bg-yellow-500 text-black border-yellow-400'
                          : 'border-white/10 text-gray-300 hover:border-yellow-500/40 hover:text-yellow-400'
                      }`}
                    >
                      {v.toLocaleString()}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="label">Or enter custom amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">KES</span>
                    <input
                      type="number"
                      min="10"
                      className="input pl-14"
                      placeholder="0"
                      value={custom}
                      onChange={e => handleCustom(e.target.value)}
                    />
                  </div>
                </div>
                {effectiveAmount > 0 && IMPACT_MAP[effectiveAmount] && (
                  <p className="mt-3 text-yellow-400/80 text-sm">
                    ✨ {IMPACT_MAP[effectiveAmount]}
                  </p>
                )}
              </div>

              {/* Category */}
              <div className="glass p-6 rounded-xl">
                <h2 className="text-white font-bold mb-4">Where should your donation go?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(Object.keys(CATEGORY_LABELS) as Category[]).map(cat => (
                    <label
                      key={cat}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        category === cat
                          ? 'border-yellow-500/50 bg-yellow-500/10'
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      <input
                        type="radio"
                        name="category"
                        checked={category === cat}
                        onChange={() => setCategory(cat)}
                        className="accent-yellow-500"
                      />
                      <span className="text-white text-sm">{CATEGORY_LABELS[cat]}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Donor Details */}
              <div className="glass p-6 rounded-xl space-y-4">
                <h2 className="text-white font-bold">Your Details</h2>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="anon"
                    checked={anonymous}
                    onChange={e => setAnonymous(e.target.checked)}
                    className="accent-yellow-500 w-4 h-4"
                  />
                  <label htmlFor="anon" className="text-gray-300 text-sm cursor-pointer">
                    Make this donation anonymous
                  </label>
                </div>
                {!anonymous && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Full Name *</label>
                      <input
                        type="text"
                        required={!anonymous}
                        className="input"
                        value={donorName}
                        onChange={e => setDonorName(e.target.value)}
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="label">Email Address *</label>
                      <input
                        type="email"
                        required={!anonymous}
                        className="input"
                        value={donorEmail}
                        onChange={e => setDonorEmail(e.target.value)}
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="donorType" className="label">Donor Type</label>
                    <select id="donorType" aria-label="Donor type" className="input" value={donorType} onChange={e => setDonorType(e.target.value as DonorType)}>
                      <option value="INDIVIDUAL">Individual</option>
                      <option value="COMPANY">Company</option>
                      <option value="ALUMNI">Alumni</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">Dedication / Message (optional)</label>
                  <input
                    type="text"
                    className="input"
                    value={dedication}
                    onChange={e => setDedication(e.target.value)}
                    placeholder="In honor of… / In memory of…"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="tax"
                    checked={taxReceipt}
                    onChange={e => setTaxReceipt(e.target.checked)}
                    className="accent-yellow-500 w-4 h-4"
                  />
                  <label htmlFor="tax" className="text-gray-300 text-sm cursor-pointer">
                    I would like a tax receipt
                  </label>
                </div>
              </div>

              {/* Payment Method */}
              <div className="glass p-6 rounded-xl">
                <h2 className="text-white font-bold mb-4">Payment Method</h2>
                <div className="space-y-3">
                  {(['MPESA', 'CARD', 'BANK_TRANSFER'] as PaymentMethod[]).map(m => (
                    <label
                      key={m}
                      className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                        payment === m
                          ? 'border-yellow-500/50 bg-yellow-500/10'
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={payment === m}
                        onChange={() => setPayment(m)}
                        className="accent-yellow-500"
                      />
                      <span className="text-white text-sm font-medium">
                        {m === 'MPESA' ? '📱 M-Pesa' : m === 'CARD' ? '💳 Card' : '🏦 Bank Transfer'}
                      </span>
                    </label>
                  ))}
                </div>

                {payment === 'MPESA' && (
                  <div className="mt-4 bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-sm text-gray-300">
                    <p className="text-green-400 font-semibold mb-1">📱 M-Pesa STK Push</p>
                    <p>After clicking Donate you&apos;ll receive a payment prompt directly on your Safaricom phone. Just enter your PIN.</p>
                  </div>
                )}
                {payment === 'CARD' && (
                  <div className="mt-4 glass p-4 rounded-xl text-gray-400 text-sm">
                    💳 Card payment coming soon. Please use M-Pesa or Bank Transfer for now.
                  </div>
                )}
                {payment === 'BANK_TRANSFER' && (
                  <div className="mt-4 glass p-4 rounded-xl text-sm text-gray-300 space-y-2">
                    <p className="text-white font-semibold mb-1">🏦 Bank Details</p>
                    <div className="flex justify-between text-xs"><span className="text-gray-500">Bank</span><strong>Equity Bank Kenya</strong></div>
                    <div className="flex justify-between text-xs"><span className="text-gray-500">Account Name</span><strong>Zaid Knights Chess Club</strong></div>
                    <div className="flex justify-between text-xs"><span className="text-gray-500">Account No</span><strong className="text-yellow-400 font-mono">1006394827</strong></div>
                    <div className="flex justify-between text-xs"><span className="text-gray-500">Branch</span><strong>Nairobi Central</strong></div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || effectiveAmount < 10}
                className="btn-primary w-full py-4 text-base"
              >
                {loading
                  ? 'Processing…'
                  : `Donate KES ${effectiveAmount > 0 ? effectiveAmount.toLocaleString() : '—'} →`}
              </button>
            </form>
          </div>

          {/* Impact Sidebar */}
          <div className="space-y-6">
            {/* Impact Guide */}
            <div className="glass p-6 rounded-xl">
              <h3 className="text-white font-bold mb-4">Your Impact</h3>
              <div className="space-y-3">
                {Object.entries(IMPACT_MAP).map(([amt, desc]) => (
                  <div key={amt} className="flex items-start gap-3">
                    <span className="text-yellow-400 font-bold text-xs w-16 flex-shrink-0 mt-0.5">
                      KES {parseInt(amt).toLocaleString()}
                    </span>
                    <span className="text-gray-400 text-xs leading-relaxed">{desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* This Month */}
            <div className="glass-gold p-6 rounded-xl text-center">
              <p className="text-gray-400 text-xs mb-1">Raised This Month</p>
              <p className="text-3xl font-bold text-yellow-400 mb-1">
                KES {monthly.toLocaleString()}
              </p>
              <ProgressBar value={monthly} max={100000} showPercent />
              <p className="text-gray-500 text-xs mt-2">Goal: KES 100,000/month</p>
            </div>

            {/* Leaderboard */}
            {leaderboard.length > 0 && (
              <div className="glass p-5 rounded-xl">
                <h3 className="text-white font-bold mb-4 text-sm">Top Supporters</h3>
                <div className="space-y-2">
                  {leaderboard.slice(0, 5).map(d => (
                    <div key={d.rank} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold w-6 ${d.rank <= 3 ? 'text-yellow-400' : 'text-gray-500'}`}>
                          {d.rank === 1 ? '🥇' : d.rank === 2 ? '🥈' : d.rank === 3 ? '🥉' : `#${d.rank}`}
                        </span>
                        <span className="text-gray-300 text-xs truncate max-w-[110px]">{d.name}</span>
                      </div>
                      <span className="text-yellow-400 text-xs font-semibold">
                        KES {d.total.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="glass p-5 rounded-xl text-center">
              <p className="text-gray-400 text-xs mb-3">Questions about donating?</p>
              <Link href="/contact" className="btn-secondary text-sm py-2 w-full block">
                Contact Us →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
    </>
  );
}
