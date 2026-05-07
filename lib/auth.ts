import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import type { NextApiRequest } from 'next';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is not set');

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password: string, hashed: string) {
  return bcrypt.compare(password, hashed);
}

export function signToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET!, { expiresIn: '7d' });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET!) as {
      id: string;
      email: string;
      role: string;
    };
  } catch {
    return null;
  }
}

export function getTokenFromRequest(req: NextApiRequest) {
  const cookie = req.headers.cookie || '';
  const match = cookie.match(/(?:^|;\s*)token=([^;]+)/);
  return match ? match[1] : null;
}

export function getUserFromRequest(req: NextApiRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
}