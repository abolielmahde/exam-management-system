/**
 * Routes לניהול מבחנים: שליפה, יצירה, עריכה, פרסום, סגירה ומחיקה.
 * ההערות בקובץ מסבירות את הזרימה וההחלטות המרכזיות בפרויקט.
 */
import express from "express";
import { randomUUID } from "crypto";
import { query } from "../db/pool.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { toExam } from "../utils/mappers.js";
import { validateExam } from "../utils/validators.js";
export const examRoutes = express.Router();
// כל פעולות המבחנים דורשות משתמש מחובר.
examRoutes.use(requireAuth);
// מרצה מקבל מבחנים שלו; סטודנט מקבל רק מבחנים שפורסמו.
examRoutes.get("/", async (req, res, next) => {
  try {
    const r =
      req.user.role === "teacher"
        ? await query(
            "SELECT * FROM exams WHERE teacher_id=$1 ORDER BY created_at DESC",
            [req.user.id],
          )
        : await query(
            "SELECT * FROM exams WHERE status='published' ORDER BY created_at DESC",
          );
    res.json({ exams: r.rows.map(toExam) });
  } catch (e) {
    next(e);
  }
});
// שליפת מבחן יחיד תוך בדיקת הרשאה לצפות בו.
examRoutes.get("/:id", async (req, res, next) => {
  try {
    const r = await query("SELECT * FROM exams WHERE id=$1", [req.params.id]);
    const exam = toExam(r.rows[0]);
    if (!exam) return res.status(404).json({ message: "Exam not found" });
    if (req.user.role === "teacher" && exam.teacherId !== req.user.id)
      return res
        .status(403)
        .json({ message: "You can access only your own exams" });
    if (req.user.role === "student" && exam.status !== "published")
      return res.status(403).json({ message: "This exam is not available" });
    res.json({ exam });
  } catch (e) {
    next(e);
  }
});
// יצירת מבחן חדש מותרת רק למרצה.
examRoutes.post("/", requireRole("teacher"), async (req, res, next) => {
  try {
    const d = {
      title: String(req.body.title || "").trim(),
      course: String(req.body.course || "").trim(),
      description: String(req.body.description || "").trim(),
      durationMinutes: Number(req.body.durationMinutes || 30),
      status: req.body.status || "draft",
      questions: req.body.questions || [],
    };
    const e = validateExam(d);
    if (e.length) return res.status(400).json({ message: e.join(", ") });
    const r = await query(
      "INSERT INTO exams(id,teacher_id,title,course,description,duration_minutes,status,questions) VALUES($1,$2,$3,$4,$5,$6,$7,$8::jsonb) RETURNING *",
      [
        randomUUID(),
        req.user.id,
        d.title,
        d.course,
        d.description,
        d.durationMinutes,
        d.status,
        JSON.stringify(d.questions),
      ],
    );
    res.status(201).json({ exam: toExam(r.rows[0]) });
  } catch (e) {
    next(e);
  }
});
// עדכון מבחן מתבצע רק אם הוא שייך למרצה המחובר.
examRoutes.put("/:id", requireRole("teacher"), async (req, res, next) => {
  try {
    const cur = await query(
      "SELECT * FROM exams WHERE id=$1 AND teacher_id=$2",
      [req.params.id, req.user.id],
    );
    if (!cur.rowCount)
      return res.status(404).json({ message: "Exam not found" });
    const old = toExam(cur.rows[0]);
    const d = {
      title: req.body.title ?? old.title,
      course: req.body.course ?? old.course,
      description: req.body.description ?? old.description,
      durationMinutes: req.body.durationMinutes ?? old.durationMinutes,
      status: req.body.status ?? old.status,
      questions: req.body.questions ?? old.questions,
    };
    const e = validateExam(d);
    if (e.length) return res.status(400).json({ message: e.join(", ") });
    const r = await query(
      "UPDATE exams SET title=$1,course=$2,description=$3,duration_minutes=$4,status=$5,questions=$6::jsonb,updated_at=NOW() WHERE id=$7 AND teacher_id=$8 RETURNING *",
      [
        d.title,
        d.course,
        d.description,
        Number(d.durationMinutes),
        d.status,
        JSON.stringify(d.questions),
        req.params.id,
        req.user.id,
      ],
    );
    res.json({ exam: toExam(r.rows[0]) });
  } catch (e) {
    next(e);
  }
});
// מחיקת מבחן והגשות קשורות באמצעות ON DELETE CASCADE.
examRoutes.delete("/:id", requireRole("teacher"), async (req, res, next) => {
  try {
    const r = await query(
      "DELETE FROM exams WHERE id=$1 AND teacher_id=$2 RETURNING id",
      [req.params.id, req.user.id],
    );
    if (!r.rowCount) return res.status(404).json({ message: "Exam not found" });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});
