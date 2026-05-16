import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../../components/common/Layout';
import { useAuth } from '../../_app';

interface Post { id: string; content: string; edited: boolean; createdAt: string; author: { id: string; name: string } }
interface Thread {
  id: string; title: string; slug: string; pinned: boolean; locked: boolean; views: number;
  createdAt: string; author: { id: string; name: string };
  category: { id: string; name: string; slug: string; icon: string };
  posts: Post[];
  _count: { posts: number };
}

export default function ThreadPage() {
  const router = useRouter();
  const { catSlug, threadSlug } = router.query;
  const { user } = useAuth();
  const [thread, setThread] = useState<Thread | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadThread = () => {
    if (!threadSlug) return;
    fetch(`/api/forums/threads?threadSlug=${threadSlug}`)
      .then(r => r.json())
      .then(d => { setThread(d.thread); setLoading(false); });
  };

  useEffect(() => { loadThread(); }, [threadSlug]);

  const submitReply = async () => {
    if (!reply.trim() || !thread) return;
    setSubmitting(true);
    try {
      await fetch('/api/forums/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId: thread.id, content: reply }),
      });
      setReply('');
      loadThread();
    } catch {}
    setSubmitting(false);
  };

  const deletePost = async (postId: string) => {
    if (!confirm('Delete this post?')) return;
    await fetch(`/api/forums/posts?postId=${postId}`, { method: 'DELETE' });
    loadThread();
  };

  if (loading) return (
    <Layout title="Loading… | Zaid Knights Forums">
      <div className="min-h-screen py-12 px-4 text-center text-gray-400">Loading thread…</div>
    </Layout>
  );

  if (!thread) return (
    <Layout title="Not Found | Zaid Knights Forums">
      <div className="min-h-screen py-12 px-4 text-center text-gray-400">Thread not found.</div>
    </Layout>
  );

  return (
    <Layout title={`${thread.title} | Zaid Knights Forums`}>
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2 flex-wrap">
            <Link href="/forums" className="hover:text-yellow-400">Forums</Link>
            <span>/</span>
            <Link href={`/forums/${catSlug}`} className="hover:text-yellow-400">{thread.category?.name}</Link>
            <span>/</span>
            <span className="text-white truncate max-w-[200px]">{thread.title}</span>
          </nav>

          {/* Thread header */}
          <div className="glass-gold p-5 rounded-xl mb-6">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold text-white">{thread.title}</h1>
              <div className="flex gap-2 flex-shrink-0">
                {thread.pinned && <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">📌</span>}
                {thread.locked && <span className="text-xs bg-gray-500/20 text-gray-400 px-2 py-0.5 rounded-full">🔒 Locked</span>}
              </div>
            </div>
            <p className="text-gray-400 text-sm mt-1">
              Started by {thread.author?.name} · {new Date(thread.createdAt).toLocaleDateString()} · {thread._count.posts} replies · {thread.views} views
            </p>
          </div>

          {/* Posts */}
          <div className="space-y-4 mb-8">
            {thread.posts.map((post, i) => (
              <div key={post.id} className="glass rounded-xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-yellow-600' : 'bg-white/10'} text-white`}>
                      {post.author?.name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{post.author?.name}</p>
                      <p className="text-gray-400 text-xs">{new Date(post.createdAt).toLocaleString()}{post.edited && ' (edited)'}</p>
                    </div>
                  </div>
                  {(user?.id === post.author?.id || user?.role === 'ADMIN') && (
                    <button onClick={() => deletePost(post.id)} className="text-gray-500 hover:text-red-400 text-xs transition-colors">Delete</button>
                  )}
                </div>
                <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</div>
              </div>
            ))}
          </div>

          {/* Reply form */}
          {user && !thread.locked ? (
            <div className="glass p-5 rounded-xl">
              <h3 className="text-white font-semibold mb-3">Post a Reply</h3>
              <textarea
                value={reply}
                onChange={e => setReply(e.target.value)}
                placeholder="Write your reply…"
                rows={5}
                className="input resize-none mb-3"
                maxLength={10000}
              />
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-xs">{reply.length}/10000</span>
                <button onClick={submitReply} disabled={submitting || !reply.trim()} className="btn-primary text-sm">
                  {submitting ? 'Posting…' : 'Post Reply'}
                </button>
              </div>
            </div>
          ) : !user ? (
            <div className="glass-gold p-5 rounded-xl text-center">
              <p className="text-gray-300 mb-3">Log in to reply to this thread</p>
              <Link href="/login" className="btn-primary text-sm">Log In</Link>
            </div>
          ) : (
            <div className="glass p-5 rounded-xl text-center text-gray-400">
              🔒 This thread is locked
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
