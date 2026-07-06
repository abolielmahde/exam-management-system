import React from 'react';
import { useEffect, useState } from 'react';
import { ClipboardList, FileCheck2, UsersRound } from 'lucide-react';
import { ApiService } from '../../services/ApiService';
import { NotifyService } from '../../services/NotifyService';

export default function TeacherDashboard({ user, setPage }) {
  const [analytics, setAnalytics] = useState({ exams_count: 0, published_count: 0, submissions_count: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const data = await ApiService.getTeacherAnalytics();
        setAnalytics(data);
      } catch (error) {
        NotifyService.error(error.message);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, [user.id]);

  if (loading) return <section className="card"><h2>Loading dashboard...</h2></section>;

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Teacher area</p>
          <h1>Teacher Dashboard</h1>
          <p className="muted">Create exams, publish them, close them, and review student submissions.</p>
        </div>
        <button className="primary" onClick={() => setPage('create-exam')}>Create New Exam</button>
      </div>

      <div className="grid-3">
        <div className="card stat-card"><ClipboardList /><h2>{analytics.exams_count || 0}</h2><p>Created Exams</p></div>
        <div className="card stat-card"><FileCheck2 /><h2>{analytics.published_count || 0}</h2><p>Published Exams</p></div>
        <div className="card stat-card"><UsersRound /><h2>{analytics.submissions_count || 0}</h2><p>Student Submissions</p></div>
      </div>
    </section>
  );
}
