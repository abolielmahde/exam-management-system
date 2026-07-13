/**
 * מודל OOP של הגשת סטודנט. מרכז תשובות, ציון, משוב וזמן הגשה.
 * ההערות בקובץ מסבירות את הזרימה וההחלטות המרכזיות בפרויקט.
 */
export class Submission {
  constructor({ id, examId, studentId, answers, grade = 0 }) {
    this.id = id;
    this.examId = examId;
    this.studentId = studentId;
    this.answers = answers;
    this.grade = grade;
    this.feedback = "";
    this.submittedAt = new Date().toISOString();
  }
}
