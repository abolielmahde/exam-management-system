/**
 * Routes של הרשמה, התחברות ובדיקת המשתמש המחובר.
 * ההערות בקובץ מסבירות את הזרימה וההחלטות המרכזיות בפרויקט.
 */
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { env } from "../config/env.js";
import { query } from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";
import { toPublicUser } from "../utils/mappers.js";
import { validateRegistration } from "../utils/validators.js";
export const authRoutes = express.Router();
// יצירת JWT שמכיל מזהה משתמש ו-Role ללא מידע סודי.
const sign = (u) =>
  jwt.sign({ sub: u.id, role: u.role, email: u.email }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
// הרשמה: Validation, Hash לסיסמה, שמירה ב-DB והחזרת Token.
authRoutes.post("/register", async (req, res, next) => {
  try {
    const d = {
      fullName: String(req.body.fullName || "").trim(),
      email: String(req.body.email || "")
        .trim()
        .toLowerCase(),
      password: String(req.body.password || ""),
      role: req.body.role,
    };
    const e = validateRegistration(d);
    if (e.length) return res.status(400).json({ message: e.join(", ") });
    const h = await bcrypt.hash(d.password, 10);
    const r = await query(
      "INSERT INTO users(id,full_name,email,password_hash,role) VALUES($1,$2,$3,$4,$5) RETURNING id,full_name,email,role,created_at",
      [randomUUID(), d.fullName, d.email, h, d.role],
    );
    const user = toPublicUser(r.rows[0]);
    res.status(201).json({ user, token: sign(user) });
  } catch (e) {
    if (e.code === "23505")
      return res.status(409).json({ message: "Email already exists" });
    next(e);
  }
});
// התחברות: חיפוש משתמש והשוואת הסיסמה ל-Hash באמצעות bcrypt.
authRoutes.post("/login", async (req, res, next) => {
  try {
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();
    const r = await query("SELECT * FROM users WHERE email=$1", [email]);
    const row = r.rows[0];
    if (
      !row ||
      !(await bcrypt.compare(
        String(req.body.password || ""),
        row.password_hash,
      ))
    )
      return res.status(401).json({ message: "Invalid email or password" });
    const user = toPublicUser(row);
    res.json({ user, token: sign(user) });
  } catch (e) {
    next(e);
  }
});
// החזרת המשתמש שכבר אומת על ידי requireAuth.
authRoutes.get("/me", requireAuth, (req, res) => res.json({ user: req.user }));
