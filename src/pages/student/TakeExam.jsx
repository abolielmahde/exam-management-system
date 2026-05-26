import React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { MockApiDbService } from '../../services/MockApiDbService';
import { NotifyService } from '../../services/NotifyService';

export default function TakeExam({ user, examId, setPage }) {
  const exam = MockApiDbService.getExams().find(item => item.id === examId);
  const durationSeconds = (Number(exam?.durationMinutes) || 30) * 60;
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const submittedRef = useRef(false);
  const answersRef = useRef({});
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const formatTime = seconds => {
    const safeSeconds = Math.max(0, seconds);
    const minutes = Math.floor(safeSeconds / 60).toString().padStart(2, '0');
    const remainingSeconds = (safeSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${remainingSeconds}`;
  };

  const submit = (force = false) => {
    if (submittedRef.current || !exam) return;

    if (!force && answeredCount < exam.questions.length) {
      NotifyService.error('Please answer all questions before submitting');
      return;
    }

    const currentAnswers = answersRef.current;
    const orderedAnswers = exam.questions.map((_, index) => currentAnswers[index] !== undefined ? Number(currentAnswers[index]) : -1);
    MockApiDbService.submitExam(exam.id, user.id, orderedAnswers);
    submittedRef.current = true;
    NotifyService.success(force ? 'Time is over. Exam submitted automatically' : 'Exam submitted successfully');
    setPage('student-results');
  };

  useEffect(() => {
    if (!exam) return undefined;
    setTimeLeft(durationSeconds);
    submittedRef.current = false;

    const timer = setInterval(() => {
      setTimeLeft(current => {
        if (current <= 1) {
          clearInterval(timer);
          submit(true);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examId]);

  if (!exam) return <section className="card"><h1>Exam not found</h1><button className="primary" onClick={() => setPage('student-dashboard')}>Back to Dashboard</button></section>;

  return (
    <section className="card form-card">
      <p className="eyebrow">Exam submission</p>
      <h1>{exam.title}</h1>
      <div className="exam-meta-bar">
        <p className="muted">Course: {exam.course} | Answered {answeredCount}/{exam.questions.length}</p>
        <div className={`timer ${timeLeft <= 60 ? 'danger-timer' : ''}`}>Time Left: {formatTime(timeLeft)}</div>
      </div>

      {exam.questions.map((question, index) => (
        <div className="question-box" key={index}>
          <h3>{index + 1}. {question.text}</h3>
          {question.options.map((option, optionIndex) => (
            <label className="radio" key={optionIndex}>
              <input type="radio" name={`question-${index}`} value={optionIndex} onChange={event => setAnswers({ ...answers, [index]: event.target.value })} />
              {option}
            </label>
          ))}
        </div>
      ))}

      <div className="actions between">
        <button className="secondary" onClick={() => setPage('student-dashboard')}>Back</button>
        <button className="primary" onClick={() => submit()}>Submit Exam</button>
      </div>
    </section>
  );
}
