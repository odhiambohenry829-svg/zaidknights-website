import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  
  try {
    const { name, email, password } = req.body;
    return res.status(200).json({ 
      message: 'API is working!', 
      received: { name, email, password: '***' },
      env: {
        hasDbUrl: !!process.env.DATABASE_URL,
        hasJwtSecret: !!process.env.JWT_SECRET,
      }
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}