/**
 * מסך הגשות המרצה. מציג סטטיסטיקות, גרף, ציונים ומשוב שניתן לערוך ולפרסם.
 * ההערות בקובץ מסבירות את הזרימה וההחלטות המרכזיות בפרויקט.
 */
import React, { useEffect, useState } from "react";
import {
  BarChart3,
  GraduationCap,
  LineChart,
  Save,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { ApiService } from "../../services/ApiService";
import { NotifyService } from "../../services/NotifyService";

// מסך ניהול הגשות וציונים של המרצה.
export default function TeacherSubmissions({ user }) {
  const [submissions, setSubmissions] = useState([]);
  const [analytics, setAnalytics] = useState({
    class_average: 0,
    highest_grade: 0,
    lowest_grade: 0,
    active_students: 0,
  });
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);

  // טעינת ההגשות וה-Analytics במקביל כדי לחסוך זמן המתנה.
  const loadData = async () => {
    try {
      const [submissionList, analyticsData] = await Promise.all([
        ApiService.getSubmissions(),
        ApiService.getTeacherAnalytics(),
      ]);

      const safeSubmissions = Array.isArray(submissionList)
        ? submissionList
        : [];
      setSubmissions(safeSubmissions);
      setAnalytics(analyticsData || {});
      setDrafts(
        Object.fromEntries(
          safeSubmissions.map((submission) => [
            submission.id,
            {
              grade: Number(submission.grade) || 0,
              feedback: submission.feedback || "",
              isPublished: submission.isPublished !== false,
            },
          ]),
        ),
      );
    } catch (error) {
      NotifyService.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user.id]);

  // שמירת שינוי זמני בציון או במשוב לפני שליחה לשרת.
  const updateDraft = (id, patch) => {
    setDrafts((current) => ({
      ...current,
      [id]: {
        ...current[id],
        ...patch,
      },
    }));
  };

  // שמירת הציון, המשוב וסטטוס הפרסום ב-Backend.
  const saveGrade = async (id) => {
    try {
      await ApiService.updateSubmissionGrade(id, drafts[id]);
      NotifyService.success("Grade and feedback saved");
      await loadData();
    } catch (error) {
      NotifyService.error(error.message);
    }
  };

  if (loading) {
    return (
      <section className="card">
        <h2>Loading submissions...</h2>
      </section>
    );
  }

  // המרת ערכי ה-Analytics למספרים לצורך הצגה וחישוב הגרף.
  const classAverage = Number(analytics.class_average || 0);
  const highestGrade = Number(analytics.highest_grade || 0);
  const lowestGrade = Number(analytics.lowest_grade || 0);
  const activeStudents = Number(analytics.active_students || 0);

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Review and analytics</p>
          <h1>Student Submissions</h1>
          <p className="muted">
            Review grades, edit feedback, publish results and compare
            performance.
          </p>
        </div>
      </div>

      <div className="grid-4">
        <div className="card stat-card compact">
          <BarChart3 />
          <h2>{classAverage}</h2>
          <p>Class Average</p>
        </div>
        <div className="card stat-card compact">
          <TrendingUp />
          <h2>{highestGrade}</h2>
          <p>Highest Grade</p>
        </div>
        <div className="card stat-card compact">
          <TrendingDown />
          <h2>{lowestGrade}</h2>
          <p>Lowest Grade</p>
        </div>
        <div className="card stat-card compact">
          <GraduationCap />
          <h2>{activeStudents}</h2>
          <p>Active Students</p>
        </div>
      </div>

      <div className="card chart-card">
        <div className="chart-header">
          <div>
            <p className="eyebrow">Average graph</p>
            <h2>Student Grades vs Class Average</h2>
            <p className="muted">
              Each bar is a submitted grade. The dashed line shows the class
              average.
            </p>
          </div>
          <LineChart size={34} />
        </div>

        {submissions.length > 0 ? (
          <div className="bar-chart" style={{ "--average": classAverage }}>
            <div className="average-line">
              <span>Average {classAverage}</span>
            </div>

            {submissions.map((submission) => {
              const grade = Number(submission.grade || 0);
              const studentName = submission.studentName || "Student";
              const examTitle = submission.examTitle || "Exam";

              return (
                <div className="bar-item" key={`chart-${submission.id}`}>
                  <div className="bar-wrap">
                    <div
                      className={
                        grade >= classAverage
                          ? "bar above-average"
                          : "bar below-average"
                      }
                      style={{
                        height: `${Math.max(Math.min(grade, 100), 4)}%`,
                      }}
                    >
                      <span>{grade}</span>
                    </div>
                  </div>
                  <p>{studentName}</p>
                  <small>{examTitle}</small>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="muted empty-table">
            The graph will appear after students submit exams.
          </p>
        )}
      </div>

      <div className="table-card card">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Exam</th>
              <th>Grade</th>
              <th>Feedback</th>
              <th>Publish</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((submission) => {
              const draft = drafts[submission.id] || {
                grade: Number(submission.grade) || 0,
                feedback: "",
                isPublished: true,
              };

              return (
                <tr key={submission.id}>
                  <td>{submission.studentName || "Unknown student"}</td>
                  <td>{submission.examTitle || "Exam"}</td>
                  <td>
                    <input
                      className="table-input"
                      type="number"
                      min="0"
                      max="100"
                      value={draft.grade}
                      onChange={(event) =>
                        updateDraft(submission.id, {
                          grade: Number(event.target.value),
                        })
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="table-input"
                      value={draft.feedback}
                      onChange={(event) =>
                        updateDraft(submission.id, {
                          feedback: event.target.value,
                        })
                      }
                      placeholder="Teacher feedback"
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={draft.isPublished}
                      onChange={(event) =>
                        updateDraft(submission.id, {
                          isPublished: event.target.checked,
                        })
                      }
                    />
                  </td>
                  <td>
                    <button
                      className="secondary small"
                      onClick={() => saveGrade(submission.id)}
                    >
                      <Save size={14} /> Save
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {submissions.length === 0 && (
          <p className="muted empty-table">No submissions yet.</p>
        )}
      </div>
    </section>
  );
}
