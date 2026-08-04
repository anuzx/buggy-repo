const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    // NOTE: no format validation - "not-an-email" is accepted
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    // minlength 3 is far too weak
    minlength: [3, 'Password must be at least 3 characters'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// bcrypt is imported but the pre-save hook below is intentionally missing,
// so passwords are stored and compared as PLAINTEXT.
// userSchema.pre('save', async function (next) { ... });

module.exports = mongoose.model('User', userSchema);
