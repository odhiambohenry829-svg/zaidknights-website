import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) return res.status(500).json({ error: 'Google OAuth not configured' });

  const baseUrl  = process.env.NEXT_PUBLIC_SITE_URL || `https://${req.headers.host}`;
  const callback = `${baseUrl}/api/auth/google/callback`;

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  callback,
    response_type: 'code',
    scope:         'openid email profile',
    access_type:   'online',
    prompt:        'select_account',
  });

  return res.redirect(302, `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}
