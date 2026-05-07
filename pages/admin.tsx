import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/common/Layout';
import { useAuth } from './_app';

interface AdminStats {
  totalMembers: number;
  pendingMembers: number;
  totalEvents: number;
  totalPosts: number;
  recentMembers: Array<{ id: string; user: { name: string; email: string }; level: string; status: string; joinedAt: string }>;
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'events'>('overview');

  useEffect(() => {
    if (!authLoading) {
      if (!user) router.push('/login');
      else if (user.role !== 'ADMIN') router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') return;
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const handleStatusChange = async (memberId: string, status: string) => {
    await fetch('/api/members', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId, status }),
    });
    // Refresh
    fetch('/api/admin/stats').then(r => r.json()).then(setStats);
  };

  if (authLoading || !user || user.role !== 'ADMIN') return null;

  return (
    <Layout title="Admin | Zaid Knights Chess Club">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400 mt-1">Manage the Zaid Knights Chess Club</p>
          </div>
          <span className="badge-gold">Administrator</span>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1,2,3,4].map(i => <div key={i} className="skeleton h-28 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Members',   value: stats?.totalMembers ?? 0,   icon: '👥', color: 'text-blue-400' },
              { label: 'Pending Approval', value: stats?.pendingMembers ?? 0, icon: '⏳', color: 'text-yellow-400' },
              { label: 'Total Events',    value: stats?.totalEvents ?? 0,    icon: '🏆', color: 'text-green-400' },
              { label: 'Blog Posts',      value: stats?.totalPosts ?? 0,     icon: '📝', color: 'text-purple-400' },
            ].map(card => (
              <div key={card.label} className="glass p-5 rounded-xl">
                <div className="text-2xl mb-2">{card.icon}</div>
                <div className={`text-3xl font-bold ${card.color}`}>{card.value}</div>
                <div className="text-gray-500 text-xs mt-0.5">{card.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/10 pb-4">
          {(['overview', 'members', 'events'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === tab ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-white glass'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Members Table */}
        {activeTab === 'members' && (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Level</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentMembers?.map(member => (
                  <tr key={member.id}>
                    <td className="text-white font-medium">{member.user.name}</td>
                    <td className="text-gray-400">{member.user.email}</td>
                    <td>
                      <span className={`badge text-xs capitalize ${member.level === 'MASTER' ? 'badge-green' : member.level === 'ADVANCED' ? 'badge-gold' : 'badge-gray'}`}>
                        {member.level.toLowerCase()}
                      </span>
                    </td>
                    <td>
                      <span className={`badge text-xs ${member.status === 'ACTIVE' ? 'badge-green' : member.status === 'SUSPENDED' ? 'badge-red' : 'badge-gold'}`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="text-gray-400 text-xs">
                      {new Date(member.joinedAt).toLocaleDateString('en-KE')}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        {member.status !== 'ACTIVE' && (
                          <button onClick={() => handleStatusChange(member.id, 'ACTIVE')} className="text-green-400 hover:text-green-300 text-xs transition-colors">Approve</button>
                        )}
                        {member.status !== 'SUSPENDED' && (
                          <button onClick={() => handleStatusChange(member.id, 'SUSPENDED')} className="text-red-400 hover:text-red-300 text-xs transition-colors">Suspend</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!stats?.recentMembers?.length && (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-500">No members found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="glass p-6 rounded-xl">
            <h2 className="text-white font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Create Event', href: '#', icon: '📅' },
                { label: 'Write Blog Post', href: '#', icon: '✍️' },
                { label: 'Add Gallery Photo', href: '#', icon: '🖼️' },
              ].map(action => (
                <a key={action.label} href={action.href} className="glass-hover p-4 rounded-xl text-center">
                  <div className="text-3xl mb-2">{action.icon}</div>
                  <p className="text-white text-sm font-medium">{action.label}</p>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}