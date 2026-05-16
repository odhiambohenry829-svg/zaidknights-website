import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/common/Layout';
import { useAuth } from '../_app';

interface Thread {
  id: string;
  title: string;
  slug: string;
  pinned: boolean;
  locked: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
  author: { id: string; name: string };
  _count: { posts: number };
  posts: { author: { name: string } }[];
}

interface Category { id: string; name: string; slug: string; icon: string; description: string | null }

export default function ForumCategoryPage() {
  const router = useRouter();
  const { catSlug } = router.query;
  const { user } = useAuth();
  const [category, setCategory] = useState<Category | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!catSlug) return;
    fetch(`/api/forums/threads?categorySlug=${catSlug}`)
      .then(r => r.json())
      .then(d => {
        setCategory(d.category);
        setThreads(d.threads || []);
        setLoading(false);
      });
  }, [catSlug]);

  const createThread = async () => {
    if (!newTitle.trim() || !newContent.trim() || !category) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/forums/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId: category.id, title: newTitle, content: newContent }),
      });
      const data = await res.json();
      if (data.thread) {
        router.push(`/forums/${catSlug}/${data.thread.slug}`);
      }
    } catch { setSubmitting(false); }
  };

  return (
    <Layout title={`${category?.name ?? 'Forum'} | Zaid Knights Forums`}>
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-400 mb-6">
            <Link href="/forums" className="hover:text-yellow-400">Forums</Link>
            <span className="mx-2">/</span>
            <span className="text-white">{category?.name}</span>
          </nav>

          <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                <span>{category?.icon}</span> {category?.name}
              </h1>
              {category?.description && <p className="text-gray-400 mt-1">{category.description}</p>}
            </div>
            {user && (
              <button onClick={() => setShowNew(!showNew)} className="btn-primary">
                {showNew ? '× Cancel' : '+ New Thread'}
              </button>
            )}
          </div>

          {/* New Thread Form */}
          {showNew && user && (
            <div className="glass p-6 rounded-xl mb-8">
              <h3 className="text-white font-semibold mb-4">Create New Thread</h3>
              <input
                type="text"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Thread title…"
                className="input mb-3"
                maxLength={200}
              />
              <textarea
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                placeholder="Write your post…"
                rows={6}
                className="input resize-none mb-3"
                maxLength={10000}
              />
              <button onClick={createThread} disabled={submitting || !newTitle.trim() || !newContent.trim()} className="btn-primary">
                {submitting ? 'Posting…' : 'Post Thread'}
              </button>
            </div>
          )}

          {/* Thread List */}
          {loading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => <div key={i} className="glass rounded-xl h-20 animate-pulse" />)}
            </div>
          ) : threads.length === 0 ? (
            <div className="glass rounded-xl p-12 text-center">
              <p className="text-gray-400">No threads yet. Be the first to start a discussion!</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-4 pb-2 text-xs text-gray-500 uppercase tracking-widest">
                <span>Thread</span>
                <span className="text-right">Replies</span>
                <span className="text-right hidden sm:block">Last Post</span>
              </div>
              {threads.map(thread => (
                <Link key={thread.id} href={`/forums/${catSlug}/${thread.slug}`}>
                  <div className="glass-hover rounded-xl p-4 grid grid-cols-[1fr_auto_auto] gap-4 items-center">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {thread.pinned && <span className="text-yellow-400 text-xs">📌 Pinned</span>}
                        {thread.locked && <span className="text-gray-400 text-xs">🔒</span>}
                        <p className="text-white font-medium truncate">{thread.title}</p>
                      </div>
                      <p className="text-gray-400 text-xs mt-0.5">
                        by {thread.author?.name} · {new Date(thread.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-300 font-medium">{thread._count.posts}</p>
                      <p className="text-gray-500 text-xs">{thread.views} views</p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-gray-400 text-xs">{thread.posts[0]?.author?.name ?? '—'}</p>
                      <p className="text-gray-500 text-xs">{new Date(thread.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
