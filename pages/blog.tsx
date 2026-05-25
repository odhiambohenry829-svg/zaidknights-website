import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../components/common/Layout';
import SkeletonCard from '../components/ui/SkeletonCard';
import EmptyState from '../components/ui/EmptyState';
import Toast from '../components/ui/Toast';
import Badge from '../components/ui/Badge';
import type { BadgeVariant } from '../components/ui/Badge';

interface Post {
  id:        string;
  title:     string;
  slug:      string;
  excerpt:   string | null;
  category:  string;
  imageUrl:  string | null;
  createdAt: string;
  author:    { name: string | null };
}

const CATEGORIES = ['all', 'tournament', 'tips', 'news', 'coaching'];

const CATEGORY_COLORS: Record<string, BadgeVariant> = {
  tournament: 'gold',
  tips:       'blue',
  news:       'green',
  coaching:   'purple',
  general:    'gray',
};

function categoryColor(cat: string): BadgeVariant {
  return CATEGORY_COLORS[cat.toLowerCase()] ?? 'gray';
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function BlogPage() {
  const router   = useRouter();
  const initCat  = (router.query.category as string) || 'all';

  const [posts,        setPosts]        = useState<Post[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [category,     setCategory]     = useState(initCat);
  const [page,         setPage]         = useState(1);
  const [totalPages,   setTotalPages]   = useState(1);
  const [newsletter,   setNewsletter]   = useState('');
  const [nlLoading,    setNlLoading]    = useState(false);
  const [toast,        setToast]        = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchPosts = useCallback(async (cat: string, pg: number) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(pg), limit: '6' });
      if (cat !== 'all') params.set('category', cat);
      const res  = await fetch(`/api/posts?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load posts');
      setPosts(data.posts ?? []);
      setTotalPages(data.pages ?? 1);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(category, page);
  }, [category, page, fetchPosts]);

  const handleCategory = (cat: string) => {
    setCategory(cat);
    setPage(1);
    router.replace({ query: cat === 'all' ? {} : { category: cat } }, undefined, { shallow: true });
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletter) return;
    setNlLoading(true);
    try {
      const res  = await fetch('/api/newsletter', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: newsletter }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setToast({ message: 'Subscribed! Welcome to the Zaid Knights newsletter.', type: 'success' });
      setNewsletter('');
    } catch (e: unknown) {
      setToast({ message: e instanceof Error ? e.message : 'Subscription failed.', type: 'error' });
    } finally {
      setNlLoading(false);
    }
  };

  const featured = posts[0];
  const rest      = posts.slice(1);

  return (
    <Layout title="Blog | Zaid Knights Chess Club">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* Hero */}
      <section className="py-20 px-4 chess-pattern">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Club <span className="gold-gradient">Blog</span>
          </h1>
          <p className="text-gray-400 text-lg">Tournament recaps, chess tips, club news, and coaching insights</p>
        </div>
      </section>

      {/* Category Tabs */}
      <div className="sticky top-16 z-30 bg-[var(--dark)]/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategory(cat)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${
                  category === cat
                    ? 'bg-yellow-500 text-black'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {cat === 'all' ? 'All Posts' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {error ? (
          <div className="text-center py-16">
            <p className="text-red-400 mb-4">{error}</p>
            <button onClick={() => fetchPosts(category, page)} className="btn-secondary">Try Again</button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} rows={3} height="h-4" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <EmptyState
            icon="📝"
            title="No posts yet"
            message="Check back soon! Our team is working on great content for you."
            ctaLabel="Back to Home"
            ctaHref="/"
          />
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main content */}
            <div className="flex-1 min-w-0">
              {/* Featured Post */}
              {featured && page === 1 && (
                <Link href={`/blog/${featured.slug}`} className="block mb-8 group">
                  <div className="glass-hover rounded-2xl overflow-hidden">
                    {featured.imageUrl && (
                      <div className="h-56 md:h-72 bg-white/5 overflow-hidden">
                        <img
                          src={featured.imageUrl}
                          alt={featured.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge variant={categoryColor(featured.category)}>
                          {featured.category}
                        </Badge>
                        <span className="text-gray-500 text-xs">Featured</span>
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors" style={{ fontFamily: 'Playfair Display, serif' }}>
                        {featured.title}
                      </h2>
                      {featured.excerpt && (
                        <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 mb-4">{featured.excerpt}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>By {featured.author.name ?? 'Zaid Knights'}</span>
                        <span>{formatDate(featured.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )}

              {/* Posts Grid */}
              {rest.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                  {rest.map(post => (
                    <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                      <div className="glass-hover rounded-xl overflow-hidden h-full flex flex-col">
                        {post.imageUrl ? (
                          <div className="h-40 bg-white/5 overflow-hidden flex-shrink-0">
                            <img
                              src={post.imageUrl}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        ) : (
                          <div className="h-40 bg-white/5 flex items-center justify-center text-5xl opacity-20 flex-shrink-0">
                            ♟
                          </div>
                        )}
                        <div className="p-5 flex flex-col flex-1">
                          <Badge variant={categoryColor(post.category)} className="mb-3 self-start">
                            {post.category}
                          </Badge>
                          <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2 group-hover:text-yellow-400 transition-colors flex-1">
                            {post.title}
                          </h3>
                          {post.excerpt && (
                            <p className="text-gray-500 text-xs line-clamp-2 mb-3">{post.excerpt}</p>
                          )}
                          <div className="flex items-center justify-between text-xs text-gray-500 mt-auto pt-3 border-t border-white/5">
                            <span>{post.author.name ?? 'Zaid Knights'}</span>
                            <span className="text-yellow-400/70 font-medium">Read more →</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-8">
                  <button
                    onClick={() => { setPage(p => p - 1); requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })); }}
                    disabled={page === 1}
                    className="btn-secondary disabled:opacity-40 text-sm px-4 py-2"
                  >
                    ← Previous
                  </button>
                  <span className="text-gray-400 text-sm">Page {page} of {totalPages}</span>
                  <button
                    onClick={() => { setPage(p => p + 1); requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })); }}
                    disabled={page >= totalPages}
                    className="btn-secondary disabled:opacity-40 text-sm px-4 py-2"
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:w-72 flex-shrink-0 space-y-6">
              {/* Recent Posts */}
              <div className="glass p-5 rounded-xl">
                <h3 className="text-white font-bold mb-4 text-sm">Recent Posts</h3>
                <div className="space-y-3">
                  {posts.slice(0, 4).map(post => (
                    <Link key={post.id} href={`/blog/${post.slug}`} className="flex gap-3 group">
                      <div className="w-12 h-12 rounded-lg bg-white/5 flex-shrink-0 overflow-hidden">
                        {post.imageUrl ? (
                          <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg opacity-20">♟</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-xs font-medium line-clamp-2 group-hover:text-yellow-400 transition-colors">
                          {post.title}
                        </p>
                        <p className="text-gray-500 text-xs mt-0.5">{formatDate(post.createdAt)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div className="glass p-5 rounded-xl">
                <h3 className="text-white font-bold mb-4 text-sm">Categories</h3>
                <div className="space-y-2">
                  {CATEGORIES.filter(c => c !== 'all').map(cat => (
                    <button
                      key={cat}
                      onClick={() => handleCategory(cat)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm capitalize transition-colors ${
                        category === cat
                          ? 'bg-yellow-500/10 text-yellow-400'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span>{cat}</span>
                      <span className="text-xs">→</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Newsletter */}
              <div className="glass-gold p-5 rounded-xl">
                <h3 className="text-white font-bold mb-2 text-sm">Newsletter</h3>
                <p className="text-gray-400 text-xs mb-4">Get club updates and chess tips delivered to your inbox.</p>
                <form onSubmit={handleSubscribe} className="space-y-3">
                  <input
                    type="email"
                    required
                    value={newsletter}
                    onChange={e => setNewsletter(e.target.value)}
                    placeholder="your@email.com"
                    className="input text-sm py-2"
                  />
                  <button
                    type="submit"
                    disabled={nlLoading}
                    className="btn-primary w-full py-2 text-sm"
                  >
                    {nlLoading ? 'Subscribing…' : 'Subscribe'}
                  </button>
                </form>
              </div>
            </aside>
          </div>
        )}
      </div>
    </Layout>
  );
}
