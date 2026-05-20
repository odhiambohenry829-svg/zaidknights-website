import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '../../components/common/Layout';

export default function DonateSuccessPage() {
  const router = useRouter();
  const { OrderTrackingId, OrderMerchantReference } = router.query;
  const [status, setStatus] = useState<'checking' | 'success' | 'pending' | 'failed'>('checking');

  useEffect(() => {
    if (!OrderTrackingId) return;
    fetch(`/api/payments/pesapal/status?orderTrackingId=${OrderTrackingId}`)
      .then(r => r.json())
      .then(data => {
        const s = data.payment_status_description?.toLowerCase();
        if (s === 'completed') setStatus('success');
        else if (s === 'failed') setStatus('failed');
        else setStatus('pending');
      })
      .catch(() => setStatus('pending'));
  }, [OrderTrackingId]);

  return (
    <Layout title="Thank You | Zaid Knights Chess Club">
      <div className="min-h-screen flex items-center justify-center px-4 py-20">
        <div className="glass p-10 rounded-2xl text-center max-w-md w-full">
          {status === 'checking' && (
            <>
              <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
              <h2 className="text-xl font-bold text-white">Checking payment status...</h2>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-white mb-3">Thank You!</h2>
              <p className="text-gray-400 mb-2">Your donation has been received successfully.</p>
              <p className="text-yellow-400 font-bold mb-6">You're helping sharpen great minds!</p>
              {OrderMerchantReference && (
                <p className="text-gray-500 text-xs mb-6">Reference: {OrderMerchantReference}</p>
              )}
              <div className="flex flex-col gap-3">
                <Link href="/" className="btn-primary">Back to Home</Link>
                <Link href="/about" className="btn-secondary">Learn About Us</Link>
              </div>
            </>
          )}

          {status === 'pending' && (
            <>
              <div className="text-6xl mb-4">⏳</div>
              <h2 className="text-2xl font-bold text-white mb-3">Payment Pending</h2>
              <p className="text-gray-400 mb-6">Your payment is being processed. We'll send you a confirmation email once it's complete.</p>
              {OrderMerchantReference && (
                <p className="text-gray-500 text-xs mb-6">Reference: {OrderMerchantReference}</p>
              )}
              <Link href="/" className="btn-primary block text-center">Back to Home</Link>
            </>
          )}

          {status === 'failed' && (
            <>
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-2xl font-bold text-white mb-3">Payment Failed</h2>
              <p className="text-gray-400 mb-6">Something went wrong. Please try again or contact us on WhatsApp +254 726 027 960.</p>
              <div className="flex flex-col gap-3">
                <Link href="/donate" className="btn-primary">Try Again</Link>
                <Link href="/contact" className="btn-secondary">Contact Us</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
