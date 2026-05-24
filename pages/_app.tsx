import type { AppProps } from 'next/app';
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import '../styles/globals.css';

// ─── Auth Types ───────────────────────────────────────────────
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'COACH' | 'MEMBER' | 'GUEST' | 'ORG_ADMIN';
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

// ─── Auth cache helpers ───────────────────────────────────────
const AUTH_CACHE_KEY = 'zk_auth_user_v1';
const AUTH_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function readAuthCache(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(AUTH_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.user || !parsed?.ts) return null;
    if (Date.now() - parsed.ts > AUTH_CACHE_TTL_MS) return null;
    return parsed.user as AuthUser;
  } catch {
    return null;
  }
}

function writeAuthCache(user: AuthUser | null) {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      sessionStorage.setItem(AUTH_CACHE_KEY, JSON.stringify({ user, ts: Date.now() }));
    } else {
      sessionStorage.removeItem(AUTH_CACHE_KEY);
    }
  } catch {}
}

// ─── App ──────────────────────────────────────────────────────
export default function App({ Component, pageProps }: AppProps) {
  // Hydrate from cache synchronously so navbar renders correctly on first paint
  const [user, setUserState] = useState<AuthUser | null>(() => readAuthCache());
  const [loading, setLoading] = useState(() => readAuthCache() === null);
  const hasFetched = useRef(false);

  const setUser = (u: AuthUser | null) => {
    setUserState(u);
    writeAuthCache(u);
  };

  useEffect(() => {
    // Only hit the API once per page session, and only if we don't have a cached user
    if (hasFetched.current) return;
    hasFetched.current = true;

    // If we already have a cached user, do a silent background refresh — don't block UI
    const hasCached = readAuthCache() !== null;
    const doFetch = () => {
      fetch('/api/auth/me')
        .then(res => (res.ok ? res.json() : null))
        .then(data => {
          if (data?.user) {
            setUser(data.user);
          } else if (!hasCached) {
            // No cache and no user — confirmed logged out
            setUser(null);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    };

    if (hasCached) {
      // Cache is fresh — render immediately, refresh in background after idle
      setLoading(false);
      const idle = (window as any).requestIdleCallback || ((cb: () => void) => setTimeout(cb, 1500));
      idle(doFetch);
    } else {
      doFetch();
    }
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