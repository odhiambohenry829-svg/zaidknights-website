import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/common/Layout';
import { useAuth } from './_app';
import { MEMBERSHIP_PRICES } from './api/memberships';

type Step = 'plan' | 'payment' | 'pending' | 'success';

const TIERS = [
  { value: 'BEGINNER',          label: 'Beginner',          icon: '♟',  desc: 'Perfect for new players just getting started' },
  { value: 'INTERMEDIATE',      label: 'Intermediate',      icon: '♞',  desc: 'For players developing competitive skills' },
  { value: 'ADVANCED',          label: 'Advanced',          icon: '♝',  desc: 'Serious players in regular tournaments' },
  { value: 'COMPETITIVE_SQUAD', label: 'Competitive Squad', icon: '♛',  desc: 'Elite players representing the club nationally' },
];

const PLANS = [
  { value: 'MONTHLY', label: 'Monthly',         period: '/ month',  badge: '' },
  { value: 'TERM',    label: 'School Term',      period: '/ term',   badge: 'Popular' },
  { value: 'ANNUAL',  label: 'Annual',           period: '/ year',   badge: 'Best Value' },
];

export default function RenewPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [tier,          setTier]          = useState('INTERMEDIATE');
  const [plan,          setPlan]          = useState('TERM');
  const [autoRenew,     setAutoRenew]     = useState(false);
  const [phoneNumber,   setPhoneNumber]   = useState('');
  const [membershipId,  setMembershipId]  = useState('');
  const [checkoutReqId, setCheckoutReqId] = useState('');
  const [step,          setStep]          = useState<Step>('plan');
  const [error,         setError]         = useState('');
  const [loading,       setLoading]       = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login?redirect=/renew');
  }, [user, authLoading, router]);

  if (authLoading || !user) return null;

  const price = MEMBERSHIP_PRICES[tier]?.[plan] ?? 0;

  // Step 1 — create membership record
  const handlePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/memberships', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, tier, autoRenew }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMembershipId(data.membership.id);
      setStep('payment');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create membership.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2 — initiate MPESA
  const handleMpesaPay = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/payments/mpesa/initiate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, amount: price, type: 'membership', referenceId: membershipId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCheckoutReqId(data.checkoutRequestId);
      setStep('pending');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Payment initiation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Renew Membership | ZaidKnights Chess Club" description="Renew or upgrade your ZaidKnights Chess Club membership.">
      {/* Hero */}
      <section className="py-16 border-b border-white/10 chess-pattern">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-yellow-400 text-sm uppercase tracking-widest mb-3">Membership</p>
          <h1 className="text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Renew Your <span className="gold-gradient">Membership</span>
          </h1>
          <p className="text-gray-400">Choose your tier and plan to continue your chess journey with us.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">

          {/* ─── Plan Selection ─── */}
          {step === 'plan' && (
            <form onSubmit={handlePlanSubmit} className="space-y-8">

              {/* Tier */}
              <div>
                <h2 className="text-white font-semibold text-lg mb-4">Membership Tier</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {TIERS.map(t => (
                    <button key={t.value} type="button"
                      onClick={() => setTier(t.value)}
                      className={`text-left p-5 rounded-xl border transition-all ${
                        tier === t.value
                          ? 'bg-yellow-500/10 border-yellow-500/50'
                          : 'glass border-white/10 hover:border-white/20'
                      }`}
                    >
                      <span className="text-2xl">{t.icon}</span>
                      <p className={`font-semibold mt-1 ${tier === t.value ? 'text-yellow-400' : 'text-white'}`}>{t.label}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Plan */}
              <div>
                <h2 className="text-white font-semibold text-lg mb-4">Billing Plan</h2>
                <div className="grid grid-cols-3 gap-3">
                  {PLANS.map(p => (
                    <button key={p.value} type="button"
                      onClick={() => setPlan(p.value)}
                      className={`relative text-center p-4 rounded-xl border transition-all ${
                        plan === p.value
                          ? 'bg-yellow-500/10 border-yellow-500/50'
                          : 'glass border-white/10 hover:border-white/20'
                      }`}
                    >
                      {p.badge && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">{p.badge}</span>
                      )}
                      <p className={`font-semibold text-sm ${plan === p.value ? 'text-yellow-400' : 'text-white'}`}>{p.label}</p>
                      <p className={`text-xl font-bold mt-1 ${plan === p.value ? 'text-yellow-300' : 'text-gray-300'}`}>
                        KES {MEMBERSHIP_PRICES[tier]?.[p.value]?.toLocaleString()}
                      </p>
                      <p className="text-gray-500 text-xs">{p.period}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="glass-gold rounded-xl p-5">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-400 text-sm">Selected Plan</p>
                    <p className="text-white font-semibold mt-0.5">
                      {TIERS.find(t => t.value === tier)?.label} · {PLANS.find(p => p.value === plan)?.label}
                    </p>
                  </div>
                  <p className="text-yellow-400 text-2xl font-bold">KES {price.toLocaleString()}</p>
                </div>
              </div>

              {/* Auto-renew */}
              <div className="flex items-center gap-3">
                <input type="checkbox" id="autorenew" checked={autoRenew} onChange={e => setAutoRenew(e.target.checked)} className="w-4 h-4 accent-yellow-500" />
                <label htmlFor="autorenew" className="text-gray-300 text-sm cursor-pointer">
                  Enable auto-renewal (we'll remind you before each charge)
                </label>
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button type="submit" disabled={loading} className="w-full btn-primary py-4 text-lg font-semibold rounded-xl disabled:opacity-50">
                {loading ? 'Processing…' : 'Continue to Payment →'}
              </button>
            </form>
          )}

          {/* ─── MPESA Payment ─── */}
          {step === 'payment' && (
            <div className="glass rounded-xl p-8">
              <h2 className="text-white font-bold text-2xl mb-2">Pay via M-PESA</h2>
              <p className="text-gray-400 mb-6">You will receive a push notification on your phone.</p>

              <div className="glass-gold rounded-xl p-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-400">Plan</span>
                  <span className="text-white">{TIERS.find(t => t.value === tier)?.label} · {PLANS.find(p => p.value === plan)?.label}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-gray-400">Amount</span>
                  <span className="text-yellow-400 font-bold text-lg">KES {price.toLocaleString()}</span>
                </div>
              </div>

              <form onSubmit={handleMpesaPay} className="space-y-4">
                <label className="block">
                  <span className="label">M-PESA Phone Number</span>
                  <input className="input mt-1" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="0712345678" required />
                </label>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button type="submit" disabled={loading} className="w-full btn-primary py-3 font-semibold rounded-xl disabled:opacity-50">
                  {loading ? 'Initiating payment…' : 'Send M-PESA Push'}
                </button>
                <button type="button" onClick={() => setStep('plan')} className="w-full btn-ghost py-3 rounded-xl text-sm">
                  ← Back
                </button>
              </form>
            </div>
          )}

          {/* ─── Pending ─── */}
          {step === 'pending' && (
            <div className="glass rounded-xl p-10 text-center">
              <div className="text-5xl mb-4 animate-pulse">📱</div>
              <h2 className="text-white font-bold text-2xl mb-3">Check Your Phone</h2>
              <p className="text-gray-400 mb-8">An M-PESA request of <strong className="text-yellow-400">KES {price.toLocaleString()}</strong> has been sent to <strong className="text-white">{phoneNumber}</strong>. Enter your PIN to complete.</p>
              <div className="glass rounded-xl p-4 mb-6 inline-block">
                <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Checkout ID</p>
                <p className="text-yellow-400 font-mono text-sm">{checkoutReqId}</p>
              </div>
              <div className="mt-6 flex gap-3 justify-center">
                <button onClick={() => setStep('success')} className="btn-secondary text-sm rounded-xl px-4 py-2">
                  Payment complete ✓
                </button>
              </div>
            </div>
          )}

          {/* ─── Success ─── */}
          {step === 'success' && (
            <div className="glass rounded-xl p-10 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-white font-bold text-2xl mb-3">Membership Renewed!</h2>
              <p className="text-gray-400 mb-6">Your membership is being activated. A receipt will be sent to your email shortly.</p>
              <button onClick={() => router.push('/dashboard')} className="btn-primary rounded-xl px-8 py-3">
                Go to Dashboard →
              </button>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
