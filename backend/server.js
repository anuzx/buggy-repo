const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const todoRoutes = require('./src/routes/todoRoutes');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Logs every mongoose query (including user data) to the console
mongoose.set('debug', true);

app.get('/', (req, res) => res.json({ message: 'Todo API is running' }));

app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

// 404 handler is MISSING - unknown routes hit the error handler below with no message

// Global error handler - leaks internal stack traces to the client
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message, stack: err.stack });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
