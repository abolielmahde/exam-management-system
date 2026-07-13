/**
 * מסך ביצוע מבחן. טוען שאלות, מנהל תשובות וטיימר ושולח את ההגשה לשרת.
 * ההערות בקובץ מסבירות את הזרימה וההחלטות המרכזיות בפרויקט.
 */
import React, { useEffect, useRef, useState } from "react";
import { ApiService } from "../../services/ApiService";
import { NotifyService } from "../../services/NotifyService";
// מסך ביצוע מבחן פעיל.
export default function TakeExam({ examId, setPage }) {
  const [exam, setExam] = useState(null),
    [answers, setAnswers] = useState({}),
    [timeLeft, setTimeLeft] = useState(0),
    [loading, setLoading] = useState(true);
  const submitted = useRef(false),
    answersRef = useRef({});
  // שמירת עותק עדכני של התשובות לשימוש מתוך Callback של הטיימר.
  // טעינת המבחן והגדרת זמן המבחן בשניות.
  // טיימר שיורד בכל שנייה ומבצע Auto Submit כאשר מגיע לאפס.
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);
  useEffect(() => {
    ApiService.getExam(examId)
      .then((x) => {
        setExam(x);
        setTimeLeft((Number(x.durationMinutes) || 30) * 60);
      })
      .catch((e) => NotifyService.error(e.message))
      .finally(() => setLoading(false));
  }, [examId]);
  // הגשת התשובות לשרת; force מאפשר הגשה אוטומטית כשהזמן נגמר.
  const submit = async (force = false) => {
    if (submitted.current || !exam) return;
    const arr = exam.questions.map((q, i) =>
      (q.type || "multiple-choice") === "open-text"
        ? String(answersRef.current[i] || "")
        : answersRef.current[i] !== undefined
          ? Number(answersRef.current[i])
          : -1,
    );
    if (
      !force &&
      arr.some((a, i) =>
        (exam.questions[i].type || "multiple-choice") === "open-text"
          ? !String(a).trim()
          : a < 0,
      )
    )
      return NotifyService.error(
        "Please answer all questions before submitting",
      );
    try {
      await ApiService.submitExam(exam.id, arr);
      submitted.current = true;
      NotifyService.success(
        force
          ? "Time is over. Exam submitted automatically"
          : "Exam submitted successfully",
      );
      setPage("student-results");
    } catch (e) {
      NotifyService.error(e.message);
    }
  };
  useEffect(() => {
    if (!exam) return;
    const timer = setInterval(
      () =>
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timer);
            submit(true);
            return 0;
          }
          return t - 1;
        }),
      1000,
    );
    return () => clearInterval(timer);
  }, [exam?.id]);
  if (loading)
    return (
      <section className="card">
        <h2>Loading exam...</h2>
      </section>
    );
  if (!exam)
    return (
      <section className="card">
        <h2>Exam not found</h2>
      </section>
    );
  // המרת מספר שניות לפורמט דקות:שניות.
  const fmt = (s) =>
    `${Math.floor(Math.max(0, s) / 60)
      .toString()
      .padStart(2, "0")}:${(Math.max(0, s) % 60).toString().padStart(2, "0")}`;
  return (
    <section className="card form-card">
      <p className="eyebrow">Exam submission</p>
      <h1>{exam.title}</h1>
      <div className="exam-meta-bar">
        <p>Course: {exam.course}</p>
        <div className={`timer ${timeLeft <= 60 ? "danger-timer" : ""}`}>
          Time Left: {fmt(timeLeft)}
        </div>
      </div>
      {exam.questions.map((q, i) => {
        const type = q.type || "multiple-choice",
          opts = type === "true-false" ? ["True", "False"] : q.options || [];
        return (
          <div className="question-box" key={i}>
            <h3>
              {i + 1}. {q.text}
            </h3>
            {type === "open-text" ? (
              <textarea
                value={answers[i] || ""}
                onChange={(e) =>
                  setAnswers({ ...answers, [i]: e.target.value })
                }
              />
            ) : (
              opts.map((o, j) => (
                <label className="radio" key={j}>
                  <input
                    type="radio"
                    name={`q-${i}`}
                    onChange={() => setAnswers({ ...answers, [i]: j })}
                  />
                  {o}
                </label>
              ))
            )}
          </div>
        );
      })}
      <div className="actions between">
        <button
          className="secondary"
          onClick={() => setPage("student-dashboard")}
        >
          Back
        </button>
        <button className="primary" onClick={() => submit()}>
          Submit Exam
        </button>
      </div>
    </section>
  );
}
