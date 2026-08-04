const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // NOTE: password is NOT excluded here, so /api/auth/me leaks it.
      // Also, if the user was deleted from the DB the lookup returns null,
      // but we still call next() -> downstream code crashes on req.user.id
      // or worse, proceeds with req.user = null.
      req.user = await User.findById(decoded.id);

      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
