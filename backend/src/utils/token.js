const jwt = require('jsonwebtoken');

// The whole user document is stuffed into the token payload,
// including the (plaintext) password. JWT payloads are only
// base64url-encoded, NOT encrypted - anyone can decode them.
// expiresIn of 30 days is also far too long.
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      password: user.password,
    },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

module.exports = generateToken;
