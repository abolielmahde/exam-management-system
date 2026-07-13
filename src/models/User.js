/**
 * מודל OOP של משתמש במערכת. שומר נתוני משתמש ומספק פעולות עזר לבדיקת Role.
 * ההערות בקובץ מסבירות את הזרימה וההחלטות המרכזיות בפרויקט.
 */
export class User {
  constructor({ id, fullName, email, password, role }) {
    this.id = id;
    this.fullName = fullName;
    this.email = email;
    this.password = password;
    this.role = role;
    this.createdAt = new Date().toISOString();
  }

  isTeacher() {
    return this.role === "teacher";
  }

  isStudent() {
    return this.role === "student";
  }
}
