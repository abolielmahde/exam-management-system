/**
 * לוח הסטודנט. מציג מבחנים שפורסמו ומונע התחלה חוזרת של מבחן שכבר הוגש.
 * ההערות בקובץ מסבירות את הזרימה וההחלטות המרכזיות בפרויקט.
 */
import React, { useEffect, useState } from "react";
import { PlayCircle } from "lucide-react";
import { ApiService } from "../../services/ApiService";
import { NotifyService } from "../../services/NotifyService";
// Dashboard של הסטודנט המציג מבחנים זמינים.
export default function StudentDashboard({ user, setSelectedExamId, setPage }) {
  const [exams, setExams] = useState([]),
    [submissions, setSubmissions] = useState([]),
    [loading, setLoading] = useState(true);
  // טעינת מבחנים והגשות כדי לדעת אילו מבחנים כבר בוצעו.
  useEffect(() => {
    Promise.all([ApiService.getExams(), ApiService.getSubmissions()])
      .then(([e, s]) => {
        setExams(e.filter((x) => x.status === "published"));
        setSubmissions(s.filter((x) => x.studentId === user.id));
      })
      .catch((e) => NotifyService.error(e.message))
      .finally(() => setLoading(false));
  }, [user.id]);
  if (loading)
    return (
      <section className="card">
        <h2>Loading exams...</h2>
      </section>
    );
  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Student area</p>
          <h1>Student Dashboard</h1>
          <p className="muted">Published exams appear here.</p>
        </div>
      </div>
      <div className="cards-list">
        {exams.map((exam) => {
          const done = submissions.some((s) => s.examId === exam.id);
          return (
            <div className="card exam-card" key={exam.id}>
              <div className="card-topline">
                <span className="badge published">Published</span>
                <span className="muted small-text">
                  {exam.questions.length} questions ·{" "}
                  {exam.durationMinutes || 30} min
                </span>
              </div>
              <h2>{exam.title}</h2>
              <p>
                <strong>Course:</strong> {exam.course}
              </p>
              <p>{exam.description || "No description was added."}</p>
              <button
                disabled={done}
                className="primary"
                onClick={() => {
                  setSelectedExamId(exam.id);
                  setPage("take-exam");
                }}
              >
                <PlayCircle size={16} />
                {done ? "Already Submitted" : "Start Exam"}
              </button>
            </div>
          );
        })}
        {!exams.length && (
          <div className="card empty-state">
            <h2>No open exams right now</h2>
          </div>
        )}
      </div>
    </section>
  );
}
