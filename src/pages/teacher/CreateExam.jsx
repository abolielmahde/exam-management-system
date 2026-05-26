import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { MockApiDbService } from '../../services/MockApiDbService';
import { NotifyService } from '../../services/NotifyService';

const createEmptyQuestion = () => ({ text: '', options: ['', '', '', ''], correctAnswer: 0 });

export default function CreateExam({ user, setPage }) {
  const [exam, setExam] = useState({ title: '', course: '', description: '', durationMinutes: 30, questions: [createEmptyQuestion()] });

  const updateQuestion = (index, patch) => {
    const questions = exam.questions.map((question, i) => i === index ? { ...question, ...patch } : question);
    setExam({ ...exam, questions });
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    const question = exam.questions[questionIndex];
    const options = question.options.map((option, i) => i === optionIndex ? value : option);
    updateQuestion(questionIndex, { options });
  };

  const addQuestion = () => {
    setExam({ ...exam, questions: [...exam.questions, createEmptyQuestion()] });
  };

  const removeQuestion = index => {
    if (exam.questions.length === 1) {
      NotifyService.error('An exam must contain at least one question');
      return;
    }
    setExam({ ...exam, questions: exam.questions.filter((_, i) => i !== index) });
  };

  const submit = event => {
    event.preventDefault();
    MockApiDbService.createExam({ ...exam, durationMinutes: Number(exam.durationMinutes) || 30, teacherId: user.id });
    NotifyService.success('Exam saved as draft');
    setPage('teacher-exams');
  };

  return (
    <section className="card form-card">
      <p className="eyebrow">Exam builder</p>
      <h1>Create Exam</h1>
      <form onSubmit={submit} className="form">
        <div className="form-row">
          <label>Exam Title<input value={exam.title} onChange={event => setExam({ ...exam, title: event.target.value })} required /></label>
          <label>Course<input value={exam.course} onChange={event => setExam({ ...exam, course: event.target.value })} required /></label>
          <label>Time Limit (minutes)<input type="number" min="1" max="240" value={exam.durationMinutes} onChange={event => setExam({ ...exam, durationMinutes: Number(event.target.value) })} required /></label>
        </div>
        <label>Description<textarea value={exam.description} onChange={event => setExam({ ...exam, description: event.target.value })} placeholder="Describe the exam goal, topic, or instructions." /></label>

        {exam.questions.map((question, questionIndex) => (
          <div className="question-box" key={questionIndex}>
            <div className="question-header">
              <h3>Question {questionIndex + 1}</h3>
              <button type="button" className="danger small" onClick={() => removeQuestion(questionIndex)}><Trash2 size={16} /> Remove</button>
            </div>

            <input placeholder="Question text" value={question.text} onChange={event => updateQuestion(questionIndex, { text: event.target.value })} required />

            <div className="answers-grid">
              {question.options.map((option, optionIndex) => (
                <input key={optionIndex} placeholder={`Answer ${optionIndex + 1}`} value={option} onChange={event => updateOption(questionIndex, optionIndex, event.target.value)} required />
              ))}
            </div>

            <label>Correct Answer<select value={question.correctAnswer} onChange={event => updateQuestion(questionIndex, { correctAnswer: Number(event.target.value) })}>{question.options.map((_, i) => <option key={i} value={i}>Answer {i + 1}</option>)}</select></label>
          </div>
        ))}

        <div className="actions between">
          <button type="button" className="secondary" onClick={addQuestion}><Plus size={16} /> Add Question</button>
          <button className="primary">Save Exam as Draft</button>
        </div>
      </form>
    </section>
  );
}
