import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../pages/_app';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

function SkeletonDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-full skeleton" />
        <div className="space-y-2">
          <div className="skeleton h-6 w-48 rounded" />
          <div className="skeleton h-4 w-32 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-28 rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="skeleton h-64 rounded-xl" />
        <div className="skeleton h-64 rounded-xl" />
      </div>
    </div>
  );
}

function AccessDenied({ message }: { message: string }) {
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass p-10 rounded-2xl text-center max-w-md w-full">
        <div className="text-6xl mb-4">🔐</div>
        <h2 className="text-2xl font-bold text-white mb-3">Members Only</h2>
        <p className="text-gray-400 mb-6">{message}</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => router.push('/login')} className="btn-primary flex-1">
            Login
          </button>
          <button onClick={() => router.push('/register')} className="btn-secondary flex-1">
            Join Free
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) return; // handled by AccessDenied component below
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.push('/dashboard');
    }
  }, [user, loading, router, allowedRoles]);

  if (loading) return <SkeletonDashboard />;

  if (!user) {
    return (
      <AccessDenied message="You need to be logged in to access this page. Join Zaid Knights for free to get started!" />
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
}
