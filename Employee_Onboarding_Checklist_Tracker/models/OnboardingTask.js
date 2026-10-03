const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  taskName: { type: String, required: true, trim: true, maxlength: 120 },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  dueDate: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model('OnboardingTask', taskSchema);
