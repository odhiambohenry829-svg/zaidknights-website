import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/80 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-lg font-semibold text-gold">ZaidKnights Chess Club</p>
          <p className="max-w-md text-sm text-slate-300">A modern chess community for players, coaches, and club champions. Strategy. Discipline. Excellence.</p>
        </div>
        <div className="flex flex-col gap-2 text-sm text-slate-300 sm:items-end">
          <p>Contact: hello@zaidknights.com</p>
          <p>Follow us on Instagram · TikTok · WhatsApp</p>
        </div>
      </div>
    </footer>
  );
}
