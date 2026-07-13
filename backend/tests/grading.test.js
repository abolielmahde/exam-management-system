/**
 * בדיקות יחידה לפונקציית חישוב הציון ללא תלות בשרת או בבסיס הנתונים.
 * ההערות בקובץ מסבירות את הזרימה וההחלטות המרכזיות בפרויקט.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { calculateGrade } from "../src/utils/grading.js";
test("full score", () =>
  assert.equal(
    calculateGrade(
      [
        { type: "multiple-choice", correctAnswer: 1, points: 1 },
        { type: "true-false", correctAnswer: 0, points: 1 },
      ],
      [1, 0],
    ),
    100,
  ));
