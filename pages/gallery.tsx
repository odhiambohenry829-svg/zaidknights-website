import { useEffect, useState, useCallback, useRef } from 'react';
import Layout from '../components/common/Layout';
import Modal from '../components/ui/Modal';
import Toast from '../components/ui/Toast';
import EmptyState from '../components/ui/EmptyState';
import SkeletonCard from '../components/ui/SkeletonCard';
import { useAuth } from './_app';

interface GalleryItem {
  id:        string;
  title:     string;
  imageUrl:  string;
  caption:   string | null;
  category:  string;
  createdAt: string;
}

type Category = 'all' | 'tournaments' | 'training' | 'events' | 'team' | 'general';
const CATEGORIES: Category[] = ['all', 'tournaments', 'training', 'events', 'team', 'general'];

export default function GalleryPage() {
  const { user } = useAuth();

  const [items,       setItems]       = useState<GalleryItem[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [category,    setCategory]    = useState<Category>('all');
  const [lightbox,    setLightbox]    = useState<number | null>(null);
  const [uploadModal, setUploadModal] = useState(false);
  const [toast,       setToast]       = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [upload,      setUpload]      = useState({ title: '', imageUrl: '', caption: '', category: 'general' });
  const [uploading,   setUploading]   = useState(false);

  const lightboxRef = useRef<HTMLDivElement>(null);

  const fetchItems = useCallback(async (cat: Category) => {
    setLoading(true);
    setError('');
    try {
      const params = cat !== 'all' ? `?category=${cat}` : '';
      const res  = await fetch(`/api/gallery${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load gallery');
      setItems(data.items ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load gallery');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(category); }, [category, fetchItems]);

  // Keyboard nav for lightbox
  useEffect(() => {
    if (lightbox === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setLightbox(i => i !== null ? Math.min(i + 1, items.length - 1) : null);
      if (e.key === 'ArrowLeft')  setLightbox(i => i !== null ? Math.max(i - 1, 0) : null);
      if (e.key === 'Escape')     setLightbox(null);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [lightbox, items.length]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upload.imageUrl || !upload.title) return;
    setUploading(true);
    try {
      const res = await fetch('/api/gallery', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(upload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setItems(prev => [data.item, ...prev]);
      setUploadModal(false);
      setUpload({ title: '', imageUrl: '', caption: '', category: 'general' });
      setToast({ message: 'Photo submitted successfully!', type: 'success' });
    } catch (e: unknown) {
      setToast({ message: e instanceof Error ? e.message : 'Upload failed.', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleShare = (item: GalleryItem) => {
    const url = `${window.location.origin}/gallery?photo=${item.id}`;
    navigator.clipboard.writeText(url)
      .then(() => setToast({ message: 'Photo link copied!', type: 'success' }))
      .catch(() => setToast({ message: 'Could not copy link', type: 'error' }));
  };

  const currentItem = lightbox !== null ? items[lightbox] : null;

  return (
    <Layout title="Gallery | Zaid Knights Chess Club">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Hero */}
      <section className="py-20 px-4 chess-pattern">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Photo <span className="gold-gradient">Gallery</span>
          </h1>
          <p className="text-gray-400 text-lg">Moments from our tournaments, training sessions, and club events</p>
        </div>
      </section>

      {/* Filter & Upload */}
      <div className="sticky top-16 z-30 bg-[var(--dark)]/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex gap-1 overflow-x-auto py-3">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${
                  category === cat
                    ? 'bg-yellow-500 text-black'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {cat === 'all' ? 'All Photos' : cat}
              </button>
            ))}
          </div>
          <button
            onClick={() => user ? setUploadModal(true) : (window.location.href = '/login?redirect=/gallery')}
            className="flex-shrink-0 ml-4 btn-secondary text-sm py-2 px-4"
          >
            + Submit Photo
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {error ? (
          <div className="text-center py-16">
            <p className="text-red-400 mb-4">{error}</p>
            <button onClick={() => fetchItems(category)} className="btn-secondary">Try Again</button>
          </div>
        ) : loading ? (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton rounded-xl break-inside-avoid" style={{ height: `${160 + (i % 3) * 60}px` }} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon="📷"
            title="No photos yet"
            message="Our first tournament photos are coming soon! Check back after our next event."
            ctaLabel="View Events"
            ctaHref="/events"
          />
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="break-inside-avoid cursor-pointer group relative rounded-xl overflow-hidden"
                onClick={() => setLightbox(idx)}
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-end">
                  <div className="p-3">
                    <p className="text-white text-xs font-semibold line-clamp-1">{item.title}</p>
                    {item.caption && <p className="text-gray-300 text-xs line-clamp-1 mt-0.5">{item.caption}</p>}
                  </div>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs bg-black/50 px-2 py-1 rounded-full text-white capitalize">{item.category}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox !== null && currentItem && (
        <div
          ref={lightboxRef}
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={e => { if (e.target === lightboxRef.current) setLightbox(null); }}
        >
          {/* Nav Buttons */}
          {lightbox > 0 && (
            <button
              onClick={() => setLightbox(i => i !== null ? i - 1 : null)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white text-xl flex items-center justify-center transition-all z-10"
            >
              ‹
            </button>
          )}
          {lightbox < items.length - 1 && (
            <button
              onClick={() => setLightbox(i => i !== null ? i + 1 : null)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white text-xl flex items-center justify-center transition-all z-10"
            >
              ›
            </button>
          )}
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all z-10"
          >
            ✕
          </button>

          <div className="max-w-4xl w-full">
            <img
              src={currentItem.imageUrl}
              alt={currentItem.title}
              className="max-h-[75vh] w-full object-contain rounded-xl"
            />
            <div className="mt-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-white font-semibold">{currentItem.title}</h3>
                {currentItem.caption && <p className="text-gray-400 text-sm mt-1">{currentItem.caption}</p>}
                <p className="text-gray-600 text-xs mt-2">
                  {lightbox + 1} / {items.length} · {currentItem.category}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => window.open(currentItem.imageUrl, '_blank')}
                  className="btn-secondary text-xs py-2 px-3"
                >
                  Download
                </button>
                <button
                  onClick={() => handleShare(currentItem)}
                  className="btn-ghost text-xs py-2 px-3"
                >
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <Modal open={uploadModal} onClose={() => setUploadModal(false)} title="Submit a Photo">
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="label">Photo URL *</label>
            <input
              type="url"
              required
              className="input"
              placeholder="https://…"
              value={upload.imageUrl}
              onChange={e => setUpload({ ...upload, imageUrl: e.target.value })}
            />
            <p className="text-gray-500 text-xs mt-1">Link to an image (Imgur, Google Drive, etc.)</p>
          </div>
          <div>
            <label className="label">Title *</label>
            <input
              type="text"
              required
              className="input"
              placeholder="e.g. Club Championship 2025"
              value={upload.title}
              onChange={e => setUpload({ ...upload, title: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Caption (optional)</label>
            <input
              type="text"
              className="input"
              placeholder="Describe what's happening in the photo"
              value={upload.caption}
              onChange={e => setUpload({ ...upload, caption: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Category</label>
            <select
              className="input"
              value={upload.category}
              onChange={e => setUpload({ ...upload, category: e.target.value })}
            >
              {CATEGORIES.filter(c => c !== 'all').map(c => (
                <option key={c} value={c} className="capitalize">{c}</option>
              ))}
            </select>
          </div>
          {upload.imageUrl && (
            <div className="rounded-xl overflow-hidden h-40 bg-white/5">
              <img src={upload.imageUrl} alt="Preview" className="w-full h-full object-cover" onError={() => {}} />
            </div>
          )}
          <button type="submit" disabled={uploading} className="btn-primary w-full">
            {uploading ? 'Submitting…' : 'Submit Photo →'}
          </button>
        </form>
      </Modal>
    </Layout>
  );
}
