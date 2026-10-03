import React, { useEffect, useState } from 'react';
import { api } from './api';
import Login from './Login';
import Dashboard from './Dashboard';
import Checklist from './Checklist';

export function Brand() {
  return <div className="brand"><span className="brand-mark">✓</span>onboard<span className="brand-dot">.</span></div>;
}

export function Progress({ progress }) {
  return <div className="progress-wrap"><div className="progress-track" role="progressbar" aria-label="Onboarding completion" aria-valuenow={progress.percentage} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${progress.percentage}%` }} /></div><span>{progress.percentage}%</span></div>;
}

export function Avatar({ name }) {
  return <span className="avatar">{name.split(' ').map(word => word[0]).slice(0, 2).join('').toUpperCase()}</span>;
}

export default function App() {
  const [employee, setEmployee] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (sessionStorage.getItem('onboarding-token')) {
      api('/auth/me').then(data => setEmployee(data.employee)).catch(err => setError(err.message)).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
    const expire = () => {
      sessionStorage.removeItem('onboarding-token');
      setEmployee(null);
      setSelected(null);
      setError('Your session has expired. Please log in again.');
    };
    window.addEventListener('session-expired', expire);
    return () => window.removeEventListener('session-expired', expire);
  }, []);

  function logout() {
    sessionStorage.removeItem('onboarding-token');
    setEmployee(null);
    setSelected(null);
    setError('');
  }

  if (loading) return <div className="loading-page"><Brand /><p>Opening your workspace…</p></div>;
  if (!employee) return <Login message={error} onLogin={user => { setEmployee(user); setError(''); }} />;

  return <div className="app-shell">
    <aside className="sidebar">
      <Brand />
      <div className="workspace-label">YOUR WORKSPACE</div>
      <nav aria-label="Main navigation"><button className="nav-item active" onClick={() => setSelected(null)}><span>▦</span>{employee.role === 'hr' ? 'HR Dashboard' : 'My Checklist'}</button></nav>
      <div className="sidebar-note"><span className="note-icon">↗</span><strong>A great start starts here.</strong><p>Small steps. Clear progress. Everything ready for day one.</p></div>
      <div className="profile"><Avatar name={employee.name} /><div><strong>{employee.name}</strong><span>{employee.role === 'hr' ? 'HR administrator' : employee.department}</span></div></div>
      <button className="logout" onClick={logout}>Sign out <span>↗</span></button>
    </aside>
    <div className="main-shell">
      <header className="topbar"><span>Workspace <span className="crumb">/</span> <strong>{selected ? 'Employee progress' : employee.role === 'hr' ? 'Overview' : 'My checklist'}</strong></span><span className="workspace-badge">Employee onboarding</span></header>
      <main>
        {employee.role === 'hr' && !selected
          ? <Dashboard onSelect={setSelected} />
          : <Checklist key={selected?._id || employee._id} employeeId={selected?._id || employee._id} currentUser={employee} onBack={selected ? () => setSelected(null) : null} />}
      </main>
      <footer>Onboard · A little structure for a great beginning.</footer>
    </div>
  </div>;
}
