import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateGrade } from '../src/utils/grading.js';

test('calculateGrade gives full score for correct auto-graded answers', () => {
  const questions = [
    { type: 'multiple-choice', correctAnswer: 1, points: 1 },
    { type: 'true-false', correctAnswer: 0, points: 1 }
  ];
  assert.equal(calculateGrade(questions, [1, 0]), 100);
});

test('calculateGrade ignores open text questions for automatic grading', () => {
  const questions = [
    { type: 'multiple-choice', correctAnswer: 0, points: 1 },
    { type: 'open-text', correctAnswer: '', points: 1 }
  ];
  assert.equal(calculateGrade(questions, [1, 'manual answer']), 0);
});
