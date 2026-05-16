import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { getUserFromRequest } from '../../../lib/auth';

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { categorySlug, threadSlug, page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    try {
      if (threadSlug) {
        const thread = await prisma.forumThread.findUnique({
          where: { slug: threadSlug as string },
          include: {
            author: { select: { id: true, name: true } },
            category: true,
            posts: {
              orderBy: { createdAt: 'asc' },
              include: { author: { select: { id: true, name: true } } },
            },
            _count: { select: { posts: true } },
          },
        });
        if (!thread) return res.status(404).json({ error: 'Thread not found' });
        // increment views
        await prisma.forumThread.update({ where: { id: thread.id }, data: { views: { increment: 1 } } });
        return res.status(200).json({ thread });
      }

      if (categorySlug) {
        const category = await prisma.forumCategory.findUnique({ where: { slug: categorySlug as string } });
        if (!category) return res.status(404).json({ error: 'Category not found' });

        const [threads, total] = await Promise.all([
          prisma.forumThread.findMany({
            where: { categoryId: category.id },
            orderBy: [{ pinned: 'desc' }, { updatedAt: 'desc' }],
            skip,
            take: parseInt(limit as string),
            include: {
              author: { select: { id: true, name: true } },
              _count: { select: { posts: true } },
              posts: {
                orderBy: { createdAt: 'desc' },
                take: 1,
                include: { author: { select: { name: true } } },
              },
            },
          }),
          prisma.forumThread.count({ where: { categoryId: category.id } }),
        ]);
        return res.status(200).json({ threads, total, category });
      }

      const threads = await prisma.forumThread.findMany({
        orderBy: [{ pinned: 'desc' }, { updatedAt: 'desc' }],
        take: 20,
        include: {
          author: { select: { id: true, name: true } },
          category: true,
          _count: { select: { posts: true } },
        },
      });
      return res.status(200).json({ threads });
    } catch (err) {
      console.error('Threads GET error:', err);
      return res.status(500).json({ error: 'Failed to fetch threads' });
    }
  }

  if (req.method === 'POST') {
    const user = getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { categoryId, title, content } = req.body;
    if (!categoryId || !title || !content) return res.status(400).json({ error: 'categoryId, title, content required' });

    try {
      const slug = slugify(title);
      const thread = await prisma.forumThread.create({
        data: {
          categoryId,
          authorId: user.id,
          title: title.slice(0, 200),
          slug,
          posts: {
            create: {
              authorId: user.id,
              content: content.slice(0, 10000),
            },
          },
        },
        include: {
          author: { select: { id: true, name: true } },
          posts: { include: { author: { select: { id: true, name: true } } } },
        },
      });
      return res.status(201).json({ thread });
    } catch (err) {
      console.error('Threads POST error:', err);
      return res.status(500).json({ error: 'Failed to create thread' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
