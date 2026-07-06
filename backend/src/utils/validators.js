const allowedRoles = ['teacher', 'student'];
const allowedStatuses = ['draft', 'published', 'closed'];
const allowedQuestionTypes = ['multiple-choice', 'true-false', 'open-text'];

export function validateRegistration(data) {
  const errors = [];
  if (!data.fullName || data.fullName.trim().length < 2) errors.push('Full name is required');
  if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) errors.push('Valid email is required');
  if (!data.password || data.password.length < 6) errors.push('Password must contain at least 6 characters');
  if (!allowedRoles.includes(data.role)) errors.push('Role must be teacher or student');
  return errors;
}

export function validateExam(data, partial = false) {
  const errors = [];

  if (!partial || data.title !== undefined) {
    if (!data.title || data.title.trim().length < 2) errors.push('Exam title is required');
  }

  if (!partial || data.course !== undefined) {
    if (!data.course || data.course.trim().length < 2) errors.push('Course is required');
  }

  if (data.durationMinutes !== undefined) {
    const duration = Number(data.durationMinutes);
    if (!Number.isInteger(duration) || duration < 1 || duration > 240) errors.push('Duration must be between 1 and 240 minutes');
  }

  if (data.status !== undefined && !allowedStatuses.includes(data.status)) errors.push('Invalid exam status');

  if (!partial || data.questions !== undefined) {
    if (!Array.isArray(data.questions) || data.questions.length === 0) {
      errors.push('Exam must contain at least one question');
    } else {
      data.questions.forEach((question, index) => {
        if (!allowedQuestionTypes.includes(question.type || 'multiple-choice')) errors.push(`Question ${index + 1}: invalid type`);
        if (!question.text || question.text.trim().length < 2) errors.push(`Question ${index + 1}: text is required`);
        const type = question.type || 'multiple-choice';
        if (type === 'multiple-choice') {
          if (!Array.isArray(question.options) || question.options.length < 2) errors.push(`Question ${index + 1}: at least two options are required`);
          if (question.options?.some(option => !String(option).trim())) errors.push(`Question ${index + 1}: all options must be filled`);
          if (Number(question.correctAnswer) < 0 || Number(question.correctAnswer) >= question.options.length) errors.push(`Question ${index + 1}: correct answer is invalid`);
        }
        if (type === 'true-false') {
          question.options = ['True', 'False'];
          if (![0, 1, '0', '1'].includes(question.correctAnswer)) errors.push(`Question ${index + 1}: true/false answer is invalid`);
        }
      });
    }
  }

  return errors;
}

export function validateAnswers(answers) {
  if (!Array.isArray(answers)) return ['Answers must be an array'];
  return [];
}
