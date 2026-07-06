export function toPublicUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    role: row.role,
    createdAt: row.created_at
  };
}

export function toExam(row) {
  if (!row) return null;
  return {
    id: row.id,
    teacherId: row.teacher_id,
    title: row.title,
    course: row.course,
    description: row.description,
    durationMinutes: row.duration_minutes,
    status: row.status,
    questions: row.questions || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function toSubmission(row) {
  if (!row) return null;
  return {
    id: row.id,
    examId: row.exam_id,
    studentId: row.student_id,
    answers: row.answers || [],
    grade: row.grade,
    feedback: row.feedback || '',
    isPublished: row.is_published,
    submittedAt: row.submitted_at,
    updatedAt: row.updated_at,
    examTitle: row.exam_title,
    studentName: row.student_name,
    studentEmail: row.student_email
  };
}
