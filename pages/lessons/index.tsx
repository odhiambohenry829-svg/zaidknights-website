import { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import { useAuth } from '../_app';
import Link from 'next/link';

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  youtubeId: string;
  category: string;
  level: string;
  durationSec: number | null;
  premium: boolean;
}

const CATEGORIES = [
  { key: 'all', label: 'All Lessons', icon: '📚' },
  { key: 'fundamentals', label: 'Fundamentals', icon: '🎯' },
  { key: 'openings', label: 'Openings', icon: '♟️' },
  { key: 'tactics', label: 'Tactics', icon: '⚔️' },
  { key: 'strategy', label: 'Strategy', icon: '🧠' },
  { key: 'endgame', label: 'Endgames', icon: '🏁' },
];

const LEVELS = ['all', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'COMPETITIVE_SQUAD'];
const LEVEL_LABELS: Record<string, string> = {
  all: 'All Levels', BEGINNER: 'Beginner', INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced', COMPETITIVE_SQUAD: 'Elite',
};

const PAID_TIERS = ['INTERMEDIATE', 'ADVANCED', 'COMPETITIVE_SQUAD'];

export default function LessonsPage() {
  const { user } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [level, setLevel] = useState('all');
  const [selected, setSelected] = useState<Lesson | null>(null);
  const [memberTier, setMemberTier] = useState<string>('BEGINNER');

  useEffect(() => {
    fetch('/api/lessons').then(r => r.json()).then(d => { setLessons(d.lessons || []); setLoading(false); });
    if (user) {
      fetch('/api/member/profile').then(r => r.json()).then(d => { if (d.member?.tier) setMemberTier(d.member.tier); });
    }
  }, [user]);

  const filtered = lessons.filter(l => {
    if (category !== 'all' && l.category !== category) return false;
    if (level !== 'all' && l.level !== level) return false;
    return true;
  });

  const canAccess = (lesson: Lesson) => {
    if (!lesson.premium) return true;
    if (!user) return false;
    return PAID_TIERS.includes(memberTier);
  };

  const formatDuration = (sec: number | null) => {
    if (!sec) return '';
    const m = Math.floor(sec / 60);
    return `${m}m`;
  };

  return (
    <Layout title="Video Lessons | Zaid Knights" description="Structured video lessons for all chess skill levels.">
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-yellow-400 text-sm uppercase tracking-widest mb-2">Learn & Improve</p>
            <h1 className="text-4xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Video Lessons</h1>
            <p className="text-gray-400 mt-2">Structured learning from beginner to elite level</p>
          </div>

          {/* Video Player Modal */}
          {selected && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={() => setSelected(null)}>
              <div className="bg-[#12121A] border border-white/10 rounded-2xl overflow-hidden w-full max-w-4xl" onClick={e => e.stopPropagation()}>
                <div className="aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${selected.youtubeId}?autoplay=1`}
                    className="w-full h-full"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-white font-semibold text-lg">{selected.title}</h2>
                      {selected.description && <p className="text-gray-400 text-sm mt-1">{selected.description}</p>}
                    </div>
                    <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white text-2xl leading-none ml-4">×</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(c => (
                <button key={c.key} onClick={() => setCategory(c.key)}
                  className={`px-4 py-2 rounded-lg text-sm border transition-all ${category === c.key ? 'bg-yellow-500 text-black border-yellow-400' : 'border-white/10 text-gray-300 hover:border-yellow-500/30'}`}>
                  {c.icon} {c.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 mb-8 flex-wrap">
            {LEVELS.map(l => (
              <button key={l} onClick={() => setLevel(l)}
                className={`px-3 py-1 rounded-full text-xs border transition-all ${level === l ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400' : 'border-white/10 text-gray-400 hover:border-white/20'}`}>
                {LEVEL_LABELS[l]}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass rounded-xl h-64 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">No lessons found for selected filters.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(lesson => {
                const accessible = canAccess(lesson);
                return (
                  <div key={lesson.id} className="glass-hover rounded-xl overflow-hidden group">
                    <div className="relative aspect-video bg-black/40">
                      <img
                        src={`https://img.youtube.com/vi/${lesson.youtubeId}/mqdefault.jpg`}
                        alt={lesson.title}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        {accessible ? (
                          <button
                            onClick={() => setSelected(lesson)}
                            className="w-14 h-14 rounded-full bg-yellow-500 flex items-center justify-center text-black text-xl shadow-lg opacity-90 hover:opacity-100 hover:scale-110 transition-all"
                          >▶</button>
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-black/60 border border-yellow-500/50 flex items-center justify-center text-2xl">🔒</div>
                        )}
                      </div>
                      {lesson.premium && (
                        <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">PREMIUM</div>
                      )}
                      {lesson.durationSec && (
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">{formatDuration(lesson.durationSec)}</div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs px-2 py-0.5 rounded-full border border-white/10 text-gray-400 capitalize">{lesson.category}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          lesson.level === 'BEGINNER' ? 'bg-green-500/20 text-green-400' :
                          lesson.level === 'INTERMEDIATE' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-purple-500/20 text-purple-400'
                        }`}>{LEVEL_LABELS[lesson.level]}</span>
                      </div>
                      <h3 className="text-white font-semibold text-sm leading-tight">{lesson.title}</h3>
                      {lesson.description && <p className="text-gray-400 text-xs mt-1 line-clamp-2">{lesson.description}</p>}
                      {!accessible && (
                        <Link href="/membership" className="block mt-3 text-yellow-400 text-xs hover:underline">Upgrade to unlock →</Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
