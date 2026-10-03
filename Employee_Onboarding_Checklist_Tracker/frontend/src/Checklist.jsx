import React, { useEffect, useState } from 'react';
import { api } from './api';
import { Avatar, Progress } from './App';

export default function Checklist({ employeeId, currentUser, onBack }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState('all');
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const isHr = currentUser.role === 'hr';

  async function load() {
    try { setData(await api(`/employees/${employeeId}/checklist`)); }
    catch (err) { setError(err.message); }
  }

  useEffect(() => { load(); }, [employeeId]);

  async function change(path, method, body) {
    setBusy(true);
    setError('');
    try {
      await api(path, { method, body });
      setEditing(null);
      setDeleting(null);
      await load();
      return true;
    } catch (err) { setError(err.message); return false; }
    finally { setBusy(false); }
  }

  async function addTask(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const task = Object.fromEntries(new FormData(form));
    if (await change(`/employees/${employeeId}/checklist`, 'POST', { tasks: [task] })) form.reset();
  }

  if (!data) return <div className="panel empty">{error ? <><p className="alert" role="alert">{error}</p><button className="secondary" onClick={load}>Retry</button></> : 'Loading checklist…'}</div>;
  const tasks = data.tasks.filter(task => filter === 'all' || task.status === filter);

  return <>
    {onBack && <button className="back-button" onClick={onBack}>← Back to dashboard</button>}
    <div className="page-heading"><div><span className="eyebrow blue">{isHr ? 'EMPLOYEE PROGRESS' : 'YOUR NEXT CHAPTER'}</span><h1>{isHr ? `${data.employee.name.split(' ')[0]}'s onboarding` : `Let's get you settled in.`}</h1><p className="muted">{isHr ? 'A clear view of every step in their journey.' : 'Your first steps, all in one place. You’ve got this.'}</p></div><span className="badge in-progress">{data.employee.department}</span></div>
    {error && <div className="alert" role="alert">{error}</div>}
    <section className="panel progress-panel"><div className="person"><Avatar name={data.employee.name} /><div><strong>{data.employee.name}</strong><span>{data.employee.email}</span></div></div><div className="progress-summary"><div><strong>{data.progress.percentage === 100 ? 'All set. Welcome aboard!' : data.progress.total ? 'A little closer with every step.' : 'A fresh start, ready to begin.'}</strong><span>{data.progress.completed} of {data.progress.total} tasks completed</span></div><Progress progress={data.progress} /></div></section>
    <div className={`checklist-layout ${isHr ? '' : 'single'}`}><section className="panel"><div className="panel-heading"><div><h2>Onboarding checklist <span className="count">{data.tasks.length}</span></h2><p className="muted">The essentials for a confident start.</p></div></div><div className="tabs" aria-label="Filter tasks">{[['all', 'All tasks'], ['pending', 'To do'], ['completed', 'Completed']].map(([value, label]) => <button key={value} className={filter === value ? 'selected' : ''} aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>)}</div>
      {tasks.length === 0 ? <div className="empty"><span className="empty-symbol">✓</span><h3>{data.tasks.length ? 'Nothing here right now' : 'A blank page, a new beginning'}</h3><p>{data.tasks.length ? 'Try another filter to see your other tasks.' : isHr ? 'Add the first task to start this checklist.' : 'Your HR team will add your onboarding tasks here.'}</p></div> : <ul className="task-list">{tasks.map(task => {
        const canManage = isHr && task.assignedBy === currentUser._id;
        const canComplete = canManage || task.employee === currentUser._id;
        const overdue = task.status === 'pending' && task.dueDate.slice(0, 10) < new Date().toLocaleDateString('en-CA');
        return <li key={task._id} className="task-row"><div className="task-main"><input type="checkbox" checked={task.status === 'completed'} disabled={busy || !canComplete} aria-label={`Complete ${task.taskName}`} onChange={event => change(`/tasks/${task._id}/complete`, 'PATCH', { completed: event.target.checked })} /><div className="task-details"><strong className={task.status === 'completed' ? 'completed-name' : ''}>{task.taskName}</strong><span className={overdue ? 'overdue' : ''}>Due {new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })}{overdue ? ' · Overdue' : ''}</span></div><span className={`badge ${task.status === 'completed' ? 'done' : ''}`}>{task.status === 'completed' ? 'Done' : 'To do'}</span></div>
          {canManage && <div className="task-actions"><button className="text-button" disabled={busy} onClick={() => { setEditing(editing === task._id ? null : task._id); setDeleting(null); }}>Edit</button><button className="text-button danger" disabled={busy} onClick={() => { setDeleting(task._id); setEditing(null); }}>Delete</button></div>}
          {editing === task._id && <form className="task-edit" onSubmit={event => { event.preventDefault(); change(`/tasks/${task._id}`, 'PATCH', Object.fromEntries(new FormData(event.currentTarget))); }}><label>Task name<input name="taskName" defaultValue={task.taskName} required maxLength={120} /></label><label>Due date<input name="dueDate" type="date" defaultValue={task.dueDate.slice(0, 10)} required /></label><div className="form-actions"><button className="secondary" type="button" onClick={() => setEditing(null)}>Cancel</button><button className="primary" disabled={busy}>Save changes</button></div></form>}
          {deleting === task._id && <div className="delete-confirm"><span>Delete this task?</span><button className="text-button" onClick={() => setDeleting(null)} disabled={busy}>Cancel</button><button className="text-button danger" disabled={busy} onClick={() => change(`/tasks/${task._id}`, 'DELETE')}>Yes, delete</button></div>}
        </li>;
      })}</ul>}
      <div className="panel-footer">{isHr ? 'You can edit tasks assigned by you.' : 'Your progress is saved as you go.'}</div>
    </section>{isHr && <aside className="panel add-task-panel"><span className="add-icon">+</span><h2>Add a next step</h2><p className="muted">Make it clear, practical, and easy to check off.</p><form onSubmit={addTask}><label>Task name<input name="taskName" placeholder="e.g. Collect your laptop" required maxLength={120} /></label><label>Due date<input name="dueDate" type="date" required /></label><button className="primary full" disabled={busy}>{busy ? 'Saving…' : '+ Add task'}</button></form><p className="form-hint">Only you and this employee can mark this task complete.</p></aside>}</div>
  </>;
}
