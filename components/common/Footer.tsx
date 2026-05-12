import Link from 'next/link';

const quickLinks = [
  { href: '/about',         label: 'About Us' },
  { href: '/events',        label: 'Events' },
  { href: '/rankings',      label: 'Rankings' },
  { href: '/membership',    label: 'Membership' },
  { href: '/organizations', label: 'Organizations' },
  { href: '/donate',        label: 'Donate' },
  { href: '/gallery',       label: 'Gallery' },
  { href: '/blog',          label: 'Blog' },
];

const socialLinks = [
  { label: 'X / Twitter', href: 'https://x.com/zaidknights?s=20',                                                                            icon: '𝕏' },
  { label: 'Facebook',    href: 'https://www.facebook.com/profile.php?id=61575904767623&sk',                                                  icon: 'f' },
  { label: 'Instagram',   href: 'https://www.instagram.com/zaidknights?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==',           icon: '◎' },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0A0A0F] mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">♞</span>
              <span className="font-bold text-white text-xl">
                Zaid <span className="text-yellow-400">Knights</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Nairobi's premier chess club. Building champions, fostering strategic minds,
              and growing the chess community in Kenya.
            </p>

            {/* Social Links */}
            <div className="flex gap-3 mt-5">
              {socialLinks.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:bg-yellow-400/20 hover:text-yellow-400 transition-all text-sm font-bold"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-yellow-400 text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <span className="mt-0.5">📍</span>
                <span>Nairobi, Kenya</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">✉️</span>
                <a href="mailto:info@zaidknights.org" className="hover:text-yellow-400 transition-colors">
                  info@zaidknights.org
                </a>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">📱</span>
                <a href="https://wa.me/254726027960" className="hover:text-yellow-400 transition-colors">
                  +254 726 027 960
                </a>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">🌐</span>
                <span>zaidknights.org</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Zaid Knights Chess Club. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/about"   className="hover:text-gray-300 transition-colors">About</Link>
            <Link href="/contact" className="hover:text-gray-300 transition-colors">Contact</Link>
            <Link href="/donate"  className="hover:text-gray-300 transition-colors">Donate</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
