import { useEffect, useState } from 'react';
import Layout from '../components/common/Layout';

interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  caption?: string;
  createdAt: string;
}

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/gallery')
      .then(r => r.json())
      .then(data => setItems(data.items || []))
      .catch(() => setError('Failed to load gallery. Please refresh the page.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout title="Gallery | Zaid Knights Chess Club" description="Photos from Zaid Knights Chess Club events, tournaments, and training sessions.">
      {/* Header */}
      <section className="py-16 border-b border-white/10 chess-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold text-white mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            Photo <span className="gold-gradient">Gallery</span>
          </h1>
          <p className="text-gray-400">Memories from our tournaments and club events</p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => <div key={i} className="skeleton aspect-square rounded-xl" />)}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 glass rounded-xl">
              <p className="text-5xl mb-4">📷</p>
              <p className="text-gray-400">No photos yet. Check back after our next event!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map(item => (
                <div
                  key={item.id}
                  onClick={() => setSelected(item)}
                  className="relative group aspect-square rounded-xl overflow-hidden cursor-pointer bg-white/5 border border-white/10"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <p className="text-white text-sm font-medium">{item.title}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-3xl hover:text-yellow-400 transition-colors"
            onClick={() => setSelected(null)}
          >
            ✕
          </button>
          <div onClick={e => e.stopPropagation()} className="max-w-4xl w-full">
            <img
              src={selected.imageUrl}
              alt={selected.title}
              className="w-full rounded-xl max-h-[80vh] object-contain"
            />
            {(selected.title || selected.caption) && (
              <div className="mt-4 text-center">
                <p className="text-white font-semibold">{selected.title}</p>
                {selected.caption && <p className="text-gray-400 text-sm mt-1">{selected.caption}</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}