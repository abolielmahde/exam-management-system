import React from 'react';
import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { ApiService } from '../../services/ApiService';
import { NotifyService } from '../../services/NotifyService';

const createEmptyQuestion = () => ({ type: 'multiple-choice', text: '', options: ['', '', '', ''], correctAnswer: 0, points: 1 });
const createEmptyExam = () => ({ title: '', course: '', description: '', durationMinutes: 30, questions: [createEmptyQuestion()] });

function normalizeQuestion(question) {
  const type = question.type || 'multiple-choice';
  if (type === 'true-false') {
    return { ...question, type, options: ['True', 'False'], correctAnswer: Number(question.correctAnswer) || 0, points: Number(question.points) || 1 };
  }
  if (type === 'open-text') {
    return { ...question, type, options: [], correctAnswer: question.correctAnswer || '', points: Number(question.points) || 1 };
  }
  const options = Array.isArray(question.options) && question.options.length >= 2 ? question.options : ['', '', '', ''];
  return { ...question, type: 'multiple-choice', options, correctAnswer: Number(question.correctAnswer) || 0, points: Number(question.points) || 1 };
}

export default function CreateExam({ user, setPage, examId }) {
  const isEditMode = Boolean(examId);
  const [exam, setExam] = useState(createEmptyExam());
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEditMode);

  useEffect(() => {
    const loadExamForEditing = async () => {
      if (!examId) {
        setExam(createEmptyExam());
        setPageLoading(false);
        return;
      }

      setPageLoading(true);
      try {
        const loadedExam = await ApiService.getExam(examId);
        setExam({
          title: loadedExam.title || '',
          course: loadedExam.course || '',
          description: loadedExam.description || '',
          durationMinutes: Number(loadedExam.durationMinutes) || 30,
          status: loadedExam.status || 'draft',
          questions: Array.isArray(loadedExam.questions) && loadedExam.questions.length
            ? loadedExam.questions.map(normalizeQuestion)
            : [createEmptyQuestion()]
        });
      } catch (error) {
        NotifyService.error(error.message);
        setPage('teacher-exams');
      } finally {
        setPageLoading(false);
      }
    };

    loadExamForEditing();
  }, [examId, setPage]);

  const updateQuestion = (index, patch) => {
    const questions = exam.questions.map((question, i) => {
      if (i !== index) return question;
      const updated = { ...question, ...patch };
      if (patch.type === 'true-false') return { ...updated, options: ['True', 'False'], correctAnswer: 0 };
      if (patch.type === 'open-text') return { ...updated, options: [], correctAnswer: '' };
      if (patch.type === 'multiple-choice' && (!updated.options || updated.options.length < 2)) return { ...updated, options: ['', '', '', ''], correctAnswer: 0 };
      return updated;
    });
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

  const submit = async event => {
    event.preventDefault();
    setLoading(true);
    try {
      const payload = { ...exam, durationMinutes: Number(exam.durationMinutes) || 30, teacherId: user.id };
      if (isEditMode) {
        await ApiService.updateExam(examId, payload);
        NotifyService.success('Exam and questions updated successfully');
      } else {
        await ApiService.createExam(payload);
        NotifyService.success('Exam saved as draft');
      }
      setPage('teacher-exams');
    } catch (error) {
      NotifyService.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) return <section className="card"><h2>Loading exam for editing...</h2></section>;

  return (
    <section className="card form-card">
      <p className="eyebrow">{isEditMode ? 'Edit exam and questions' : 'Exam builder'}</p>
      <h1>{isEditMode ? 'Edit Exam / Edit Questions' : 'Create Exam'}</h1>
      <form onSubmit={submit} className="form">
        <div className="form-row">
          <label>Exam Title<input value={exam.title} onChange={event => setExam({ ...exam, title: event.target.value })} required /></label>
          <label>Course<input value={exam.course} onChange={event => setExam({ ...exam, course: event.target.value })} required /></label>
          <label>Time Limit (minutes)<input type="number" min="1" max="240" value={exam.durationMinutes} onChange={event => setExam({ ...exam, durationMinutes: Number(event.target.value) })} required /></label>
        </div>
        <label>Description<textarea value={exam.description} onChange={event => setExam({ ...exam, description: event.target.value })} placeholder="Describe the exam goal, topic, or instructions." /></label>

        {exam.questions.map((question, questionIndex) => {
          const type = question.type || 'multiple-choice';
          return (
            <div className="question-box" key={questionIndex}>
              <div className="question-header">
                <h3>Question {questionIndex + 1}</h3>
                <button type="button" className="danger small" onClick={() => removeQuestion(questionIndex)}><Trash2 size={16} /> Remove</button>
              </div>

              <div className="form-row">
                <label>Question Type
                  <select value={type} onChange={event => updateQuestion(questionIndex, { type: event.target.value })}>
                    <option value="multiple-choice">Multiple Choice</option>
                    <option value="true-false">True / False</option>
                    <option value="open-text">Open Text</option>
                  </select>
                </label>
                <label>Points<input type="number" min="1" max="100" value={question.points || 1} onChange={event => updateQuestion(questionIndex, { points: Number(event.target.value) || 1 })} /></label>
              </div>

              <input placeholder="Question text" value={question.text} onChange={event => updateQuestion(questionIndex, { text: event.target.value })} required />

              {type === 'multiple-choice' && (
                <>
                  <div className="answers-grid">
                    {question.options.map((option, optionIndex) => (
                      <input key={optionIndex} placeholder={`Answer ${optionIndex + 1}`} value={option} onChange={event => updateOption(questionIndex, optionIndex, event.target.value)} required />
                    ))}
                  </div>

                  <label>Correct Answer<select value={question.correctAnswer} onChange={event => updateQuestion(questionIndex, { correctAnswer: Number(event.target.value) })}>{question.options.map((_, i) => <option key={i} value={i}>Answer {i + 1}</option>)}</select></label>
                </>
              )}

              {type === 'true-false' && (
                <label>Correct Answer<select value={question.correctAnswer} onChange={event => updateQuestion(questionIndex, { correctAnswer: Number(event.target.value) })}><option value={0}>True</option><option value={1}>False</option></select></label>
              )}

              {type === 'open-text' && <p className="muted">Open text questions are reviewed manually by the lecturer using the submissions page.</p>}
            </div>
          );
        })}

        <div className="actions between">
          <button type="button" className="secondary" onClick={addQuestion}><Plus size={16} /> Add Question</button>
          <div className="actions">
            {isEditMode && <button type="button" className="secondary" onClick={() => setPage('teacher-exams')}>Cancel</button>}
            <button className="primary" disabled={loading}>{loading ? 'Saving...' : isEditMode ? 'Save Changes' : 'Save Exam as Draft'}</button>
          </div>
        </div>
      </form>
    </section>
  );
}
