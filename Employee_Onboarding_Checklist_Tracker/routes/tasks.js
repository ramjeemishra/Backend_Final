const express = require('express');
const { authenticate, hrOnly, taskOwner } = require('../middleware/auth');
const { taskError } = require('../middleware/validation');

const router = express.Router();
router.use(authenticate);

router.patch('/:id/complete', taskOwner, async (req, res) => {
  const { completed } = req.body || {};
  if (completed !== undefined && typeof completed !== 'boolean') {
    return res.status(400).json({ message: 'Completed must be true or false.' });
  }
  req.task.status = completed === false ? 'pending' : 'completed';
  await req.task.save();
  res.json({ task: req.task });
});

router.patch('/:id', hrOnly, taskOwner, async (req, res) => {
  const { taskName, dueDate } = req.body || {};
  if (taskName === undefined && dueDate === undefined) {
    return res.status(400).json({ message: 'Provide a task name or due date to update.' });
  }
  const updated = {
    taskName: taskName === undefined ? req.task.taskName : taskName,
    dueDate: dueDate === undefined ? req.task.dueDate.toISOString().slice(0, 10) : dueDate
  };
  const message = taskError(updated);
  if (message) return res.status(400).json({ message });
  req.task.taskName = updated.taskName;
  req.task.dueDate = updated.dueDate;
  await req.task.save();
  res.json({ task: req.task });
});

router.delete('/:id', hrOnly, taskOwner, async (req, res) => {
  await req.task.deleteOne();
  res.json({ message: 'Task deleted.' });
});

module.exports = router;
