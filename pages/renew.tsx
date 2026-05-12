import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/common/Layout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import Toast from '../components/ui/Toast';
import Modal from '../components/ui/Modal';
import { useAuth } from './_app';

type Plan   = 'MONTHLY' | 'TERM' | 'ANNUAL';
type Method = 'MPESA' | 'CARD' | 'BANK_TRANSFER';

interface MemberData {
  id:     string;
  level:  string;
  tier:   string;
  status: string;
  memberships: {
    id:        string;
    plan:      string;
    tier:      string;
    status:    string;
    startDate: string;
    endDate:   string;
    amount:    number;
    transactions: { status: string; mpesaReceiptNo: string | null; createdAt: string }[];
  }[];
}

const PLAN_INFO: Record<Plan, { label: string; duration: string; months: number; badge?: string }> = {
  MONTHLY: { label: 'Monthly',     duration: '1 month',       months: 1 },
  TERM:    { label: 'School Term', duration: '~4 months',     months: 4, badge: 'Most Popular' },
  ANNUAL:  { label: 'Annual',      duration: '12 months',     months: 12, badge: 'Best Value' },
};

const PRICES: Record<string, Record<Plan, number>> = {
  BEGINNER:          { MONTHLY: 0,    TERM: 0,    ANNUAL: 0 },
  INTERMEDIATE:      { MONTHLY: 400,  TERM: 1200, ANNUAL: 4000 },
  ADVANCED:          { MONTHLY: 1200, TERM: 3000, ANNUAL: 10000 },
  COMPETITIVE_SQUAD: { MONTHLY: 2000, TERM: 5000, ANNUAL: 16000 },
};

const TIER_LABELS: Record<string, string> = {
  BEGINNER:          'Beginner',
  INTERMEDIATE:      'Intermediate',
  ADVANCED:          'Advanced',
  COMPETITIVE_SQUAD: 'Competitive Squad',
};

function calcNewExpiry(plan: Plan): Date {
  const now = new Date();
  if (plan === 'MONTHLY') return new Date(now.setMonth(now.getMonth() + 1));
  if (plan === 'ANNUAL')  return new Date(now.setFullYear(now.getFullYear() + 1));
  // TERM — next school term end
  const month = now.getMonth() + 1;
  const year  = now.getFullYear();
  if (month <= 4)  return new Date(year, 3, 30);
  if (month <= 8)  return new Date(year, 7, 31);
  return new Date(year, 11, 15);
}

function daysUntil(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

export default function RenewPage() {
  const { user } = useAuth();
  const router   = useRouter();

  const [member,     setMember]     = useState<MemberData | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [plan,       setPlan]       = useState<Plan>((router.query.plan as Plan) || 'TERM');
  const [method,     setMethod]     = useState<Method>('MPESA');
  const [autoRenew,  setAutoRenew]  = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState<{ membership: { endDate: string }; amount: number } | null>(null);
  const [toast,      setToast]      = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [histModal,  setHistModal]  = useState<(typeof member)['memberships'][0] | null>(null);

  const tier = (router.query.tier as string) || member?.tier || 'BEGINNER';

  useEffect(() => {
    fetch('/api/memberships')
      .then(r => r.json())
      .then(d => setMember(d.member))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const effectiveTier  = tier || member?.tier || 'BEGINNER';
  const amount         = PRICES[effectiveTier]?.[plan] ?? 0;
  const newExpiry      = calcNewExpiry(plan);
  const activeMembership = member?.memberships?.find(m => m.status === 'ACTIVE') ?? member?.memberships?.[0];
  const daysLeft       = activeMembership ? daysUntil(activeMembership.endDate) : null;

  const handlePay = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/memberships', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ plan, tier: effectiveTier, autoRenew }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment failed');
      setSuccess(data);
    } catch (e: unknown) {
      setToast({ message: e instanceof Error ? e.message : 'Payment failed.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    const expiry = new Date(success.membership.endDate).toLocaleDateString('en-KE', { dateStyle: 'long' });
    return (
      <ProtectedRoute allowedRoles={['MEMBER', 'COACH', 'GUEST', 'ADMIN', 'ORG_ADMIN']}>
        <Layout title="Membership Renewed | Zaid Knights Chess Club">
          <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
            <div className="max-w-lg w-full glass p-10 rounded-2xl text-center border border-green-500/30">
              <div className="text-6xl mb-4">🎉</div>
              <h1 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                Membership Renewed!
              </h1>
              <p className="text-gray-400 mb-6">
                Your <span className="text-yellow-400 font-semibold">{PLAN_INFO[plan].label}</span> plan is active.
                Valid until <span className="text-green-400 font-semibold">{expiry}</span>.
              </p>
              {method === 'MPESA' && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-5 text-sm text-gray-300 space-y-1.5 mb-8 text-left">
                  <p className="text-green-400 font-semibold mb-2">Complete M-Pesa Payment</p>
                  <p>1. Go to M-PESA → Lipa na M-PESA → Pay Bill</p>
                  <p>2. Business No: <strong className="text-white">522522</strong></p>
                  <p>3. Account: <strong className="text-white">{user?.email}</strong></p>
                  <p>4. Amount: <strong className="text-yellow-400">KES {success.amount.toLocaleString()}</strong></p>
                </div>
              )}
              <div className="flex gap-3 justify-center">
                <Link href="/dashboard" className="btn-primary">Back to Dashboard →</Link>
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['MEMBER', 'COACH', 'GUEST', 'ADMIN', 'ORG_ADMIN']}>
      <Layout title="Renew Membership | Zaid Knights Chess Club">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        {/* Hero */}
        <section className="py-20 px-4 chess-pattern">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Renew <span className="gold-gradient">Membership</span>
            </h1>
            <p className="text-gray-400 text-lg">Keep playing, keep competing, keep growing.</p>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Current Status */}
              {!loading && member && (
                <div className="glass p-6 rounded-xl">
                  <h2 className="text-white font-bold mb-4">Current Membership</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Tier</p>
                      <p className="text-yellow-400 font-semibold">{TIER_LABELS[member.tier] ?? member.tier}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Status</p>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        member.status === 'ACTIVE'   ? 'bg-green-500/20 text-green-400' :
                        member.status === 'EXPIRED'  ? 'bg-red-500/20 text-red-400' :
                        member.status === 'PENDING'  ? 'bg-yellow-500/20 text-yellow-400' :
                                                       'bg-gray-500/20 text-gray-400'
                      }`}>
                        {member.status}
                      </span>
                    </div>
                    {activeMembership && (
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Expires</p>
                        <p className={`font-semibold text-sm ${daysLeft !== null && daysLeft < 0 ? 'text-red-400' : daysLeft !== null && daysLeft <= 30 ? 'text-orange-400' : 'text-white'}`}>
                          {daysLeft !== null && daysLeft < 0
                            ? `Expired ${Math.abs(daysLeft)} days ago`
                            : daysLeft === 0
                              ? 'Expires today'
                              : daysLeft !== null && daysLeft <= 30
                                ? `${daysLeft} days left`
                                : new Date(activeMembership.endDate).toLocaleDateString('en-KE')
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Plan Selector */}
              <div className="glass p-6 rounded-xl">
                <h2 className="text-white font-bold mb-4">Choose Your Plan</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(Object.keys(PLAN_INFO) as Plan[]).map(p => {
                    const info  = PLAN_INFO[p];
                    const price = PRICES[effectiveTier]?.[p] ?? 0;
                    return (
                      <label
                        key={p}
                        className={`relative flex flex-col p-4 rounded-xl border cursor-pointer transition-all ${
                          plan === p
                            ? 'border-yellow-500/60 bg-yellow-500/10'
                            : 'border-white/10 hover:border-white/20'
                        }`}
                      >
                        <input type="radio" name="plan" className="sr-only" checked={plan === p} onChange={() => setPlan(p)} />
                        {info.badge && (
                          <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
                            {info.badge}
                          </span>
                        )}
                        <span className="text-white font-semibold text-sm mb-1">{info.label}</span>
                        <span className="text-yellow-400 font-bold text-lg">
                          {price === 0 ? 'Free' : `KES ${price.toLocaleString()}`}
                        </span>
                        <span className="text-gray-500 text-xs mt-1">{info.duration}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Payment Method */}
              <div className="glass p-6 rounded-xl">
                <h2 className="text-white font-bold mb-4">Payment Method</h2>
                <div className="space-y-3">
                  {(['MPESA', 'CARD', 'BANK_TRANSFER'] as Method[]).map(m => (
                    <label
                      key={m}
                      className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                        method === m ? 'border-yellow-500/50 bg-yellow-500/10' : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      <input type="radio" name="method" checked={method === m} onChange={() => setMethod(m)} className="accent-yellow-500" />
                      <span className="text-white text-sm font-medium">
                        {m === 'MPESA' ? '📱 M-Pesa' : m === 'CARD' ? '💳 Card' : '🏦 Bank Transfer'}
                      </span>
                    </label>
                  ))}
                </div>

                {method === 'MPESA' && (
                  <div className="mt-4 bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-sm text-gray-300 space-y-1.5">
                    <p className="text-green-400 font-semibold mb-2">M-Pesa Step-by-Step</p>
                    <p>1. Go to <strong className="text-white">M-PESA</strong> → Lipa na M-PESA → Pay Bill</p>
                    <p>2. Business No: <strong className="text-white">522522</strong></p>
                    <p>3. Account No: <strong className="text-white">{user?.email}</strong></p>
                    <p>4. Amount: <strong className="text-yellow-400">KES {amount.toLocaleString()}</strong></p>
                    <p>5. Enter PIN and confirm</p>
                  </div>
                )}
                {method === 'CARD' && (
                  <div className="mt-4 glass p-4 rounded-xl text-gray-400 text-sm">
                    💳 Card payment is coming soon. Use M-Pesa or Bank Transfer.
                  </div>
                )}
                {method === 'BANK_TRANSFER' && (
                  <div className="mt-4 glass p-4 rounded-xl text-sm text-gray-300 space-y-1">
                    <p className="text-white font-semibold mb-2">Bank Details</p>
                    <p>Bank: <strong>Equity Bank Kenya</strong></p>
                    <p>Account: <strong>Zaid Knights Chess Club</strong></p>
                    <p>Acc No: <strong>0123456789</strong></p>
                    <p>Branch: <strong>Nairobi Central</strong></p>
                  </div>
                )}

                <div className="mt-4 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="auto"
                    checked={autoRenew}
                    onChange={e => setAutoRenew(e.target.checked)}
                    className="accent-yellow-500 w-4 h-4"
                  />
                  <label htmlFor="auto" className="text-gray-300 text-sm cursor-pointer">
                    Enable auto-renew (we&apos;ll remind you 7 days before expiry)
                  </label>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-4">
              <div className="glass-gold p-6 rounded-xl">
                <h3 className="text-white font-bold mb-5">Order Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Plan</span>
                    <span className="text-white font-medium">{PLAN_INFO[plan].label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tier</span>
                    <span className="text-white font-medium">{TIER_LABELS[effectiveTier] ?? effectiveTier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration</span>
                    <span className="text-white">{PLAN_INFO[plan].duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">New expiry</span>
                    <span className="text-green-400 font-medium">
                      {newExpiry.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="border-t border-white/10 pt-3 flex justify-between">
                    <span className="text-gray-300 font-semibold">Total</span>
                    <span className="text-yellow-400 font-bold text-lg">
                      {amount === 0 ? 'Free' : `KES ${amount.toLocaleString()}`}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handlePay}
                  disabled={submitting}
                  className="btn-primary w-full mt-6"
                >
                  {submitting ? 'Processing…' : amount === 0 ? 'Activate →' : `Confirm & Pay KES ${amount.toLocaleString()} →`}
                </button>
              </div>

              <div className="glass p-4 rounded-xl text-center">
                <p className="text-gray-400 text-xs mb-2">Need help?</p>
                <Link href="/contact" className="text-yellow-400 hover:text-yellow-300 text-sm transition-colors">
                  Contact Us →
                </Link>
              </div>

              {/* Payment History */}
              {member?.memberships && member.memberships.length > 0 && (
                <div className="glass p-5 rounded-xl">
                  <h3 className="text-white font-bold mb-4 text-sm">Payment History</h3>
                  <div className="space-y-2">
                    {member.memberships.slice(0, 4).map(ms => (
                      <button
                        key={ms.id}
                        onClick={() => setHistModal(ms)}
                        className="w-full flex items-center justify-between text-xs text-left hover:bg-white/5 rounded-lg p-2 transition-colors"
                      >
                        <div>
                          <p className="text-white font-medium capitalize">{ms.plan.toLowerCase()} · {TIER_LABELS[ms.tier] ?? ms.tier}</p>
                          <p className="text-gray-500">{new Date(ms.startDate).toLocaleDateString('en-KE')}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-yellow-400 font-semibold">KES {ms.amount.toLocaleString()}</p>
                          <span className={`text-xs ${ms.status === 'ACTIVE' ? 'text-green-400' : 'text-gray-500'}`}>{ms.status}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* History Receipt Modal */}
        <Modal open={!!histModal} onClose={() => setHistModal(null)} title="Payment Receipt">
          {histModal && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Plan', histModal.plan],
                  ['Tier', TIER_LABELS[histModal.tier] ?? histModal.tier],
                  ['Amount', `KES ${histModal.amount.toLocaleString()}`],
                  ['Status', histModal.status],
                  ['Start', new Date(histModal.startDate).toLocaleDateString('en-KE')],
                  ['Expiry', new Date(histModal.endDate).toLocaleDateString('en-KE')],
                ].map(([k, v]) => (
                  <div key={k} className="glass p-3 rounded-lg">
                    <p className="text-gray-500 text-xs mb-1">{k}</p>
                    <p className="text-white font-medium capitalize">{v.toLowerCase()}</p>
                  </div>
                ))}
              </div>
              {histModal.transactions?.length > 0 && (
                <div>
                  <p className="text-gray-400 text-xs mb-2">M-Pesa Receipt</p>
                  <p className="text-yellow-400 font-mono">{histModal.transactions[0]?.mpesaReceiptNo ?? 'Pending'}</p>
                </div>
              )}
            </div>
          )}
        </Modal>
      </Layout>
    </ProtectedRoute>
  );
}
