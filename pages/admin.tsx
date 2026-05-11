import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/common/Layout';
import { useAuth } from './_app';

interface AdminStats {
  totalMembers:       number;
  pendingMembers:     number;
  activeMembers:      number;
  totalEvents:        number;
  totalPosts:         number;
  totalDonations:     number;
  pendingDonations:   number;
  completedDonations: number;
  totalOrgs:          number;
  pendingOrgs:        number;
  revenueTotal:       number;
  recentMembers: Array<{ id: string; user: { name: string; email: string }; level: string; status: string; joinedAt: string }>;
}

interface Donation {
  id: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  category: string;
  status: string;
  anonymous: boolean;
  createdAt: string;
}

interface Organization {
  id: string;
  name: string;
  type: string;
  location: string;
  contactPerson: string;
  email: string;
  memberCount: number;
  status: string;
  createdAt: string;
}

type Tab = 'overview' | 'members' | 'donations' | 'organizations' | 'events';

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [stats,     setStats]     = useState<AdminStats | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [orgs,      setOrgs]      = useState<Organization[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) router.push('/login');
      else if (user.role !== 'ADMIN') router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') return;
    Promise.all([
      fetch('/api/admin/stats').then(r => r.json()),
      fetch('/api/donations').then(r => r.json()),
      fetch('/api/organizations').then(r => r.json()),
    ])
      .then(([statsData, donationsData, orgsData]) => {
        setStats(statsData);
        setDonations(donationsData.donations || []);
        setOrgs(orgsData.organizations || []);
      })
      .catch(() => setActionError('Failed to load admin data.'))
      .finally(() => setLoading(false));
  }, [user]);

  const handleStatusChange = async (memberId: string, status: string) => {
    setActionError(null);
    try {
      const res = await fetch('/api/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, status }),
      });
      if (!res.ok) {
        const data = await res.json();
        setActionError(data.error || 'Failed to update member status.');
        return;
      }
      fetch('/api/admin/stats').then(r => r.json()).then(setStats).catch(() => {});
    } catch {
      setActionError('Network error. Please try again.');
    }
  };

  const handleOrgStatus = async (orgId: string, status: string) => {
    setActionError(null);
    try {
      const res = await fetch(`/api/organizations/${orgId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json();
        setActionError(data.error || 'Failed to update organization.');
        return;
      }
      const data = await res.json();
      setOrgs(prev => prev.map(o => o.id === orgId ? { ...o, status: data.organization.status } : o));
    } catch {
      setActionError('Network error. Please try again.');
    }
  };

  if (authLoading || !user || user.role !== 'ADMIN') return null;

  const TABS: { key: Tab; label: string; badge?: number }[] = [
    { key: 'overview',       label: 'Overview' },
    { key: 'members',        label: 'Members',       badge: stats?.pendingMembers },
    { key: 'donations',      label: 'Donations',     badge: stats?.pendingDonations },
    { key: 'organizations',  label: 'Organizations', badge: stats?.pendingOrgs },
    { key: 'events',         label: 'Events' },
  ];

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

        {/* Error banner */}
        {actionError && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400 text-sm flex items-center justify-between">
            <span>{actionError}</span>
            <button onClick={() => setActionError(null)} className="ml-4 text-red-300 hover:text-white transition">✕</button>
          </div>
        )}

        {/* Stats Cards */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1,2,3,4].map(i => <div key={i} className="skeleton h-28 rounded-xl" />)}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {[
                { label: 'Total Members',   value: stats?.totalMembers ?? 0,   icon: '👥', color: 'text-blue-400' },
                { label: 'Active Members',  value: stats?.activeMembers ?? 0,  icon: '✅', color: 'text-green-400' },
                { label: 'Pending Approval',value: stats?.pendingMembers ?? 0, icon: '⏳', color: 'text-yellow-400' },
                { label: 'Total Events',    value: stats?.totalEvents ?? 0,    icon: '🏆', color: 'text-purple-400' },
              ].map(card => (
                <div key={card.label} className="glass p-5 rounded-xl">
                  <div className="text-2xl mb-2">{card.icon}</div>
                  <div className={`text-3xl font-bold ${card.color}`}>{card.value}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{card.label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Donations', value: stats?.completedDonations ?? 0, icon: '💰', color: 'text-green-400' },
                { label: 'Revenue (KES)',   value: `${((stats?.revenueTotal ?? 0) / 1000).toFixed(1)}K`, icon: '📈', color: 'text-yellow-400' },
                { label: 'Organizations',   value: stats?.totalOrgs ?? 0,           icon: '🏫', color: 'text-blue-400' },
                { label: 'Blog Posts',      value: stats?.totalPosts ?? 0,          icon: '📝', color: 'text-purple-400' },
              ].map(card => (
                <div key={card.label} className="glass p-5 rounded-xl">
                  <div className="text-2xl mb-2">{card.icon}</div>
                  <div className={`text-3xl font-bold ${card.color}`}>{card.value}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{card.label}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/10 pb-4 overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`relative px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all whitespace-nowrap ${activeTab === tab.key ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-white glass'}`}
            >
              {tab.label}
              {!!tab.badge && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {tab.badge > 9 ? '9+' : tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ─── Overview Tab ─── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="glass p-6 rounded-xl">
              <h2 className="text-white font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Create Event',       href: '#',                          icon: '📅' },
                  { label: 'Write Blog Post',    href: '#',                          icon: '✍️' },
                  { label: 'Add Gallery Photo',  href: '#',                          icon: '🖼️' },
                  { label: 'View Donations',     href: '#donations',                 icon: '💰', onClick: () => setActiveTab('donations') },
                  { label: 'Review Organizations', href: '#orgs',                   icon: '🏫', onClick: () => setActiveTab('organizations') },
                  { label: 'Manage Members',     href: '#members',                   icon: '👥', onClick: () => setActiveTab('members') },
                ].map(action => (
                  <button key={action.label} onClick={action.onClick ?? undefined} className="glass-hover p-4 rounded-xl text-center w-full">
                    <div className="text-3xl mb-2">{action.icon}</div>
                    <p className="text-white text-sm font-medium">{action.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── Members Tab ─── */}
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
                      <span className={`badge text-xs capitalize ${member.level === 'COMPETITIVE_SQUAD' ? 'badge-green' : member.level === 'ADVANCED' ? 'badge-gold' : 'badge-gray'}`}>
                        {member.level.toLowerCase().replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      <span className={`badge text-xs ${member.status === 'ACTIVE' ? 'badge-green' : member.status === 'SUSPENDED' ? 'badge-red' : 'badge-gold'}`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="text-gray-400 text-xs">{new Date(member.joinedAt).toLocaleDateString('en-KE')}</td>
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

        {/* ─── Donations Tab ─── */}
        {activeTab === 'donations' && (
          <div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Total Received',  value: `KES ${((stats?.revenueTotal ?? 0)).toLocaleString()}`, color: 'text-green-400' },
                { label: 'Completed',       value: stats?.completedDonations ?? 0,                          color: 'text-blue-400' },
                { label: 'Pending',         value: stats?.pendingDonations ?? 0,                            color: 'text-yellow-400' },
              ].map(s => (
                <div key={s.label} className="glass p-4 rounded-xl">
                  <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Donor</th>
                    <th>Amount</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map(d => (
                    <tr key={d.id}>
                      <td>
                        <p className="text-white font-medium text-sm">{d.anonymous ? 'Anonymous' : d.donorName}</p>
                        {!d.anonymous && <p className="text-gray-500 text-xs">{d.donorEmail}</p>}
                      </td>
                      <td><span className="text-green-400 font-bold">KES {d.amount.toLocaleString()}</span></td>
                      <td><span className="text-gray-300 text-xs capitalize">{d.category.replace(/_/g, ' ').toLowerCase()}</span></td>
                      <td>
                        <span className={`badge text-xs ${d.status === 'COMPLETED' ? 'badge-green' : d.status === 'FAILED' ? 'badge-red' : 'badge-gold'}`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="text-gray-400 text-xs">{new Date(d.createdAt).toLocaleDateString('en-KE')}</td>
                    </tr>
                  ))}
                  {donations.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-8 text-gray-500">No donations yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── Organizations Tab ─── */}
        {activeTab === 'organizations' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-400 text-sm">{orgs.length} organizations registered · {orgs.filter(o => o.status === 'PENDING').length} pending approval</p>
              <Link href="/organizations" className="text-yellow-400 text-sm hover:text-yellow-300">Public view →</Link>
            </div>

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Organization</th>
                    <th>Type</th>
                    <th>Location</th>
                    <th>Contact</th>
                    <th>Members</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orgs.map(org => (
                    <tr key={org.id}>
                      <td className="text-white font-medium">{org.name}</td>
                      <td><span className="badge badge-gray text-xs capitalize">{org.type.toLowerCase()}</span></td>
                      <td className="text-gray-400 text-sm">{org.location}</td>
                      <td>
                        <p className="text-gray-300 text-sm">{org.contactPerson}</p>
                        <p className="text-gray-500 text-xs">{org.email}</p>
                      </td>
                      <td className="text-gray-300 text-sm">{org.memberCount}</td>
                      <td>
                        <span className={`badge text-xs ${org.status === 'APPROVED' ? 'badge-green' : org.status === 'REJECTED' ? 'badge-red' : 'badge-gold'}`}>
                          {org.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          {org.status !== 'APPROVED' && (
                            <button onClick={() => handleOrgStatus(org.id, 'APPROVED')} className="text-green-400 hover:text-green-300 text-xs transition-colors">Approve</button>
                          )}
                          {org.status !== 'REJECTED' && (
                            <button onClick={() => handleOrgStatus(org.id, 'REJECTED')} className="text-red-400 hover:text-red-300 text-xs transition-colors">Reject</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {orgs.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-8 text-gray-500">No organizations registered</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── Events Tab ─── */}
        {activeTab === 'events' && (
          <div className="glass p-6 rounded-xl text-center">
            <p className="text-5xl mb-3">🏆</p>
            <p className="text-white font-semibold mb-2">Event Management</p>
            <p className="text-gray-400 text-sm">Create and manage tournaments, training sessions, and club events.</p>
            <button className="mt-4 btn-primary rounded-xl px-5 py-2 text-sm">Create New Event</button>
          </div>
        )}
      </div>
    </Layout>
  );
}
