/**
 * מודל OOP של מבחן. מייצג נתוני מבחן ופעולות לשינוי סטטוס לפרסום או סגירה.
 * ההערות בקובץ מסבירות את הזרימה וההחלטות המרכזיות בפרויקט.
 */
export class Exam {
  constructor({
    id,
    title,
    course,
    description,
    teacherId,
    questions = [],
    durationMinutes = 30,
    status = "draft",
  }) {
    this.id = id;
    this.title = title;
    this.course = course;
    this.description = description;
    this.teacherId = teacherId;
    this.durationMinutes = Number(durationMinutes) || 30;
    this.questions = questions;
    this.status = status;
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  publish() {
    this.status = "published";
    this.updatedAt = new Date().toISOString();
  }

  close() {
    this.status = "closed";
    this.updatedAt = new Date().toISOString();
  }
}
