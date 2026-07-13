/**
 * שירות לוגים בצד ה-Frontend. עוטף את console כדי לשמור ממשק אחיד ללוגים.
 * ההערות בקובץ מסבירות את הזרימה וההחלטות המרכזיות בפרויקט.
 */
// נקודת כניסה אחידה ללוגים, שניתן להחליף בעתיד בשירות חיצוני.
export class LoggerService {
  static info(message, data = {}) {
    console.log(`[INFO] ${message}`, data);
  }

  static warn(message, data = {}) {
    console.warn(`[WARN] ${message}`, data);
  }

  static error(message, data = {}) {
    console.error(`[ERROR] ${message}`, data);
  }
}
