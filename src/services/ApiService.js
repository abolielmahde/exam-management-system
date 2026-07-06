import { StorageService } from './StorageService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
const TOKEN_KEY = 'auth_token';

async function request(path, options = {}) {
  const token = StorageService.get(TOKEN_KEY, null);
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  if (response.status === 204) return null;

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Server request failed');
  }
  return data;
}

export class ApiService {
  static tokenKey = TOKEN_KEY;
  static apiBaseUrl = API_BASE_URL;

  static saveAuth({ user, token }) {
    StorageService.set('current_user', user);
    StorageService.set(TOKEN_KEY, token);
    return user;
  }

  static clearAuth() {
    StorageService.remove('current_user');
    StorageService.remove(TOKEN_KEY);
  }

  static login(email, password) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  static register(payload) {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  static getExams() {
    return request('/exams').then(data => data.exams || []);
  }

  static getExam(id) {
    return request(`/exams/${id}`).then(data => data.exam);
  }

  static createExam(payload) {
    return request('/exams', {
      method: 'POST',
      body: JSON.stringify(payload)
    }).then(data => data.exam);
  }

  static updateExam(id, patch) {
    return request(`/exams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patch)
    }).then(data => data.exam);
  }

  static deleteExam(id) {
    return request(`/exams/${id}`, { method: 'DELETE' });
  }

  static getSubmissions() {
    return request('/submissions').then(data => data.submissions || []);
  }

  static submitExam(examId, answers) {
    return request(`/submissions/exams/${examId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers })
    }).then(data => data.submission);
  }

  static updateSubmissionGrade(id, payload) {
    return request(`/submissions/${id}/grade`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }).then(data => data.submission);
  }

  static getTeacherAnalytics() {
    return request('/analytics/teacher').then(data => data.analytics);
  }
}
