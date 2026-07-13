Exam Management System - Full Stack Version
===========================================

Recommended run:

docker compose up --build

Frontend: http://localhost:4173
Backend health: http://localhost:5001/api/health

Demo users:
Teacher: teacher@test.com / 123456
Student: student@test.com / 123456

The My Exams page includes the Edit Exam / Questions button.

My Exams blank-page fix:
- The My Exams page now validates API data before rendering.
- The page shows a readable error with Retry instead of a blank screen.
- Navigation resets the scroll position.
- An ErrorBoundary protects the application from full-page crashes.
