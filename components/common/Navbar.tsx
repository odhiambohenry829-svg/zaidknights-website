import Link from 'next/link';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/membership', label: 'Membership' },
  { href: '/events', label: 'Events' },
  { href: '/rankings', label: 'Rankings' },
  { href: '/blog', label: 'Blog' }
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 text-white">
        <Link href="/" className="text-xl font-semibold tracking-wide text-gold">
          ZaidKnights
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-gold">
              {item.label}
            </Link>
          ))}
          <Link href="/login" className="rounded-full border border-gold px-4 py-2 text-sm font-medium transition hover:bg-gold/10">
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}
