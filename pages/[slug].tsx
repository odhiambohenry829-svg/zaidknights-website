import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../../components/common/Layout';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  imageUrl?: string;
  createdAt: string;
  author: { name: string };
}

export default function BlogPostPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/posts?slug=${slug}`)
      .then(r => r.json())
      .then(data => setPost(data.post || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto px-4 py-20">
          <div className="skeleton h-12 rounded mb-4 w-3/4" />
          <div className="skeleton h-6 rounded mb-8 w-1/2" />
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => <div key={i} className="skeleton h-4 rounded" />)}
          </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="text-center py-32">
          <p className="text-5xl mb-4">📄</p>
          <h1 className="text-2xl text-white mb-3">Post not found</h1>
          <Link href="/blog" className="btn-secondary">← Back to Blog</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`${post.title} | Zaid Knights Blog`} description={post.excerpt}>
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        {/* Back */}
        <Link href="/blog" className="text-gray-500 hover:text-yellow-400 text-sm transition-colors flex items-center gap-1 mb-8">
          ← Back to Blog
        </Link>

        {/* Meta */}
        <div className="flex items-center gap-3 mb-6">
          <span className="badge-gold capitalize">{post.category}</span>
          <span className="text-gray-500 text-sm">
            {new Date(post.createdAt).toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
          {post.title}
        </h1>
        <p className="text-gray-400 mb-6">By <span className="text-gray-300">{post.author.name}</span></p>

        {/* Cover Image */}
        {post.imageUrl && (
          <div className="rounded-xl overflow-hidden mb-10 h-64 md:h-80">
            <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-invert prose-yellow max-w-none text-gray-300 leading-relaxed"
          style={{ whiteSpace: 'pre-wrap' }}
        >
          {post.content}
        </div>
      </article>
    </Layout>
  );
}