require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

if (!process.env.MONGODB_URI || !process.env.JWT_SECRET || process.env.JWT_SECRET === 'replace-with-a-long-random-secret') {
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    const port = process.env.PORT || 5050;
    app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
  })
  .catch(error => {
    console.error('mongo failed:', error.message);
    process.exit(1);
  });
