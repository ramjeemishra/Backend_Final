const express = require('express');
const bcrypt = require('bcryptjs');
const Employee = require('../models/Employee');
const Task = require('../models/OnboardingTask');
const { authenticate, hrOnly, checklistAccess } = require('../middleware/auth');
const { taskError } = require('../middleware/validation');
const getProgress = require('../progress');

const router = express.Router();
router.use(authenticate);

router.get('/', hrOnly, async (req, res) => {
  const employees = await Employee.find({ role: 'employee' }).sort({ createdAt: -1 }).lean();
  const tasks = await Task.find().lean();
  res.json({ employees: employees.map(employee => ({
    ...employee,
    progress: getProgress(tasks.filter(task => task.employee.equals(employee._id)))
  })) });
});

router.post('/', hrOnly, async (req, res) => {
  const { name, email, password, department } = req.body || {};
  if ([name, email, password, department].some(value => typeof value !== 'string' || !value.trim())) {
    return res.status(400).json({ message: 'Name, email, password, and department are required.' });
  }
  if (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
    return res.status(400).json({ message: 'Password must be at least 8 characters and at most 72 bytes.' });
  }
  const employee = await Employee.create({ name, email, password: await bcrypt.hash(password, 10), department, role: 'employee' });
  const safeEmployee = employee.toObject();
  delete safeEmployee.password;
  res.status(201).json({ employee: safeEmployee });
});

router.get('/:id/checklist', checklistAccess, async (req, res) => {
  const tasks = await Task.find({ employee: req.params.id }).sort({ dueDate: 1, createdAt: 1 });
  res.json({ employee: req.checklistEmployee, tasks, progress: getProgress(tasks) });
});

router.post('/:id/checklist', hrOnly, checklistAccess, async (req, res) => {
  const { tasks } = req.body || {};
  if (!Array.isArray(tasks) || tasks.length === 0 || tasks.length > 50) {
    return res.status(400).json({ message: 'Provide between 1 and 50 tasks.' });
  }
  for (const task of tasks) {
    const message = taskError(task);
    if (message) return res.status(400).json({ message });
  }
  const savedTasks = await Task.insertMany(tasks.map(task => ({
    taskName: task.taskName,
    dueDate: task.dueDate,
    employee: req.params.id,
    assignedBy: req.employee._id
  })));
  res.status(201).json({ tasks: savedTasks });
});

router.get('/:id/onboarding-progress', checklistAccess, async (req, res) => {
  const tasks = await Task.find({ employee: req.params.id });
  res.json({ employee: req.checklistEmployee, progress: getProgress(tasks) });
});

module.exports = router;
