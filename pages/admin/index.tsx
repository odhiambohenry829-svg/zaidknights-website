import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/common/Layout';
import { useAuth } from '../_app';

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
}

interface AdminMember {
  id: string;
  userId: string;
  level: string;
  tier: string;
  status: string;
  rating: number;
  joinedAt: string;
  user: { name: string | null; email: string };
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

interface AdminEvent {
  id: string;
  title: string;
  type: string;
  location: string;
  startDate: string;
  endDate: string;
  capacity: number;
  createdAt: string;
  _count: { registrations: number };
}

interface AdminPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  published: boolean;
  createdAt: string;
  author: { name: string | null };
}

interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  caption: string | null;
  createdAt: string;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  status: string;
  createdAt: string;
}

type Tab = 'overview' | 'members' | 'donations' | 'organizations' | 'events' | 'posts' | 'gallery' | 'messages' | 'settings';

const INP = 'input w-full';
const LBL = 'label';

const SETTINGS_FIELDS = [
  { key: 'heroTitle',       label: 'Hero Title',        type: 'text',     placeholder: 'Master the Game of Kings' },
  { key: 'heroSubtitle',    label: 'Hero Subtitle',     type: 'textarea', placeholder: 'Join Zaid Knights Chess Club…' },
  { key: 'aboutIntro',      label: 'About Intro',       type: 'textarea', placeholder: 'Zaid Knights is Nairobi\'s premier chess club…' },
  { key: 'clubAddress',     label: 'Club Address',      type: 'text',     placeholder: 'Nairobi, Kenya' },
  { key: 'clubPhone',       label: 'Club Phone',        type: 'text',     placeholder: '+254 700 000 000' },
  { key: 'clubEmail',       label: 'Club Email',        type: 'email',    placeholder: 'info@zaidknights.org' },
  { key: 'clubWhatsApp',    label: 'WhatsApp Number',   type: 'text',     placeholder: '+254700000000' },
  { key: 'socialX',         label: 'X (Twitter) URL',   type: 'url',      placeholder: 'https://x.com/zaidknights' },
  { key: 'socialFacebook',  label: 'Facebook URL',      type: 'url',      placeholder: 'https://facebook.com/zaidknights' },
  { key: 'socialInstagram', label: 'Instagram URL',     type: 'url',      placeholder: 'https://instagram.com/zaidknights' },
];

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Core data
  const [stats,        setStats]        = useState<AdminStats | null>(null);
  const [donations,    setDonations]    = useState<Donation[]>([]);
  const [orgs,         setOrgs]         = useState<Organization[]>([]);

  // Tab-specific data
  const [members,       setMembers]       = useState<AdminMember[]>([]);
  const [events,        setEvents]        = useState<AdminEvent[]>([]);
  const [posts,         setPosts]         = useState<AdminPost[]>([]);
  const [galleryItems,  setGalleryItems]  = useState<GalleryItem[]>([]);
  const [messages,      setMessages]      = useState<ContactMessage[]>([]);
  const [settings,      setSettings]      = useState<Record<string, string>>({});
  const [settingsForm,  setSettingsForm]  = useState<Record<string, string>>({});

  // Loading states
  const [loading,         setLoading]         = useState(true);
  const [tabLoading,      setTabLoading]      = useState(false);
  const [membersLoaded,   setMembersLoaded]   = useState(false);
  const [eventsLoaded,    setEventsLoaded]    = useState(false);
  const [postsLoaded,     setPostsLoaded]     = useState(false);
  const [galleryLoaded,   setGalleryLoaded]   = useState(false);
  const [messagesLoaded,  setMessagesLoaded]  = useState(false);
  const [settingsLoaded,  setSettingsLoaded]  = useState(false);
  const [settingsSaving,  setSettingsSaving]  = useState(false);

  // UI state
  const [activeTab,    setActiveTab]    = useState<Tab>('overview');
  const [actionError,  setActionError]  = useState<string | null>(null);
  const [actionOk,     setActionOk]     = useState<string | null>(null);
  const [memberSearch, setMemberSearch] = useState('');
  const [memberFilter, setMemberFilter] = useState('ALL');

  // Form visibility
  const [showEventForm,   setShowEventForm]   = useState(false);
  const [showPostForm,    setShowPostForm]    = useState(false);
  const [showGalleryForm, setShowGalleryForm] = useState(false);

  // Form data
  const [eventForm,      setEventForm]      = useState({ title: '', description: '', location: '', type: 'tournament', startDate: '', endDate: '', capacity: 32 });
  const [postForm,       setPostForm]       = useState({ title: '', excerpt: '', content: '', category: 'general', imageUrl: '', tags: '', published: false });
  const [galleryForm,    setGalleryForm]    = useState({ title: '', imageUrl: '', caption: '' });
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!authLoading) {
      if (!user) router.push('/admin/login');
      else if (user.role !== 'ADMIN') router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  // Initial data fetch
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

  // Tab data fetchers
  const fetchMembers = useCallback(async () => {
    setTabLoading(true);
    try {
      const data = await fetch('/api/members?admin=true').then(r => r.json());
      setMembers(data.members || []);
      setMembersLoaded(true);
    } catch { setActionError('Failed to load members.'); }
    finally { setTabLoading(false); }
  }, []);

  const fetchEvents = useCallback(async () => {
    setTabLoading(true);
    try {
      const data = await fetch('/api/events?admin=true').then(r => r.json());
      setEvents(data.events || []);
      setEventsLoaded(true);
    } catch { setActionError('Failed to load events.'); }
    finally { setTabLoading(false); }
  }, []);

  const fetchPosts = useCallback(async () => {
    setTabLoading(true);
    try {
      const data = await fetch('/api/posts?admin=true').then(r => r.json());
      setPosts(data.posts || []);
      setPostsLoaded(true);
    } catch { setActionError('Failed to load posts.'); }
    finally { setTabLoading(false); }
  }, []);

  const fetchGallery = useCallback(async () => {
    setTabLoading(true);
    try {
      const data = await fetch('/api/gallery').then(r => r.json());
      setGalleryItems(data.items || []);
      setGalleryLoaded(true);
    } catch { setActionError('Failed to load gallery.'); }
    finally { setTabLoading(false); }
  }, []);

  const fetchMessages = useCallback(async () => {
    setTabLoading(true);
    try {
      const data = await fetch('/api/admin/messages').then(r => r.json());
      setMessages(data.messages || []);
      setMessagesLoaded(true);
    } catch { setActionError('Failed to load messages.'); }
    finally { setTabLoading(false); }
  }, []);

  const fetchSettings = useCallback(async () => {
    setTabLoading(true);
    try {
      const data = await fetch('/api/admin/settings').then(r => r.json());
      setSettings(data.settings || {});
      setSettingsForm(data.settings || {});
      setSettingsLoaded(true);
    } catch { setActionError('Failed to load settings.'); }
    finally { setTabLoading(false); }
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') return;
    if (activeTab === 'members'   && !membersLoaded)  fetchMembers();
    if (activeTab === 'events'    && !eventsLoaded)   fetchEvents();
    if (activeTab === 'posts'     && !postsLoaded)    fetchPosts();
    if (activeTab === 'gallery'   && !galleryLoaded)  fetchGallery();
    if (activeTab === 'messages'  && !messagesLoaded) fetchMessages();
    if (activeTab === 'settings'  && !settingsLoaded) fetchSettings();
  }, [activeTab, user, membersLoaded, eventsLoaded, postsLoaded, galleryLoaded, messagesLoaded, settingsLoaded,
      fetchMembers, fetchEvents, fetchPosts, fetchGallery, fetchMessages, fetchSettings]);

  // ── Action handlers ────────────────────────────────────────────

  const handleStatusChange = async (memberId: string, status: string) => {
    setActionError(null);
    try {
      const res = await fetch('/api/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, status }),
      });
      if (!res.ok) { setActionError((await res.json()).error || 'Failed to update member.'); return; }
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, status } : m));
      fetch('/api/admin/stats').then(r => r.json()).then(setStats).catch(() => {});
    } catch { setActionError('Network error. Please try again.'); }
  };

  const handleOrgStatus = async (orgId: string, status: string) => {
    setActionError(null);
    try {
      const res = await fetch(`/api/organizations/${orgId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) { setActionError((await res.json()).error || 'Failed to update organization.'); return; }
      const data = await res.json();
      setOrgs(prev => prev.map(o => o.id === orgId ? { ...o, status: data.organization.status } : o));
    } catch { setActionError('Network error. Please try again.'); }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setActionError(null);
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventForm),
      });
      if (!res.ok) { setActionError((await res.json()).error || 'Failed to create event.'); return; }
      setShowEventForm(false);
      setEventForm({ title: '', description: '', location: '', type: 'tournament', startDate: '', endDate: '', capacity: 32 });
      await fetchEvents();
    } catch { setActionError('Network error. Please try again.'); }
    finally { setFormSubmitting(false); }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Delete this event? This cannot be undone.')) return;
    setActionError(null);
    try {
      const res = await fetch('/api/events', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) { setActionError((await res.json()).error || 'Failed to delete event.'); return; }
      setEvents(prev => prev.filter(ev => ev.id !== id));
    } catch { setActionError('Network error.'); }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setActionError(null);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...postForm,
          tags: postForm.tags ? postForm.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        }),
      });
      if (!res.ok) { setActionError((await res.json()).error || 'Failed to create post.'); return; }
      setShowPostForm(false);
      setPostForm({ title: '', excerpt: '', content: '', category: 'general', imageUrl: '', tags: '', published: false });
      await fetchPosts();
      fetch('/api/admin/stats').then(r => r.json()).then(setStats).catch(() => {});
    } catch { setActionError('Network error. Please try again.'); }
    finally { setFormSubmitting(false); }
  };

  const handleTogglePublish = async (postId: string, published: boolean) => {
    setActionError(null);
    try {
      const res = await fetch('/api/posts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: postId, published: !published }),
      });
      if (!res.ok) { setActionError((await res.json()).error || 'Failed to update post.'); return; }
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, published: !published } : p));
      fetch('/api/admin/stats').then(r => r.json()).then(setStats).catch(() => {});
    } catch { setActionError('Network error.'); }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Delete this post? This cannot be undone.')) return;
    setActionError(null);
    try {
      const res = await fetch('/api/posts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) { setActionError((await res.json()).error || 'Failed to delete post.'); return; }
      setPosts(prev => prev.filter(p => p.id !== id));
      fetch('/api/admin/stats').then(r => r.json()).then(setStats).catch(() => {});
    } catch { setActionError('Network error.'); }
  };

  const handleAddGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setActionError(null);
    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(galleryForm),
      });
      if (!res.ok) { setActionError((await res.json()).error || 'Failed to add photo.'); return; }
      const { item } = await res.json();
      setGalleryItems(prev => [item, ...prev]);
      setShowGalleryForm(false);
      setGalleryForm({ title: '', imageUrl: '', caption: '' });
    } catch { setActionError('Network error. Please try again.'); }
    finally { setFormSubmitting(false); }
  };

  const handleDeleteGalleryItem = async (id: string) => {
    if (!confirm('Delete this photo?')) return;
    setActionError(null);
    try {
      const res = await fetch('/api/gallery', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) { setActionError((await res.json()).error || 'Failed to delete photo.'); return; }
      setGalleryItems(prev => prev.filter(item => item.id !== id));
    } catch { setActionError('Network error.'); }
  };

  const handleMessageStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/admin/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) { setActionError('Failed to update message.'); return; }
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m));
    } catch { setActionError('Network error.'); }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    try {
      const res = await fetch('/api/admin/messages', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) { setActionError('Failed to delete message.'); return; }
      setMessages(prev => prev.filter(m => m.id !== id));
    } catch { setActionError('Network error.'); }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaving(true);
    setActionError(null);
    setActionOk(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm),
      });
      if (!res.ok) { setActionError((await res.json()).error || 'Failed to save settings.'); return; }
      setSettings(settingsForm);
      setActionOk('Settings saved! Changes will appear on the website shortly.');
    } catch { setActionError('Network error.'); }
    finally { setSettingsSaving(false); }
  };

  // Computed
  const filteredMembers = members.filter(m => {
    const q = memberSearch.toLowerCase();
    const matchSearch = !q || m.user.name?.toLowerCase().includes(q) || m.user.email.toLowerCase().includes(q);
    const matchFilter = memberFilter === 'ALL' || m.status === memberFilter;
    return matchSearch && matchFilter;
  });

  const unreadMessages = messages.filter(m => m.status === 'NEW').length;

  if (authLoading || !user || user.role !== 'ADMIN') return null;

  const TABS: { key: Tab; label: string; badge?: number }[] = [
    { key: 'overview',      label: 'Overview' },
    { key: 'members',       label: 'Members',       badge: stats?.pendingMembers },
    { key: 'donations',     label: 'Donations',     badge: stats?.pendingDonations },
    { key: 'organizations', label: 'Organizations', badge: stats?.pendingOrgs },
    { key: 'events',        label: 'Events' },
    { key: 'posts',         label: 'Posts' },
    { key: 'gallery',       label: 'Gallery' },
    { key: 'messages',      label: 'Messages',      badge: messagesLoaded ? unreadMessages : undefined },
    { key: 'settings',      label: 'Settings' },
  ];

  const TabSkeleton = ({ rows = 5 }: { rows?: number }) => (
    <div className="space-y-2">{Array.from({ length: rows }).map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}</div>
  );

  return (
    <Layout title="Admin | Zaid Knights Chess Club">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400 mt-1">Manage the Zaid Knights Chess Club</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/admin/ai" className="btn-secondary">
              AI Tools
            </Link>
            <span className="badge-gold">Administrator</span>
          </div>
        </div>

        {/* Error / Success banners */}
        {actionError && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400 text-sm flex items-center justify-between">
            <span>{actionError}</span>
            <button onClick={() => setActionError(null)} className="ml-4 text-red-300 hover:text-white transition">✕</button>
          </div>
        )}
        {actionOk && (
          <div className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-green-400 text-sm flex items-center justify-between">
            <span>{actionOk}</span>
            <button onClick={() => setActionOk(null)} className="ml-4 text-green-300 hover:text-white transition">✕</button>
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
                { label: 'Total Members',    value: stats?.totalMembers ?? 0,   icon: '👥', color: 'text-blue-400' },
                { label: 'Active Members',   value: stats?.activeMembers ?? 0,  icon: '✅', color: 'text-green-400' },
                { label: 'Pending Approval', value: stats?.pendingMembers ?? 0, icon: '⏳', color: 'text-yellow-400' },
                { label: 'Total Events',     value: stats?.totalEvents ?? 0,    icon: '🏆', color: 'text-purple-400' },
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
                { label: 'Completed Donations', value: stats?.completedDonations ?? 0, icon: '💰', color: 'text-green-400' },
                { label: 'Revenue (KES)',        value: `${((stats?.revenueTotal ?? 0) / 1000).toFixed(1)}K`, icon: '📈', color: 'text-yellow-400' },
                { label: 'Organizations',        value: stats?.totalOrgs ?? 0,          icon: '🏫', color: 'text-blue-400' },
                { label: 'Blog Posts',           value: stats?.totalPosts ?? 0,         icon: '📝', color: 'text-purple-400' },
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

        {/* Tab bar */}
        <div className="flex gap-2 mb-6 border-b border-white/10 pb-4 overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`relative px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.key ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-white glass'}`}
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

        {/* ── Overview ─────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="glass p-6 rounded-xl">
            <h2 className="text-white font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {([
                { label: 'Create Event',        icon: '📅', tab: 'events' },
                { label: 'Write Blog Post',      icon: '✍️', tab: 'posts' },
                { label: 'Add Gallery Photo',    icon: '🖼️', tab: 'gallery' },
                { label: 'View Donations',       icon: '💰', tab: 'donations' },
                { label: 'Review Organizations', icon: '🏫', tab: 'organizations' },
                { label: 'Manage Members',       icon: '👥', tab: 'members' },
                { label: 'View Messages',        icon: '✉️', tab: 'messages' },
                { label: 'Site Settings',        icon: '⚙️', tab: 'settings' },
              ] as { label: string; icon: string; tab: Tab }[]).map(action => (
                <button key={action.label} onClick={() => setActiveTab(action.tab)} className="glass-hover p-4 rounded-xl text-center w-full">
                  <div className="text-3xl mb-2">{action.icon}</div>
                  <p className="text-white text-sm font-medium">{action.label}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Members ──────────────────────────────────────────────── */}
        {activeTab === 'members' && (
          <div>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <input type="text" placeholder="Search by name or email…" value={memberSearch} onChange={e => setMemberSearch(e.target.value)} className="input flex-1" />
              <select value={memberFilter} onChange={e => setMemberFilter(e.target.value)} className="input w-full sm:w-44">
                {['ALL', 'PENDING', 'ACTIVE', 'EXPIRED', 'SUSPENDED', 'PENDING_PAYMENT'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            {tabLoading ? <TabSkeleton /> : (
              <div className="table-container">
                <table className="table">
                  <thead><tr><th>Name</th><th>Email</th><th>Level</th><th>Rating</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
                  <tbody>
                    {filteredMembers.map(m => (
                      <tr key={m.id}>
                        <td className="text-white font-medium">{m.user.name || '—'}</td>
                        <td className="text-gray-400 text-sm">{m.user.email}</td>
                        <td>
                          <span className={`badge text-xs capitalize ${m.level === 'COMPETITIVE_SQUAD' ? 'badge-green' : m.level === 'ADVANCED' ? 'badge-gold' : 'badge-gray'}`}>
                            {m.level.toLowerCase().replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="text-gray-300 text-sm">{m.rating}</td>
                        <td>
                          <span className={`badge text-xs ${m.status === 'ACTIVE' ? 'badge-green' : m.status === 'SUSPENDED' ? 'badge-red' : 'badge-gold'}`}>{m.status}</span>
                        </td>
                        <td className="text-gray-400 text-xs">{new Date(m.joinedAt).toLocaleDateString('en-KE')}</td>
                        <td>
                          <div className="flex gap-2">
                            {m.status !== 'ACTIVE'    && <button onClick={() => handleStatusChange(m.id, 'ACTIVE')}    className="text-green-400 hover:text-green-300 text-xs transition-colors">Approve</button>}
                            {m.status !== 'SUSPENDED' && <button onClick={() => handleStatusChange(m.id, 'SUSPENDED')} className="text-red-400 hover:text-red-300 text-xs transition-colors">Suspend</button>}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredMembers.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-gray-500">No members found</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Donations ────────────────────────────────────────────── */}
        {activeTab === 'donations' && (
          <div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Total Received', value: `KES ${(stats?.revenueTotal ?? 0).toLocaleString()}`, color: 'text-green-400' },
                { label: 'Completed',      value: stats?.completedDonations ?? 0,                       color: 'text-blue-400' },
                { label: 'Pending',        value: stats?.pendingDonations ?? 0,                         color: 'text-yellow-400' },
              ].map(s => (
                <div key={s.label} className="glass p-4 rounded-xl">
                  <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="table-container">
              <table className="table">
                <thead><tr><th>Donor</th><th>Amount</th><th>Category</th><th>Status</th><th>Date</th></tr></thead>
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
                        <span className={`badge text-xs ${d.status === 'COMPLETED' ? 'badge-green' : d.status === 'FAILED' ? 'badge-red' : 'badge-gold'}`}>{d.status}</span>
                      </td>
                      <td className="text-gray-400 text-xs">{new Date(d.createdAt).toLocaleDateString('en-KE')}</td>
                    </tr>
                  ))}
                  {donations.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-gray-500">No donations yet</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Organizations ────────────────────────────────────────── */}
        {activeTab === 'organizations' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-400 text-sm">{orgs.length} registered · {orgs.filter(o => o.status === 'PENDING').length} pending</p>
              <Link href="/organizations" className="text-yellow-400 text-sm hover:text-yellow-300">Public view →</Link>
            </div>
            <div className="table-container">
              <table className="table">
                <thead><tr><th>Organization</th><th>Type</th><th>Location</th><th>Contact</th><th>Members</th><th>Status</th><th>Actions</th></tr></thead>
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
                        <span className={`badge text-xs ${org.status === 'APPROVED' ? 'badge-green' : org.status === 'REJECTED' ? 'badge-red' : 'badge-gold'}`}>{org.status}</span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          {org.status !== 'APPROVED' && <button onClick={() => handleOrgStatus(org.id, 'APPROVED')} className="text-green-400 hover:text-green-300 text-xs transition-colors">Approve</button>}
                          {org.status !== 'REJECTED' && <button onClick={() => handleOrgStatus(org.id, 'REJECTED')} className="text-red-400 hover:text-red-300 text-xs transition-colors">Reject</button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {orgs.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-gray-500">No organizations registered</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Events ───────────────────────────────────────────────── */}
        {activeTab === 'events' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-400 text-sm">{events.length} event{events.length !== 1 ? 's' : ''} total</p>
              <button onClick={() => setShowEventForm(v => !v)} className="btn-primary text-sm px-4 py-2 rounded-xl">
                {showEventForm ? '✕ Cancel' : '+ Create Event'}
              </button>
            </div>
            {showEventForm && (
              <form onSubmit={handleCreateEvent} className="glass p-6 rounded-xl mb-6 space-y-4">
                <h3 className="text-white font-semibold">New Event</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className={LBL}>Title *</label><input required className={INP} value={eventForm.title} onChange={e => setEventForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Monthly Rapid Tournament" /></div>
                  <div><label className={LBL}>Type</label>
                    <select className={INP} value={eventForm.type} onChange={e => setEventForm(f => ({ ...f, type: e.target.value }))}>
                      <option value="tournament">Tournament</option>
                      <option value="training">Training</option>
                      <option value="simul">Simul</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div><label className={LBL}>Location *</label><input required className={INP} value={eventForm.location} onChange={e => setEventForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Nairobi Chess Center" /></div>
                  <div><label className={LBL}>Capacity</label><input type="number" min={1} className={INP} value={eventForm.capacity} onChange={e => setEventForm(f => ({ ...f, capacity: parseInt(e.target.value) || 32 }))} /></div>
                  <div><label className={LBL}>Start Date & Time *</label><input required type="datetime-local" className={INP} value={eventForm.startDate} onChange={e => setEventForm(f => ({ ...f, startDate: e.target.value }))} /></div>
                  <div><label className={LBL}>End Date & Time *</label><input required type="datetime-local" className={INP} value={eventForm.endDate} onChange={e => setEventForm(f => ({ ...f, endDate: e.target.value }))} /></div>
                </div>
                <div><label className={LBL}>Description *</label><textarea required className={`${INP} h-24 resize-none`} value={eventForm.description} onChange={e => setEventForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the event…" /></div>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setShowEventForm(false)} className="btn-ghost text-sm px-4 py-2 rounded-xl">Cancel</button>
                  <button type="submit" disabled={formSubmitting} className="btn-primary text-sm px-6 py-2 rounded-xl">{formSubmitting ? 'Creating…' : 'Create Event'}</button>
                </div>
              </form>
            )}
            {tabLoading ? <TabSkeleton rows={3} /> : (
              <div className="table-container">
                <table className="table">
                  <thead><tr><th>Event</th><th>Type</th><th>Location</th><th>Date</th><th>Registrations</th><th>Actions</th></tr></thead>
                  <tbody>
                    {events.map(ev => (
                      <tr key={ev.id}>
                        <td className="text-white font-medium">{ev.title}</td>
                        <td><span className="badge badge-gray text-xs capitalize">{ev.type}</span></td>
                        <td className="text-gray-400 text-sm">{ev.location}</td>
                        <td className="text-gray-400 text-xs">
                          <div>{new Date(ev.startDate).toLocaleDateString('en-KE')}</div>
                          <div className="text-gray-500">{new Date(ev.startDate).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}</div>
                        </td>
                        <td className="text-gray-300 text-sm">{ev._count?.registrations ?? 0} / {ev.capacity}</td>
                        <td><button onClick={() => handleDeleteEvent(ev.id)} className="text-red-400 hover:text-red-300 text-xs transition-colors">Delete</button></td>
                      </tr>
                    ))}
                    {events.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-gray-500">No events yet — create one above</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Posts ────────────────────────────────────────────────── */}
        {activeTab === 'posts' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-400 text-sm">{posts.length} post{posts.length !== 1 ? 's' : ''} · {posts.filter(p => p.published).length} published</p>
              <button onClick={() => setShowPostForm(v => !v)} className="btn-primary text-sm px-4 py-2 rounded-xl">{showPostForm ? '✕ Cancel' : '+ New Post'}</button>
            </div>
            {showPostForm && (
              <form onSubmit={handleCreatePost} className="glass p-6 rounded-xl mb-6 space-y-4">
                <h3 className="text-white font-semibold">New Blog Post</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2"><label className={LBL}>Title *</label><input required className={INP} value={postForm.title} onChange={e => setPostForm(f => ({ ...f, title: e.target.value }))} placeholder="Post title" /></div>
                  <div><label className={LBL}>Category</label>
                    <select className={INP} value={postForm.category} onChange={e => setPostForm(f => ({ ...f, category: e.target.value }))}>
                      {['general', 'tournament', 'training', 'news', 'announcement'].map(c => (
                        <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div><label className={LBL}>Image URL</label><input className={INP} value={postForm.imageUrl} onChange={e => setPostForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://…" /></div>
                  <div className="sm:col-span-2"><label className={LBL}>Tags (comma-separated)</label><input className={INP} value={postForm.tags} onChange={e => setPostForm(f => ({ ...f, tags: e.target.value }))} placeholder="chess, tournament, kenya" /></div>
                </div>
                <div><label className={LBL}>Excerpt *</label><textarea required className={`${INP} h-20 resize-none`} value={postForm.excerpt} onChange={e => setPostForm(f => ({ ...f, excerpt: e.target.value }))} placeholder="Short summary…" /></div>
                <div><label className={LBL}>Content *</label><textarea required className={`${INP} h-48 resize-y`} value={postForm.content} onChange={e => setPostForm(f => ({ ...f, content: e.target.value }))} placeholder="Full post content…" /></div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={postForm.published} onChange={e => setPostForm(f => ({ ...f, published: e.target.checked }))} className="w-4 h-4 accent-yellow-400" />
                    <span className="text-gray-300 text-sm">Publish immediately</span>
                  </label>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setShowPostForm(false)} className="btn-ghost text-sm px-4 py-2 rounded-xl">Cancel</button>
                    <button type="submit" disabled={formSubmitting} className="btn-primary text-sm px-6 py-2 rounded-xl">{formSubmitting ? 'Saving…' : 'Save Post'}</button>
                  </div>
                </div>
              </form>
            )}
            {tabLoading ? <TabSkeleton rows={3} /> : (
              <div className="table-container">
                <table className="table">
                  <thead><tr><th>Title</th><th>Category</th><th>Author</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
                  <tbody>
                    {posts.map(post => (
                      <tr key={post.id}>
                        <td className="text-white font-medium max-w-xs truncate">{post.title}</td>
                        <td><span className="badge badge-gray text-xs capitalize">{post.category}</span></td>
                        <td className="text-gray-400 text-sm">{post.author?.name || '—'}</td>
                        <td><span className={`badge text-xs ${post.published ? 'badge-green' : 'badge-gray'}`}>{post.published ? 'Published' : 'Draft'}</span></td>
                        <td className="text-gray-400 text-xs">{new Date(post.createdAt).toLocaleDateString('en-KE')}</td>
                        <td>
                          <div className="flex gap-3">
                            <button onClick={() => handleTogglePublish(post.id, post.published)} className={`text-xs transition-colors ${post.published ? 'text-yellow-400 hover:text-yellow-300' : 'text-green-400 hover:text-green-300'}`}>
                              {post.published ? 'Unpublish' : 'Publish'}
                            </button>
                            <button onClick={() => handleDeletePost(post.id)} className="text-red-400 hover:text-red-300 text-xs transition-colors">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {posts.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-gray-500">No posts yet — write one above</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Gallery ──────────────────────────────────────────────── */}
        {activeTab === 'gallery' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-400 text-sm">{galleryItems.length} photo{galleryItems.length !== 1 ? 's' : ''}</p>
              <button onClick={() => setShowGalleryForm(v => !v)} className="btn-primary text-sm px-4 py-2 rounded-xl">{showGalleryForm ? '✕ Cancel' : '+ Add Photo'}</button>
            </div>
            {showGalleryForm && (
              <form onSubmit={handleAddGalleryItem} className="glass p-6 rounded-xl mb-6 space-y-4">
                <h3 className="text-white font-semibold">Add Gallery Photo</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className={LBL}>Title *</label><input required className={INP} value={galleryForm.title} onChange={e => setGalleryForm(f => ({ ...f, title: e.target.value }))} placeholder="Photo title" /></div>
                  <div><label className={LBL}>Caption</label><input className={INP} value={galleryForm.caption} onChange={e => setGalleryForm(f => ({ ...f, caption: e.target.value }))} placeholder="Optional caption" /></div>
                  <div className="sm:col-span-2"><label className={LBL}>Image URL *</label><input required className={INP} value={galleryForm.imageUrl} onChange={e => setGalleryForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://…" /></div>
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setShowGalleryForm(false)} className="btn-ghost text-sm px-4 py-2 rounded-xl">Cancel</button>
                  <button type="submit" disabled={formSubmitting} className="btn-primary text-sm px-6 py-2 rounded-xl">{formSubmitting ? 'Adding…' : 'Add Photo'}</button>
                </div>
              </form>
            )}
            {tabLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton aspect-square rounded-xl" />)}
              </div>
            ) : galleryItems.length === 0 ? (
              <div className="glass p-12 rounded-xl text-center">
                <p className="text-5xl mb-3">🖼️</p>
                <p className="text-white font-semibold mb-1">No photos yet</p>
                <p className="text-gray-400 text-sm">Add your first gallery photo above</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {galleryItems.map(item => (
                  <div key={item.id} className="glass rounded-xl overflow-hidden group relative">
                    <img src={item.imageUrl} alt={item.title} className="w-full aspect-square object-cover" />
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-3">
                      <p className="text-white text-xs font-medium text-center">{item.title}</p>
                      {item.caption && <p className="text-gray-300 text-xs text-center">{item.caption}</p>}
                      <button onClick={() => handleDeleteGalleryItem(item.id)} className="mt-2 text-red-400 hover:text-red-300 text-xs border border-red-400/30 rounded px-2 py-1 transition-colors">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Messages ─────────────────────────────────────────────── */}
        {activeTab === 'messages' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-400 text-sm">
                {messages.length} message{messages.length !== 1 ? 's' : ''}
                {unreadMessages > 0 && <span className="ml-2 badge badge-gold">{unreadMessages} unread</span>}
              </p>
              <button onClick={fetchMessages} className="btn-ghost text-sm px-3 py-1.5 rounded-lg">↺ Refresh</button>
            </div>
            {tabLoading ? <TabSkeleton /> : messages.length === 0 ? (
              <div className="glass p-12 rounded-xl text-center">
                <p className="text-5xl mb-3">✉️</p>
                <p className="text-white font-semibold mb-1">No messages yet</p>
                <p className="text-gray-500 text-sm">Contact form submissions will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map(msg => (
                  <div key={msg.id} className={`glass rounded-xl p-5 border ${msg.status === 'NEW' ? 'border-yellow-500/30' : 'border-white/5'}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-white font-semibold text-sm">{msg.name}</p>
                          {msg.status === 'NEW' && <span className="badge badge-gold text-xs">New</span>}
                        </div>
                        <p className="text-yellow-400/70 text-xs mb-2">{msg.email}</p>
                        <p className="text-gray-300 text-sm leading-relaxed">{msg.message}</p>
                        <p className="text-gray-600 text-xs mt-2">{new Date(msg.createdAt).toLocaleString('en-KE')}</p>
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        {msg.status === 'NEW' && (
                          <button onClick={() => handleMessageStatus(msg.id, 'READ')} className="text-green-400 hover:text-green-300 text-xs border border-green-400/30 rounded px-2 py-1 transition-colors whitespace-nowrap">
                            Mark Read
                          </button>
                        )}
                        <a href={`mailto:${msg.email}`} className="text-blue-400 hover:text-blue-300 text-xs border border-blue-400/30 rounded px-2 py-1 transition-colors text-center">
                          Reply
                        </a>
                        <button onClick={() => handleDeleteMessage(msg.id)} className="text-red-400 hover:text-red-300 text-xs border border-red-400/30 rounded px-2 py-1 transition-colors">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Settings ─────────────────────────────────────────────── */}
        {activeTab === 'settings' && (
          <div>
            <div className="mb-4">
              <h2 className="text-white font-semibold text-lg">Site Settings</h2>
              <p className="text-gray-500 text-sm mt-0.5">Edit the text and links shown on your website. Changes take effect immediately.</p>
            </div>
            {tabLoading ? <TabSkeleton rows={6} /> : (
              <form onSubmit={handleSaveSettings} className="space-y-6">
                {/* Hero Section */}
                <div className="glass p-6 rounded-xl space-y-4">
                  <h3 className="text-yellow-400 font-semibold text-sm uppercase tracking-widest">Hero Section</h3>
                  {SETTINGS_FIELDS.filter(f => f.key.startsWith('hero')).map(field => (
                    <div key={field.key}>
                      <label className={LBL}>{field.label}</label>
                      {field.type === 'textarea' ? (
                        <textarea
                          className={`${INP} mt-1 h-20 resize-none`}
                          value={settingsForm[field.key] ?? settings[field.key] ?? ''}
                          onChange={e => setSettingsForm(f => ({ ...f, [field.key]: e.target.value }))}
                          placeholder={field.placeholder}
                        />
                      ) : (
                        <input
                          type={field.type}
                          className={`${INP} mt-1`}
                          value={settingsForm[field.key] ?? settings[field.key] ?? ''}
                          onChange={e => setSettingsForm(f => ({ ...f, [field.key]: e.target.value }))}
                          placeholder={field.placeholder}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* About Section */}
                <div className="glass p-6 rounded-xl space-y-4">
                  <h3 className="text-yellow-400 font-semibold text-sm uppercase tracking-widest">About Section</h3>
                  {SETTINGS_FIELDS.filter(f => f.key.startsWith('about')).map(field => (
                    <div key={field.key}>
                      <label className={LBL}>{field.label}</label>
                      <textarea
                        className={`${INP} mt-1 h-28 resize-none`}
                        value={settingsForm[field.key] ?? settings[field.key] ?? ''}
                        onChange={e => setSettingsForm(f => ({ ...f, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                      />
                    </div>
                  ))}
                </div>

                {/* Contact Info */}
                <div className="glass p-6 rounded-xl space-y-4">
                  <h3 className="text-yellow-400 font-semibold text-sm uppercase tracking-widest">Contact Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {SETTINGS_FIELDS.filter(f => f.key.startsWith('club')).map(field => (
                      <div key={field.key}>
                        <label className={LBL}>{field.label}</label>
                        <input
                          type={field.type}
                          className={`${INP} mt-1`}
                          value={settingsForm[field.key] ?? settings[field.key] ?? ''}
                          onChange={e => setSettingsForm(f => ({ ...f, [field.key]: e.target.value }))}
                          placeholder={field.placeholder}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Social Links */}
                <div className="glass p-6 rounded-xl space-y-4">
                  <h3 className="text-yellow-400 font-semibold text-sm uppercase tracking-widest">Social Media Links</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {SETTINGS_FIELDS.filter(f => f.key.startsWith('social')).map(field => (
                      <div key={field.key}>
                        <label className={LBL}>{field.label}</label>
                        <input
                          type={field.type}
                          className={`${INP} mt-1`}
                          value={settingsForm[field.key] ?? settings[field.key] ?? ''}
                          onChange={e => setSettingsForm(f => ({ ...f, [field.key]: e.target.value }))}
                          placeholder={field.placeholder}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setSettingsForm(settings)} className="btn-ghost px-6 py-2.5 rounded-xl text-sm">Reset Changes</button>
                  <button type="submit" disabled={settingsSaving} className="btn-primary px-8 py-2.5 rounded-xl">
                    {settingsSaving ? 'Saving…' : 'Save Settings'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

      </div>
    </Layout>
  );
}
