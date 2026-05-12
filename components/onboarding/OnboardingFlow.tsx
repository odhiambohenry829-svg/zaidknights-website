import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import OnboardingStep from './OnboardingStep';
import MpesaPrompt from '../payment/MpesaPrompt';

interface UpcomingEvent {
  id:       string;
  title:    string;
  startDate: string;
  location: string;
  type:     string;
  capacity: number;
  _count:   { registrations: number };
}

interface OnboardingFlowProps {
  userId:         string;
  userName:       string;
  memberTier:     string;
  upcomingEvents: UpcomingEvent[];
  onComplete?:    () => void;
}

// ── Confetti ──────────────────────────────────────────────────────────────────
const CONFETTI_COLORS = ['#D4AF37', '#ffffff', '#22c55e', '#3b82f6', '#f97316', '#ec4899'];

function Confetti() {
  const pieces = Array.from({ length: 36 });
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((_, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left:            `${(i * 2.8) % 100}%`,
            top:             '-12px',
            width:           `${8 + (i % 5) * 3}px`,
            height:          `${8 + (i % 5) * 3}px`,
            backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            borderRadius:    i % 3 === 0 ? '50%' : '2px',
            animation:       `zkConfetti ${2.2 + (i % 4) * 0.4}s ${(i * 0.07) % 1.8}s ease-in forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes zkConfetti {
          0%   { transform: translateY(0)     rotate(0deg);   opacity: 1; }
          100% { transform: translateY(105vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ── localStorage helpers ──────────────────────────────────────────────────────
interface OnboardingState {
  completedSteps: number[];
  skippedSteps:   number[];
  completedAt?:   string;
}

function getStorageKey(userId: string) {
  return `zk_onboarding_${userId}`;
}

function loadState(userId: string): OnboardingState {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    return raw ? JSON.parse(raw) : { completedSteps: [1], skippedSteps: [] };
  } catch {
    return { completedSteps: [1], skippedSteps: [] };
  }
}

function saveState(userId: string, state: OnboardingState) {
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(state));
  } catch { /* ignore */ }
}

// ── Payment amounts ───────────────────────────────────────────────────────────
const TIER_AMOUNT: Record<string, string> = {
  INTERMEDIATE:      'KES 1,200 / term',
  ADVANCED:          'KES 3,000 / term',
  COMPETITIVE_SQUAD: 'KES 5,000 / term',
};

const TRAINING_GROUPS = ['Morning', 'Afternoon', 'Weekend'];

// ── Main component ────────────────────────────────────────────────────────────
export default function OnboardingFlow({
  userId, userName, memberTier, upcomingEvents, onComplete,
}: OnboardingFlowProps) {
  const requiresPayment = ['INTERMEDIATE', 'ADVANCED', 'COMPETITIVE_SQUAD'].includes(memberTier);
  const totalSteps      = requiresPayment ? 4 : 3;

  const [state,      setState]      = useState<OnboardingState>(() => loadState(userId));
  const [activeStep, setActiveStep] = useState(1);
  const [done,       setDone]       = useState(false);
  const [showConf,   setShowConf]   = useState(false);
  const [mpesaOpen,  setMpesaOpen]  = useState(false);
  const [membershipId, setMembershipId] = useState('');

  // Profile form
  const [profilePhoto,     setProfilePhoto]     = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [trainingGroup,    setTrainingGroup]    = useState('');
  const [profileSaving,    setProfileSaving]    = useState(false);
  const [profileError,     setProfileError]     = useState('');

  // Event registration
  const [registering,     setRegistering]     = useState<string | null>(null);
  const [registeredIds,   setRegisteredIds]   = useState<string[]>([]);
  const [registerError,   setRegisterError]   = useState('');

  // Sync active step from state
  useEffect(() => {
    const maxDone = Math.max(...state.completedSteps, ...state.skippedSteps, 0);
    const nextStep = Math.min(maxDone + 1, totalSteps);
    setActiveStep(nextStep);
  }, [state, totalSteps]);

  // Check if fully done
  useEffect(() => {
    const allDone = Array.from({ length: totalSteps }, (_, i) => i + 1).every(
      s => state.completedSteps.includes(s) || state.skippedSteps.includes(s),
    );
    if (allDone && !done) {
      setDone(true);
      setShowConf(true);
      setTimeout(() => setShowConf(false), 4000);
      onComplete?.();
    }
  }, [state, totalSteps, done, onComplete]);

  const markStep = useCallback((step: number, skipped = false) => {
    setState(prev => {
      const next: OnboardingState = {
        completedSteps: skipped ? prev.completedSteps : [...new Set([...prev.completedSteps, step])],
        skippedSteps:   skipped ? [...new Set([...prev.skippedSteps, step])] : prev.skippedSteps,
      };
      saveState(userId, next);
      return next;
    });
    // Notify server (fire-and-forget)
    fetch('/api/member/onboarding', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ step }),
    }).catch(() => {});
  }, [userId]);

  // ── Step 2: Save profile ──────────────────────────────────────────────────
  const handleProfileSave = async () => {
    if (!emergencyContact && !trainingGroup && !profilePhoto) {
      setProfileError('Please fill in at least one field.');
      return;
    }
    setProfileSaving(true);
    setProfileError('');
    try {
      const res = await fetch('/api/member/profile', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ emergencyContact, trainingGroup, profilePhoto }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      markStep(2);
    } catch (e: unknown) {
      setProfileError(e instanceof Error ? e.message : 'Failed to save profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  // ── Step 3: Register for event ────────────────────────────────────────────
  const handleRegister = async (eventId: string) => {
    setRegistering(eventId);
    setRegisterError('');
    try {
      const res = await fetch('/api/events', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ eventId, action: 'register' }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Registration failed');
      }
      setRegisteredIds(prev => [...prev, eventId]);
      markStep(3);
    } catch (e: unknown) {
      setRegisterError(e instanceof Error ? e.message : 'Registration failed.');
    } finally {
      setRegistering(null);
    }
  };

  const isStepDone   = (s: number) => state.completedSteps.includes(s) || state.skippedSteps.includes(s);
  const progressPct  = Math.round(((state.completedSteps.length + state.skippedSteps.length) / totalSteps) * 100);

  // ── Completion screen ─────────────────────────────────────────────────────
  if (done) {
    return (
      <>
        {showConf && <Confetti />}
        <div className="glass rounded-2xl p-10 text-center border border-green-500/30">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            You&apos;re all set!
          </h2>
          <p className="text-gray-400 mb-6">Welcome to the club, {userName}. Your chess journey starts now.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/events" className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-2.5 rounded-lg transition-all">
              Browse Events →
            </Link>
            <Link href="/rankings" className="border border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 px-6 py-2.5 rounded-lg transition-all">
              View Rankings
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-white font-semibold">Complete Your Setup</h2>
        <span className="text-yellow-400 text-sm font-medium">{progressPct}%</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-yellow-500 rounded-full transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Step 1 — Account created (always done) */}
      <OnboardingStep
        stepNumber={1}
        title="Account Created"
        completed={true}
        active={false}
      >
        <span />
      </OnboardingStep>

      {/* Step 2 — Profile */}
      <OnboardingStep
        stepNumber={2}
        title="Complete Your Profile"
        completed={isStepDone(2)}
        active={activeStep === 2}
        onSkip={() => markStep(2, true)}
      >
        <div className="space-y-4">
          <div>
            <label className="label">Profile Photo URL</label>
            <input
              className="input mt-1"
              value={profilePhoto}
              onChange={e => setProfilePhoto(e.target.value)}
              placeholder="https://…"
            />
          </div>
          <div>
            <label className="label">Emergency Contact (name &amp; phone)</label>
            <input
              className="input mt-1"
              value={emergencyContact}
              onChange={e => setEmergencyContact(e.target.value)}
              placeholder="e.g. Jane Doe — +254 712 345 678"
            />
          </div>
          <div>
            <label className="label">Training Group</label>
            <select
              className="input mt-1"
              value={trainingGroup}
              onChange={e => setTrainingGroup(e.target.value)}
            >
              <option value="">Select a group…</option>
              {TRAINING_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          {profileError && <p className="text-red-400 text-sm">{profileError}</p>}
          <button
            onClick={handleProfileSave}
            disabled={profileSaving}
            className="bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black font-bold px-6 py-2.5 rounded-lg transition-all text-sm"
          >
            {profileSaving ? 'Saving…' : 'Save Profile →'}
          </button>
        </div>
      </OnboardingStep>

      {/* Step 3 — Browse & register for an event */}
      <OnboardingStep
        stepNumber={3}
        title="Register for an Event"
        completed={isStepDone(3)}
        active={activeStep === 3}
        onSkip={() => markStep(3, true)}
      >
        <div className="space-y-3">
          {registerError && <p className="text-red-400 text-sm mb-2">{registerError}</p>}
          {upcomingEvents.length === 0 ? (
            <p className="text-gray-500 text-sm">No upcoming events at the moment. Check back soon!</p>
          ) : (
            upcomingEvents.slice(0, 3).map(ev => {
              const full       = ev._count.registrations >= ev.capacity;
              const registered = registeredIds.includes(ev.id);
              return (
                <div key={ev.id} className="flex items-start justify-between gap-3 p-4 bg-white/5 border border-white/10 rounded-xl">
                  <div className="min-w-0">
                    <p className="text-white font-medium text-sm truncate">{ev.title}</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      📅 {new Date(ev.startDate).toLocaleDateString('en-KE')} · 📍 {ev.location}
                    </p>
                    <p className="text-gray-600 text-xs mt-0.5">
                      {ev._count.registrations}/{ev.capacity} spots
                    </p>
                  </div>
                  <button
                    onClick={() => !registered && !full && handleRegister(ev.id)}
                    disabled={!!registering || registered || full}
                    className={`flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 ${
                      registered
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : full
                          ? 'bg-white/5 text-gray-500 border border-white/10'
                          : 'bg-yellow-500 hover:bg-yellow-400 text-black'
                    }`}
                  >
                    {registered ? '✓ Registered' : full ? 'Full' : registering === ev.id ? '…' : 'Register'}
                  </button>
                </div>
              );
            })
          )}
          <Link href="/events" className="block text-yellow-400/70 hover:text-yellow-400 text-xs text-center mt-2 transition-colors">
            View all events →
          </Link>
        </div>
      </OnboardingStep>

      {/* Step 4 — Payment (only for paid tiers) */}
      {requiresPayment && (
        <OnboardingStep
          stepNumber={4}
          title="Complete Payment"
          completed={isStepDone(4)}
          active={activeStep === 4}
          onSkip={() => markStep(4, true)}
        >
          <div className="space-y-4">
            <div className="glass-gold rounded-xl p-4 text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-gray-400">Tier</span>
                <span className="text-white capitalize">{memberTier.replace(/_/g, ' ').toLowerCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Amount</span>
                <span className="text-yellow-400 font-bold">{TIER_AMOUNT[memberTier] ?? 'Contact admin'}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href="/renew"
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-2.5 rounded-lg transition-all text-sm"
              >
                Pay via M-PESA →
              </Link>
              <button
                type="button"
                onClick={() => markStep(4, true)}
                className="border border-white/20 text-gray-400 hover:text-white px-4 py-2.5 rounded-lg text-sm transition-all"
              >
                I&apos;ll pay later
              </button>
            </div>
          </div>
        </OnboardingStep>
      )}

      {/* M-Pesa prompt overlay (for inline payment in onboarding) */}
      {mpesaOpen && membershipId && (
        <MpesaPrompt
          amount={parseInt((TIER_AMOUNT[memberTier] ?? '0').replace(/\D/g, ''), 10)}
          type="membership"
          referenceId={membershipId}
          onSuccess={() => { setMpesaOpen(false); markStep(4); }}
          onCancel={() => setMpesaOpen(false)}
        />
      )}
    </div>
  );
}
