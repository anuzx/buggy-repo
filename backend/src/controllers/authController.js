const User = require('../models/User');
const generateToken = require('../utils/token');

// registerUser - stores passwords in PLAINTEXT
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill all fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // BUG: password is saved as-is, bcryptjs is never used.
    // The pre('save') hook in the model is commented out.
    const user = await User.create({ name, email, password });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user),
    });
  } catch (error) {
    next(error);
  }
};

// loginUser - plaintext comparison + user enumeration
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });

    // Enumeration: tells attackers whether an account exists
    if (!user) {
      return res.status(401).json({ message: 'No account found with this email' });
    }

    // Plaintext comparison
    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user),
    });
  } catch (error) {
    next(error);
  }
};

// getMe - returns the user doc straight from the middleware, including password
const getMe = async (req, res, next) => {
  try {
    res.json(req.user);
  } catch (error) {
    next(error);
  }
};

module.exports = { registerUser, loginUser, getMe };
