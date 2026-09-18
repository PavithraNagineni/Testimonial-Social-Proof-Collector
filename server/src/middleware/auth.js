const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { ACCESS_COOKIE } = require('../utils/tokens');

// Requires a valid access token. Attaches req.user (Mongoose doc, no sensitive fields).
const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.[ACCESS_COOKIE];
  if (!token) {
    res.status(401);
    throw new Error('Not authenticated. Please log in.');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (err) {
    res.status(401);
    throw new Error('Session expired or invalid. Please log in again.');
  }

  const user = await User.findById(decoded.sub);
  if (!user) {
    res.status(401);
    throw new Error('User no longer exists.');
  }

  req.user = user;
  next();
});

// Attaches req.user if present, but does not block unauthenticated requests.
// Used for public routes that behave slightly differently when logged in.
const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.[ACCESS_COOKIE];
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.sub);
    if (user) req.user = user;
  } catch (err) {
    // ignore - treated as unauthenticated
  }
  next();
});

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    res.status(403);
    throw new Error('You do not have permission to perform this action.');
  }
  next();
};

module.exports = { protect, optionalAuth, requireRole };
