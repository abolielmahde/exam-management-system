import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { query } from '../db/pool.js';
import { toPublicUser } from '../utils/mappers.js';

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Missing authorization token' });

    const decoded = jwt.verify(token, env.jwtSecret);
    const result = await query('SELECT id, full_name, email, role, created_at FROM users WHERE id = $1;', [decoded.sub]);
    const user = toPublicUser(result.rows[0]);
    if (!user) return res.status(401).json({ message: 'User no longer exists' });

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
    }
    return next();
  };
}
