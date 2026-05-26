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
    ['mock_users', 'mock_exams', 'mock_submissions', 'current_user'].forEach(key => localStorage.removeItem(key));
  }
}
