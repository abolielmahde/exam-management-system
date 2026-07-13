/**
 * לוח המרצה. טוען נתוני Analytics ומציג כמות מבחנים והגשות.
 * ההערות בקובץ מסבירות את הזרימה וההחלטות המרכזיות בפרויקט.
 */
import React, { useEffect, useState } from "react";
import { ClipboardList, FileCheck2, UsersRound } from "lucide-react";
import { ApiService } from "../../services/ApiService";
import { NotifyService } from "../../services/NotifyService";
// Dashboard ראשי של המרצה.
export default function TeacherDashboard({ user, setPage }) {
  const [a, setA] = useState({
    exams_count: 0,
    published_count: 0,
    submissions_count: 0,
  });
  // טעינת Analytics כאשר המשתמש המחובר משתנה.
  useEffect(() => {
    ApiService.getTeacherAnalytics()
      .then(setA)
      .catch((e) => NotifyService.error(e.message));
  }, [user.id]);
  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Teacher area</p>
          <h1>Teacher Dashboard</h1>
          <p className="muted">
            Create exams, publish them, close them, and review student
            submissions.
          </p>
        </div>
        <button className="primary" onClick={() => setPage("create-exam")}>
          Create New Exam
        </button>
      </div>
      <div className="grid-3">
        <div className="card stat-card">
          <ClipboardList />
          <h2>{a.exams_count || 0}</h2>
          <p>Created Exams</p>
        </div>
        <div className="card stat-card">
          <FileCheck2 />
          <h2>{a.published_count || 0}</h2>
          <p>Published Exams</p>
        </div>
        <div className="card stat-card">
          <UsersRound />
          <h2>{a.submissions_count || 0}</h2>
          <p>Student Submissions</p>
        </div>
      </div>
    </section>
  );
}
