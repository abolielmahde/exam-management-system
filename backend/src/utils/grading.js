/**
 * לוגיקה עסקית לחישוב ציון אוטומטי לשאלות סגורות.
 * ההערות בקובץ מסבירות את הזרימה וההחלטות המרכזיות בפרויקט.
 */
// השוואת תשובות לשאלות סגורות וחישוב אחוז משוקלל לפי points.
export function calculateGrade(questions, answers) {
  let total = 0,
    earned = 0;
  (questions || []).forEach((q, i) => {
    if ((q.type || "multiple-choice") === "open-text") return;
    const points = Number(q.points || 1);
    total += points;
    if (
      String(q.correctAnswer ?? "")
        .trim()
        .toLowerCase() ===
      String(answers[i] ?? "")
        .trim()
        .toLowerCase()
    )
      earned += points;
  });
  return total ? Math.round((earned / total) * 100) : 0;
}
