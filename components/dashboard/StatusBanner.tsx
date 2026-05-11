import Link from 'next/link';

interface StatusBannerProps {
  status: string;
  expiredAt?: string | null;
}

export default function StatusBanner({ status, expiredAt }: StatusBannerProps) {
  if (status === 'PENDING') {
    return (
      <div className="mb-6 rounded-xl border border-yellow-500/40 bg-yellow-500/10 px-5 py-4 flex items-start gap-4">
        <span className="text-2xl flex-shrink-0">⏳</span>
        <div>
          <p className="text-yellow-400 font-semibold">Account Pending Approval</p>
          <p className="text-gray-400 text-sm mt-0.5">
            An admin will review and approve your account within 24 hours. You can complete your profile and browse events in the meantime.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'SUSPENDED') {
    return (
      <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-4 flex items-start gap-4">
        <span className="text-2xl flex-shrink-0">⚠️</span>
        <div>
          <p className="text-red-400 font-semibold">Account Suspended</p>
          <p className="text-gray-400 text-sm mt-0.5">
            Your account has been suspended. Please contact us at{' '}
            <a href="mailto:info@zaidknights.org" className="text-yellow-400 hover:underline">
              info@zaidknights.org
            </a>{' '}
            to resolve this.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'EXPIRED' || status === 'PENDING_PAYMENT') {
    const dateStr = expiredAt
      ? new Date(expiredAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })
      : null;
    return (
      <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="text-2xl flex-shrink-0">🔒</span>
          <div>
            <p className="text-red-400 font-semibold">
              {status === 'EXPIRED' ? `Membership expired${dateStr ? ` on ${dateStr}` : ''}` : 'Payment required'}
            </p>
            <p className="text-gray-400 text-sm mt-0.5">
              Renew your membership to regain full access to events, rankings, and club features.
            </p>
          </div>
        </div>
        <Link
          href="/renew"
          className="flex-shrink-0 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm px-6 py-2.5 rounded-lg transition-all whitespace-nowrap"
        >
          Renew Now →
        </Link>
      </div>
    );
  }

  return null;
}
