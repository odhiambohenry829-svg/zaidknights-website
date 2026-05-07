import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../pages/_app';

const navLinks = [
  { href: '/',           label: 'Home' },
  { href: '/about',      label: 'About' },
  { href: '/events',     label: 'Events' },
  { href: '/rankings',   label: 'Rankings' },
  { href: '/membership', label: 'Membership' },
  { href: '/gallery',    label: 'Gallery' },
  { href: '/blog',       label: 'Blog' },
  { href: '/contact',    label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#0A0A0F]/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl">♞</span>
            <span className="font-bold text-white group-hover:text-yellow-400 transition-colors">
              Zaid <span className="text-yellow-400">Knights</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  router.pathname === link.href
                    ? 'text-yellow-400 bg-yellow-400/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href={user.role === 'ADMIN' ? '/admin' : '/dashboard'}
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  {user.name}
                </Link>
                <button onClick={handleLogout} className="btn-secondary text-sm py-2">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-ghost text-sm">Login</Link>
                <Link href="/register" className="btn-primary text-sm py-2">Join Now</Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-gray-300 hover:text-white p-2"
            aria-label="Toggle menu"
          >
            <div className={`w-5 h-0.5 bg-current mb-1 transition-all ${open ? 'rotate-45 translate-y-1.5' : ''}`} />
            <div className={`w-5 h-0.5 bg-current mb-1 transition-all ${open ? 'opacity-0' : ''}`} />
            <div className={`w-5 h-0.5 bg-current transition-all ${open ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden border-t border-white/10 bg-[#0A0A0F]/95 backdrop-blur-md">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  router.pathname === link.href
                    ? 'text-yellow-400 bg-yellow-400/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              {user ? (
                <>
                  <Link href={user.role === 'ADMIN' ? '/admin' : '/dashboard'} onClick={() => setOpen(false)} className="btn-ghost text-sm text-center">
                    Dashboard
                  </Link>
                  <button onClick={handleLogout} className="btn-secondary text-sm">Logout</button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)} className="btn-ghost text-sm text-center">Login</Link>
                  <Link href="/register" onClick={() => setOpen(false)} className="btn-primary text-sm text-center">Join Now</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}