import express from 'express';
import { randomUUID } from 'crypto';
import { query } from '../db/pool.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { toExam, toSubmission } from '../utils/mappers.js';
import { calculateGrade } from '../utils/grading.js';
import { validateAnswers } from '../utils/validators.js';

export const submissionRoutes = express.Router();

submissionRoutes.use(requireAuth);

submissionRoutes.get('/', async (req, res, next) => {
  try {
    let result;
    if (req.user.role === 'teacher') {
      result = await query(
        `SELECT s.*, e.title AS exam_title, u.full_name AS student_name, u.email AS student_email
         FROM submissions s
         JOIN exams e ON e.id = s.exam_id
         JOIN users u ON u.id = s.student_id
         WHERE e.teacher_id = $1
         ORDER BY s.submitted_at DESC;`,
        [req.user.id]
      );
    } else {
      result = await query(
        `SELECT s.*, e.title AS exam_title, u.full_name AS student_name, u.email AS student_email
         FROM submissions s
         JOIN exams e ON e.id = s.exam_id
         JOIN users u ON u.id = s.student_id
         WHERE s.student_id = $1 AND s.is_published = TRUE
         ORDER BY s.submitted_at DESC;`,
        [req.user.id]
      );
    }
    res.json({ submissions: result.rows.map(toSubmission) });
  } catch (error) {
    next(error);
  }
});

submissionRoutes.post('/exams/:examId/submit', requireRole('student'), async (req, res, next) => {
  try {
    const answers = req.body.answers || [];
    const errors = validateAnswers(answers);
    if (errors.length) return res.status(400).json({ message: errors.join(', ') });

    const examResult = await query("SELECT * FROM exams WHERE id = $1 AND status = 'published';", [req.params.examId]);
    const exam = toExam(examResult.rows[0]);
    if (!exam) return res.status(404).json({ message: 'Published exam not found' });
    if (answers.length !== exam.questions.length) return res.status(400).json({ message: 'Please answer all questions before submitting' });

    const grade = calculateGrade(exam.questions, answers);
    const id = randomUUID();
    const result = await query(
      `INSERT INTO submissions (id, exam_id, student_id, answers, grade, is_published)
       VALUES ($1, $2, $3, $4::jsonb, $5, TRUE)
       ON CONFLICT (exam_id, student_id)
       DO UPDATE SET answers = EXCLUDED.answers, grade = EXCLUDED.grade, submitted_at = NOW(), updated_at = NOW()
       RETURNING *;`,
      [id, exam.id, req.user.id, JSON.stringify(answers), grade]
    );

    res.status(201).json({ submission: toSubmission(result.rows[0]) });
  } catch (error) {
    next(error);
  }
});

submissionRoutes.patch('/:id/grade', requireRole('teacher'), async (req, res, next) => {
  try {
    const grade = Number(req.body.grade);
    const feedback = String(req.body.feedback || '').trim();
    const isPublished = req.body.isPublished !== undefined ? Boolean(req.body.isPublished) : true;

    if (!Number.isInteger(grade) || grade < 0 || grade > 100) {
      return res.status(400).json({ message: 'Grade must be an integer between 0 and 100' });
    }

    const result = await query(
      `UPDATE submissions s
       SET grade = $1, feedback = $2, is_published = $3, updated_at = NOW()
       FROM exams e
       WHERE s.id = $4 AND s.exam_id = e.id AND e.teacher_id = $5
       RETURNING s.*;`,
      [grade, feedback, isPublished, req.params.id, req.user.id]
    );

    if (result.rowCount === 0) return res.status(404).json({ message: 'Submission not found' });
    res.json({ submission: toSubmission(result.rows[0]) });
  } catch (error) {
    next(error);
  }
});
