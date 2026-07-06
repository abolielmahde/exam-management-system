import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { env } from '../config/env.js';
import { query } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { toPublicUser } from '../utils/mappers.js';
import { validateRegistration } from '../utils/validators.js';

export const authRoutes = express.Router();

function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role, email: user.email }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

authRoutes.post('/register', async (req, res, next) => {
  try {
    const payload = {
      fullName: String(req.body.fullName || '').trim(),
      email: String(req.body.email || '').trim().toLowerCase(),
      password: String(req.body.password || ''),
      role: req.body.role
    };

    const errors = validateRegistration(payload);
    if (errors.length) return res.status(400).json({ message: errors.join(', ') });

    const passwordHash = await bcrypt.hash(payload.password, 10);
    const result = await query(
      `INSERT INTO users (id, full_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, full_name, email, role, created_at;`,
      [randomUUID(), payload.fullName, payload.email, passwordHash, payload.role]
    );

    const user = toPublicUser(result.rows[0]);
    res.status(201).json({ user, token: signToken(user) });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ message: 'Email already exists' });
    return next(error);
  }
});

authRoutes.post('/login', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    const result = await query('SELECT * FROM users WHERE email = $1;', [email]);
    const row = result.rows[0];
    if (!row) return res.status(401).json({ message: 'Invalid email or password' });

    const ok = await bcrypt.compare(password, row.password_hash);
    if (!ok) return res.status(401).json({ message: 'Invalid email or password' });

    const user = toPublicUser(row);
    res.json({ user, token: signToken(user) });
  } catch (error) {
    next(error);
  }
});

authRoutes.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});
