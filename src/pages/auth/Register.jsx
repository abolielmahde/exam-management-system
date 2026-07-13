/**
 * מסך הרשמה. אוסף פרטי משתמש חדש ומבצע בדיקות בסיסיות לפני שליחה לשרת.
 * ההערות בקובץ מסבירות את הזרימה וההחלטות המרכזיות בפרויקט.
 */
import React, { useState } from "react";
import { AuthService } from "../../services/AuthService";
import { NotifyService } from "../../services/NotifyService";
// טופס יצירת משתמש חדש.
export default function Register({ onLogin, setPage }) {
  const [form, setForm] = useState({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "student",
    }),
    [loading, setLoading] = useState(false);
  // בדיקות Client בסיסיות ולאחר מכן שליחת ההרשמה לשרת.
  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword)
      return NotifyService.error("Password confirmation does not match");
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      const u = await AuthService.register(payload);
      NotifyService.success("Account created successfully");
      onLogin(u);
    } catch (err) {
      NotifyService.error(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <section className="card narrow auth-card">
      <p className="eyebrow">New user</p>
      <h1>Create Account</h1>
      <form onSubmit={submit} className="form">
        <label>
          Full Name
          <input
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            required
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </label>
        <label>
          Confirm Password
          <input
            type="password"
            value={form.confirmPassword}
            onChange={(e) =>
              setForm({ ...form, confirmPassword: e.target.value })
            }
            required
          />
        </label>
        <label>
          User Type
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        </label>
        <button className="primary" disabled={loading}>
          {loading ? "Creating..." : "Register"}
        </button>
        <button
          type="button"
          className="secondary"
          onClick={() => setPage("login")}
        >
          Already have an account? Login
        </button>
      </form>
    </section>
  );
}
