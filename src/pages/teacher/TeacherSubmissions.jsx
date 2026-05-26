import React from 'react';
import { BarChart3, GraduationCap, LineChart, TrendingDown, TrendingUp } from 'lucide-react';
import { MockApiDbService } from '../../services/MockApiDbService';

export default function TeacherSubmissions({ user }) {
  const exams = MockApiDbService.getExams().filter(exam => exam.teacherId === user.id);
  const users = MockApiDbService.getUsers();
  const submissions = MockApiDbService.getTeacherSubmissions(user.id);
  const grades = submissions.map(submission => Number(submission.grade));
  const classAverage = grades.length ? Math.round(grades.reduce((sum, grade) => sum + grade, 0) / grades.length) : 0;
  const highestGrade = grades.length ? Math.max(...grades) : 0;
  const lowestGrade = grades.length ? Math.min(...grades) : 0;
  const uniqueStudents = new Set(submissions.map(submission => submission.studentId)).size;

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Review and analytics</p>
          <h1>Student Submissions</h1>
          <p className="muted">Review grades, track the class average, and compare student performance after exam submissions.</p>
        </div>
      </div>

      <div className="grid-4">
        <div className="card stat-card compact"><BarChart3 /><h2>{classAverage}</h2><p>Class Average</p></div>
        <div className="card stat-card compact"><TrendingUp /><h2>{highestGrade}</h2><p>Highest Grade</p></div>
        <div className="card stat-card compact"><TrendingDown /><h2>{lowestGrade}</h2><p>Lowest Grade</p></div>
        <div className="card stat-card compact"><GraduationCap /><h2>{uniqueStudents}</h2><p>Active Students</p></div>
      </div>

      <div className="card chart-card">
        <div className="chart-header">
          <div>
            <p className="eyebrow">Average graph</p>
            <h2>Student Grades vs Class Average</h2>
            <p className="muted">Each bar represents a submitted exam grade. The blue line shows the class average.</p>
          </div>
          <LineChart />
        </div>

        {submissions.length > 0 ? (
          <div className="bar-chart" style={{ '--average': classAverage }}>
            <div className="average-line"><span>Average {classAverage}</span></div>
            {submissions.map(submission => {
              const student = users.find(item => item.id === submission.studentId);
              const exam = exams.find(item => item.id === submission.examId);
              const grade = Number(submission.grade);
              return (
                <div className="bar-item" key={`chart-${submission.id}`}>
                  <div className="bar-wrap">
                    <div className={grade >= classAverage ? 'bar above-average' : 'bar below-average'} style={{ height: `${Math.max(grade, 4)}%` }}>
                      <span>{grade}</span>
                    </div>
                  </div>
                  <p>{student?.fullName || 'Student'}</p>
                  <small>{exam?.title || 'Exam'}</small>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="muted empty-table">No graph yet. The average graph will appear after students submit exams.</p>
        )}
      </div>

      <div className="table-card card">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Exam</th>
              <th>Submitted At</th>
              <th>Grade</th>
              <th>Compared to Average</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map(submission => {
              const exam = exams.find(item => item.id === submission.examId);
              const student = users.find(item => item.id === submission.studentId);
              const difference = Number(submission.grade) - classAverage;
              return (
                <tr key={submission.id}>
                  <td>{student?.fullName || 'Unknown student'}</td>
                  <td>{exam?.title || 'Deleted exam'}</td>
                  <td>{new Date(submission.submittedAt).toLocaleString('en-US')}</td>
                  <td><strong>{submission.grade}</strong></td>
                  <td className={difference >= 0 ? 'positive' : 'negative'}>{difference >= 0 ? '+' : ''}{difference}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {submissions.length === 0 && <p className="muted empty-table">No submissions yet. The average will appear after students submit exams.</p>}
      </div>
    </section>
  );
}
