/**
 * Route לנתוני Analytics של המרצה, המחושבים באמצעות Aggregation ב-SQL.
 * ההערות בקובץ מסבירות את הזרימה וההחלטות המרכזיות בפרויקט.
 */
import express from "express";
import { query } from "../db/pool.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
export const analyticsRoutes = express.Router();
// רק מרצה מחובר יכול לראות Analytics של הכיתה.
analyticsRoutes.use(requireAuth, requireRole("teacher"));
// SQL Aggregation לחישוב ממוצע, מקסימום, מינימום וספירות.
analyticsRoutes.get("/teacher", async (req, res, next) => {
  try {
    const r = await query(
      `SELECT COUNT(DISTINCT e.id)::int exams_count,COUNT(DISTINCT CASE WHEN e.status='published' THEN e.id END)::int published_count,COUNT(s.id)::int submissions_count,COALESCE(ROUND(AVG(s.grade)),0)::int class_average,COALESCE(MAX(s.grade),0)::int highest_grade,COALESCE(MIN(s.grade),0)::int lowest_grade,COUNT(DISTINCT s.student_id)::int active_students FROM exams e LEFT JOIN submissions s ON s.exam_id=e.id WHERE e.teacher_id=$1`,
      [req.user.id],
    );
    res.json({ analytics: r.rows[0] });
  } catch (e) {
    next(e);
  }
});
