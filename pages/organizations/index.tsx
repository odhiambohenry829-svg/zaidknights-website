import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../../components/common/Layout';

interface Organization {
  id: string;
  name: string;
  type: string;
  location: string;
  county?: string;
  memberCount: number;
  chessInterest: string;
  participationType: string;
  _count: { members: number };
}

const TYPE_ICONS: Record<string, string> = {
  SCHOOL:  '🏫',
  COMPANY: '🏢',
  ACADEMY: '🎓',
  CLUB:    '♟',
};

export default function OrganizationsPage() {
  const [orgs,    setOrgs]    = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState('All');
  const [error,   setError]   = useState('');

  useEffect(() => {
    fetch('/api/organizations')
      .then(r => r.json())
      .then(data => setOrgs(data.organizations || []))
      .catch(() => setError('Failed to load organizations. Please refresh.'))
      .finally(() => setLoading(false));
  }, []);

  const types = ['All', 'SCHOOL', 'COMPANY', 'ACADEMY', 'CLUB'];

  const filtered = orgs
    .filter(o => filter === 'All' || o.type === filter)
    .filter(o => o.name.toLowerCase().includes(search.toLowerCase()) || o.location.toLowerCase().includes(search.toLowerCase()));

  return (
    <Layout title="Partner Organizations | ZaidKnights Chess Club" description="Schools, companies, and academies partnered with ZaidKnights Chess Club.">
      {/* Hero */}
      <section className="py-16 border-b border-white/10 chess-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <h1 className="text-5xl font-bold text-white mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
              Partner <span className="gold-gradient">Organizations</span>
            </h1>
            <p className="text-gray-400">Schools, companies, and clubs affiliated with ZaidKnights</p>
          </div>
          <Link href="/organizations/register" className="btn-primary rounded-xl px-6 py-3 font-semibold whitespace-nowrap">
            Register Your Organization →
          </Link>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <input
              type="text"
              placeholder="Search organizations..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input max-w-sm"
            />
            <div className="flex gap-2 flex-wrap">
              {types.map(type => (
                <button key={type}
                  onClick={() => setFilter(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                    filter === type ? 'bg-yellow-500 text-black' : 'glass text-gray-400 hover:text-white'
                  }`}
                >
                  {type === 'All' ? 'All' : `${TYPE_ICONS[type]} ${type.charAt(0) + type.slice(1).toLowerCase()}`}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400 text-sm">{error}</div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-48 rounded-xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 glass rounded-xl">
              <p className="text-5xl mb-4">🏫</p>
              <p className="text-gray-400">No organizations found</p>
              <Link href="/organizations/register" className="mt-4 inline-block text-yellow-400 hover:text-yellow-300">
                Be the first to register →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(org => (
                <div key={org.id} className="glass-hover rounded-xl p-6 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-3xl">{TYPE_ICONS[org.type] ?? '🏛'}</div>
                    <span className="badge badge-gold text-xs capitalize">{org.type.toLowerCase()}</span>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-1">{org.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">📍 {org.location}{org.county ? `, ${org.county}` : ''}</p>
                  <div className="mt-auto grid grid-cols-2 gap-3 text-sm">
                    <div className="glass rounded-lg p-2 text-center">
                      <p className="text-yellow-400 font-bold">{org.memberCount}</p>
                      <p className="text-gray-500 text-xs">Members</p>
                    </div>
                    <div className="glass rounded-lg p-2 text-center">
                      <p className="text-white font-medium text-xs capitalize">
                        {org.participationType.replace(/_/g, ' ').toLowerCase()}
                      </p>
                      <p className="text-gray-500 text-xs">Partnership</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
