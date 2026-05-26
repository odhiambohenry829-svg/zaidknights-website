import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromRequest } from '../../../lib/auth';
import { generateArticleWithClaude } from '../../../lib/ai/claude';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = getUserFromRequest(req as any);
  if (!user || !['ADMIN', 'COACH'].includes(user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { brief, maxTokens } = req.body || {};
  if (!brief || typeof brief !== 'string') return res.status(400).json({ error: 'Missing brief in request body' });

  try {
    const out = await generateArticleWithClaude(brief, maxTokens || 800);
    if (out.error) return res.status(500).json({ error: out.error });
    return res.status(200).json({ success: true, article: out });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || String(err) });
  }
}
