function getProgress(tasks) {
  const total = tasks.length;
  const completed = tasks.filter(task => task.status === 'completed').length;
  return {
    total,
    completed,
    pending: total - completed,
    percentage: total === 0 ? 0 : Math.floor(completed / total * 100)
  };
}

module.exports = getProgress;
