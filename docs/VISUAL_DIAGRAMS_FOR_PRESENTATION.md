# Visual Diagrams for Final Presentation

Use these diagrams in the final presentation. They can be copied into tools that support Mermaid diagrams, or redrawn as boxes/arrows in PowerPoint.

## 1. Architecture Diagram

```mermaid
flowchart LR
    A[Teacher / Student Browser] --> B[React Frontend - Vite]
    B --> C[REST API - Node.js / Express]
    C --> D[(PostgreSQL Database)]
    C --> E[JWT Authentication]
    C --> F[Validation + Role Authorization]
    D --> G[Users]
    D --> H[Exams + Questions JSONB]
    D --> I[Submissions + Answers + Grades]
```

## 2. Database ERD

```mermaid
erDiagram
    USERS ||--o{ EXAMS : creates
    USERS ||--o{ SUBMISSIONS : submits
    EXAMS ||--o{ SUBMISSIONS : receives

    USERS {
      uuid id PK
      string name
      string email
      string password_hash
      string role
    }

    EXAMS {
      uuid id PK
      uuid teacher_id FK
      string title
      string course
      text description
      integer duration_minutes
      string status
      jsonb questions
    }

    SUBMISSIONS {
      uuid id PK
      uuid exam_id FK
      uuid student_id FK
      jsonb answers
      numeric score
      text feedback
      string status
    }
```

## 3. Use Case Diagram

```mermaid
flowchart TB
    Teacher[Lecturer / Teacher]
    Student[Student]
    System[Exam Management System]

    Teacher --> UC1[Create Exam]
    Teacher --> UC2[Edit Exam / Edit Questions]
    Teacher --> UC3[Publish or Close Exam]
    Teacher --> UC4[Review Submissions]
    Teacher --> UC5[Grade and Publish Feedback]
    Teacher --> UC6[View Analytics]

    Student --> UC7[Login]
    Student --> UC8[View Available Exams]
    Student --> UC9[Enter Exam]
    Student --> UC10[Submit Answers]
    Student --> UC11[View Grades and Feedback]

    UC1 --> System
    UC2 --> System
    UC3 --> System
    UC4 --> System
    UC5 --> System
    UC6 --> System
    UC7 --> System
    UC8 --> System
    UC9 --> System
    UC10 --> System
    UC11 --> System
```

## 4. Frontend Component Hierarchy

```mermaid
flowchart TD
    App --> NavigationMenu
    App --> Login
    App --> Register
    App --> TeacherDashboard
    App --> CreateExam
    App --> TeacherExams
    App --> TeacherSubmissions
    App --> StudentDashboard
    App --> TakeExam
    App --> StudentResults
    CreateExam --> QuestionEditor[Question fields and type selector]
    TeacherExams --> EditButton[Edit Exam / Questions]
    TeacherSubmissions --> GradeFeedback[Manual grade and feedback]
```
