/**
 * יוצר Connection Pool ל-PostgreSQL ומספק פונקציית query משותפת לכל ה-Routes.
 * ההערות בקובץ מסבירות את הזרימה וההחלטות המרכזיות בפרויקט.
 */
import pg from "pg";
import { env } from "../config/env.js";
const { Pool } = pg;
// Pool שומר מספר חיבורים זמינים ומשפר ביצועים לעומת פתיחת חיבור בכל בקשה.
export const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: env.databaseSsl ? { rejectUnauthorized: false } : false,
});
// פונקציה משותפת להרצת SQL פרמטרי ובטוח יותר מפני SQL Injection.
export function query(text, params = []) {
  return pool.query(text, params);
}
