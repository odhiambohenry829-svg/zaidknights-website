import Head from 'next/head';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  ogImage?: string;
}

export default function Layout({
  children,
  title = 'Zaid Knights Chess Club | Nairobi, Kenya',
  description = 'Zaid Knights Chess Club — Nairobi\'s premier chess community. Join tournaments, improve your game, and connect with passionate players.',
  ogImage,
}: LayoutProps) {
  return (
    <>
     <Head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta name="viewport" content="width=device-width, initial-scale=1" />

  {/* Favicon */}
  <link rel="icon" href="/logo.png" type="image/png" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <link rel="shortcut icon" href="/logo.png" />

  {/* Open Graph - shows on Google/Facebook/WhatsApp */}
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://zaidknights.org" />
  <meta property="og:site_name" content="Zaid Knights Chess Club" />
  <meta property="og:image" content="https://zaidknights.org/og-image.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />

  {/* Twitter/X */}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content="https://zaidknights.org/og-image.png" />

  {/* Google */}
  <meta name="robots" content="index, follow" />
  <meta name="googlebot" content="index, follow" />
</Head>      <div className="min-h-screen flex flex-col bg-[#0A0A0F]">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </>
  );
}