import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zaid Knights Chess Club",
  description:
    "Tournament play, coaching, member development, and chess community programming.",
};

const navItems = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/donate", label: "Donate" },
  { href: "/renew", label: "Renew" },
  { href: "/organizations", label: "Organizations" },
  { href: "/profile", label: "Profile" },
  { href: "/news", label: "News" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="site-shell">
          <header className="site-header">
            <nav className="nav" aria-label="Primary navigation">
              <Link className="brand" href="/">
                <span className="brand-mark">ZK</span>
                <span>Zaid Knights</span>
              </Link>
              <div className="nav-links">
                {navItems.map((item) => (
                  <Link href={item.href} key={item.href}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>
          </header>
          {children}
          <footer className="site-footer">
            <div className="footer-inner">
              <strong>Zaid Knights Chess Club</strong>
              <span>Coaching, events, and competitive chess development.</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
