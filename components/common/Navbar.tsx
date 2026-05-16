import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../pages/_app';

type NavLink  = { href: string; label: string };
type NavGroup = { label: string; children: NavLink[] };
type NavItem  = NavLink | NavGroup;

const navItems: NavItem[] = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  {
    label: '♟️ Play',
    children: [
      { href: '/play',         label: '⚡ Play Online' },
      { href: '/play/bot',     label: '🤖 Play vs Bot' },
      { href: '/puzzles',      label: '🧩 Puzzles' },
      { href: '/puzzles/rush', label: '⚡ Puzzle Rush' },
      { href: '/analysis',     label: '🔍 Game Analysis' },
      { href: '/live',         label: '📺 Live Games' },
    ],
  },
  {
    label: '📚 Learn',
    children: [
      { href: '/lessons',   label: '🎥 Video Lessons' },
      { href: '/openings',  label: '📖 Opening Explorer' },
      { href: '/endgames',  label: '🏁 Endgame Drills' },
    ],
  },
  {
    label: 'Explore',
    children: [
      { href: '/events',      label: 'Events & Tournaments' },
      { href: '/leaderboard', label: '🏆 Leaderboard' },
      { href: '/forums',      label: '💬 Forums' },
      { href: '/gallery',     label: 'Gallery' },
      { href: '/blog',        label: 'Blog' },
    ],
  },
  {
    label: 'Community',
    children: [
      { href: '/membership',    label: 'Membership' },
      { href: '/friends',       label: '👥 Friends' },
      { href: '/organizations', label: 'Organizations' },
      { href: '/donate',        label: 'Donate' },
    ],
  },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup,  setOpenGroup]  = useState<string | null>(null);
  const router  = useRouter();
  const { user, logout } = useAuth();
  const navRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenGroup(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    setOpenGroup(null);
    setMobileOpen(false);
  }, [router.pathname]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const groupIsActive = (item: NavGroup) =>
    item.children.some(c => router.pathname === c.href);

  return (
    <nav ref={navRef} className="sticky top-0 z-50 bg-[#0A0A0F]/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <span className="text-2xl">♞</span>
            <span className="font-bold text-white group-hover:text-yellow-400 transition-colors">
              Zaid <span className="text-yellow-400">Knights</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(item => {
              if ('children' in item) {
                const active = groupIsActive(item);
                const isOpen = openGroup === item.label;
                return (
                  <div key={item.label} className="relative">
                    <button
                      onClick={() => setOpenGroup(isOpen ? null : item.label)}
                      className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        active || isOpen
                          ? 'text-yellow-400 bg-yellow-400/10'
                          : 'text-gray-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {item.label}
                      <svg
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {isOpen && (
                      <div className="absolute top-full left-0 mt-1 w-52 bg-[#0A0A0F]/98 backdrop-blur-md border border-white/10 rounded-xl shadow-xl shadow-black/50 py-1 z-20">
                        {item.children.map(child => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`block px-4 py-2.5 text-sm transition-colors ${
                              router.pathname === child.href
                                ? 'text-yellow-400 bg-yellow-400/10'
                                : 'text-gray-300 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    router.pathname === item.href
                      ? 'text-yellow-400 bg-yellow-400/10'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
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
                <Link href="/login"    className="btn-ghost text-sm">Login</Link>
                <Link href="/register" className="btn-primary text-sm py-2">Join Now</Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-gray-300 hover:text-white p-2"
            aria-label="Toggle menu"
          >
            <div className={`w-5 h-0.5 bg-current mb-1 transition-all ${mobileOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <div className={`w-5 h-0.5 bg-current mb-1 transition-all ${mobileOpen ? 'opacity-0' : ''}`} />
            <div className={`w-5 h-0.5 bg-current transition-all ${mobileOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0A0A0F]/95 backdrop-blur-md">
          <div className="px-4 py-3 space-y-1">
            {navItems.map(item => {
              if ('children' in item) {
                const isOpen = openGroup === item.label;
                return (
                  <div key={item.label}>
                    <button
                      onClick={() => setOpenGroup(isOpen ? null : item.label)}
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        groupIsActive(item) ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      {item.label}
                      <svg
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isOpen && (
                      <div className="pl-4 mt-1 space-y-1 border-l border-white/10 ml-3">
                        {item.children.map(child => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setMobileOpen(false)}
                            className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                              router.pathname === child.href
                                ? 'text-yellow-400 bg-yellow-400/10'
                                : 'text-gray-300 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    router.pathname === item.href
                      ? 'text-yellow-400 bg-yellow-400/10'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              {user ? (
                <>
                  <Link
                    href={user.role === 'ADMIN' ? '/admin' : '/dashboard'}
                    onClick={() => setMobileOpen(false)}
                    className="btn-ghost text-sm text-center"
                  >
                    Dashboard
                  </Link>
                  <button onClick={handleLogout} className="btn-secondary text-sm">Logout</button>
                </>
              ) : (
                <>
                  <Link href="/login"    onClick={() => setMobileOpen(false)} className="btn-ghost text-sm text-center">Login</Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)} className="btn-primary text-sm text-center">Join Now</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
