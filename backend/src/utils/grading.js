export function calculateGrade(questions, answers) {
  const safeQuestions = Array.isArray(questions) ? questions : [];
  if (safeQuestions.length === 0) return 0;

  let totalPoints = 0;
  let earnedPoints = 0;

  safeQuestions.forEach((question, index) => {
    const type = question.type || 'multiple-choice';
    const points = Number(question.points || 1);

    if (type === 'open-text') {
      return;
    }

    totalPoints += points;
    const expected = String(question.correctAnswer ?? '').trim().toLowerCase();
    const actual = String(answers[index] ?? '').trim().toLowerCase();
    if (expected === actual) earnedPoints += points;
  });

  if (totalPoints === 0) return 0;
  return Math.round((earnedPoints / totalPoints) * 100);
}
