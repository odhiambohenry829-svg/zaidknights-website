import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../../components/common/Layout';
import { useAuth } from '../_app';

interface ForumThread { id: string; title: string; slug: string; updatedAt: string; author: { name: string }; _count: { posts: number }; posts: { author: { name: string } }[] }
interface ForumCategory {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  icon: string;
  _count: { threads: number };
  threads: ForumThread[];
}

export default function ForumsPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/forums/categories')
      .then(r => r.json())
      .then(d => { setCategories(d.categories || []); setLoading(false); });
  }, []);

  return (
    <Layout title="Community Forums | Zaid Knights" description="Join the conversation — chess discussions, game analysis, and club news.">
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-start justify-between mb-10 flex-wrap gap-4">
            <div>
              <p className="text-yellow-400 text-sm uppercase tracking-widest mb-2">Community</p>
              <h1 className="text-4xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Forums</h1>
              <p className="text-gray-400 mt-2">Chess discussions, game analysis, and club news</p>
            </div>
            {user && (
              <Link href="/forums/new" className="btn-primary">+ New Thread</Link>
            )}
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => <div key={i} className="glass rounded-xl h-28 animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-4">
              {categories.map(cat => (
                <div key={cat.id} className="glass-hover rounded-xl overflow-hidden">
                  <Link href={`/forums/${cat.slug}`}>
                    <div className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="text-3xl flex-shrink-0">{cat.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <h3 className="text-white font-semibold text-lg">{cat.name}</h3>
                            <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">{cat._count.threads} threads</span>
                          </div>
                          {cat.description && <p className="text-gray-400 text-sm mt-0.5">{cat.description}</p>}

                          {cat.threads[0] && (
                            <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                              <div className="min-w-0">
                                <p className="text-gray-300 text-sm truncate">{cat.threads[0].title}</p>
                                <p className="text-gray-500 text-xs mt-0.5">
                                  by {cat.threads[0].posts[0]?.author?.name ?? cat.threads[0].author?.name} · {new Date(cat.threads[0].updatedAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right flex-shrink-0 ml-4">
                                <p className="text-gray-400 text-xs">{cat.threads[0]._count.posts} replies</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}

          {!user && (
            <div className="glass-gold p-6 rounded-xl mt-8 text-center">
              <p className="text-white font-semibold mb-2">Join the conversation</p>
              <p className="text-gray-400 text-sm mb-4">Log in to post in the forums and connect with other members</p>
              <div className="flex gap-3 justify-center">
                <Link href="/login" className="btn-primary">Log In</Link>
                <Link href="/register" className="btn-secondary">Register</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
