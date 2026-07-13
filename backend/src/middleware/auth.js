/**
 * Middleware לאימות JWT ולבדיקת הרשאות לפי Role.
 * ההערות בקובץ מסבירות את הזרימה וההחלטות המרכזיות בפרויקט.
 */
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { query } from "../db/pool.js";
import { toPublicUser } from "../utils/mappers.js";
// אימות JWT, שליפת המשתמש מה-DB והוספתו ל-req.user.
export async function requireAuth(req, res, next) {
  try {
    const h = req.headers.authorization || "";
    const token = h.startsWith("Bearer ") ? h.slice(7) : null;
    if (!token)
      return res.status(401).json({ message: "Missing authorization token" });
    const decoded = jwt.verify(token, env.jwtSecret);
    const r = await query(
      "SELECT id, full_name, email, role, created_at FROM users WHERE id=$1",
      [decoded.sub],
    );
    const user = toPublicUser(r.rows[0]);
    if (!user)
      return res.status(401).json({ message: "User no longer exists" });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
// Authorization: מאפשר המשך רק אם Role המשתמש נמצא ברשימת התפקידים המותרים.
export const requireRole =
  (...roles) =>
  (req, res, next) =>
    roles.includes(req.user?.role)
      ? next()
      : res
          .status(403)
          .json({ message: "Forbidden: insufficient permissions" });
