const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  password: { type: String, required: true, select: false },
  department: { type: String, required: true, trim: true, maxlength: 80 },
  role: { type: String, enum: ['hr', 'employee'], default: 'employee' }
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);
