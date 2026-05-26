import React from 'react';
import { ClipboardList, FileCheck2, UsersRound } from 'lucide-react';
import { MockApiDbService } from '../../services/MockApiDbService';

export default function TeacherDashboard({ user, setPage }) {
  const exams = MockApiDbService.getExams().filter(exam => exam.teacherId === user.id);
  const submissions = MockApiDbService.getTeacherSubmissions(user.id);

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
        <div className="card stat-card"><ClipboardList /><h2>{exams.length}</h2><p>Created Exams</p></div>
        <div className="card stat-card"><FileCheck2 /><h2>{exams.filter(exam => exam.status === 'published').length}</h2><p>Published Exams</p></div>
        <div className="card stat-card"><UsersRound /><h2>{submissions.length}</h2><p>Student Submissions</p></div>
      </div>
    </section>
  );
}
