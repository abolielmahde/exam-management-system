import { useEffect, useState } from 'react';
import NavigationMenu from './components/NavigationMenu';
import Toast from './components/Toast';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import CreateExam from './pages/teacher/CreateExam';
import TeacherExams from './pages/teacher/TeacherExams';
import TeacherSubmissions from './pages/teacher/TeacherSubmissions';
import StudentDashboard from './pages/student/StudentDashboard';
import TakeExam from './pages/student/TakeExam';
import StudentResults from './pages/student/StudentResults';
import { AuthService } from './services/AuthService';
import { MockApiDbService } from './services/MockApiDbService';
import { LoggerService } from './services/LoggerService';

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('home');
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    MockApiDbService.init();
    const currentUser = AuthService.currentUser();
    setUser(currentUser);
    setPage(currentUser ? `${currentUser.role}-dashboard` : 'home');
    LoggerService.info('Application started');
  }, []);

  const onLogin = loggedUser => {
    setUser(loggedUser);
    setPage(`${loggedUser.role}-dashboard`);
  };

  const onLogout = () => {
    setUser(null);
    setSelectedExamId(null);
    setPage('login');
  };

  const refresh = () => forceUpdate(value => value + 1);

  const renderPage = () => {
    if (page === 'home') {
      return (
        <section className="hero card">
          <p className="eyebrow">Git + AI modular project</p>
          <h1>Exam Management System</h1>
          <p>A client-side system for teachers and students. It includes authentication, exam creation, status management, student submissions, results, configuration service, Mock API DB service, and OOP models.</p>
          <div className="actions center">
            <button className="primary" onClick={() => setPage('login')}>Enter System</button>
            <button className="secondary" onClick={() => setPage('register')}>Create Account</button>
          </div>
        </section>
      );
    }

    if (page === 'login') return <Login onLogin={onLogin} setPage={setPage} />;
    if (page === 'register') return <Register onLogin={onLogin} setPage={setPage} />;
    if (!user) return <Login onLogin={onLogin} setPage={setPage} />;
    if (page === 'teacher-dashboard') return <TeacherDashboard user={user} setPage={setPage} />;
    if (page === 'create-exam') return <CreateExam user={user} setPage={setPage} />;
    if (page === 'teacher-exams') return <TeacherExams user={user} refresh={refresh} />;
    if (page === 'teacher-submissions') return <TeacherSubmissions user={user} />;
    if (page === 'student-dashboard') return <StudentDashboard user={user} setSelectedExamId={setSelectedExamId} setPage={setPage} />;
    if (page === 'take-exam') return <TakeExam user={user} examId={selectedExamId} setPage={setPage} />;
    if (page === 'student-results') return <StudentResults user={user} />;
    return <section className="card"><h1>Page not found</h1></section>;
  };

  return (
    <>
      <NavigationMenu user={user} page={page} setPage={setPage} onLogout={onLogout} />
      <main>{renderPage()}</main>
      <footer className="footer">Developed by Mahde Aboliel | Git + AI Project</footer>
      <Toast />
    </>
  );
}
