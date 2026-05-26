import { MockApiDbService } from '../../services/MockApiDbService';

export default function TeacherSubmissions({ user }) {
  const exams = MockApiDbService.getExams().filter(exam => exam.teacherId === user.id);
  const users = MockApiDbService.getUsers();
  const submissions = MockApiDbService.getTeacherSubmissions(user.id);

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Review</p>
          <h1>Student Submissions</h1>
          <p className="muted">This page shows grades calculated by the mock service after students submit exams.</p>
        </div>
      </div>

      <div className="table-card card">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Exam</th>
              <th>Submitted At</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map(submission => {
              const exam = exams.find(item => item.id === submission.examId);
              const student = users.find(item => item.id === submission.studentId);
              return (
                <tr key={submission.id}>
                  <td>{student?.fullName || 'Unknown student'}</td>
                  <td>{exam?.title || 'Deleted exam'}</td>
                  <td>{new Date(submission.submittedAt).toLocaleString('en-US')}</td>
                  <td><strong>{submission.grade}</strong></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {submissions.length === 0 && <p className="muted empty-table">No submissions yet.</p>}
      </div>
    </section>
  );
}
