Exam Management System - Full Stack Version
==========================================

Demo users after first backend start:
Teacher: teacher@test.com / 123456
Student: student@test.com / 123456

OPTION A - Recommended full stack run with Docker
-------------------------------------------------
1. Open terminal inside this project folder.
2. Run:
   docker compose up --build
3. Open the frontend:
   http://localhost:4173
4. Backend health check:
   http://localhost:5001/api/health
5. PostgreSQL runs on localhost:5432.

OPTION B - Manual local run
---------------------------
1. Start PostgreSQL and create database/user:
   database: exam_management
   user: exam_user
   password: exam_password

2. Backend:
   cd backend
   cp .env.example .env
   npm install
   npm run dev

3. Frontend in a second terminal:
   cp .env.example .env
   npm install
   npm run dev

4. Open:
   http://localhost:5173

What was added in this full version
-----------------------------------
- Backend API with Node.js and Express.
- PostgreSQL database with users, exams and submissions tables.
- JWT authentication.
- Role-based authorization for teacher/student.
- Multiple question types: multiple choice, true/false, open text.
- Student exam submission with automatic grading.
- Teacher review screen with grade editing, feedback and result publishing.
- Analytics dashboard and average grade graph.
- Docker and docker-compose.
- GitHub Actions CI/CD pipeline.
- Documentation, API explanation, database diagram and architecture notes.

Docker fix note:
This version uses Node 20 and npm install without the generated package-lock files, so Docker downloads packages from the public npm registry and installs Vite correctly.

Latest UI update:
- In Teacher Demo -> My Exams, every exam card now has an "Edit Exam / Questions" button.
- Use this button to update exam title, course, description, time limit, question text, question type, answers, correct answer, and points.
