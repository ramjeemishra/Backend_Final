const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');
const Task = require('../models/OnboardingTask');

async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Please log in first.' });
  }

  let payload;
  try {
    payload = jwt.verify(header.slice(7), process.env.JWT_SECRET, { algorithms: ['HS256'] });
  } catch {
    return res.status(401).json({ message: 'Your session has expired. Please log in again.' });
  }

  req.employee = await Employee.findById(payload.id);
  if (!req.employee) return res.status(401).json({ message: 'Account not found. Please log in again.' });
  next();
}

function hrOnly(req, res, next) {
  if (req.employee.role !== 'hr') return res.status(403).json({ message: 'Only HR can perform this action.' });
  next();
}

async function checklistAccess(req, res, next) {
  const employee = await Employee.findById(req.params.id);
  if (!employee || employee.role !== 'employee') return res.status(404).json({ message: 'Employee not found.' });
  if (req.employee.role !== 'hr' && !employee._id.equals(req.employee._id)) {
    return res.status(403).json({ message: 'You can only view your own checklist.' });
  }
  req.checklistEmployee = employee;
  next();
}

async function taskOwner(req, res, next) {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found.' });
  const isEmployee = task.employee.equals(req.employee._id);
  const isAssignedHr = req.employee.role === 'hr' && task.assignedBy.equals(req.employee._id);
  if (!isEmployee && !isAssignedHr) {
    return res.status(403).json({ message: 'Only the assigned HR admin or employee can change this task.' });
  }
  req.task = task;
  next();
}

module.exports = { authenticate, hrOnly, checklistAccess, taskOwner };
