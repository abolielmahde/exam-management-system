import React from 'react';
import { useState } from 'react';
import { AuthService } from '../../services/AuthService';
import { ConfigurationService } from '../../services/ConfigurationService';
import { NotifyService } from '../../services/NotifyService';

export default function Login({ onLogin, setPage }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const demo = ConfigurationService.demoAccounts();

  const submit = async event => {
    event.preventDefault();
    setLoading(true);

    try {
      const user = await AuthService.login(form.email, form.password);
      NotifyService.success('Logged in successfully');
      onLogin(user);
    } catch (error) {
      NotifyService.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = role => {
    setForm({ email: demo[role].email, password: demo[role].password });
  };

  return (
    <section className="card narrow auth-card">
      <p className="eyebrow">Welcome back</p>
      <h1>Login</h1>
      <p className="muted">Use one of the demo accounts or register a new teacher/student account.</p>

      <div className="demo-buttons">
        <button type="button" onClick={() => fillDemo('teacher')}>Use Teacher Demo</button>
        <button type="button" onClick={() => fillDemo('student')}>Use Student Demo</button>
      </div>

      <form onSubmit={submit} className="form">
        <label>Email<input type="email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} required /></label>
        <label>Password<input type="password" value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} required /></label>
        <button className="primary" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        <button type="button" className="secondary" onClick={() => setPage('register')}>No account? Register</button>
      </form>
    </section>
  );
}
