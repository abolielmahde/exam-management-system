import React from 'react';
import { useEffect, useState } from 'react';
import { PlayCircle } from 'lucide-react';
import { ApiService } from '../../services/ApiService';
import { NotifyService } from '../../services/NotifyService';

export default function StudentDashboard({ user, setSelectedExamId, setPage }) {
  const [exams, setExams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [examList, submissionList] = await Promise.all([
          ApiService.getExams(),
          ApiService.getSubmissions()
        ]);
        setExams(examList.filter(exam => exam.status === 'published'));
        setSubmissions(submissionList.filter(submission => submission.studentId === user.id));
      } catch (error) {
        NotifyService.error(error.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user.id]);

  if (loading) return <section className="card"><h2>Loading exams...</h2></section>;

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Student area</p>
          <h1>Student Dashboard</h1>
          <p className="muted">Open exams appear here after a teacher publishes them.</p>
        </div>
      </div>

      <div className="cards-list">
        {exams.map(exam => {
          const done = submissions.some(submission => submission.examId === exam.id);
          return (
            <div className="card exam-card" key={exam.id}>
              <div className="card-topline">
                <span className="badge published">Published</span>
                <span className="muted small-text">{exam.questions.length} questions · {exam.durationMinutes || 30} min</span>
              </div>
              <h2>{exam.title}</h2>
              <p><strong>Course:</strong> {exam.course}</p>
              <p>{exam.description || 'No description was added.'}</p>
              <p><strong>Time Limit:</strong> {exam.durationMinutes || 30} minutes</p>
              <button disabled={done} className="primary" onClick={() => { setSelectedExamId(exam.id); setPage('take-exam'); }}>
                <PlayCircle size={16} /> {done ? 'Already Submitted' : 'Start Exam'}
              </button>
            </div>
          );
        })}
        {exams.length === 0 && <div className="card empty-state"><h2>No open exams right now</h2><p>Ask the teacher to publish an exam.</p></div>}
      </div>
    </section>
  );
}
