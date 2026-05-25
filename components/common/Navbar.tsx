import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useAuth } from '../../pages/_app';

type NavLink  = { href: string; label: string };
type NavGroup = { label: string; children: NavLink[] };
type NavItem  = NavLink | NavGroup;

const publicNavItems: NavItem[] = [
  { href: '/',        label: 'Home' },
  { href: '/about',   label: 'About' },
  { href: '/events',  label: 'Events' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/blog',    label: 'Blog' },
  { href: '/donate',  label: 'Donate' },
  { href: '/contact', label: 'Contact' },
];

const memberNavItems: NavItem[] = [
  { href: '/',      label: 'Home' },
  { href: '/about', label: 'About' },
  {
    label: '♟ Play',
    children: [
      { href: '/play',         label: '⚡ Play Online' },
      { href: '/play/bot',     label: '🤖 Play vs Bot' },
      { href: '/live',         label: '📺 Live Games' },
      { href: '/analysis',     label: '🔍 Game Analysis' },
    ],
  },
  {
    label: '📚 Learn',
    children: [
      { href: '/puzzles',      label: '🧩 Puzzles' },
      { href: '/puzzles/rush', label: '⚡ Puzzle Rush' },
      { href: '/lessons',      label: '🎥 Video Lessons' },
      { href: '/openings',     label: '📖 Opening Explorer' },
      { href: '/endgames',     label: '🏁 Endgame Drills' },
    ],
  },
  {
    label: 'Community',
    children: [
      { href: '/events',        label: '📅 Events' },
      { href: '/leaderboard',   label: '🏆 Leaderboard' },
      { href: '/rankings',      label: '📊 Rankings' },
      { href: '/forums',        label: '💬 Forums' },
      { href: '/friends',       label: '👥 Friends' },
      { href: '/organizations', label: '🏢 Organizations' },
      { href: '/gallery',       label: '🖼 Gallery' },
      { href: '/blog',          label: '📝 Blog' },
    ],
  },
  { href: '/donate',  label: 'Donate' },
  { href: '/contact', label: 'Contact' },
];

const publicTabs = [
  { href: '/',       icon: '🏠', label: 'Home' },
  { href: '/events', icon: '📅', label: 'Events' },
  { href: '/donate', icon: '💛', label: 'Donate' },
  { href: '/about',  icon: 'ℹ️',  label: 'About' },
  { href: '/login',  icon: '👤', label: 'Login' },
];

const memberTabs = [
  { href: '/',            icon: '🏠', label: 'Home' },
  { href: '/play',        icon: '♟',  label: 'Play' },
  { href: '/puzzles',     icon: '🧩', label: 'Learn' },
  { href: '/leaderboard', icon: '🏆', label: 'Ranks' },
  { href: '/dashboard',   icon: '👤', label: 'Profile' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup,  setOpenGroup]  = useState<string | null>(null);
  const router  = useRouter();
  const { user, logout } = useAuth();
  const navRef  = useRef<HTMLDivElement>(null);

  const navItems = user ? memberNavItems : publicNavItems;
  const tabs     = user ? memberTabs     : publicTabs;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenGroup(null);
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
    item.children.some(c => router.pathname === c.href || router.pathname.startsWith(c.href + '/'));

  const isActive = (href: string) =>
    href === '/' ? router.pathname === '/' : router.pathname.startsWith(href);

  return (
    <>
      <nav ref={navRef} className="sticky top-0 z-50 bg-[#0A0A0F]/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            <Link href="/" className="flex items-center flex-shrink-0 gap-2 text-yellow-400 font-bold text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>
              <span className="text-2xl">♞</span>
              <span>Zaid Knights</span>
            </Link>

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
                          active || isOpen ? 'text-yellow-400 bg-yellow-400/10' : 'text-gray-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {item.label}
                        <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isOpen && (
                        <div className="absolute top-full left-0 mt-1 w-52 bg-[#0A0A0F]/98 backdrop-blur-md border border-white/10 rounded-xl shadow-xl shadow-black/50 py-1 z-20">
                          {item.children.map(child => (
                            <Link key={child.href} href={child.href}
                              className={`block px-4 py-2.5 text-sm transition-colors ${
                                router.pathname === child.href ? 'text-yellow-400 bg-yellow-400/10' : 'text-gray-300 hover:text-white hover:bg-white/10'
                              }`}>
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                return (
                  <Link key={item.href} href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.href) ? 'text-yellow-400 bg-yellow-400/10' : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}>
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="hidden md:flex items-center gap-3 flex-shrink-0">
              {user ? (
                <>
                  <Link href={user.role === 'ADMIN' ? '/admin' : '/dashboard'}
                    className="text-sm text-gray-300 hover:text-white transition-colors truncate max-w-[120px]">
                    {user.name}
                  </Link>
                  <button onClick={handleLogout} className="btn-secondary text-sm py-2">Logout</button>
                </>
              ) : (
                <>
                  <Link href="/login"    className="btn-ghost text-sm">Login</Link>
                  <Link href="/register" className="btn-primary text-sm py-2">Join Now</Link>
                </>
              )}
            </div>

            <button onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden text-gray-300 hover:text-white p-2" aria-label="Toggle menu">
              <div className={`w-5 h-0.5 bg-current mb-1 transition-all ${mobileOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
              <div className={`w-5 h-0.5 bg-current mb-1 transition-all ${mobileOpen ? 'opacity-0' : ''}`} />
              <div className={`w-5 h-0.5 bg-current transition-all ${mobileOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#0A0A0F]/98 backdrop-blur-md max-h-[70vh] overflow-y-auto">
            <div className="px-4 py-3 space-y-1">
              {navItems.map(item => {
                if ('children' in item) {
                  const isOpen = openGroup === item.label;
                  return (
                    <div key={item.label}>
                      <button onClick={() => setOpenGroup(isOpen ? null : item.label)}
                        className={`flex items-center justify-between w-full px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                          groupIsActive(item) ? 'text-yellow-400' : 'text-gray-300'
                        }`}>
                        {item.label}
                        <svg className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isOpen && (
                        <div className="pl-4 mt-1 space-y-1 border-l border-white/10 ml-3">
                          {item.children.map(child => (
                            <Link key={child.href} href={child.href} onClick={() => setMobileOpen(false)}
                              className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                                router.pathname === child.href ? 'text-yellow-400 bg-yellow-400/10' : 'text-gray-300 hover:text-white hover:bg-white/10'
                              }`}>
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                return (
                  <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                    className={`block px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.href) ? 'text-yellow-400 bg-yellow-400/10' : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}>
                    {item.label}
                  </Link>
                );
              })}
              <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
                {user ? (
                  <>
                    <Link href={user.role === 'ADMIN' ? '/admin' : '/dashboard'}
                      onClick={() => setMobileOpen(false)} className="btn-ghost text-sm text-center">
                      My Dashboard
                    </Link>
                    <button onClick={handleLogout} className="btn-secondary text-sm">Logout</button>
                  </>
                ) : (
                  <>
                    <Link href="/login"    onClick={() => setMobileOpen(false)} className="btn-ghost text-sm text-center">Login</Link>
                    <Link href="/register" onClick={() => setMobileOpen(false)} className="btn-primary text-sm text-center">Join Now — It's Free</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ── Mobile Bottom Tab Bar ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0A0A0F]/98 backdrop-blur-md border-t border-white/10">
        <div className="grid grid-cols-5 h-16">
          {tabs.map(tab => {
            const active = isActive(tab.href);
            return (
              <Link key={tab.href} href={tab.href}
                className={`flex flex-col items-center justify-center gap-0.5 relative transition-colors ${
                  active ? 'text-yellow-400' : 'text-gray-500 hover:text-gray-300'
                }`}>
                {active && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-yellow-400 rounded-full" />}
                <span className={`text-xl transition-transform ${active ? 'scale-110' : ''}`}>{tab.icon}</span>
                <span className="text-[10px] font-medium">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom spacer for mobile */}
      <div className="md:hidden h-16" />
    </>
  );
}
