import React from 'react';
import { Award, BarChart3, LineChart } from 'lucide-react';
import { MockApiDbService } from '../../services/MockApiDbService';

export default function StudentResults({ user }) {
  const exams = MockApiDbService.getExams();
  const results = MockApiDbService.getSubmissions().filter(submission => submission.studentId === user.id);
  const average = results.length ? Math.round(results.reduce((sum, result) => sum + Number(result.grade), 0) / results.length) : 0;

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Grades</p>
          <h1>Results</h1>
          <p className="muted">Your submitted exam grades and personal average are displayed here.</p>
        </div>
      </div>

      {results.length > 0 && (
        <>
          <div className="card average-card">
            <BarChart3 size={34} />
            <div>
              <p className="eyebrow">Personal performance</p>
              <h2>{average}</h2>
              <p className="muted">Your average grade across {results.length} submitted exam{results.length === 1 ? '' : 's'}.</p>
            </div>
          </div>

          <div className="card chart-card">
            <div className="chart-header">
              <div>
                <p className="eyebrow">Personal graph</p>
                <h2>Your Grades vs Personal Average</h2>
                <p className="muted">The bars show your grades and the line shows your personal average.</p>
              </div>
              <LineChart />
            </div>

            <div className="bar-chart student-chart" style={{ '--average': average }}>
              <div className="average-line"><span>Average {average}</span></div>
              {results.map(result => {
                const exam = exams.find(item => item.id === result.examId);
                const grade = Number(result.grade);
                return (
                  <div className="bar-item" key={`student-chart-${result.id}`}>
                    <div className="bar-wrap">
                      <div className={grade >= average ? 'bar above-average' : 'bar below-average'} style={{ height: `${Math.max(grade, 4)}%` }}>
                        <span>{grade}</span>
                      </div>
                    </div>
                    <p>{exam?.title || 'Exam'}</p>
                    <small>{new Date(result.submittedAt).toLocaleDateString('en-US')}</small>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

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
        {results.length === 0 && <div className="card empty-state"><h2>No submissions yet</h2><p>Submit an exam to see your grade and average.</p></div>}
      </div>
    </section>
  );
}
