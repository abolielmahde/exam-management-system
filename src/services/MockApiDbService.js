import { StorageService } from './StorageService';
import { LoggerService } from './LoggerService';
import { User } from '../models/User';
import { Exam } from '../models/Exam';
import { Submission } from '../models/Submission';

const USERS_KEY = 'mock_users';
const EXAMS_KEY = 'mock_exams';
const SUBMISSIONS_KEY = 'mock_submissions';

const createId = () => {
  if (crypto?.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export class MockApiDbService {
  static init() {
    const users = StorageService.get(USERS_KEY, []);

    if (users.length === 0) {
      StorageService.set(USERS_KEY, [
        new User({ id: createId(), fullName: 'Teacher Demo', email: 'teacher@test.com', password: '123456', role: 'teacher' }),
        new User({ id: createId(), fullName: 'Student Demo', email: 'student@test.com', password: '123456', role: 'student' })
      ]);
    }

    if (!Array.isArray(StorageService.get(EXAMS_KEY))) StorageService.set(EXAMS_KEY, []);
    if (!Array.isArray(StorageService.get(SUBMISSIONS_KEY))) StorageService.set(SUBMISSIONS_KEY, []);
    LoggerService.info('Mock API DB initialized');
  }

  static getUsers() {
    return StorageService.get(USERS_KEY, []);
  }

  static saveUsers(users) {
    StorageService.set(USERS_KEY, users);
  }

  static getExams() {
    return StorageService.get(EXAMS_KEY, []);
  }

  static saveExams(exams) {
    StorageService.set(EXAMS_KEY, exams);
  }

  static getSubmissions() {
    return StorageService.get(SUBMISSIONS_KEY, []);
  }

  static saveSubmissions(submissions) {
    StorageService.set(SUBMISSIONS_KEY, submissions);
  }

  static createUser(data) {
    const users = this.getUsers();
    const email = data.email.trim().toLowerCase();

    if (users.some(user => user.email.toLowerCase() === email)) {
      throw new Error('Email already exists');
    }

    const user = new User({ id: createId(), ...data, email });
    users.push(user);
    this.saveUsers(users);
    LoggerService.info('User created', { email, role: data.role });
    return user;
  }

  static createExam(data) {
    const exams = this.getExams();
    const exam = new Exam({ id: createId(), ...data, status: 'draft' });
    exams.push(exam);
    this.saveExams(exams);
    LoggerService.info('Exam created', { title: exam.title });
    return exam;
  }

  static updateExam(id, patch) {
    const exams = this.getExams();
    const updated = exams.map(exam => (
      exam.id === id ? { ...exam, ...patch, updatedAt: new Date().toISOString() } : exam
    ));
    this.saveExams(updated);
    return updated.find(exam => exam.id === id);
  }

  static deleteExam(id) {
    this.saveExams(this.getExams().filter(exam => exam.id !== id));
    this.saveSubmissions(this.getSubmissions().filter(submission => submission.examId !== id));
  }

  static submitExam(examId, studentId, answers) {
    const exam = this.getExams().find(item => item.id === examId);
    if (!exam) throw new Error('Exam not found');

    const oldSubmissions = this.getSubmissions().filter(item => !(item.examId === examId && item.studentId === studentId));
    const correctAnswers = exam.questions.filter((question, index) => Number(question.correctAnswer) === Number(answers[index])).length;
    const grade = exam.questions.length ? Math.round((correctAnswers / exam.questions.length) * 100) : 0;

    const submission = new Submission({ id: createId(), examId, studentId, answers, grade });
    oldSubmissions.push(submission);
    this.saveSubmissions(oldSubmissions);
    LoggerService.info('Exam submitted', { examId, studentId, grade });
    return submission;
  }

  static getTeacherSubmissions(teacherId) {
    const teacherExamIds = this.getExams().filter(exam => exam.teacherId === teacherId).map(exam => exam.id);
    return this.getSubmissions().filter(submission => teacherExamIds.includes(submission.examId));
  }
}
