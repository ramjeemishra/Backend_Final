const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }
  const employee = await Employee.findOne({ email: email.trim().toLowerCase() }).select('+password');
  if (!employee || !(await bcrypt.compare(password, employee.password))) {
    return res.status(401).json({ message: 'Incorrect email or password.' });
  }
  const token = jwt.sign({ id: employee._id.toString() }, process.env.JWT_SECRET, { expiresIn: '1d', algorithm: 'HS256' });
  const safeEmployee = employee.toObject();
  delete safeEmployee.password;
  res.json({ token, employee: safeEmployee });
});

router.get('/me', authenticate, (req, res) => {
  res.json({ employee: req.employee });
});

module.exports = router;
