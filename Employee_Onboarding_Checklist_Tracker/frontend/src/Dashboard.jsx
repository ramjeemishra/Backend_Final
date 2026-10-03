import React, { useEffect, useState } from 'react';
import { api } from './api';
import { Avatar, Progress } from './App';

export default function Dashboard({ onSelect }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');

  async function load() {
    setError('');
    setLoading(true);
    try { setEmployees((await api('/employees')).employees); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function createEmployee(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const data = await api('/employees', { method: 'POST', body: Object.fromEntries(new FormData(event.currentTarget)) });
      onSelect(data.employee);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  const complete = employees.filter(employee => employee.progress.total > 0 && employee.progress.percentage === 100).length;
  const pending = employees.reduce((total, employee) => total + employee.progress.pending, 0);
  const filtered = employees.filter(employee => `${employee.name} ${employee.email} ${employee.department}`.toLowerCase().includes(search.toLowerCase()));

  return <>
    <div className="page-heading"><div><span className="eyebrow blue">PEOPLE & PROGRESS</span><h1>A great start for everyone.</h1><p className="muted">Keep every new hire on track, from their first task to their first day.</p></div><button className="primary" onClick={() => setShowForm(!showForm)}>{showForm ? 'Close form' : '+ Add employee'}</button></div>
    {error && <div className="alert" role="alert">{error} <button className="text-button" onClick={load}>Retry</button></div>}
    {showForm && <section className="panel form-panel"><h2>Add a new employee</h2><p className="muted">Create their account, then put their checklist together.</p><form onSubmit={createEmployee} className="employee-form"><label>Full name<input name="name" required maxLength={80} placeholder="e.g. Aanya Sharma" /></label><label>Email address<input name="email" type="email" required placeholder="aanya@company.com" /></label><label>Department<input name="department" required maxLength={80} placeholder="e.g. Engineering" /></label><label>Initial password<input name="password" type="password" required minLength={8} maxLength={72} autoComplete="new-password" placeholder="At least 8 characters" /></label><div className="form-actions"><button type="button" className="secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="primary" disabled={busy}>{busy ? 'Creating…' : 'Create employee'}</button></div></form></section>}
    <div className="stats-grid"><div className="stat"><span>Total employees <span className="stat-icon">◎</span></span><strong>{loading ? '—' : employees.length}</strong><small>People in your workspace</small></div><div className="stat"><span>Ready to go <span className="stat-icon green">✓</span></span><strong>{loading ? '—' : complete}</strong><small>Checklists fully completed</small></div><div className="stat"><span>Tasks remaining <span className="stat-icon amber">◷</span></span><strong>{loading ? '—' : pending}</strong><small>Next steps across your team</small></div></div>
    <section className="panel"><div className="panel-heading"><div><h2>Your people <span className="count">{employees.length}</span></h2><p className="muted">A little visibility goes a long way.</p></div><label className="search-label"><span className="sr-only">Search employees</span><input type="search" placeholder="Search name or department…" value={search} onChange={event => setSearch(event.target.value)} /></label></div>
      {loading ? <div className="empty">Loading your team…</div> : filtered.length === 0 ? <div className="empty"><span className="empty-symbol">◎</span><h3>{search ? 'No matches found' : 'Your next great hire starts here'}</h3><p>{search ? 'Try a different name or department.' : 'Add your first employee and give them a clear path forward.'}</p>{!search && <button className="primary" onClick={() => setShowForm(true)}>+ Add employee</button>}</div> : <div className="table-scroll"><table><thead><tr><th>EMPLOYEE</th><th>DEPARTMENT</th><th>PROGRESS</th><th>STATUS</th><th><span className="sr-only">View checklist</span></th></tr></thead><tbody>{filtered.map(employee => <tr key={employee._id}><td><div className="person"><Avatar name={employee.name} /><div><button className="name-button" onClick={() => onSelect(employee)}>{employee.name}</button><span>{employee.email}</span></div></div></td><td>{employee.department}</td><td><Progress progress={employee.progress} /><small>{employee.progress.completed} of {employee.progress.total} tasks</small></td><td><span className={`badge ${employee.progress.percentage === 100 ? 'done' : employee.progress.total ? 'in-progress' : ''}`}>{employee.progress.percentage === 100 ? 'Completed' : employee.progress.total ? 'In progress' : 'Not started'}</span></td><td><button className="row-link" onClick={() => onSelect(employee)} aria-label={`View ${employee.name}'s checklist`}>↗</button></td></tr>)}</tbody></table></div>}
      <div className="panel-footer">A smooth onboarding experience, one step at a time.</div>
    </section>
  </>;
}
