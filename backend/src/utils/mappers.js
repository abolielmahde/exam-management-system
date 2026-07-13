/**
 * ממיר שורות PostgreSQL מ-snake_case לאובייקטי JSON ב-camelCase.
 * ההערות בקובץ מסבירות את הזרימה וההחלטות המרכזיות בפרויקט.
 */
// טיפול בטוח בערכי JSONB שמתקבלים כמערך או כמחרוזת.
function jsonArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

// הסרת password_hash ומיפוי משתמש לפורמט ציבורי.
export const toPublicUser = (row) =>
  row
    ? {
        id: row.id,
        fullName: row.full_name,
        email: row.email,
        role: row.role,
        createdAt: row.created_at,
      }
    : null;
// מיפוי רשומת מבחן ל-JSON שה-Frontend מצפה לו.
export const toExam = (row) =>
  row
    ? {
        id: row.id,
        teacherId: row.teacher_id,
        title: row.title,
        course: row.course,
        description: row.description,
        durationMinutes: row.duration_minutes,
        status: row.status,
        questions: jsonArray(row.questions),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }
    : null;
// מיפוי רשומת הגשה כולל answers, grade ו-feedback.
export const toSubmission = (row) =>
  row
    ? {
        id: row.id,
        examId: row.exam_id,
        studentId: row.student_id,
        answers: jsonArray(row.answers),
        grade: row.grade,
        feedback: row.feedback || "",
        isPublished: row.is_published,
        submittedAt: row.submitted_at,
        updatedAt: row.updated_at,
        examTitle: row.exam_title,
        studentName: row.student_name,
        studentEmail: row.student_email,
      }
    : null;
