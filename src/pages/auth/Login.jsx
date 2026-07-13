/**
 * מסך התחברות. שולח אימייל וסיסמה ל-Backend ושומר את המשתמש לאחר Login מוצלח.
 * ההערות בקובץ מסבירות את הזרימה וההחלטות המרכזיות בפרויקט.
 */
import React, { useState } from "react";
import { AuthService } from "../../services/AuthService";
import { ConfigurationService } from "../../services/ConfigurationService";
import { NotifyService } from "../../services/NotifyService";
// טופס Login למרצה או לסטודנט.
export default function Login({ onLogin, setPage }) {
  const [form, setForm] = useState({ email: "", password: "" }),
    [loading, setLoading] = useState(false),
    demo = ConfigurationService.demoAccounts();
  // שליחת פרטי ההתחברות ל-AuthService וטיפול בתוצאה.
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await AuthService.login(form.email, form.password);
      NotifyService.success("Logged in successfully");
      onLogin(u);
    } catch (err) {
      NotifyService.error(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <section className="card narrow auth-card">
      <p className="eyebrow">Welcome back</p>
      <h1>Login</h1>
      <div className="demo-buttons">
        <button type="button" onClick={() => setForm(demo.teacher)}>
          Use Teacher Demo
        </button>
        <button type="button" onClick={() => setForm(demo.student)}>
          Use Student Demo
        </button>
      </div>
      <form onSubmit={submit} className="form">
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
        <button className="primary" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
        <button
          type="button"
          className="secondary"
          onClick={() => setPage("register")}
        >
          No account? Register
        </button>
      </form>
    </section>
  );
}
