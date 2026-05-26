import { PlayCircle } from 'lucide-react';
import { MockApiDbService } from '../../services/MockApiDbService';

export default function StudentDashboard({ user, setSelectedExamId, setPage }) {
  const exams = MockApiDbService.getExams().filter(exam => exam.status === 'published');
  const submissions = MockApiDbService.getSubmissions().filter(submission => submission.studentId === user.id);

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
