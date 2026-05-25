const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
const uploadsPath = path.join(__dirname, 'uploads');

app.use('/uploads', express.static(uploadsPath));
console.log(uploadsPath);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/submissions', require('./routes/submissions'));
app.use('/api/exams', require('./routes/exams'));
app.use('/api/marks', require('./routes/marks'));

app.get('/', (req, res) => {
  res.json({ message: 'Universal CodeBox Portal API Running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});