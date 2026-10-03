import React, { useState } from 'react';
import { api } from './api';
import { Brand } from './App';

export default function Login({ onLogin, message }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const data = await api('/auth/login', { method: 'POST', body: Object.fromEntries(new FormData(event.currentTarget)) });
      sessionStorage.setItem('onboarding-token', data.token);
      onLogin(data.employee);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return <div className="login-page">
    <section className="login-story"><Brand /><div className="story-content"><span className="eyebrow">GOOD BEGINNINGS, MADE SIMPLE</span><h1>Every new chapter<br />starts with a<br /><em>great first day.</em></h1><p>One place for your people, their next steps, and everything that makes them feel ready.</p><div className="story-card"><span className="story-check">✓</span><div><strong>A warm welcome, a clear path.</strong><span>Bring your onboarding together.</span></div></div></div><span className="story-footer">Your people. Their potential. A better beginning.</span></section>
    <section className="login-form-side"><div className="login-form-wrap"><span className="eyebrow blue">WELCOME TO YOUR WORKSPACE</span><h2>Welcome back.</h2><p className="muted">Sign in to keep your onboarding moving.</p>
      {(error || message) && <p role="alert" className="alert">{error || message}</p>}
      <form onSubmit={submit}><label>Email address<input type="email" name="email" autoComplete="username" placeholder="you@company.com" required /></label><label>Password<input type="password" name="password" autoComplete="current-password" placeholder="Enter your password" required /></label><button className="primary full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in to workspace'}<span>→</span></button></form>
      <p className="login-help">New to the team? Your HR administrator will share your account details.</p>
    </div><span className="login-bottom">A clear checklist. A confident start.</span></section>
  </div>;
}
