/**
 * מסך ניהול מבחנים. מאפשר לערוך, לפרסם, לסגור ולמחוק מבחנים.
 * ההערות בקובץ מסבירות את הזרימה וההחלטות המרכזיות בפרויקט.
 */
import React, { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Edit3, Lock, Trash2 } from "lucide-react";
import { ApiService } from "../../services/ApiService";
import { NotifyService } from "../../services/NotifyService";
import { ConfigurationService } from "../../services/ConfigurationService";

// רשימת המבחנים ששייכים למרצה המחובר.
export default function TeacherExams({ user, onEditExam }) {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // שליפת המבחנים מהשרת וסינון לפי teacherId.
  const loadExams = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await ApiService.getExams();
      const list = Array.isArray(response) ? response : [];
      setExams(list.filter((exam) => exam?.teacherId === user?.id));
    } catch (err) {
      const message = err?.message || "Failed to load exams";
      setError(message);
      NotifyService.error(message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadExams();
  }, [loadExams]);

  // שינוי סטטוס מבחן ל-Published או Closed.
  const changeStatus = async (id, status) => {
    try {
      await ApiService.updateExam(id, { status });
      NotifyService.success(
        `Exam marked as ${ConfigurationService.statusLabel(status)}`,
      );
      await loadExams();
    } catch (err) {
      NotifyService.error(err?.message || "Failed to update exam");
    }
  };

  // מחיקת מבחן רק לאחר אישור המשתמש.
  const deleteExam = async (id) => {
    if (!window.confirm("Delete this exam and related submissions?")) return;
    try {
      await ApiService.deleteExam(id);
      NotifyService.info("Exam deleted");
      await loadExams();
    } catch (err) {
      NotifyService.error(err?.message || "Failed to delete exam");
    }
  };

  if (loading) {
    return (
      <section className="card">
        <h2>Loading exams...</h2>
      </section>
    );
  }

  if (error) {
    return (
      <section className="card empty-state">
        <h2>Could not load exams</h2>
        <p>{error}</p>
        <button className="primary" onClick={loadExams}>
          Try Again
        </button>
      </section>
    );
  }

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Status management</p>
          <h1>My Exams</h1>
          <p className="muted">
            Publish exams, close them, edit exam details, edit questions, or
            delete drafts.
          </p>
        </div>
      </div>

      <div className="cards-list">
        {exams.map((exam) => {
          const questions = Array.isArray(exam?.questions)
            ? exam.questions
            : [];
          return (
            <div className="card exam-card" key={exam.id}>
              <div className="card-topline">
                <span className={`badge ${exam.status || "draft"}`}>
                  {ConfigurationService.statusLabel(exam.status || "draft")}
                </span>
                <span className="muted small-text">
                  {questions.length} questions · {exam.durationMinutes || 30}{" "}
                  min
                </span>
              </div>
              <h2>{exam.title || "Untitled Exam"}</h2>
              <p>
                <strong>Course:</strong> {exam.course || "No course"}
              </p>
              <p>{exam.description || "No description was added."}</p>
              <div className="actions">
                <button
                  className="secondary"
                  onClick={() => onEditExam(exam.id)}
                >
                  <Edit3 size={16} /> Edit Exam / Questions
                </button>
                <button
                  className="primary"
                  disabled={exam.status === "published"}
                  onClick={() => changeStatus(exam.id, "published")}
                >
                  <CheckCircle2 size={16} /> Publish
                </button>
                <button
                  className="secondary"
                  disabled={exam.status === "closed"}
                  onClick={() => changeStatus(exam.id, "closed")}
                >
                  <Lock size={16} /> Close
                </button>
                <button className="danger" onClick={() => deleteExam(exam.id)}>
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          );
        })}

        {exams.length === 0 && (
          <div className="card empty-state">
            <h2>No exams yet</h2>
            <p>Create your first exam from the Create Exam page.</p>
          </div>
        )}
      </div>
    </section>
  );
}
