import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';
import { getUserFromRequest } from '../../lib/auth';
import { sanitizeString, slugify } from '../../lib/validators';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    if (req.query.admin === 'true') {
      const user = getUserFromRequest(req);
      if (!user || !['ADMIN', 'COACH'].includes(user.role)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      try {
        const posts = await prisma.post.findMany({
          orderBy: { createdAt: 'desc' },
          select: {
            id: true, title: true, slug: true, excerpt: true,
            category: true, imageUrl: true, tags: true,
            published: true, createdAt: true,
            author: { select: { name: true } },
          },
        });
        return res.status(200).json({ posts });
      } catch (err) {
        console.error('Posts admin GET error:', err);
        return res.status(500).json({ error: 'Failed to fetch posts' });
      }
    }

    const { slug, category } = req.query;
    const page  = parseInt((req.query.page  as string) || '1');
    const limit = parseInt((req.query.limit as string) || '6');
    const skip  = (page - 1) * limit;

    try {
      if (slug) {
        const post = await prisma.post.findUnique({
          where:   { slug: slug as string },
          include: { author: { select: { name: true } } },
        });
        if (!post || !post.published) return res.status(404).json({ post: null });

        const related = await prisma.post.findMany({
          where: {
            published: true,
            category:  post.category,
            id:        { not: post.id },
          },
          take:    3,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true, title: true, slug: true, excerpt: true,
            category: true, imageUrl: true, createdAt: true,
            author: { select: { name: true } },
          },
        });
        return res.status(200).json({ post, related });
      }

      const where = {
        published: true,
        ...(category && category !== 'all' ? { category: category as string } : {}),
      };

      const [posts, total] = await Promise.all([
        prisma.post.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          select: {
            id: true, title: true, slug: true, excerpt: true,
            category: true, imageUrl: true, createdAt: true,
            author: { select: { name: true } },
          },
        }),
        prisma.post.count({ where }),
      ]);

      return res.status(200).json({
        posts,
        total,
        page,
        pages:   Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      });
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
    if (!title || !excerpt || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
      const post = await prisma.post.create({
        data: {
          title:     sanitizeString(title),
          slug:      slugify(title),
          excerpt:   sanitizeString(excerpt),
          content,
          category:  category  || 'general',
          imageUrl:  imageUrl  || null,
          published: published ?? false,
          tags:      tags      || [],
          authorId:  user.id,
        },
      });
      return res.status(201).json({ post });
    } catch (err) {
      console.error('Posts POST error:', err);
      return res.status(500).json({ error: 'Failed to create post' });
    }
  }

  if (req.method === 'PATCH') {
    const user = getUserFromRequest(req);
    if (!user || !['ADMIN', 'COACH'].includes(user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { id, published, title, excerpt, content, category, imageUrl, tags } = req.body;
    if (!id) return res.status(400).json({ error: 'id is required' });
    try {
      const post = await prisma.post.update({
        where: { id },
        data: {
          ...(published  !== undefined && { published }),
          ...(title      !== undefined && { title: sanitizeString(title) }),
          ...(excerpt    !== undefined && { excerpt: sanitizeString(excerpt) }),
          ...(content    !== undefined && { content }),
          ...(category   !== undefined && { category }),
          ...(imageUrl   !== undefined && { imageUrl }),
          ...(tags       !== undefined && { tags }),
        },
      });
      return res.status(200).json({ post });
    } catch (err) {
      console.error('Posts PATCH error:', err);
      return res.status(500).json({ error: 'Failed to update post' });
    }
  }

  if (req.method === 'DELETE') {
    const user = getUserFromRequest(req);
    if (!user || !['ADMIN', 'COACH'].includes(user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'id is required' });
    try {
      await prisma.post.delete({ where: { id } });
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error('Posts DELETE error:', err);
      return res.status(500).json({ error: 'Failed to delete post' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
