function taskError(task) {
  if (!task || typeof task.taskName !== 'string' || !task.taskName.trim() || task.taskName.trim().length > 120) {
    return 'Task name must contain 1 to 120 characters.';
  }
  if (typeof task.dueDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(task.dueDate)) {
    return 'Choose a valid due date (YYYY-MM-DD).';
  }
  const date = new Date(task.dueDate);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== task.dueDate) {
    return 'Choose a valid due date.';
  }
  return null;
}

module.exports = { taskError };
