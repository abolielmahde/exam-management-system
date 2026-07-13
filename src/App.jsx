/**
 * הקומפוננטה הראשית של ה-Frontend. מנהלת משתמש מחובר, ניווט בין מסכים ומצב המבחן שנבחר או נערך.
 * ההערות בקובץ מסבירות את הזרימה וההחלטות המרכזיות בפרויקט.
 */
import React, { useEffect, useState } from "react";
import NavigationMenu from "./components/NavigationMenu";
import Toast from "./components/Toast";
import ErrorBoundary from "./components/ErrorBoundary";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import CreateExam from "./pages/teacher/CreateExam";
import TeacherExams from "./pages/teacher/TeacherExams";
import TeacherSubmissions from "./pages/teacher/TeacherSubmissions";
import StudentDashboard from "./pages/student/StudentDashboard";
import TakeExam from "./pages/student/TakeExam";
import StudentResults from "./pages/student/StudentResults";
import { AuthService } from "./services/AuthService";
// קומפוננטת השורש של האפליקציה.
export default function App() {
  // State גלובלי בסיסי: משתמש מחובר, דף נוכחי ומזהי מבחנים.
  const [user, setUser] = useState(null),
    [page, setPage] = useState("home"),
    [selectedExamId, setSelectedExamId] = useState(null),
    [editingExamId, setEditingExamId] = useState(null);
  // בעת טעינת האתר משחזרים את המשתמש שנשמר ב-localStorage.
  useEffect(() => {
    const u = AuthService.currentUser();
    setUser(u);
    setPage(u ? `${u.role}-dashboard` : "home");
  }, []);
  // מעבר בין מסכים והחזרת הגלילה לראש הדף.
  const navigate = (p) => {
    if (p !== "edit-exam") setEditingExamId(null);
    setPage(p);
    window.scrollTo({ top: 0, behavior: "auto" });
  };
  // לאחר Login מוצלח מפנים את המשתמש ל-Dashboard לפי ה-Role שלו.
  const onLogin = (u) => {
    setUser(u);
    setPage(`${u.role}-dashboard`);
  };
  // ניקוי מצב האפליקציה לאחר התנתקות.
  const onLogout = () => {
    setUser(null);
    setSelectedExamId(null);
    setEditingExamId(null);
    setPage("login");
  };
  // שמירת מזהה המבחן שנבחר לעריכה.
  const edit = (id) => {
    setEditingExamId(id);
    setPage("edit-exam");
  };
  // בחירת הקומפוננטה שתוצג לפי ערך page.
  const render = () => {
    if (page === "home")
      return (
        <section className="hero card">
          <p className="eyebrow">FULL STACK PROJECT</p>
          <h1>Exam Management System</h1>
          <p>
            React frontend, Express REST API, PostgreSQL database, JWT
            authentication, Docker and CI/CD.
          </p>
          <div className="feature-strip">
            <div className="feature-pill">Teacher exam builder</div>
            <div className="feature-pill">Student submissions</div>
            <div className="feature-pill">PostgreSQL + JWT</div>
          </div>
          <div className="actions">
            <button className="primary" onClick={() => setPage("login")}>
              Enter System
            </button>
            <button className="secondary" onClick={() => setPage("register")}>
              Create Account
            </button>
          </div>
        </section>
      );
    if (page === "login") return <Login onLogin={onLogin} setPage={setPage} />;
    if (page === "register")
      return <Register onLogin={onLogin} setPage={setPage} />;
    if (!user) return <Login onLogin={onLogin} setPage={setPage} />;
    if (page === "teacher-dashboard")
      return <TeacherDashboard user={user} setPage={navigate} />;
    if (page === "create-exam")
      return <CreateExam user={user} setPage={navigate} />;
    if (page === "edit-exam")
      return (
        <CreateExam user={user} setPage={navigate} examId={editingExamId} />
      );
    if (page === "teacher-exams")
      return <TeacherExams user={user} onEditExam={edit} />;
    if (page === "teacher-submissions")
      return <TeacherSubmissions user={user} />;
    if (page === "student-dashboard")
      return (
        <StudentDashboard
          user={user}
          setSelectedExamId={setSelectedExamId}
          setPage={navigate}
        />
      );
    if (page === "take-exam")
      return (
        <TakeExam user={user} examId={selectedExamId} setPage={navigate} />
      );
    if (page === "student-results") return <StudentResults user={user} />;
    return (
      <section className="card">
        <h1>Page not found</h1>
      </section>
    );
  };
  return (
    <>
      <NavigationMenu
        user={user}
        page={page}
        setPage={navigate}
        onLogout={onLogout}
      />
      <main>
        <ErrorBoundary resetKey={page}>{render()}</ErrorBoundary>
      </main>
      <footer className="footer">
        Developed by Mahde Aboliel | Full Stack Project
      </footer>
      <Toast />
    </>
  );
}
