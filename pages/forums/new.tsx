import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/common/Layout';
import ProtectedRoute from '../../components/common/ProtectedRoute';

interface Category { id: string; name: string; slug: string; icon: string }

export default function NewThreadPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/forums/categories').then(r => r.json()).then(d => {
      setCategories(d.categories || []);
      if (d.categories?.[0]) setCategoryId(d.categories[0].id);
    });
  }, []);

  const submit = async () => {
    if (!categoryId || !title.trim() || !content.trim()) { setError('All fields are required.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/forums/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId, title, content }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to create thread'); setSubmitting(false); return; }
      const cat = categories.find(c => c.id === categoryId);
      router.push(`/forums/${cat?.slug ?? ''}/${data.thread.slug}`);
    } catch { setError('An error occurred'); setSubmitting(false); }
  };

  return (
    <ProtectedRoute>
      <Layout title="New Thread | Zaid Knights Forums">
        <div className="min-h-screen py-12 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <p className="text-yellow-400 text-sm uppercase tracking-widest mb-2">Forums</p>
              <h1 className="text-3xl font-bold text-white">Create New Thread</h1>
            </div>
            <div className="glass p-6 rounded-xl space-y-5">
              <div>
                <label className="label">Category</label>
                <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="input">
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Thread title…" className="input" maxLength={200} />
              </div>
              <div>
                <label className="label">Content</label>
                <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Write your post…" rows={8} className="input resize-none" maxLength={10000} />
                <p className="text-gray-500 text-xs mt-1 text-right">{content.length}/10000</p>
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <div className="flex gap-3">
                <button onClick={submit} disabled={submitting} className="btn-primary flex-1 py-3">
                  {submitting ? 'Posting…' : 'Post Thread'}
                </button>
                <button onClick={() => router.back()} className="btn-secondary px-6">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
