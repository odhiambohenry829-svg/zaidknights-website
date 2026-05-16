import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { getUserFromRequest } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const user = getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { threadId, content } = req.body;
    if (!threadId || !content) return res.status(400).json({ error: 'threadId and content required' });

    try {
      const thread = await prisma.forumThread.findUnique({ where: { id: threadId } });
      if (!thread) return res.status(404).json({ error: 'Thread not found' });
      if (thread.locked && !['ADMIN', 'COACH'].includes(user.role)) {
        return res.status(403).json({ error: 'Thread is locked' });
      }

      const post = await prisma.forumPost.create({
        data: { threadId, authorId: user.id, content: content.slice(0, 10000) },
        include: { author: { select: { id: true, name: true } } },
      });

      await prisma.forumThread.update({
        where: { id: threadId },
        data: { updatedAt: new Date() },
      });

      return res.status(201).json({ post });
    } catch (err) {
      console.error('Posts POST error:', err);
      return res.status(500).json({ error: 'Failed to create post' });
    }
  }

  if (req.method === 'DELETE') {
    const user = getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { postId } = req.query;
    try {
      const post = await prisma.forumPost.findUnique({ where: { id: postId as string } });
      if (!post) return res.status(404).json({ error: 'Post not found' });

      const canDelete = post.authorId === user.id || ['ADMIN', 'COACH'].includes(user.role);
      if (!canDelete) return res.status(403).json({ error: 'Forbidden' });

      await prisma.forumPost.delete({ where: { id: postId as string } });
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('Posts DELETE error:', err);
      return res.status(500).json({ error: 'Failed to delete post' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
