import { useMemo, useState } from 'react';
import { MockApiDbService } from '../../services/MockApiDbService';
import { NotifyService } from '../../services/NotifyService';

export default function TakeExam({ user, examId, setPage }) {
  const exam = MockApiDbService.getExams().find(item => item.id === examId);
  const [answers, setAnswers] = useState({});
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);

  if (!exam) return <section className="card"><h1>Exam not found</h1><button className="primary" onClick={() => setPage('student-dashboard')}>Back to Dashboard</button></section>;

  const submit = () => {
    if (answeredCount < exam.questions.length) {
      NotifyService.error('Please answer all questions before submitting');
      return;
    }

    const orderedAnswers = exam.questions.map((_, index) => Number(answers[index]));
    MockApiDbService.submitExam(exam.id, user.id, orderedAnswers);
    NotifyService.success('Exam submitted successfully');
    setPage('student-results');
  };

  return (
    <section className="card form-card">
      <p className="eyebrow">Exam submission</p>
      <h1>{exam.title}</h1>
      <p className="muted">Course: {exam.course} | Answered {answeredCount}/{exam.questions.length}</p>

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
        <button className="primary" onClick={submit}>Submit Exam</button>
      </div>
    </section>
  );
}
