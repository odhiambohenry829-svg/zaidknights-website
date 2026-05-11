import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../components/common/Layout';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  imageUrl?: string;
  createdAt: string;
  author: { name: string };
}

const CATEGORIES = ['All', 'general', 'tournament', 'tips', 'news', 'coaching'];

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/posts')
      .then(r => r.json())
      .then(data => setPosts(data.posts || []))
      .catch(() => setError('Failed to load posts. Please refresh the page.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = category === 'All' ? posts : posts.filter(p => p.category === category);

  return (
    <Layout title="Blog | Zaid Knights Chess Club" description="Chess news, tips, and stories from the Zaid Knights community.">
      {/* Header */}
      <section className="py-16 border-b border-white/10 chess-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold text-white mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            Club <span className="gold-gradient">Blog</span>
          </h1>
          <p className="text-gray-400">Chess insights, tournament recaps, and tips from our coaches</p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap mb-10">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                  category === cat
                    ? 'bg-yellow-500 text-black'
                    : 'glass text-gray-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Error state */}
          {error && (
            <div className="mb-8 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Posts Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map(i => <div key={i} className="skeleton h-80 rounded-xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 glass rounded-xl">
              <p className="text-5xl mb-4">📝</p>
              <p className="text-gray-400">No posts yet in this category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(post => (
                <article key={post.id} className="glass-hover rounded-xl overflow-hidden flex flex-col">
                  {post.imageUrl && (
                    <div className="h-48 bg-white/5 overflow-hidden">
                      <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <span className="badge-gold text-xs capitalize">{post.category}</span>
                      <span className="text-gray-500 text-xs">
                        {new Date(post.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <h2 className="text-white font-bold text-lg mb-2 flex-1">{post.title}</h2>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-gray-500 text-xs">By {post.author.name}</span>
                      <Link href={`/blog/${post.slug}`} className="text-yellow-400 text-sm hover:text-yellow-300 transition-colors">
                        Read more →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}