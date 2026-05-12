import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/common/Layout';
import SkeletonCard from '../../components/ui/SkeletonCard';
import Badge from '../../components/ui/Badge';
import Toast from '../../components/ui/Toast';
import type { BadgeVariant } from '../../components/ui/Badge';

interface Post {
  id:        string;
  title:     string;
  slug:      string;
  excerpt:   string | null;
  content:   string | null;
  category:  string;
  imageUrl:  string | null;
  createdAt: string;
  author:    { name: string | null };
}

const CATEGORY_COLORS: Record<string, BadgeVariant> = {
  tournament: 'gold',
  tips:       'blue',
  news:       'green',
  coaching:   'purple',
};
function catColor(c: string): BadgeVariant {
  return CATEGORY_COLORS[c.toLowerCase()] ?? 'gray';
}

function getInitials(name: string | null) {
  if (!name) return 'ZK';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function renderContent(content: string) {
  return content
    .split('\n\n')
    .filter(Boolean)
    .map((para, i) => (
      <p key={i} className="text-gray-300 leading-relaxed mb-4">
        {para.trim()}
      </p>
    ));
}

export default function BlogPostPage() {
  const router = useRouter();
  const { slug } = router.query;

  const [post,    setPost]    = useState<Post | null>(null);
  const [related, setRelated] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [toast,   setToast]   = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/posts?slug=${encodeURIComponent(slug as string)}`)
      .then(res => res.json())
      .then(data => {
        if (!data.post) { setNotFound(true); return; }
        setPost(data.post);
        setRelated(data.related ?? []);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleShare = (method: 'copy' | 'whatsapp' | 'twitter') => {
    const url   = window.location.href;
    const title = post?.title ?? 'Zaid Knights Chess Club';
    if (method === 'copy') {
      navigator.clipboard.writeText(url).then(() =>
        setToast('Link copied to clipboard!')
      ).catch(() => setToast('Could not copy link'));
    } else if (method === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(title + '\n' + url)}`, '_blank');
    } else {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
    }
  };

  if (loading) {
    return (
      <Layout title="Loading… | Zaid Knights">
        <div className="max-w-3xl mx-auto px-4 py-16 space-y-6">
          <SkeletonCard rows={1} height="h-8" />
          <SkeletonCard rows={6} height="h-4" />
        </div>
      </Layout>
    );
  }

  if (notFound || !post) {
    return (
      <Layout title="Post Not Found | Zaid Knights Chess Club">
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
          <div className="text-7xl mb-6 opacity-20">♟</div>
          <h1 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            Post not found
          </h1>
          <p className="text-gray-400 mb-8">This article doesn&apos;t exist or has been removed.</p>
          <Link href="/blog" className="btn-primary">Browse All Posts →</Link>
        </div>
      </Layout>
    );
  }

  const authorName     = post.author.name ?? 'Zaid Knights';
  const authorInitials = getInitials(post.author.name);
  const publishDate    = new Date(post.createdAt).toLocaleDateString('en-KE', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <Layout
      title={`${post.title} | Zaid Knights Chess Club`}
      description={post.excerpt ?? undefined}
      ogImage={post.imageUrl ?? undefined}
    >
      {toast && <Toast message={toast} type="success" onClose={() => setToast(null)} />}

      {/* Back Button */}
      <div className="max-w-3xl mx-auto px-4 pt-8">
        <Link href="/blog" className="inline-flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition-colors text-sm">
          ← Back to Blog
        </Link>
      </div>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-4 py-8">
        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <Badge variant={catColor(post.category)}>{post.category}</Badge>
          <span className="text-gray-500 text-sm">{publishDate}</span>
          <span className="text-gray-600 text-sm">·</span>
          <span className="text-gray-400 text-sm flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-yellow-500/20 border border-yellow-500/30 inline-flex items-center justify-center text-yellow-400 text-xs font-bold">
              {authorInitials}
            </span>
            {authorName}
          </span>
        </div>

        {/* Title */}
        <h1
          className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          {post.title}
        </h1>

        {/* Cover Image */}
        {post.imageUrl && (
          <div className="rounded-2xl overflow-hidden mb-8 h-64 md:h-80 bg-white/5">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="prose-dark">
          {post.content
            ? renderContent(post.content)
            : <p className="text-gray-400">No content available.</p>
          }
        </div>

        {/* Share Buttons */}
        <div className="mt-10 pt-8 border-t border-white/10">
          <p className="text-gray-400 text-sm mb-4">Share this article</p>
          <div className="flex gap-3 flex-wrap">
            <button onClick={() => handleShare('copy')} className="btn-secondary text-sm px-4 py-2">
              🔗 Copy Link
            </button>
            <button onClick={() => handleShare('whatsapp')} className="bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 px-4 py-2 rounded-lg text-sm font-medium transition-all">
              💬 WhatsApp
            </button>
            <button onClick={() => handleShare('twitter')} className="bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 px-4 py-2 rounded-lg text-sm font-medium transition-all">
              𝕏 Twitter/X
            </button>
          </div>
        </div>

        {/* Author Box */}
        <div className="mt-8 glass p-6 rounded-xl flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-yellow-500/20 border-2 border-yellow-500/30 flex items-center justify-center text-xl font-bold text-yellow-400 flex-shrink-0">
            {authorInitials}
          </div>
          <div>
            <p className="text-white font-semibold">{authorName}</p>
            <p className="text-gray-400 text-xs mt-0.5">Zaid Knights Chess Club</p>
            <p className="text-gray-500 text-sm mt-2">
              Passionate about chess and dedicated to growing the game across Kenya.
            </p>
          </div>
        </div>

        {/* Back to Blog */}
        <div className="mt-8 text-center">
          <Link href="/blog" className="btn-secondary">← Back to Blog</Link>
        </div>
      </article>

      {/* Related Posts */}
      {related.length > 0 && (
        <section className="py-16 px-4" style={{ background: 'var(--dark-2)' }}>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
              Related Articles
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {related.map(p => (
                <Link key={p.id} href={`/blog/${p.slug}`} className="group">
                  <div className="glass-hover rounded-xl overflow-hidden h-full">
                    {p.imageUrl ? (
                      <div className="h-36 bg-white/5 overflow-hidden">
                        <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    ) : (
                      <div className="h-36 bg-white/5 flex items-center justify-center text-4xl opacity-10">♟</div>
                    )}
                    <div className="p-4">
                      <Badge variant={catColor(p.category)} className="mb-2">{p.category}</Badge>
                      <h3 className="text-white text-sm font-semibold line-clamp-2 group-hover:text-yellow-400 transition-colors">
                        {p.title}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}
