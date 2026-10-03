const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

app.use(cors({ origin: (process.env.CLIENT_URL || 'http://localhost:5179,http://127.0.0.1:5179').split(',').map(url => url.trim()) }));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({ message: connected ? 'API is running.' : 'Database is unavailable.' });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/tasks', require('./routes/tasks'));

app.use((req, res) => res.status(404).json({ message: 'Route not found.' }));

app.use((error, req, res, next) => {
  if (error.code === 11000) return res.status(409).json({ message: 'This email is already registered.' });
  if (error.name === 'ValidationError') {
    return res.status(400).json({ message: Object.values(error.errors).map(item => item.message).join(' ') });
  }
  if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid ID or field value.' });
  if (error.type === 'entity.parse.failed') return res.status(400).json({ message: 'Request body must be valid JSON.' });
  if (error.type === 'entity.too.large') return res.status(413).json({ message: 'Request body is too large.' });
  console.error(error);
  res.status(500).json({ message: 'Something went wrong. Please try again.' });
});

module.exports = app;
