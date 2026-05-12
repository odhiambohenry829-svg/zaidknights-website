import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../components/common/Layout';
import { useAuth } from './_app';

const TIERS = [
  {
    value:    'BEGINNER',
    label:    'Beginner',
    price:    'Free',
    icon:     '♟',
    desc:     'Club access, Saturday sessions & newsletter',
    highlight: false,
  },
  {
    value:    'INTERMEDIATE',
    label:    'Intermediate',
    price:    'KES 1,200 / term',
    icon:     '♜',
    desc:     'Group coaching, ELO ranking & tournament priority',
    highlight: true,
  },
  {
    value:    'ADVANCED',
    label:    'Advanced',
    price:    'KES 3,000 / term',
    icon:     '♛',
    desc:     'Personal coaching, FIDE rating & national eligibility',
    highlight: false,
  },
  {
    value:    'COMPETITIVE_SQUAD',
    label:    'Competitive Squad',
    price:    'KES 5,000 / term',
    icon:     '♔',
    desc:     'Full kit, travel support & national team selection',
    highlight: false,
  },
];

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

  if (!password) return null;
  return (
    <div className="mt-1.5 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= score ? colors[score] : 'bg-white/10'}`} />
        ))}
      </div>
      <p className={`text-xs ${score <= 1 ? 'text-red-400' : score === 2 ? 'text-yellow-400' : score === 3 ? 'text-blue-400' : 'text-green-400'}`}>
        {labels[score]}
      </p>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuth();

  const initialTier = (router.query.tier as string) || 'BEGINNER';
  const validTier   = TIERS.some(t => t.value === initialTier) ? initialTier : 'BEGINNER';

  const [step,    setStep]    = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [googleError, setGoogleError] = useState('');

  const [form, setForm] = useState({
    name:            '',
    email:           '',
    password:        '',
    confirmPassword: '',
    tier:            validTier,
    chessComUsername: '',
    agreed:          false,
  });

  // Surface Google OAuth errors from URL
  useEffect(() => {
    if (router.query.error === 'google_cancelled') setGoogleError('Google sign-in was cancelled.');
    if (router.query.error === 'google_failed')    setGoogleError('Google sign-in failed. Please try email instead.');
  }, [router.query.error]);

  const goToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim())    { setError('Please enter your name'); return; }
    if (!form.email.trim())   { setError('Please enter your email'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.agreed) { setError('Please agree to the terms'); return; }
    setLoading(true);
    setError('');
    try {
      const res  = await fetch('/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          name:             form.name,
          email:            form.email,
          password:         form.password,
          tier:             form.tier,
          chessComUsername: form.chessComUsername || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        const dest = data.isNewMember
          ? '/dashboard?onboarding=true'
          : ((router.query.redirect as string) || '/dashboard');
        router.push(dest);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Join Zaid Knights | Chess Club Nairobi">
      <div className="min-h-screen flex chess-pattern">

        {/* Left panel — branding (hidden on mobile) */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-16 py-12 border-r border-white/5">
          <div className="max-w-md">
            <span className="text-6xl block mb-6">♞</span>
            <h1 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Join Zaid <span className="gold-gradient">Knights</span>
            </h1>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              Nairobi's premier chess club. Compete, learn, and grow with 500+ passionate players.
            </p>
            <div className="space-y-4">
              {['Free Beginner membership — no card needed', 'Saturday sessions every week', 'Expert FIDE-trained coaches', 'National tournament eligibility'].map(f => (
                <div key={f} className="flex items-center gap-3">
                  <span className="text-yellow-400 text-lg">✓</span>
                  <span className="text-gray-300 text-sm">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-10">
          <div className="w-full max-w-md">

            {/* Logo (mobile only) */}
            <div className="text-center mb-6 lg:hidden">
              <span className="text-5xl">♞</span>
              <h1 className="text-xl font-bold text-white mt-2">Join Zaid Knights</h1>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-3 mb-6">
              {[1, 2].map(s => (
                <div key={s} className={`flex items-center gap-2 ${s < 2 ? 'flex-1' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step === s ? 'bg-yellow-500 text-black' : step > s ? 'bg-green-500 text-black' : 'bg-white/10 text-gray-500'
                  }`}>
                    {step > s ? '✓' : s}
                  </div>
                  <span className={`text-xs hidden sm:block ${step === s ? 'text-yellow-400' : 'text-gray-600'}`}>
                    {s === 1 ? 'Your details' : 'Choose tier'}
                  </span>
                  {s < 2 && <div className={`flex-1 h-px ${step > s ? 'bg-green-500/50' : 'bg-white/10'}`} />}
                </div>
              ))}
            </div>

            <div className="glass p-7 rounded-2xl">
              {/* Google OAuth error */}
              {googleError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-5">
                  {googleError}
                </div>
              )}

              {/* ── Step 1: Account details ── */}
              {step === 1 && (
                <>
                  <h2 className="text-white font-bold text-lg mb-5">Create your account</h2>

                  {/* Social signup */}
                  <a
                    href="/api/auth/google"
                    className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-all mb-4"
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908C16.658 14.013 17.64 11.705 17.64 9.2z" fill="#4285F4"/>
                      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </a>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-gray-600 text-xs">or with email</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">
                      {error}
                    </div>
                  )}

                  <form onSubmit={goToStep2} className="space-y-4">
                    <div>
                      <label className="label">Full Name</label>
                      <input
                        type="text"
                        required
                        className="input mt-1"
                        placeholder="Your full name"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="label">Email</label>
                      <input
                        type="email"
                        required
                        className="input mt-1"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="label">Password</label>
                      <input
                        type="password"
                        required
                        className="input mt-1"
                        placeholder="At least 8 characters"
                        value={form.password}
                        onChange={e => setForm({ ...form, password: e.target.value })}
                      />
                      <PasswordStrength password={form.password} />
                    </div>
                    <div>
                      <label className="label">Confirm Password</label>
                      <input
                        type="password"
                        required
                        className="input mt-1"
                        placeholder="Repeat your password"
                        value={form.confirmPassword}
                        onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                      />
                    </div>
                    <button type="submit" className="btn-primary w-full py-3 mt-1">
                      Continue →
                    </button>
                  </form>
                </>
              )}

              {/* ── Step 2: Tier + Chess.com ── */}
              {step === 2 && (
                <>
                  <h2 className="text-white font-bold text-lg mb-1">Choose your membership</h2>
                  <p className="text-gray-500 text-sm mb-5">You can upgrade at any time from your dashboard.</p>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      {TIERS.map(tier => (
                        <label
                          key={tier.value}
                          className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                            form.tier === tier.value
                              ? 'border-yellow-500/50 bg-yellow-500/10'
                              : 'border-white/10 hover:border-white/20'
                          }`}
                        >
                          <input
                            type="radio"
                            name="tier"
                            value={tier.value}
                            checked={form.tier === tier.value}
                            onChange={e => setForm({ ...form, tier: e.target.value })}
                            className="accent-yellow-500"
                          />
                          <span className="text-xl">{tier.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-white font-medium text-sm">{tier.label}</span>
                              {tier.highlight && (
                                <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">Popular</span>
                              )}
                            </div>
                            <p className="text-gray-500 text-xs mt-0.5 truncate">{tier.desc}</p>
                          </div>
                          <span className="text-yellow-400 text-xs font-semibold flex-shrink-0">{tier.price}</span>
                        </label>
                      ))}
                    </div>

                    {/* Chess.com username (optional) */}
                    <div>
                      <label className="label">
                        Chess.com Username
                        <span className="text-gray-600 font-normal ml-1">(optional)</span>
                      </label>
                      <div className="flex items-center mt-1">
                        <span className="input rounded-r-none px-3 py-2.5 bg-white/5 border-r-0 text-gray-500 text-sm flex-shrink-0 select-none">
                          ♟
                        </span>
                        <input
                          type="text"
                          className="input rounded-l-none flex-1"
                          placeholder="your_username"
                          value={form.chessComUsername}
                          onChange={e => setForm({ ...form, chessComUsername: e.target.value })}
                        />
                      </div>
                      <p className="text-gray-600 text-xs mt-1">We'll import your rating to show on the leaderboard.</p>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        id="agreed"
                        checked={form.agreed}
                        onChange={e => setForm({ ...form, agreed: e.target.checked })}
                        className="w-4 h-4 mt-0.5 accent-yellow-500 flex-shrink-0"
                      />
                      <label htmlFor="agreed" className="text-sm text-gray-400 leading-snug">
                        I agree to the club rules and{' '}
                        <Link href="/about#rules" className="text-yellow-400 hover:text-yellow-300">terms of membership</Link>
                      </label>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => { setStep(1); setError(''); }}
                        className="btn-secondary flex-1 py-3"
                      >
                        ← Back
                      </button>
                      <button type="submit" disabled={loading} className="btn-primary flex-1 py-3">
                        {loading ? 'Creating account…' : 'Join the Club →'}
                      </button>
                    </div>
                  </form>
                </>
              )}

              <p className="text-center text-gray-600 text-sm mt-5">
                Already a member?{' '}
                <Link href="/login" className="text-yellow-400 hover:text-yellow-300 font-medium">Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
