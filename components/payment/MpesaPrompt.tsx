import { useState, useEffect, useRef } from 'react';

type Stage = 'phone' | 'waiting' | 'success' | 'failed';

interface Props {
  amount:      number;
  type:        'donation' | 'membership';
  referenceId: string;
  onSuccess:   (receiptNo: string) => void;
  onCancel:    () => void;
}

const TILL    = process.env.NEXT_PUBLIC_MPESA_TILL    ?? '';
const PAYBILL = process.env.NEXT_PUBLIC_MPESA_PAYBILL ?? '880100';
const ACCOUNT = process.env.NEXT_PUBLIC_MPESA_ACCOUNT ?? '124498';

function formatPhone(p: string): string {
  const d = p.replace(/\D/g, '');
  if (d.startsWith('07') || d.startsWith('01')) return '254' + d.slice(1);
  if (d.startsWith('254'))                       return d;
  if (d.startsWith('7')  || d.startsWith('1'))  return '254' + d;
  return d;
}

function isValidPhone(p: string): boolean {
  return /^254[71]\d{8}$/.test(formatPhone(p));
}

export default function MpesaPrompt({ amount, type, referenceId, onSuccess, onCancel }: Props) {
  const [phone,         setPhone]         = useState('');
  const [stage,         setStage]         = useState<Stage>('phone');
  const [error,         setError]         = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [receiptNo,     setReceiptNo]     = useState('');
  const [etimsNo,       setEtimsNo]       = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleSend = async () => {
    setError('');
    if (!isValidPhone(phone)) {
      setError('Enter a valid Safaricom number (07xx or 01xx)');
      return;
    }
    try {
      const res  = await fetch('/api/payments/mpesa/initiate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ phoneNumber: formatPhone(phone), amount, type, referenceId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send M-Pesa prompt');
      setTransactionId(data.transactionId);
      setStage('waiting');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Try again.');
    }
  };

  useEffect(() => {
    if (stage !== 'waiting' || !transactionId) return;
    let attempts = 0;
    pollRef.current = setInterval(async () => {
      attempts++;
      try {
        const res  = await fetch(`/api/payments/status?transactionId=${transactionId}`);
        const data = await res.json();
        if (data.status === 'COMPLETED') {
          clearInterval(pollRef.current!);
          setReceiptNo(data.mpesaReceiptNo ?? '');
          setEtimsNo(data.etimsReceiptNo ?? '');
          setStage('success');
        } else if (data.status === 'FAILED') {
          clearInterval(pollRef.current!);
          setStage('failed');
        }
      } catch { /* poll silently */ }
      if (attempts >= 20) {
        clearInterval(pollRef.current!);
        setStage('failed');
      }
    }, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [stage, transactionId]);

  // Auto-advance on success after brief pause
  useEffect(() => {
    if (stage !== 'success') return;
    const t = setTimeout(() => onSuccess(receiptNo), 2000);
    return () => clearTimeout(t);
  }, [stage, receiptNo, onSuccess]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center px-4 pb-0 sm:pb-0">
      <div className="glass w-full max-w-sm rounded-t-3xl sm:rounded-2xl px-7 pt-8 pb-10 border border-white/10 border-b-0 sm:border-b relative">
        {/* Drag handle (mobile) */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-7 sm:hidden" />

        {/* Amount badge */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-green-500/15 border border-green-500/30 rounded-full px-5 py-2 mb-3">
            <span className="text-xl">📱</span>
            <span className="text-green-400 font-bold">M-Pesa</span>
          </div>
          <p className="text-white font-bold text-3xl">KES {amount.toLocaleString()}</p>
        </div>

        {stage === 'phone' && (
          <div className="space-y-4">
            <div>
              <label className="label">Safaricom Phone Number</label>
              <input
                type="tel"
                inputMode="numeric"
                className="input mt-1 text-lg tracking-wider"
                placeholder="0712 345 678"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                autoFocus
              />
              {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
            </div>

            <div className="bg-white/5 rounded-xl p-3.5 text-xs text-gray-400 space-y-1">
              {TILL ? (
                <div className="flex justify-between">
                  <span>Till Number</span>
                  <strong className="text-white">{TILL}</strong>
                </div>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span>Paybill</span>
                    <strong className="text-white">{PAYBILL}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Account</span>
                    <strong className="text-white">{ACCOUNT}</strong>
                  </div>
                </>
              )}
              <p className="text-gray-600 pt-1">An STK push will be sent to your phone.</p>
            </div>

            <button onClick={handleSend} className="btn-primary w-full py-3.5 text-base">
              Send M-Pesa Prompt →
            </button>
            <button onClick={onCancel} className="w-full text-gray-500 text-sm hover:text-white transition py-1.5">
              Cancel
            </button>
          </div>
        )}

        {stage === 'waiting' && (
          <div className="text-center space-y-5 py-2">
            <div className="relative flex justify-center">
              <div className="w-20 h-20 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin" />
              <span className="absolute inset-0 flex items-center justify-center text-3xl">📱</span>
            </div>
            <div>
              <p className="text-white font-semibold text-lg">Check your phone!</p>
              <p className="text-gray-400 text-sm mt-2 leading-relaxed">
                Enter your M-Pesa PIN to confirm the payment of{' '}
                <strong className="text-white">KES {amount.toLocaleString()}</strong>.
              </p>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-xs text-yellow-300">
              Don't close this screen — we're waiting for confirmation…
            </div>
            <button onClick={onCancel} className="text-gray-600 text-xs hover:text-white transition">
              Cancel payment
            </button>
          </div>
        )}

        {stage === 'success' && (
          <div className="text-center space-y-4 py-2">
            <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-500/40">
              <span className="text-4xl">✅</span>
            </div>
            <div>
              <p className="text-green-400 font-bold text-xl">Payment Confirmed!</p>
              <p className="text-gray-400 text-sm mt-2">
                KES {amount.toLocaleString()} received.
              </p>
              {receiptNo && (
                <p className="text-xs text-gray-500 mt-1">M-PESA: <span className="text-yellow-400 font-mono">{receiptNo}</span></p>
              )}
              {etimsNo && (
                <p className="text-xs text-gray-500 mt-0.5">Receipt: <span className="text-yellow-400 font-mono">{etimsNo}</span></p>
              )}
            </div>
            {transactionId && (
              <a
                href={`/payments/receipt/${transactionId}`}
                target="_blank"
                rel="noreferrer"
                className="inline-block text-xs bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition"
              >
                View / Print eTIMS Receipt →
              </a>
            )}
          </div>
        )}

        {stage === 'failed' && (
          <div className="text-center space-y-4 py-2">
            <div className="w-20 h-20 mx-auto bg-red-500/15 rounded-full flex items-center justify-center border-2 border-red-500/30">
              <span className="text-4xl">✗</span>
            </div>
            <div>
              <p className="text-red-400 font-semibold text-lg">Payment Not Completed</p>
              <p className="text-gray-400 text-sm mt-1">
                The M-Pesa prompt timed out or was cancelled.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setStage('phone'); setError(''); }} className="flex-1 btn-primary text-sm py-2.5">
                Try Again
              </button>
              <button onClick={onCancel} className="flex-1 btn-secondary text-sm py-2.5">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
