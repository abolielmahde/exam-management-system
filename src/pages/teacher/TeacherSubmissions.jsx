import React from 'react';
import { useEffect, useState } from 'react';
import { BarChart3, GraduationCap, LineChart, Save, TrendingDown, TrendingUp } from 'lucide-react';
import { ApiService } from '../../services/ApiService';
import { NotifyService } from '../../services/NotifyService';

export default function TeacherSubmissions({ user }) {
  const [submissions, setSubmissions] = useState([]);
  const [analytics, setAnalytics] = useState({ class_average: 0, highest_grade: 0, lowest_grade: 0, active_students: 0 });
  const [draftGrades, setDraftGrades] = useState({});
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [submissionList, analyticsData] = await Promise.all([
        ApiService.getSubmissions(),
        ApiService.getTeacherAnalytics()
      ]);
      setSubmissions(submissionList);
      setAnalytics(analyticsData);
      const drafts = {};
      submissionList.forEach(submission => {
        drafts[submission.id] = { grade: submission.grade, feedback: submission.feedback || '', isPublished: submission.isPublished !== false };
      });
      setDraftGrades(drafts);
    } catch (error) {
      NotifyService.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user.id]);

  const updateDraft = (id, patch) => {
    setDraftGrades(current => ({ ...current, [id]: { ...current[id], ...patch } }));
  };

  const saveGrade = async id => {
    try {
      await ApiService.updateSubmissionGrade(id, draftGrades[id]);
      NotifyService.success('Grade and feedback saved');
      loadData();
    } catch (error) {
      NotifyService.error(error.message);
    }
  };

  const classAverage = Number(analytics.class_average || 0);
  const highestGrade = Number(analytics.highest_grade || 0);
  const lowestGrade = Number(analytics.lowest_grade || 0);
  const uniqueStudents = Number(analytics.active_students || 0);

  if (loading) return <section className="card"><h2>Loading submissions...</h2></section>;

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Review and analytics</p>
          <h1>Student Submissions</h1>
          <p className="muted">Review grades, edit manual grades, publish feedback, and compare student performance.</p>
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
            <p className="muted">Each bar represents a submitted exam grade. The line shows the class average.</p>
          </div>
          <LineChart />
        </div>

        {submissions.length > 0 ? (
          <div className="bar-chart" style={{ '--average': classAverage }}>
            <div className="average-line"><span>Average {classAverage}</span></div>
            {submissions.map(submission => {
              const grade = Number(submission.grade);
              return (
                <div className="bar-item" key={`chart-${submission.id}`}>
                  <div className="bar-wrap">
                    <div className={grade >= classAverage ? 'bar above-average' : 'bar below-average'} style={{ height: `${Math.max(grade, 4)}%` }}>
                      <span>{grade}</span>
                    </div>
                  </div>
                  <p>{submission.studentName || 'Student'}</p>
                  <small>{submission.examTitle || 'Exam'}</small>
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
              <th>Feedback</th>
              <th>Publish</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map(submission => {
              const draft = draftGrades[submission.id] || { grade: submission.grade, feedback: '', isPublished: true };
              return (
                <tr key={submission.id}>
                  <td>{submission.studentName || 'Unknown student'}</td>
                  <td>{submission.examTitle || 'Deleted exam'}</td>
                  <td>{new Date(submission.submittedAt).toLocaleString('en-US')}</td>
                  <td><input className="table-input" type="number" min="0" max="100" value={draft.grade} onChange={event => updateDraft(submission.id, { grade: Number(event.target.value) })} /></td>
                  <td><input className="table-input" value={draft.feedback} onChange={event => updateDraft(submission.id, { feedback: event.target.value })} placeholder="Teacher feedback" /></td>
                  <td><input type="checkbox" checked={draft.isPublished} onChange={event => updateDraft(submission.id, { isPublished: event.target.checked })} /></td>
                  <td><button className="secondary small" onClick={() => saveGrade(submission.id)}><Save size={14} /> Save</button></td>
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
