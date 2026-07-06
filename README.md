# Exam Management System - Full Stack Project

This project is a full stack web application for managing online exams and student submissions.

## Main Features

### Lecturer / Teacher
- Register and login with JWT authentication.
- Create and manage exams.
- Add multiple question types: multiple choice, true/false, open text.
- Publish or close exams.
- Review student submissions.
- Edit grades, add feedback and publish results.
- View analytics: class average, highest grade, lowest grade and active students.

### Student
- Register and login.
- View published exams.
- Enter an exam with a time limit.
- Submit answers.
- View grades, feedback and personal average.

## Technology Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: PostgreSQL
- Authentication: JWT + bcrypt password hashing
- DevOps: Docker, Docker Compose, GitHub Actions

## Quick Run

```bash
docker compose up --build
```

Open:

- Frontend: http://localhost:4173
- Backend: http://localhost:5001/api/health

Demo accounts:

- Teacher: teacher@test.com / 123456
- Student: student@test.com / 123456

## Local Development

Backend:

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Frontend:

```bash
cp .env.example .env
npm install
npm run dev
```

## Project Structure

```text
.
├── src/                         React frontend
├── backend/                     Express backend API
│   ├── src/db/                  PostgreSQL initialization and pool
│   ├── src/routes/              Auth, exams, submissions, analytics routes
│   ├── src/middleware/          JWT auth, roles and error handling
│   └── tests/                   Backend unit tests
├── docs/                        Documentation and diagrams
├── docker-compose.yml           Frontend + backend + PostgreSQL
└── .github/workflows/ci.yml     CI/CD pipeline
```
