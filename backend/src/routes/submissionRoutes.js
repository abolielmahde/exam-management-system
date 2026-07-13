/**
 * Routes להגשות: שליפה, הגשת תשובות ועדכון ציון ומשוב.
 * ההערות בקובץ מסבירות את הזרימה וההחלטות המרכזיות בפרויקט.
 */
import express from "express";
import { randomUUID } from "crypto";
import { query } from "../db/pool.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { toExam, toSubmission } from "../utils/mappers.js";
import { calculateGrade } from "../utils/grading.js";
export const submissionRoutes = express.Router();
// כל פעולות ההגשות דורשות JWT תקין.
submissionRoutes.use(requireAuth);
// החזרת הגשות לפי Role: למרצה הגשות למבחניו, לסטודנט תוצאותיו.
submissionRoutes.get("/", async (req, res, next) => {
  try {
    const sql =
      req.user.role === "teacher"
        ? `SELECT s.*,e.title exam_title,u.full_name student_name,u.email student_email FROM submissions s JOIN exams e ON e.id=s.exam_id JOIN users u ON u.id=s.student_id WHERE e.teacher_id=$1 ORDER BY s.submitted_at DESC`
        : `SELECT s.*,e.title exam_title,u.full_name student_name,u.email student_email FROM submissions s JOIN exams e ON e.id=s.exam_id JOIN users u ON u.id=s.student_id WHERE s.student_id=$1 AND s.is_published=TRUE ORDER BY s.submitted_at DESC`;
    const r = await query(sql, [req.user.id]);
    res.json({ submissions: r.rows.map(toSubmission) });
  } catch (e) {
    next(e);
  }
});
// הגשת מבחן: בדיקת סטטוס, חישוב ציון ושמירה ב-PostgreSQL.
submissionRoutes.post(
  "/exams/:examId/submit",
  requireRole("student"),
  async (req, res, next) => {
    try {
      const answers = req.body.answers || [];
      const er = await query(
        "SELECT * FROM exams WHERE id=$1 AND status='published'",
        [req.params.examId],
      );
      const exam = toExam(er.rows[0]);
      if (!exam)
        return res.status(404).json({ message: "Published exam not found" });
      if (answers.length !== exam.questions.length)
        return res
          .status(400)
          .json({ message: "Please answer all questions before submitting" });
      const grade = calculateGrade(exam.questions, answers);
      const r = await query(
        "INSERT INTO submissions(id,exam_id,student_id,answers,grade,is_published) VALUES($1,$2,$3,$4::jsonb,$5,TRUE) ON CONFLICT(exam_id,student_id) DO UPDATE SET answers=EXCLUDED.answers,grade=EXCLUDED.grade,submitted_at=NOW(),updated_at=NOW() RETURNING *",
        [randomUUID(), exam.id, req.user.id, JSON.stringify(answers), grade],
      );
      res.status(201).json({ submission: toSubmission(r.rows[0]) });
    } catch (e) {
      next(e);
    }
  },
);
// עדכון ידני של ציון, Feedback וסטטוס פרסום על ידי המרצה.
submissionRoutes.patch(
  "/:id/grade",
  requireRole("teacher"),
  async (req, res, next) => {
    try {
      const grade = Number(req.body.grade),
        feedback = String(req.body.feedback || ""),
        published =
          req.body.isPublished !== undefined
            ? Boolean(req.body.isPublished)
            : true;
      if (!Number.isInteger(grade) || grade < 0 || grade > 100)
        return res
          .status(400)
          .json({ message: "Grade must be between 0 and 100" });
      const r = await query(
        "UPDATE submissions s SET grade=$1,feedback=$2,is_published=$3,updated_at=NOW() FROM exams e WHERE s.id=$4 AND s.exam_id=e.id AND e.teacher_id=$5 RETURNING s.*",
        [grade, feedback, published, req.params.id, req.user.id],
      );
      if (!r.rowCount)
        return res.status(404).json({ message: "Submission not found" });
      res.json({ submission: toSubmission(r.rows[0]) });
    } catch (e) {
      next(e);
    }
  },
);
