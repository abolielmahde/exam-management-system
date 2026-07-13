/**
 * מסך תוצאות הסטודנט. מציג ציונים, משובים, ממוצע אישי וגרף ביצועים.
 * ההערות בקובץ מסבירות את הזרימה וההחלטות המרכזיות בפרויקט.
 */
import React, { useEffect, useState } from "react";
import { Award, BarChart3, LineChart } from "lucide-react";
import { ApiService } from "../../services/ApiService";
import { NotifyService } from "../../services/NotifyService";

// מסך התוצאות והגרף האישי של הסטודנט.
export default function StudentResults({ user }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // טעינת תוצאות שפורסמו עבור הסטודנט המחובר.
  useEffect(() => {
    ApiService.getSubmissions()
      .then((submissions) => {
        const safeSubmissions = Array.isArray(submissions) ? submissions : [];
        setResults(
          safeSubmissions.filter((item) => item.studentId === user.id),
        );
      })
      .catch((error) => NotifyService.error(error.message))
      .finally(() => setLoading(false));
  }, [user.id]);

  if (loading) {
    return (
      <section className="card">
        <h2>Loading results...</h2>
      </section>
    );
  }

  // חישוב ממוצע אישי מתוך רשימת הציונים.
  const average = results.length
    ? Math.round(
        results.reduce((sum, result) => sum + Number(result.grade || 0), 0) /
          results.length,
      )
    : 0;

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Grades</p>
          <h1>Results</h1>
          <p className="muted">
            Grades, teacher feedback and personal performance.
          </p>
        </div>
      </div>

      {results.length > 0 && (
        <>
          <div className="card average-card">
            <BarChart3 size={34} />
            <div>
              <p className="eyebrow">Personal performance</p>
              <h2>{average}</h2>
              <p className="muted">Personal average</p>
            </div>
          </div>

          <div className="card chart-card">
            <div className="chart-header">
              <div>
                <p className="eyebrow">Personal grade graph</p>
                <h2>Grades by Exam</h2>
                <p className="muted">
                  The dashed line shows your personal average.
                </p>
              </div>
              <LineChart size={34} />
            </div>

            <div
              className="bar-chart student-chart"
              style={{ "--average": average }}
            >
              <div className="average-line">
                <span>Average {average}</span>
              </div>

              {results.map((result) => {
                const grade = Number(result.grade || 0);

                return (
                  <div className="bar-item" key={`result-chart-${result.id}`}>
                    <div className="bar-wrap">
                      <div
                        className={
                          grade >= average
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
                    <p>{result.examTitle || "Exam"}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      <div className="cards-list">
        {results.map((result) => (
          <div className="card result-card" key={result.id}>
            <Award size={32} />
            <h2>{result.examTitle || "Exam"}</h2>
            <p>Submitted: {new Date(result.submittedAt).toLocaleString()}</p>
            <strong>Grade: {result.grade}</strong>
            {result.feedback && (
              <p>
                <strong>Teacher Feedback:</strong> {result.feedback}
              </p>
            )}
          </div>
        ))}

        {results.length === 0 && (
          <div className="card empty-state">
            <h2>No submissions yet</h2>
          </div>
        )}
      </div>
    </section>
  );
}
