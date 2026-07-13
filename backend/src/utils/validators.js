/**
 * בדיקות תקינות לנתוני הרשמה ומבחנים לפני שמירה בבסיס הנתונים.
 * ההערות בקובץ מסבירות את הזרימה וההחלטות המרכזיות בפרויקט.
 */
const roles = ["teacher", "student"];
const statuses = ["draft", "published", "closed"];
const types = ["multiple-choice", "true-false", "open-text"];
// Validation להרשמה; מחזיר מערך הודעות שגיאה ולא זורק Exception.
export function validateRegistration(d) {
  const e = [];
  if (!d.fullName || d.fullName.trim().length < 2)
    e.push("Full name is required");
  if (!d.email || !/^\S+@\S+\.\S+$/.test(d.email))
    e.push("Valid email is required");
  if (!d.password || d.password.length < 6)
    e.push("Password must contain at least 6 characters");
  if (!roles.includes(d.role)) e.push("Role must be teacher or student");
  return e;
}
// Validation למבחן ולכל השאלות שבתוכו.
export function validateExam(d) {
  const e = [];
  if (!d.title || d.title.trim().length < 2) e.push("Exam title is required");
  if (!d.course || d.course.trim().length < 2) e.push("Course is required");
  const duration = Number(d.durationMinutes);
  if (!Number.isInteger(duration) || duration < 1 || duration > 240)
    e.push("Duration must be between 1 and 240 minutes");
  if (!statuses.includes(d.status || "draft")) e.push("Invalid exam status");
  if (!Array.isArray(d.questions) || !d.questions.length)
    e.push("Exam must contain at least one question");
  else
    d.questions.forEach((q, i) => {
      const type = q.type || "multiple-choice";
      if (!types.includes(type)) e.push(`Question ${i + 1}: invalid type`);
      if (!q.text || q.text.trim().length < 2)
        e.push(`Question ${i + 1}: text is required`);
      if (
        type === "multiple-choice" &&
        (!Array.isArray(q.options) ||
          q.options.length < 2 ||
          q.options.some((o) => !String(o).trim()))
      )
        e.push(`Question ${i + 1}: all options are required`);
    });
  return e;
}
