import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';
import { getUserFromRequest } from '../../lib/auth';
import { sanitizeString, slugify } from '../../lib/validators';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { slug, category } = req.query;

    try {
      // Single post by slug
      if (slug) {
        const post = await prisma.post.findUnique({
          where: { slug: slug as string },
          include: { author: { select: { name: true } } },
        });
        if (!post || !post.published) return res.status(404).json({ post: null });
        return res.status(200).json({ post });
      }

      // List posts
      const posts = await prisma.post.findMany({
        where: {
          published: true,
          ...(category && category !== 'All' && { category: category as string }),
        },
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { name: true } } },
        select: {
          id: true, title: true, slug: true, excerpt: true,
          category: true, imageUrl: true, createdAt: true,
          author: true,
        },
      });
      return res.status(200).json({ posts });
    } catch (err) {
      console.error('Posts GET error:', err);
      return res.status(500).json({ error: 'Failed to fetch posts' });
    }
  }

  if (req.method === 'POST') {
    const user = getUserFromRequest(req);
    if (!user || !['ADMIN', 'COACH'].includes(user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { title, excerpt, content, category, imageUrl, published, tags } = req.body;
    if (!title || !excerpt || !content) return res.status(400).json({ error: 'Missing required fields' });

    try {
      const post = await prisma.post.create({
        data: {
          title: sanitizeString(title),
          slug: slugify(title),
          excerpt: sanitizeString(excerpt),
          content,
          category: category || 'general',
          imageUrl: imageUrl || null,
          published: published ?? false,
          tags: tags || [],
          authorId: user.id,
        },
      });
      return res.status(201).json({ post });
    } catch (err) {
      console.error('Posts POST error:', err);
      return res.status(500).json({ error: 'Failed to create post' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}