import React from 'react';
import { useState } from 'react';
import { AuthService } from '../../services/AuthService';
import { NotifyService } from '../../services/NotifyService';

export default function Register({ onLogin, setPage }) {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '', role: 'student' });
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (form.password.length < 6) return 'Password must contain at least 6 characters';
    if (form.password !== form.confirmPassword) return 'Password confirmation does not match';
    if (!['teacher', 'student'].includes(form.role)) return 'Invalid user type';
    return null;
  };

  const submit = async event => {
    event.preventDefault();
    const error = validate();

    if (error) {
      NotifyService.error(error);
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      const user = await AuthService.register(payload);
      NotifyService.success('Account created successfully');
      onLogin(user);
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
        <label>Full Name<input value={form.fullName} onChange={event => setForm({ ...form, fullName: event.target.value })} required /></label>
        <label>Email<input type="email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} required /></label>
        <label>Password<input type="password" value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} required /></label>
        <label>Confirm Password<input type="password" value={form.confirmPassword} onChange={event => setForm({ ...form, confirmPassword: event.target.value })} required /></label>
        <label>User Type<select value={form.role} onChange={event => setForm({ ...form, role: event.target.value })}><option value="student">Student</option><option value="teacher">Teacher</option></select></label>
        <button className="primary" disabled={loading}>{loading ? 'Creating...' : 'Register'}</button>
        <button type="button" className="secondary" onClick={() => setPage('login')}>Already have an account? Login</button>
      </form>
    </section>
  );
}
