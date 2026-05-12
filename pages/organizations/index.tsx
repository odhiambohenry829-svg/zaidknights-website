import { useState } from 'react';
import Link from 'next/link';
import Layout from '../../components/common/Layout';
import Toast from '../../components/ui/Toast';

type OrgType       = 'SCHOOL' | 'COMPANY' | 'ACADEMY' | 'CLUB';
type InterestLevel = 'BEGINNER_INTEREST' | 'ACTIVE_INTEREST' | 'COMPETITIVE_INTEREST';
type Participation = 'TRAINING_PARTNERSHIP' | 'TOURNAMENT_ENTRY' | 'MEMBERSHIP_AFFILIATION';

const KENYA_COUNTIES = [
  'Baringo','Bomet','Bungoma','Busia','Elgeyo-Marakwet','Embu','Garissa','Homa Bay',
  'Isiolo','Kajiado','Kakamega','Kericho','Kiambu','Kilifi','Kirinyaga','Kisii','Kisumu',
  'Kitui','Kwale','Laikipia','Lamu','Machakos','Makueni','Mandera','Marsabit','Meru',
  'Migori','Mombasa','Murang\'a','Nairobi','Nakuru','Nandi','Narok','Nyamira','Nyandarua',
  'Nyeri','Samburu','Siaya','Taita-Taveta','Tana River','Tharaka-Nithi','Trans Nzoia',
  'Turkana','Uasin Gishu','Vihiga','Wajir','West Pokot',
];

const ORG_TYPES: { id: OrgType; icon: string; label: string; desc: string }[] = [
  { id: 'SCHOOL',  icon: '🏫', label: 'School',   desc: 'Primary or secondary school introducing chess to students' },
  { id: 'COMPANY', icon: '🏢', label: 'Company',  desc: 'Corporate entity sponsoring employee chess programmes' },
  { id: 'ACADEMY', icon: '🎓', label: 'Academy',  desc: 'Dedicated chess or sports academy seeking affiliation' },
  { id: 'CLUB',    icon: '♟',  label: 'Club',     desc: 'Existing chess club seeking inter-club partnership' },
];

const BENEFITS = [
  { icon: '🏆', title: 'Tournament Access',  desc: 'Your members get priority registration for all Zaid Knights tournaments and inter-club events.' },
  { icon: '🎓', title: 'Expert Coaching',    desc: 'Send your players to our certified coaching sessions or request on-site coaching visits.' },
  { icon: '📊', title: 'Club Affiliation',   desc: 'Official affiliation status, membership cards, and inclusion in our national ranking system.' },
];

interface Step1 {
  name:               string;
  type:               OrgType | '';
  registrationNumber: string;
  county:             string;
  location:           string;
}

interface Step2 {
  contactPerson:    string;
  contactRole:      string;
  email:            string;
  phone:            string;
  memberCount:      string;
  chessInterest:    InterestLevel;
  participation:    Participation[];
  trainingSchedule: string;
}

interface Step3 {
  notes:   string;
  agreed:  boolean;
}

type StepNum = 1 | 2 | 3;

const STEP_LABELS = ['Organization Details', 'Contact Information', 'Review & Submit'];

export default function OrganizationsPage() {
  const [step,     setStep]     = useState<StepNum>(1);
  const [toast,    setToast]    = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState<string | null>(null);
  const [errors,   setErrors]   = useState<string[]>([]);

  const [s1, setS1] = useState<Step1>({ name: '', type: '', registrationNumber: '', county: '', location: '' });
  const [s2, setS2] = useState<Step2>({
    contactPerson: '', contactRole: '', email: '', phone: '',
    memberCount: '', chessInterest: 'ACTIVE_INTEREST', participation: [], trainingSchedule: '',
  });
  const [s3, setS3] = useState<Step3>({ notes: '', agreed: false });

  const validateStep1 = () => {
    const errs: string[] = [];
    if (!s1.name.trim())     errs.push('Organization name is required');
    if (!s1.type)            errs.push('Organization type is required');
    if (!s1.county)          errs.push('County is required');
    if (!s1.location.trim()) errs.push('City/Town is required');
    return errs;
  };

  const validateStep2 = () => {
    const errs: string[] = [];
    if (!s2.contactPerson.trim()) errs.push('Contact person name is required');
    if (!s2.email.trim())         errs.push('Email is required');
    if (!s2.phone.trim())         errs.push('Phone number is required');
    if (s2.participation.length === 0) errs.push('Select at least one participation type');
    return errs;
  };

  const handleNext = () => {
    const errs = step === 1 ? validateStep1() : step === 2 ? validateStep2() : [];
    if (errs.length) { setErrors(errs); return; }
    setErrors([]);
    setStep((s => Math.min(s + 1, 3)) as (s: StepNum) => StepNum);
  };

  const handleBack = () => {
    setErrors([]);
    setStep((s => Math.max(s - 1, 1)) as (s: StepNum) => StepNum);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!s3.agreed) { setErrors(['You must agree to the terms']); return; }
    setErrors([]);
    setLoading(true);
    try {
      const body = {
        name:               s1.name,
        type:               s1.type,
        registrationNumber: s1.registrationNumber || undefined,
        county:             s1.county,
        location:           `${s1.location}, ${s1.county}`,
        contactPerson:      s2.contactPerson,
        contactRole:        s2.contactRole || undefined,
        email:              s2.email,
        phone:              s2.phone,
        memberCount:        parseInt(s2.memberCount) || 0,
        chessInterest:      s2.chessInterest,
        participationType:  s2.participation[0] || 'MEMBERSHIP_AFFILIATION',
        trainingSchedule:   s2.trainingSchedule || undefined,
        notes:              s3.notes || undefined,
      };
      const res  = await fetch('/api/organizations', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setSuccess(`ZKO-${data.organization?.id?.slice(0, 8)?.toUpperCase() ?? '000000'}`);
    } catch (e: unknown) {
      setToast({ message: e instanceof Error ? e.message : 'Submission failed.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const toggleParticipation = (p: Participation) => {
    setS2(prev => ({
      ...prev,
      participation: prev.participation.includes(p)
        ? prev.participation.filter(x => x !== p)
        : [...prev.participation, p],
    }));
  };

  if (success) {
    return (
      <Layout title="Application Submitted | Zaid Knights Chess Club">
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
          <div className="max-w-lg w-full glass p-10 rounded-2xl text-center border border-green-500/30">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
              Application Submitted!
            </h1>
            <p className="text-gray-400 mb-4">
              Reference: <span className="text-yellow-400 font-mono font-bold">{success}</span>
            </p>
            <div className="glass p-5 rounded-xl mb-8 text-left space-y-4">
              <p className="text-white font-semibold text-sm mb-1">What happens next</p>
              {[
                ['1. Review',         'Our team reviews your application within 2–3 business days.'],
                ['2. Approval Email', 'We\'ll send an approval or follow-up email to ' + s2.email + '.'],
                ['3. Onboarding Call','A coordinator will contact you to schedule your onboarding call.'],
              ].map(([title, desc]) => (
                <div key={title} className="flex gap-3">
                  <span className="text-yellow-400 font-bold text-sm flex-shrink-0">{title}</span>
                  <span className="text-gray-400 text-sm">{desc}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/" className="btn-primary">Back to Home →</Link>
              <Link href="/contact" className="btn-secondary">Contact Us</Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Organizations | Zaid Knights Chess Club">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Hero */}
      <section className="py-20 px-4 chess-pattern">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Organization <span className="gold-gradient">Registration</span>
          </h1>
          <p className="text-gray-400 text-lg mb-6">Partner with Nairobi&apos;s premier chess club</p>
          <Link href="/login" className="text-yellow-400 hover:text-yellow-300 text-sm transition-colors">
            Already registered? Sign in →
          </Link>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4" style={{ background: 'var(--dark-2)' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-10" style={{ fontFamily: 'Playfair Display, serif' }}>
            Why Partner with Zaid Knights?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {BENEFITS.map(b => (
              <div key={b.title} className="glass-hover p-6 rounded-xl text-center">
                <div className="text-4xl mb-4">{b.icon}</div>
                <h3 className="text-white font-bold mb-2">{b.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-white text-center mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
            Who Can Register?
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ORG_TYPES.map(ot => (
              <div key={ot.id} className="glass p-5 rounded-xl text-center">
                <div className="text-4xl mb-3">{ot.icon}</div>
                <h3 className="text-white font-semibold text-sm mb-1">{ot.label}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{ot.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Multi-step Form */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Step indicators */}
          <div className="flex items-center justify-between mb-10">
            {STEP_LABELS.map((label, i) => {
              const n = (i + 1) as StepNum;
              const done = step > n;
              const active = step === n;
              return (
                <button
                  key={n}
                  onClick={() => done ? setStep(n) : undefined}
                  disabled={!done}
                  className="flex flex-col items-center gap-2 flex-1"
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    done   ? 'bg-green-500 text-white cursor-pointer' :
                    active ? 'bg-yellow-500 text-black' :
                             'bg-white/10 text-gray-500'
                  }`}>
                    {done ? '✓' : n}
                  </div>
                  <span className={`text-xs hidden sm:block ${active ? 'text-white' : done ? 'text-green-400' : 'text-gray-500'}`}>
                    {label}
                  </span>
                  {i < 2 && <div className="absolute hidden" />}
                </button>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-white/10 rounded-full mb-10 overflow-hidden">
            <div
              className="h-full bg-yellow-500 rounded-full transition-all duration-500"
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            />
          </div>

          {errors.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
              {errors.map((e, i) => <p key={i} className="text-red-400 text-sm">{e}</p>)}
            </div>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <div className="glass p-8 rounded-2xl space-y-5">
              <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                Organization Details
              </h2>
              <div>
                <label className="label">Organization Name *</label>
                <input className="input" placeholder="e.g. Westlands High School" value={s1.name} onChange={e => setS1({ ...s1, name: e.target.value })} />
              </div>
              <div>
                <label className="label">Organization Type *</label>
                <div className="grid grid-cols-2 gap-3">
                  {ORG_TYPES.map(ot => (
                    <label key={ot.id} className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${s1.type === ot.id ? 'border-yellow-500/50 bg-yellow-500/10' : 'border-white/10 hover:border-white/20'}`}>
                      <input type="radio" name="orgtype" value={ot.id} checked={s1.type === ot.id} onChange={() => setS1({ ...s1, type: ot.id })} className="accent-yellow-500" />
                      <span className="text-lg">{ot.icon}</span>
                      <span className="text-white text-sm">{ot.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Registration Number (optional)</label>
                <input className="input" placeholder="e.g. MOE/2023/001" value={s1.registrationNumber} onChange={e => setS1({ ...s1, registrationNumber: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">County *</label>
                  <select className="input" value={s1.county} onChange={e => setS1({ ...s1, county: e.target.value })}>
                    <option value="">Select county…</option>
                    {KENYA_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">City / Town *</label>
                  <input className="input" placeholder="e.g. Nairobi" value={s1.location} onChange={e => setS1({ ...s1, location: e.target.value })} />
                </div>
              </div>
              <button onClick={handleNext} className="btn-primary w-full">Next →</button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="glass p-8 rounded-2xl space-y-5">
              <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                Contact Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Contact Person *</label>
                  <input className="input" placeholder="Full name" value={s2.contactPerson} onChange={e => setS2({ ...s2, contactPerson: e.target.value })} />
                </div>
                <div>
                  <label className="label">Role / Title</label>
                  <input className="input" placeholder="e.g. Principal, HR Manager" value={s2.contactRole} onChange={e => setS2({ ...s2, contactRole: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Email *</label>
                  <input type="email" className="input" placeholder="contact@org.ke" value={s2.email} onChange={e => setS2({ ...s2, email: e.target.value })} />
                </div>
                <div>
                  <label className="label">Phone *</label>
                  <input type="tel" className="input" placeholder="+254 7XX XXX XXX" value={s2.phone} onChange={e => setS2({ ...s2, phone: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">No. of Members / Students</label>
                  <input type="number" min="1" className="input" placeholder="e.g. 500" value={s2.memberCount} onChange={e => setS2({ ...s2, memberCount: e.target.value })} />
                </div>
                <div>
                  <label className="label">Chess Interest Level</label>
                  <select className="input" value={s2.chessInterest} onChange={e => setS2({ ...s2, chessInterest: e.target.value as InterestLevel })}>
                    <option value="BEGINNER_INTEREST">Beginner — Just starting out</option>
                    <option value="ACTIVE_INTEREST">Active — Some experience</option>
                    <option value="COMPETITIVE_INTEREST">Competitive — Ready to compete</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Participation Type * (select all that apply)</label>
                <div className="space-y-2 mt-1">
                  {([
                    { id: 'TRAINING_PARTNERSHIP',   label: 'Training Partnership — Regular coaching sessions' },
                    { id: 'TOURNAMENT_ENTRY',        label: 'Tournament Entry — Enter teams in competitions' },
                    { id: 'MEMBERSHIP_AFFILIATION',  label: 'Membership Affiliation — Full club affiliation' },
                  ] as { id: Participation; label: string }[]).map(pt => (
                    <label key={pt.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${s2.participation.includes(pt.id) ? 'border-yellow-500/50 bg-yellow-500/10' : 'border-white/10 hover:border-white/20'}`}>
                      <input type="checkbox" checked={s2.participation.includes(pt.id)} onChange={() => toggleParticipation(pt.id)} className="accent-yellow-500 w-4 h-4" />
                      <span className="text-white text-sm">{pt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Preferred Training Schedule</label>
                <input className="input" placeholder="e.g. Weekday evenings, Saturday mornings" value={s2.trainingSchedule} onChange={e => setS2({ ...s2, trainingSchedule: e.target.value })} />
              </div>
              <div className="flex gap-3">
                <button onClick={handleBack} className="btn-ghost flex-1">← Back</button>
                <button onClick={handleNext} className="btn-primary flex-1">Next →</button>
              </div>
            </div>
          )}

          {/* Step 3 — Review */}
          {step === 3 && (
            <form onSubmit={handleSubmit}>
              <div className="glass p-8 rounded-2xl space-y-5">
                <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Review & Submit
                </h2>

                {/* Summary */}
                <div className="glass p-5 rounded-xl text-sm space-y-2">
                  <p className="text-yellow-400 font-semibold mb-3">Organization Summary</p>
                  {[
                    ['Name',        s1.name],
                    ['Type',        ORG_TYPES.find(o => o.id === s1.type)?.label ?? s1.type],
                    ['Location',    `${s1.location}, ${s1.county}`],
                    ['Contact',     s2.contactPerson + (s2.contactRole ? ` (${s2.contactRole})` : '')],
                    ['Email',       s2.email],
                    ['Phone',       s2.phone],
                    ['Members',     s2.memberCount || 'Not specified'],
                    ['Interest',    s2.chessInterest.replace(/_/g, ' ').toLowerCase()],
                    ['Participation', s2.participation.join(', ').replace(/_/g, ' ').toLowerCase()],
                  ].map(([k, v]) => (
                    <div key={k} className="flex gap-3">
                      <span className="text-gray-500 w-28 flex-shrink-0">{k}:</span>
                      <span className="text-gray-200 capitalize">{v}</span>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="label">Additional Notes (optional)</label>
                  <textarea
                    rows={3}
                    className="input resize-none"
                    placeholder="Any additional information you'd like to share with us…"
                    value={s3.notes}
                    onChange={e => setS3({ ...s3, notes: e.target.value })}
                  />
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={s3.agreed}
                    onChange={e => setS3({ ...s3, agreed: e.target.checked })}
                    className="accent-yellow-500 w-4 h-4 mt-0.5 flex-shrink-0"
                  />
                  <span className="text-gray-300 text-sm">
                    I confirm the information above is accurate and I agree to Zaid Knights&apos; partnership terms and code of conduct.
                  </span>
                </label>

                <div className="flex gap-3">
                  <button type="button" onClick={handleBack} className="btn-ghost flex-1">← Back</button>
                  <button type="submit" disabled={loading || !s3.agreed} className="btn-primary flex-1">
                    {loading ? 'Submitting…' : 'Submit Application →'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </section>
    </Layout>
  );
}
