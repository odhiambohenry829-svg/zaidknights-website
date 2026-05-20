import { useState } from 'react';
import Image from 'next/image';
import Layout from '../components/common/Layout';

const PHOTOS = [
  { src: '/images/gallery/20251019_161800.jpg',   caption: 'Club session in action' },
  { src: '/images/gallery/20251019_161816.jpg',   caption: 'Strategic thinking at work' },
  { src: '/images/gallery/20251019_161839.jpg',   caption: 'National level competition' },
  { src: '/images/gallery/20251019_161843.jpg',   caption: 'Intense concentration' },
  { src: '/images/gallery/20251019_161846.jpg',   caption: 'Zaid Knights members' },
  { src: '/images/gallery/20251019_161851.jpg',   caption: 'Chess training session' },
  { src: '/images/gallery/20251019_161853.jpg',   caption: 'Club championship' },
  { src: '/images/gallery/20251018_090237.jpg',   caption: 'Morning training' },
  { src: '/images/gallery/20251018_090240.jpg',   caption: 'Players in focus' },
  { src: '/images/gallery/20251018_090259.jpg',   caption: 'Group training session' },
  { src: '/images/gallery/20251018_090305.jpg',   caption: 'Sharpening great minds' },
  { src: '/images/gallery/20251018_090306.jpg',   caption: 'Club members at play' },
  { src: '/images/gallery/20251018_090307.jpg',   caption: 'Competitive chess' },
  { src: '/images/gallery/20251018_090319.jpg',   caption: 'Tournament day' },
  { src: '/images/gallery/20251018_090321.jpg',   caption: 'Chess champions' },
  { src: '/images/gallery/20251018_093006.jpg',   caption: 'Club activity' },
  { src: '/images/gallery/20251018_093329.jpg',   caption: 'Members in action' },
  { src: '/images/gallery/20251014_171920.jpg',   caption: 'Training day' },
  { src: '/images/gallery/20251014_171923.jpg',   caption: 'Chess match' },
  { src: '/images/gallery/20251014_172114.jpg',   caption: 'Club community' },
  { src: '/images/gallery/20251014_172122.jpg',   caption: 'Players focus' },
  { src: '/images/gallery/20251014_172509.jpg',   caption: 'Game in progress' },
  { src: '/images/gallery/20251019_084248.jpg',   caption: 'Representing Kenya' },
  { src: '/images/gallery/20251019_084250.jpg',   caption: 'National championship' },
  { src: '/images/gallery/20251019_085953.jpg',   caption: 'Tournament players' },
  { src: '/images/gallery/20251112_151315.jpg',   caption: 'School partnership session' },
  { src: '/images/gallery/20251112_155423.jpg',   caption: 'Junior players training' },
  { src: '/images/gallery/20251119_151514.jpg',   caption: 'Club event' },
  { src: '/images/gallery/20251003_194648.jpg',   caption: 'Evening session' },
  { src: '/images/gallery/20251003_194651.jpg',   caption: 'Club members' },
  { src: '/images/gallery/Snapchat-583996864.jpg', caption: 'Zaid Knights moments' },
];

export default function GalleryPage() {
  const [selected, setSelected] = useState<number | null>(null);

  const prev = () => setSelected(i => i !== null ? (i - 1 + PHOTOS.length) % PHOTOS.length : null);
  const next = () => setSelected(i => i !== null ? (i + 1) % PHOTOS.length : null);

  return (
    <Layout title="Gallery | Zaid Knights Chess Club" description="Photos from Zaid Knights Chess Club events, training sessions and tournaments.">

      {/* Hero */}
      <section className="py-16 px-4 chess-pattern">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-yellow-400 text-sm uppercase tracking-widest mb-2">📸 Our Moments</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Gallery
          </h1>
          <p className="text-gray-400">Memories from our training sessions, tournaments and club activities</p>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {PHOTOS.map((photo, i) => (
              <div
                key={i}
                onClick={() => setSelected(i)}
                className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
              >
                <Image
                  src={photo.src}
                  alt={photo.caption}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-end">
                  <p className="text-white text-xs p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {photo.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {selected !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <button
            onClick={e => { e.stopPropagation(); prev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xl z-10"
          >
            ←
          </button>

          <div className="relative max-w-4xl max-h-[85vh] w-full" onClick={e => e.stopPropagation()}>
            <Image
              src={PHOTOS[selected].src}
              alt={PHOTOS[selected].caption}
              width={1200}
              height={800}
              className="object-contain w-full h-full max-h-[80vh] rounded-xl"
            />
            <p className="text-white text-center mt-3 text-sm">{PHOTOS[selected].caption}</p>
            <p className="text-gray-500 text-center text-xs mt-1">{selected + 1} / {PHOTOS.length}</p>
          </div>

          <button
            onClick={e => { e.stopPropagation(); next(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xl z-10"
          >
            →
          </button>

          <button
            onClick={() => setSelected(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            ✕
          </button>
        </div>
      )}
    </Layout>
  );
}
