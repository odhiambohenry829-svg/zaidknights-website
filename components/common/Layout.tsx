import { ReactNode } from 'react';
import Head from 'next/head';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export default function Layout({ children, title = 'ZaidKnights Chess Club', description = 'Modern chess club platform for tournaments, rankings, membership, and club news.' }: LayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={process.env.NEXT_PUBLIC_SITE_URL ?? 'https://zaidknights.com'} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <div className="min-h-screen text-white">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </div>
    </>
  );
}
