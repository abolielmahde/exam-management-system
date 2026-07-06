import express from 'express';
import { query } from '../db/pool.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const analyticsRoutes = express.Router();

analyticsRoutes.use(requireAuth);
analyticsRoutes.use(requireRole('teacher'));

analyticsRoutes.get('/teacher', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT
         COUNT(DISTINCT e.id)::int AS exams_count,
         COUNT(DISTINCT CASE WHEN e.status = 'published' THEN e.id END)::int AS published_count,
         COUNT(s.id)::int AS submissions_count,
         COALESCE(ROUND(AVG(s.grade)), 0)::int AS class_average,
         COALESCE(MAX(s.grade), 0)::int AS highest_grade,
         COALESCE(MIN(s.grade), 0)::int AS lowest_grade,
         COUNT(DISTINCT s.student_id)::int AS active_students
       FROM exams e
       LEFT JOIN submissions s ON s.exam_id = e.id
       WHERE e.teacher_id = $1;`,
      [req.user.id]
    );
    res.json({ analytics: result.rows[0] });
  } catch (error) {
    next(error);
  }
});
