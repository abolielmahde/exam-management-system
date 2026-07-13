/**
 * טופס יצירה ועריכה של מבחן. תומך בכמה סוגי שאלות, ניקוד ותשובה נכונה.
 * ההערות בקובץ מסבירות את הזרימה וההחלטות המרכזיות בפרויקט.
 */
import React, { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { ApiService } from "../../services/ApiService";
import { NotifyService } from "../../services/NotifyService";
// יצירת שאלה ריקה מסוג Multiple Choice.
const q0 = () => ({
  type: "multiple-choice",
  text: "",
  options: ["", "", "", ""],
  correctAnswer: 0,
  points: 1,
});
// יצירת מבנה התחלתי של מבחן חדש במצב Draft.
const e0 = () => ({
  title: "",
  course: "",
  description: "",
  durationMinutes: 30,
  status: "draft",
  questions: [q0()],
});
// נרמול שאלה שהגיעה מהשרת כדי שלכל סוג יהיה מבנה צפוי.
const norm = (q) => {
  const type = q.type || "multiple-choice";
  if (type === "true-false")
    return {
      ...q,
      type,
      options: ["True", "False"],
      correctAnswer: Number(q.correctAnswer) || 0,
      points: Number(q.points) || 1,
    };
  if (type === "open-text")
    return {
      ...q,
      type,
      options: [],
      correctAnswer: "",
      points: Number(q.points) || 1,
    };
  return {
    ...q,
    type: "multiple-choice",
    options:
      Array.isArray(q.options) && q.options.length >= 2
        ? q.options
        : ["", "", "", ""],
    correctAnswer: Number(q.correctAnswer) || 0,
    points: Number(q.points) || 1,
  };
};
// אותו מסך משמש גם ליצירה וגם לעריכת מבחן קיים.
export default function CreateExam({ user, setPage, examId }) {
  const edit = Boolean(examId);
  const [exam, setExam] = useState(e0()),
    [loading, setLoading] = useState(false),
    [pageLoading, setPageLoading] = useState(edit);
  // במצב עריכה טוענים את המבחן הקיים מה-Backend.
  useEffect(() => {
    if (!examId) {
      setExam(e0());
      setPageLoading(false);
      return;
    }
    setPageLoading(true);
    ApiService.getExam(examId)
      .then((x) => setExam({ ...x, questions: (x.questions || []).map(norm) }))
      .catch((e) => {
        NotifyService.error(e.message);
        setPage("teacher-exams");
      })
      .finally(() => setPageLoading(false));
  }, [examId]);
  // עדכון שאלה מסוימת לפי האינדקס שלה.
  const updateQ = (i, p) =>
    setExam({
      ...exam,
      questions: exam.questions.map((q, j) => {
        if (i !== j) return q;
        const u = { ...q, ...p };
        if (p.type === "true-false")
          return { ...u, options: ["True", "False"], correctAnswer: 0 };
        if (p.type === "open-text")
          return { ...u, options: [], correctAnswer: "" };
        if (p.type === "multiple-choice")
          return {
            ...u,
            options: u.options?.length >= 2 ? u.options : ["", "", "", ""],
            correctAnswer: 0,
          };
        return u;
      }),
    });
  // עדכון אפשרות תשובה בתוך שאלה אמריקאית.
  const updateO = (qi, oi, v) => {
    const options = exam.questions[qi].options.map((o, i) =>
      i === oi ? v : o,
    );
    updateQ(qi, { options });
  };
  // מחיקת שאלה תוך שמירה על לפחות שאלה אחת במבחן.
  const remove = (i) =>
    exam.questions.length === 1
      ? NotifyService.error("An exam must contain at least one question")
      : setExam({
          ...exam,
          questions: exam.questions.filter((_, j) => j !== i),
        });
  // שליחת הטופס: POST ליצירה או PUT לעריכה.
  const submit = async (ev) => {
    ev.preventDefault();
    setLoading(true);
    try {
      edit
        ? await ApiService.updateExam(examId, exam)
        : await ApiService.createExam({
            ...exam,
            teacherId: user.id,
            status: "draft",
          });
      NotifyService.success(
        edit
          ? "Exam and questions updated successfully"
          : "Exam saved as draft",
      );
      setPage("teacher-exams");
    } catch (e) {
      NotifyService.error(e.message);
    } finally {
      setLoading(false);
    }
  };
  if (pageLoading)
    return (
      <section className="card">
        <h2>Loading exam for editing...</h2>
      </section>
    );
  return (
    <section className="card form-card">
      <p className="eyebrow">
        {edit ? "Edit exam and questions" : "Exam builder"}
      </p>
      <h1>{edit ? "Edit Exam / Edit Questions" : "Create Exam"}</h1>
      <form onSubmit={submit} className="form">
        <div className="form-row">
          <label>
            Exam Title
            <input
              value={exam.title}
              onChange={(e) => setExam({ ...exam, title: e.target.value })}
              required
            />
          </label>
          <label>
            Course
            <input
              value={exam.course}
              onChange={(e) => setExam({ ...exam, course: e.target.value })}
              required
            />
          </label>
          <label>
            Time Limit (minutes)
            <input
              type="number"
              min="1"
              max="240"
              value={exam.durationMinutes}
              onChange={(e) =>
                setExam({ ...exam, durationMinutes: Number(e.target.value) })
              }
              required
            />
          </label>
        </div>
        <label>
          Description
          <textarea
            value={exam.description}
            onChange={(e) => setExam({ ...exam, description: e.target.value })}
          />
        </label>
        {exam.questions.map((q, i) => (
          <div className="question-box" key={i}>
            <div className="question-header">
              <h3>Question {i + 1}</h3>
              <button
                type="button"
                className="danger small"
                onClick={() => remove(i)}
              >
                <Trash2 size={16} /> Remove
              </button>
            </div>
            <div className="form-row">
              <label>
                Question Type
                <select
                  value={q.type}
                  onChange={(e) => updateQ(i, { type: e.target.value })}
                >
                  <option value="multiple-choice">Multiple Choice</option>
                  <option value="true-false">True / False</option>
                  <option value="open-text">Open Text</option>
                </select>
              </label>
              <label>
                Points
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={q.points || 1}
                  onChange={(e) =>
                    updateQ(i, { points: Number(e.target.value) || 1 })
                  }
                />
              </label>
            </div>
            <input
              placeholder="Question text"
              value={q.text}
              onChange={(e) => updateQ(i, { text: e.target.value })}
              required
            />
            {q.type === "multiple-choice" && (
              <>
                <div className="answers-grid">
                  {q.options.map((o, j) => (
                    <input
                      key={j}
                      placeholder={`Answer ${j + 1}`}
                      value={o}
                      onChange={(e) => updateO(i, j, e.target.value)}
                      required
                    />
                  ))}
                </div>
                <label>
                  Correct Answer
                  <select
                    value={q.correctAnswer}
                    onChange={(e) =>
                      updateQ(i, { correctAnswer: Number(e.target.value) })
                    }
                  >
                    {q.options.map((_, j) => (
                      <option key={j} value={j}>
                        Answer {j + 1}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            )}
            {q.type === "true-false" && (
              <label>
                Correct Answer
                <select
                  value={q.correctAnswer}
                  onChange={(e) =>
                    updateQ(i, { correctAnswer: Number(e.target.value) })
                  }
                >
                  <option value={0}>True</option>
                  <option value={1}>False</option>
                </select>
              </label>
            )}
            {q.type === "open-text" && (
              <p className="muted">Open text questions are graded manually.</p>
            )}
          </div>
        ))}
        <div className="actions between">
          <button
            type="button"
            className="secondary"
            onClick={() =>
              setExam({ ...exam, questions: [...exam.questions, q0()] })
            }
          >
            <Plus size={16} /> Add Question
          </button>
          <div className="actions">
            {edit && (
              <button
                type="button"
                className="secondary"
                onClick={() => setPage("teacher-exams")}
              >
                Cancel
              </button>
            )}
            <button className="primary" disabled={loading}>
              {loading
                ? "Saving..."
                : edit
                  ? "Save Changes"
                  : "Save Exam as Draft"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
