import type { AppProps } from 'next/app';
import { createContext, useContext, useState, useEffect } from 'react';
import '../styles/globals.css';

// ─── Auth Types ───────────────────────────────────────────────
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'COACH' | 'MEMBER' | 'GUEST';
}

interface AuthContextType {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  loading: boolean;
  logout: () => Promise<void>;
}

// ─── Auth Context ─────────────────────────────────────────────
export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  loading: true,
  logout: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

// ─── App ──────────────────────────────────────────────────────
export default function App({ Component, pageProps }: AppProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    await fetch('/api/auth/logout');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      <Component {...pageProps} />
    </AuthContext.Provider>
  );
}