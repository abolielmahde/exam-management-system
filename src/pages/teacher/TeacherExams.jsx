import { CheckCircle2, Lock, Trash2 } from 'lucide-react';
import { MockApiDbService } from '../../services/MockApiDbService';
import { NotifyService } from '../../services/NotifyService';
import { ConfigurationService } from '../../services/ConfigurationService';

export default function TeacherExams({ user, refresh }) {
  const exams = MockApiDbService.getExams().filter(exam => exam.teacherId === user.id);

  const changeStatus = (id, status) => {
    MockApiDbService.updateExam(id, { status });
    NotifyService.success(`Exam marked as ${ConfigurationService.statusLabel(status)}`);
    refresh();
  };

  const remove = id => {
    const approved = confirm('Delete this exam and its related submissions?');
    if (!approved) return;
    MockApiDbService.deleteExam(id);
    NotifyService.info('Exam deleted');
    refresh();
  };

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Status management</p>
          <h1>My Exams</h1>
          <p className="muted">Publish exams for students, close them when the exam is finished, or delete drafts.</p>
        </div>
      </div>

      <div className="cards-list">
        {exams.map(exam => (
          <div className="card exam-card" key={exam.id}>
            <div className="card-topline">
              <span className={`badge ${exam.status}`}>{ConfigurationService.statusLabel(exam.status)}</span>
              <span className="muted small-text">{exam.questions.length} questions · {exam.durationMinutes || 30} min</span>
            </div>
            <h2>{exam.title}</h2>
            <p><strong>Course:</strong> {exam.course}</p>
            <p>{exam.description || 'No description was added.'}</p>

            <div className="actions">
              <button className="primary" disabled={exam.status === 'published'} onClick={() => changeStatus(exam.id, 'published')}><CheckCircle2 size={16} /> Publish</button>
              <button className="secondary" disabled={exam.status === 'closed'} onClick={() => changeStatus(exam.id, 'closed')}><Lock size={16} /> Close</button>
              <button className="danger" onClick={() => remove(exam.id)}><Trash2 size={16} /> Delete</button>
            </div>
          </div>
        ))}
        {exams.length === 0 && <div className="card empty-state"><h2>No exams yet</h2><p>Create your first exam from the Create Exam page.</p></div>}
      </div>
    </section>
  );
}
