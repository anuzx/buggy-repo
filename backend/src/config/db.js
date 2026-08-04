const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Falls back to a local DB with no auth if MONGO_URI is unset
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/todoapp';
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
