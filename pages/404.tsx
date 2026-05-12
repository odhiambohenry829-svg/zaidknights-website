import Link from 'next/link';
import Layout from '../components/common/Layout';

export default function NotFound() {
  return (
    <Layout title="Page Not Found | Zaid Knights Chess Club">
      <div className="min-h-[75vh] flex items-center justify-center px-4 chess-pattern">
        <div className="text-center max-w-lg">
          <div className="text-8xl mb-6 select-none">♟</div>
          <h1 className="text-6xl font-bold text-yellow-400 mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            404
          </h1>
          <h2 className="text-2xl font-semibold text-white mb-4">
            This square is empty
          </h2>
          <p className="text-gray-400 mb-10">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/" className="btn-primary">
              Back to Home
            </Link>
            <Link href="/events" className="btn-secondary">
              Browse Events
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
