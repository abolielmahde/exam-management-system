import { Award } from 'lucide-react';
import { MockApiDbService } from '../../services/MockApiDbService';

export default function StudentResults({ user }) {
  const exams = MockApiDbService.getExams();
  const results = MockApiDbService.getSubmissions().filter(submission => submission.studentId === user.id);

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Grades</p>
          <h1>Results</h1>
          <p className="muted">Your submitted exam grades are displayed here.</p>
        </div>
      </div>

      <div className="cards-list">
        {results.map(result => {
          const exam = exams.find(item => item.id === result.examId);
          return (
            <div className="card result-card" key={result.id}>
              <Award size={32} />
              <h2>{exam?.title || 'Deleted exam'}</h2>
              <p>Submitted At: {new Date(result.submittedAt).toLocaleString('en-US')}</p>
              <strong>Grade: {result.grade}</strong>
            </div>
          );
        })}
        {results.length === 0 && <div className="card empty-state"><h2>No submissions yet</h2><p>Submit an exam to see your grade.</p></div>}
      </div>
    </section>
  );
}
