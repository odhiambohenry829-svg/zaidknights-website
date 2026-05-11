import Link from 'next/link';

interface RenewalBannerProps {
  endDate: string;
}

export default function RenewalBanner({ endDate }: RenewalBannerProps) {
  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000),
  );

  if (daysLeft > 30) return null;

  const urgent  = daysLeft <= 7;
  const dateStr = new Date(endDate).toLocaleDateString('en-KE', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div
      className={`mb-6 rounded-xl border px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
        urgent
          ? 'border-red-500/40 bg-red-500/10'
          : 'border-yellow-500/40 bg-yellow-500/10'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0">{urgent ? '🔔' : '⏰'}</span>
        <div>
          <p className={`font-semibold ${urgent ? 'text-red-400' : 'text-yellow-400'}`}>
            Membership expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''}
          </p>
          <p className="text-gray-400 text-sm mt-0.5">
            Your membership expires on {dateStr}. Renew early to avoid interruption.
          </p>
        </div>
      </div>
      <Link
        href="/renew"
        className={`flex-shrink-0 text-sm font-bold px-5 py-2 rounded-lg transition-all whitespace-nowrap ${
          urgent
            ? 'bg-red-500 hover:bg-red-400 text-white'
            : 'border border-yellow-500/60 text-yellow-400 hover:bg-yellow-500/10'
        }`}
      >
        Renew →
      </Link>
    </div>
  );
}
