/**
 * עטיפה מעל localStorage. אחראית לקריאה, כתיבה ומחיקה של מידע מקומי.
 * ההערות בקובץ מסבירות את הזרימה וההחלטות המרכזיות בפרויקט.
 */
// עטיפה בטוחה מעל localStorage עם JSON serialization.
export class StorageService {
  static get(key, fallback = null) {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    try {
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }
  static set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
  static remove(key) {
    localStorage.removeItem(key);
  }
  static clearProjectData() {
    ["auth_token", "current_user"].forEach((key) =>
      localStorage.removeItem(key),
    );
  }
}
