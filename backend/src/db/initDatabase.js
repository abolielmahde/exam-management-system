/**
 * מאתחל את בסיס הנתונים, יוצר טבלאות ונתוני Demo בהפעלה הראשונה.
 * ההערות בקובץ מסבירות את הזרימה וההחלטות המרכזיות בפרויקט.
 */
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { query, pool } from "./pool.js";
// יצירת הטבלאות אם הן עדיין אינן קיימות.
export async function initDatabase() {
  await query(
    `CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY, full_name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('teacher','student')), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`,
  );
  await query(
    `CREATE TABLE IF NOT EXISTS exams(id TEXT PRIMARY KEY, teacher_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, title TEXT NOT NULL, course TEXT NOT NULL, description TEXT DEFAULT '', duration_minutes INTEGER NOT NULL DEFAULT 30, status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','closed')), questions JSONB NOT NULL DEFAULT '[]'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`,
  );
  await query(
    `CREATE TABLE IF NOT EXISTS submissions(id TEXT PRIMARY KEY, exam_id TEXT NOT NULL REFERENCES exams(id) ON DELETE CASCADE, student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, answers JSONB NOT NULL DEFAULT '[]'::jsonb, grade INTEGER NOT NULL DEFAULT 0 CHECK(grade BETWEEN 0 AND 100), feedback TEXT DEFAULT '', is_published BOOLEAN NOT NULL DEFAULT TRUE, submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE(exam_id,student_id))`,
  );
  // נתוני Demo נוצרים רק כאשר טבלת המשתמשים ריקה.
  const c = await query("SELECT COUNT(*)::int AS count FROM users");
  if (c.rows[0].count === 0) {
    const teacherId = randomUUID(),
      studentId = randomUUID(),
      hash = await bcrypt.hash("123456", 10);
    await query(
      "INSERT INTO users(id,full_name,email,password_hash,role) VALUES($1,$2,$3,$4,$5),($6,$7,$8,$9,$10)",
      [
        teacherId,
        "Teacher Demo",
        "teacher@test.com",
        hash,
        "teacher",
        studentId,
        "Student Demo",
        "student@test.com",
        hash,
        "student",
      ],
    );
    const questions = [
      {
        type: "multiple-choice",
        text: "What does API stand for?",
        options: [
          "Application Programming Interface",
          "Advanced Process Internet",
          "Applied Program Index",
          "Automatic Page Input",
        ],
        correctAnswer: 0,
        points: 50,
      },
      {
        type: "true-false",
        text: "JWT is commonly used for stateless authentication.",
        options: ["True", "False"],
        correctAnswer: 0,
        points: 50,
      },
    ];
    await query(
      "INSERT INTO exams(id,teacher_id,title,course,description,duration_minutes,status,questions) VALUES($1,$2,$3,$4,$5,$6,$7,$8::jsonb)",
      [
        randomUUID(),
        teacherId,
        "Full Stack Basics Demo",
        "Web Development",
        "Demo exam for the final project presentation.",
        30,
        "published",
        JSON.stringify(questions),
      ],
    );
  }
}
if (import.meta.url === `file://${process.argv[1]}`)
  initDatabase()
    .then(() => pool.end())
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
