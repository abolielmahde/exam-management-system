/**
 * נקודת הכניסה של שרת Express. מגדירה Middleware, Routes, Database ו-Graceful Shutdown.
 * ההערות בקובץ מסבירות את הזרימה וההחלטות המרכזיות בפרויקט.
 */
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { initDatabase } from "./db/initDatabase.js";
import { pool } from "./db/pool.js";
import { authRoutes } from "./routes/authRoutes.js";
import { examRoutes } from "./routes/examRoutes.js";
import { submissionRoutes } from "./routes/submissionRoutes.js";
import { analyticsRoutes } from "./routes/analyticsRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
// יצירת אפליקציית Express.
const app = express();
// Middleware אבטחה, CORS, JSON parsing ולוגים של בקשות HTTP.
app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));
// Health Check עבור Docker ו-Deployment.
app.get("/api/health", (req, res) =>
  res.json({ status: "ok", service: "exam-management-backend" }),
);
// חיבור קבוצות ה-Routes לכתובות ה-API.
app.use("/api/auth", authRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use(notFound);
app.use(errorHandler);
// פתיחת השרת ואתחול הטבלאות ונתוני ה-Demo.
const server = app.listen(env.port, async () => {
  try {
    await initDatabase();
    console.log(`Backend API is running on http://localhost:${env.port}`);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
});
// סגירה מסודרת של השרת ושל חיבורי PostgreSQL.
const shutdown = () =>
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
