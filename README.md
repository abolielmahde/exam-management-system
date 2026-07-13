# מערכת לניהול מבחנים מקוונים — Full Stack Exam Management System

מערכת Full Stack לניהול מבחנים, שאלות, הגשות, ציונים ומשוב. המערכת כוללת ממשק React למרצה ולסטודנט, שרת Express עם REST API, בסיס נתונים PostgreSQL, אימות JWT, Docker ו־GitHub Actions.
שמות המציגים:
מהדי אבו ליל 212192603
מוסטפא זידאן 322965369
## קישורים להגשה

## קישורים להגשה

- **GitHub – branch סופי:** https://github.com/abolielmahde/exam-management-system/tree/feature/fullstack-final
- **GitHub – repository:** https://github.com/abolielmahde/exam-management-system
- **Deployment – Frontend:** https://exam-management-frontend.onrender.com
- **Backend API:** https://exam-management-api-votx.onrender.com
- **Backend Health Check:** https://exam-management-api-votx.onrender.com/api/health
- **הרצה מקומית:** Frontend — `http://localhost:4173` | Backend health — `http://localhost:5001/api/health`
- 
> הערה: `localhost` ו־Docker מקומי אינם נחשבים Deployment ציבורי. לפני ההגשה יש להחליף את שורת ה־Deployment בקישור פעיל.

## משתמשי Demo

| תפקיד  | אימייל             | סיסמה    |
| ------ | ------------------ | -------- |
| מרצה   | `teacher@test.com` | `123456` |
| סטודנט | `student@test.com` | `123456` |

## פיצ'רים מרכזיים

### מרצה

- הרשמה והתחברות.
- יצירת מבחן עם שם, קורס, תיאור ומגבלת זמן.
- הוספה, מחיקה ועריכה של שאלות.
- סוגי שאלות: Multiple Choice, True/False, Open Text.
- שמירת מבחן כ־Draft, פרסום וסגירה.
- עריכת מבחן ושאלות קיימות דרך `Edit Exam / Questions`.
- צפייה בהגשות, שינוי ציון, כתיבת משוב ופרסום תוצאה.
- נתוני Analytics: מספר מבחנים, מספר מבחנים שפורסמו, מספר הגשות, ממוצע, ציון גבוה/נמוך וסטודנטים פעילים.

### סטודנט

- הרשמה והתחברות.
- צפייה במבחנים שפורסמו בלבד.
- כניסה למבחן עם טיימר.
- שליחת תשובות.
- בדיקה אוטומטית של שאלות סגורות.
- צפייה בציון, משוב וממוצע אישי.

## דפים מרכזיים ב־Frontend

| דף                | Component                | תפקיד                      |
| ----------------- | ------------------------ | -------------------------- |
| Home              | `App.jsx`                | דף פתיחה וניווט            |
| Login             | `Login.jsx`              | התחברות למערכת             |
| Register          | `Register.jsx`           | יצירת משתמש חדש            |
| Teacher Dashboard | `TeacherDashboard.jsx`   | סיכום נתונים למרצה         |
| Create/Edit Exam  | `CreateExam.jsx`         | יצירה ועריכת מבחן ושאלות   |
| My Exams          | `TeacherExams.jsx`       | פרסום, סגירה, עריכה ומחיקה |
| Submissions       | `TeacherSubmissions.jsx` | בדיקת הגשות, ציונים ומשוב  |
| Student Dashboard | `StudentDashboard.jsx`   | מבחנים זמינים לסטודנט      |
| Take Exam         | `TakeExam.jsx`           | פתרון מבחן והגשה           |
| Results           | `StudentResults.jsx`     | ציונים, משוב וממוצע אישי   |

## API מרכזי

Base URL מקומי: `http://localhost:5001/api`

| Method | Endpoint                            | הרשאה       | תפקיד                    |
| ------ | ----------------------------------- | ----------- | ------------------------ |
| GET    | `/health`                           | ציבורי      | בדיקת תקינות השרת        |
| POST   | `/auth/register`                    | ציבורי      | הרשמה                    |
| POST   | `/auth/login`                       | ציבורי      | התחברות וקבלת JWT        |
| GET    | `/auth/me`                          | משתמש מחובר | פרטי המשתמש המחובר       |
| GET    | `/exams`                            | מרצה/סטודנט | מבחנים לפי Role          |
| GET    | `/exams/:id`                        | מרצה/סטודנט | מבחן יחיד                |
| POST   | `/exams`                            | מרצה        | יצירת מבחן               |
| PUT    | `/exams/:id`                        | מרצה        | עריכת מבחן/שאלות/סטטוס   |
| DELETE | `/exams/:id`                        | מרצה        | מחיקת מבחן               |
| GET    | `/submissions`                      | מרצה/סטודנט | הגשות לפי הרשאה          |
| POST   | `/submissions/exams/:examId/submit` | סטודנט      | שליחת תשובות וחישוב ציון |
| PATCH  | `/submissions/:id/grade`            | מרצה        | שינוי ציון, משוב ופרסום  |
| GET    | `/analytics/teacher`                | מרצה        | סטטיסטיקות למרצה         |

---

# ארכיטקטורת המערכת

## מבט על — Client, Server, DB, Services

```text
Browser
  ↓
React Frontend
  ↓ fetch + JSON + Authorization: Bearer JWT
Express REST API
  ↓ SQL parameters
PostgreSQL
```

1. המשתמש עובד בדפדפן מול React.
2. ה־Components קוראים לפונקציות ב־`ApiService`.
3. `ApiService` שולח בקשות HTTP ל־Express ומצרף JWT כאשר קיים.
4. Middleware בשרת מאמת את ה־JWT ואת ה־Role.
5. Routes מפעילים Validation ולוגיקה עסקית.
6. שכבת DB שולחת שאילתות ל־PostgreSQL באמצעות `pg`.
7. השרת מחזיר JSON, וה־Frontend מעדכן את המסך.

### מי שומר מה?

- **PostgreSQL:** משתמשים, מבחנים, שאלות בתוך JSONB, הגשות, תשובות, ציונים ומשוב.
- **Browser localStorage:** רק `auth_token` ו־`current_user` כדי לשמור Session בצד לקוח.
- **Frontend state:** מצב זמני של טפסים, תשובות, טיימר ונתונים שמוצגים כרגע.
- **Backend:** אינו שומר מידע קבוע בזיכרון; המידע הקבוע נשמר ב־DB.

![System Architecture](docs/diagrams/01_system_architecture.png)

## ארכיטקטורת Client

ה־Client אינו MVC קלאסי; הוא בנוי בארכיטקטורת Components + Services + Models:

- `pages/` — מסכים ראשיים לפי תפקיד.
- `components/` — רכיבים משותפים כמו Navigation ו־Toast.
- `services/` — תקשורת API, אימות, אחסון מקומי, התראות ולוגים.
- `models/` — מחלקות OOP עבור User, Exam ו־Submission.
- `styles/` — עיצוב מרכזי.

![Client Architecture](docs/diagrams/02_client_architecture.png)

### Packages ב־Client

- `react`, `react-dom` — UI ו־Components.
- `vite` — Dev server ו־Production build.
- `lucide-react` — Icons.
- `@vitejs/plugin-react` — שילוב React עם Vite.

## ארכיטקטורת Server

ה־Server בנוי בשכבות:

- `server.js` — Bootstrap, Middleware וחיבור Routes.
- `routes/` — Endpoints ולוגיקה של Auth, Exams, Submissions ו־Analytics.
- `middleware/` — JWT, Authorization ו־Error handling.
- `utils/` — Validation, Grading ו־Mapping.
- `db/` — Connection pool ואתחול Schema/Seed.
- `config/` — Environment variables.

זו ארכיטקטורה Layered REST ולא MVC מלא: אין Controller/Repository נפרדים; ה־Route handlers ממלאים כרגע את תפקיד ה־Controller.

![Server Architecture](docs/diagrams/03_server_architecture.png)

### Packages ב־Server

- `express` — REST API.
- `pg` — PostgreSQL driver.
- `jsonwebtoken` — יצירה ואימות JWT.
- `bcryptjs` — Hash לסיסמאות.
- `cors` — הרשאת תקשורת מה־Frontend.
- `helmet` — Security headers.
- `morgan` — HTTP request logs.
- `dotenv` — טעינת Environment variables.

---

# DB ERD ו־JSON Models

## טבלאות

### users

- `id` — Primary Key.
- `full_name`.
- `email` — Unique.
- `password_hash` — סיסמה מוצפנת ב־bcrypt.
- `role` — teacher/student.
- `created_at`.

### exams

- `id` — Primary Key.
- `teacher_id` — Foreign Key אל users.
- `title`, `course`, `description`.
- `duration_minutes`.
- `status` — draft/published/closed.
- `questions` — JSONB.
- `created_at`, `updated_at`.

### submissions

- `id` — Primary Key.
- `exam_id` — Foreign Key אל exams.
- `student_id` — Foreign Key אל users.
- `answers` — JSONB.
- `grade`, `feedback`, `is_published`.
- `submitted_at`, `updated_at`.
- Unique על `(exam_id, student_id)`.

![Database ERD](docs/diagrams/04_database_erd.png)

## דוגמת JSON של שאלה

```json
{
  "type": "multiple-choice",
  "text": "What does API stand for?",
  "options": [
    "Application Programming Interface",
    "Advanced Process Internet",
    "Applied Program Index",
    "Automatic Page Input"
  ],
  "correctAnswer": 0,
  "points": 50
}
```

## דוגמת JSON של הגשה

```json
{
  "examId": "exam-id",
  "studentId": "student-id",
  "answers": [0, 1],
  "grade": 50,
  "feedback": "Good work",
  "isPublished": true
}
```

---

# OOP UML

המחלקות המרכזיות בצד הלקוח:

- `User` — נתוני משתמש ומתודות `isTeacher()` / `isStudent()`.
- `Exam` — נתוני מבחן ומתודות `publish()` / `close()`.
- `Submission` — הגשה, תשובות, ציון ומשוב.
- Services סטטיים: `ApiService`, `AuthService`, `StorageService`, `LoggerService`, `NotifyService`, `ConfigurationService`.

![OOP UML](docs/diagrams/05_oop_uml.png)

---

# תרחישים מרכזיים — Sequence Diagrams

## תרחיש 1: Login

1. המשתמש מזין אימייל וסיסמה.
2. Login Component קורא ל־AuthService.
3. AuthService קורא ל־ApiService.
4. השרת שולף User מה־DB ומשווה bcrypt hash.
5. השרת מחזיר JWT ו־User ציבורי.
6. ה־Client שומר Token ו־User ב־localStorage ומעביר למסך לפי Role.

![Login Sequence](docs/diagrams/06_sequence_login.png)

## תרחיש 2: מרצה יוצר ומפרסם מבחן

1. המרצה ממלא טופס ושאלות.
2. Frontend שולח POST ל־`/api/exams`.
3. JWT ו־Role נבדקים.
4. הנתונים עוברים Validation ונשמרים ב־PostgreSQL.
5. פרסום מתבצע באמצעות PUT ל־`/api/exams/:id` עם status=`published`.
6. המבחן מופיע לסטודנטים.

![Create and Publish Sequence](docs/diagrams/07_sequence_create_publish_exam.png)

## תרחיש 3: סטודנט מגיש ומקבל ציון

1. הסטודנט פותח מבחן שפורסם.
2. ה־Frontend מוריד את המבחן ומפעיל טיימר.
3. הסטודנט שולח תשובות.
4. ה־Backend בודק הרשאה, מאמת את מספר התשובות ומחשב ציון לשאלות סגורות.
5. ההגשה נשמרת ב־DB.
6. המרצה יכול לעדכן ציון/משוב.
7. הסטודנט רואה תוצאה שפורסמה.

![Submit and Grade Sequence](docs/diagrams/08_sequence_submit_grade.png)

---

# Milestones ומבנה ענפים

## Milestones שבוצעו

1. **Project structure:** יצירת React app, Components ו־Services.
2. **Authentication UI:** Login/Register ו־Role-based screens.
3. **Exam flow:** יצירה, שאלות, Draft/Publish/Close וטיימר.
4. **Student flow:** מבחנים זמינים, הגשה ותוצאות.
5. **Analytics:** ממוצעים וגרפים למרצה ולסטודנט.
6. **Full Stack:** Express API, PostgreSQL, JSONB ו־JWT.
7. **Security:** bcrypt, Helmet, CORS, Validation ו־Role middleware.
8. **DevOps:** Dockerfiles, Docker Compose ו־GitHub Actions.
9. **Final UX:** Edit Exam / Questions, משוב ופרסום ציונים.
10. **Documentation:** README, ERD, UML ו־Sequence diagrams.

## מבנה ענפים

- `main` — ענף בסיס/יציב של המאגר.
- `dev` — עבודה קודמת שנשמרה ללא שינוי.
- `feature/fullstack-final` — גרסת ההגשה המלאה של הפרויקט.

בענף הסופי קיימים commits נפרדים לאורך הפיתוח, והוא הועלה בלי למחוק או לשנות את `dev`.

![Git Branches and Milestones](docs/diagrams/10_git_branches_milestones.png)

---

# תהליכי עבודה, Docker, Unit Tests, Logs ו־Deploy

## Docker

`docker-compose.yml` מפעיל שלושה Services:

1. `postgres` — PostgreSQL 16 עם Volume קבוע ו־Healthcheck.
2. `backend` — Express על פורט 5001 ותלות ב־PostgreSQL healthy.
3. `frontend` — React production build על פורט 4173.

### הפעלה במחשב שבו מותקן Compose standalone

```bash
docker-compose down -v --remove-orphans
docker-compose up --build
```

### הפעלה במחשב עם Compose plugin חדש

```bash
docker compose down -v --remove-orphans
docker compose up --build
```

## Configurations

### Frontend

```env
VITE_API_BASE_URL=http://localhost:5001/api
```

### Backend

```env
PORT=5001
CLIENT_URL=http://localhost:4173
JWT_SECRET=change-me
JWT_EXPIRES_IN=2h
DATABASE_URL=postgres://exam_user:exam_password@postgres:5432/exam_management
DATABASE_SSL=false
```

קבצי `.env` אמיתיים אינם עולים ל־Git; משתמשים ב־`.env.example`.

## Unit Tests

קיים Unit Test ללוגיקת חישוב הציון:

```bash
cd backend
npm install
npm test
```

הבדיקה משתמשת ב־Node Test Runner ומוודאת חישוב ציונים לשאלות סגורות והתעלמות משאלות Open Text בבדיקה האוטומטית.

> היקף הבדיקות הנוכחי הוא בסיסי וממוקד ב־grading utility. אין בפרויקט כרגע Integration/E2E tests מלאים.

## Logs

- `morgan` מדפיס HTTP requests ב־Backend.
- `LoggerService` מדפיס אירועי Client לקונסול.
- PostgreSQL מדפיס לוגים דרך Container.
- צפייה בלוגים:

```bash
docker-compose logs backend --tail=100
docker-compose logs postgres --tail=100
docker-compose logs frontend --tail=100
```

## CI/CD

Workflow: `.github/workflows/ci.yml`

בכל Push ל־`main`, `dev` או `feature/fullstack-final`:

- מתקין Node 20.
- מתקין Frontend packages.
- מריץ Frontend build.
- מריץ `npm audit`.
- מתקין Backend packages.
- מריץ Unit Tests.
- מריץ Backend `npm audit`.

![DevOps Flow](docs/diagrams/09_devops_flow.png)

## Deploy

הפרויקט מוכן ל־Deploy באמצעות Environment variables ו־PostgreSQL בענן. תהליך מומלץ:

1. יצירת PostgreSQL בענן וקבלת `DATABASE_URL`.
2. העלאת Backend כשירות Node והגדרת Variables.
3. העלאת Frontend כ־Static site והגדרת `VITE_API_BASE_URL` לכתובת ה־Backend.
4. שינוי `CLIENT_URL` ב־Backend לכתובת ה־Frontend.
5. בדיקת `/api/health`, Login וזרימה מלאה.

**מצב נוכחי:** ההרצה המקומית ב־Docker עובדת. כתובת Deployment ציבורית עדיין צריכה להתווסף לשורת הקישורים בראש המסמך.

---

# מבנה הפרויקט

```text
exam-management-system-dev/
├── src/
│   ├── components/
│   ├── models/
│   ├── pages/
│   ├── services/
│   └── styles/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── db/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── utils/
│   ├── tests/
│   ├── sql/
│   └── Dockerfile
├── docs/
│   └── diagrams/
├── .github/workflows/ci.yml
├── Dockerfile.frontend
├── docker-compose.yml
├── package.json
└── README.md
```

# התאמה לדרישות המרצה

| דרישה                                   | מצב                              |
| --------------------------------------- | -------------------------------- |
| README/מסמך הסבר                        | קיים                             |
| GitHub link                             | קיים                             |
| Deployment link                         | **חסר קישור ציבורי — יש להוסיף** |
| פיצ'רים ודפים/API                       | מתועד                            |
| Client/Server/DB/Services               | מתועד + Diagram                  |
| Client architecture/packages/components | מתועד + Diagram                  |
| Server architecture/packages            | מתועד + Diagram                  |
| DB ERD + JSON Models                    | מתועד + Diagram                  |
| OOP UML                                 | מתועד + Diagram                  |
| 2–3 Scenarios + Sequence                | קיימים 3                         |
| Milestones + branches                   | מתועד                            |
| Docker/configurations/tests/logs        | מתועד                            |
| CI/CD                                   | קיים ומתועד                      |
