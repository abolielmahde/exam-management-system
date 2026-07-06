import express from 'express';
import { randomUUID } from 'crypto';
import { query } from '../db/pool.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { toExam } from '../utils/mappers.js';
import { validateExam } from '../utils/validators.js';

export const examRoutes = express.Router();

examRoutes.use(requireAuth);

examRoutes.get('/', async (req, res, next) => {
  try {
    let result;
    if (req.user.role === 'teacher') {
      result = await query('SELECT * FROM exams WHERE teacher_id = $1 ORDER BY created_at DESC;', [req.user.id]);
    } else {
      result = await query("SELECT * FROM exams WHERE status = 'published' ORDER BY created_at DESC;");
    }
    res.json({ exams: result.rows.map(toExam) });
  } catch (error) {
    next(error);
  }
});

examRoutes.get('/:id', async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM exams WHERE id = $1;', [req.params.id]);
    const exam = toExam(result.rows[0]);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    if (req.user.role === 'teacher' && exam.teacherId !== req.user.id) {
      return res.status(403).json({ message: 'You can access only your own exams' });
    }
    if (req.user.role === 'student' && exam.status !== 'published') {
      return res.status(403).json({ message: 'This exam is not available for students' });
    }

    return res.json({ exam });
  } catch (error) {
    next(error);
  }
});

examRoutes.post('/', requireRole('teacher'), async (req, res, next) => {
  try {
    const payload = {
      title: String(req.body.title || '').trim(),
      course: String(req.body.course || '').trim(),
      description: String(req.body.description || '').trim(),
      durationMinutes: Number(req.body.durationMinutes || 30),
      status: req.body.status || 'draft',
      questions: req.body.questions || []
    };

    const errors = validateExam(payload);
    if (errors.length) return res.status(400).json({ message: errors.join(', ') });

    const result = await query(
      `INSERT INTO exams (id, teacher_id, title, course, description, duration_minutes, status, questions)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
       RETURNING *;`,
      [randomUUID(), req.user.id, payload.title, payload.course, payload.description, payload.durationMinutes, payload.status, JSON.stringify(payload.questions)]
    );

    res.status(201).json({ exam: toExam(result.rows[0]) });
  } catch (error) {
    next(error);
  }
});

examRoutes.put('/:id', requireRole('teacher'), async (req, res, next) => {
  try {
    const current = await query('SELECT * FROM exams WHERE id = $1 AND teacher_id = $2;', [req.params.id, req.user.id]);
    if (current.rowCount === 0) return res.status(404).json({ message: 'Exam not found' });

    const existing = toExam(current.rows[0]);
    const payload = {
      title: req.body.title ?? existing.title,
      course: req.body.course ?? existing.course,
      description: req.body.description ?? existing.description,
      durationMinutes: req.body.durationMinutes ?? existing.durationMinutes,
      status: req.body.status ?? existing.status,
      questions: req.body.questions ?? existing.questions
    };

    const errors = validateExam(payload, true);
    if (errors.length) return res.status(400).json({ message: errors.join(', ') });

    const result = await query(
      `UPDATE exams
       SET title = $1, course = $2, description = $3, duration_minutes = $4,
           status = $5, questions = $6::jsonb, updated_at = NOW()
       WHERE id = $7 AND teacher_id = $8
       RETURNING *;`,
      [payload.title, payload.course, payload.description, Number(payload.durationMinutes), payload.status, JSON.stringify(payload.questions), req.params.id, req.user.id]
    );

    res.json({ exam: toExam(result.rows[0]) });
  } catch (error) {
    next(error);
  }
});

examRoutes.delete('/:id', requireRole('teacher'), async (req, res, next) => {
  try {
    const result = await query('DELETE FROM exams WHERE id = $1 AND teacher_id = $2 RETURNING id;', [req.params.id, req.user.id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Exam not found' });
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
});
