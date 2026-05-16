import { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import ProtectedRoute from '../../components/common/ProtectedRoute';
import { useAuth } from '../_app';
import Link from 'next/link';

interface FriendProfile { id: string; name: string; email: string; friendshipId: string; member?: { rating: number; level: string; profilePhoto: string | null } }

const LEVEL_BADGE: Record<string, string> = {
  BEGINNER: 'bg-green-500/20 text-green-400',
  INTERMEDIATE: 'bg-blue-500/20 text-blue-400',
  ADVANCED: 'bg-purple-500/20 text-purple-400',
  COMPETITIVE_SQUAD: 'bg-yellow-500/20 text-yellow-400',
};

export default function FriendsPage() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [pending, setPending] = useState<FriendProfile[]>([]);
  const [sentPending, setSentPending] = useState<FriendProfile[]>([]);
  const [members, setMembers] = useState<{ id: string; name: string; member?: { rating: number; level: string } }[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadFriends = () => {
    fetch('/api/friends').then(r => r.json()).then(d => {
      setFriends(d.friends || []);
      setPending(d.pending || []);
      setSentPending(d.sentPending || []);
      setLoading(false);
    });
  };

  useEffect(() => { loadFriends(); }, []);

  useEffect(() => {
    if (search.length < 2) { setMembers([]); return; }
    fetch(`/api/members?search=${encodeURIComponent(search)}&limit=10`)
      .then(r => r.json()).then(d => setMembers(d.members || []));
  }, [search]);

  const sendRequest = async (addresseeId: string) => {
    await fetch('/api/friends', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ addresseeId }) });
    loadFriends();
  };

  const handleAction = async (friendshipId: string, action: string) => {
    await fetch('/api/friends', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, friendshipId }) });
    loadFriends();
  };

  const filteredMembers = members.filter(m =>
    m.id !== user?.id &&
    !friends.some(f => f.id === m.id) &&
    !sentPending.some(s => s.id === m.id)
  );

  return (
    <ProtectedRoute>
      <Layout title="Friends | Zaid Knights" description="Connect with other Zaid Knights members.">
        <div className="min-h-screen py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-10">
              <p className="text-yellow-400 text-sm uppercase tracking-widest mb-2">Social</p>
              <h1 className="text-4xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Friends</h1>
              <p className="text-gray-400 mt-2">Connect with club members and challenge them to games</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Friends list */}
                <div className="glass rounded-xl p-5">
                  <h2 className="text-white font-semibold mb-4">Friends ({friends.length})</h2>
                  {loading ? (
                    <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />)}</div>
                  ) : friends.length === 0 ? (
                    <p className="text-gray-500 text-sm">You haven't added any friends yet. Search for members on the right!</p>
                  ) : (
                    <div className="space-y-3">
                      {friends.map(f => (
                        <div key={f.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-yellow-600 flex items-center justify-center text-white font-bold">
                              {f.name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="text-white font-medium">{f.name}</p>
                              {f.member && (
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-yellow-400 text-xs font-bold">{f.member.rating}</span>
                                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${LEVEL_BADGE[f.member.level]}`}>{f.member.level.replace('_', ' ')}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Link href="/play" className="btn-primary text-xs px-3 py-1.5">Challenge</Link>
                            <button onClick={() => handleAction(f.friendshipId, 'remove')} className="btn-ghost text-xs px-2 py-1">Remove</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pending requests */}
                {pending.length > 0 && (
                  <div className="glass rounded-xl p-5">
                    <h2 className="text-white font-semibold mb-4">Pending Requests ({pending.length})</h2>
                    <div className="space-y-3">
                      {pending.map(f => (
                        <div key={f.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                              {f.name?.[0]?.toUpperCase()}
                            </div>
                            <p className="text-white font-medium">{f.name}</p>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleAction(f.friendshipId, 'accept')} className="btn-primary text-xs px-3 py-1.5">Accept</button>
                            <button onClick={() => handleAction(f.friendshipId, 'reject')} className="btn-secondary text-xs px-3 py-1.5">Decline</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sent pending */}
                {sentPending.length > 0 && (
                  <div className="glass rounded-xl p-5">
                    <h2 className="text-white font-semibold mb-4">Sent Requests ({sentPending.length})</h2>
                    <div className="space-y-3">
                      {sentPending.map(f => (
                        <div key={f.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold">
                              {f.name?.[0]?.toUpperCase()}
                            </div>
                            <p className="text-white font-medium">{f.name}</p>
                          </div>
                          <span className="text-gray-400 text-xs">Pending…</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Search sidebar */}
              <div className="glass p-5 rounded-xl h-fit">
                <h2 className="text-white font-semibold mb-4">Find Members</h2>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name…"
                  className="input mb-4"
                />
                {search.length > 0 && search.length < 2 && (
                  <p className="text-gray-500 text-xs">Type at least 2 characters</p>
                )}
                <div className="space-y-2">
                  {filteredMembers.map(m => (
                    <div key={m.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div>
                        <p className="text-white text-sm font-medium">{m.name}</p>
                        {m.member && <p className="text-gray-400 text-xs">{m.member.rating} ELO</p>}
                      </div>
                      <button onClick={() => sendRequest(m.id)} className="btn-primary text-xs px-3 py-1">+ Add</button>
                    </div>
                  ))}
                  {search.length >= 2 && filteredMembers.length === 0 && (
                    <p className="text-gray-500 text-sm">No members found.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
