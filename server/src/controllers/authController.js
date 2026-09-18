const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');
const {
  signAccessToken,
  signRefreshToken,
  hashToken,
  setAuthCookies,
  clearAuthCookies,
  REFRESH_COOKIE,
} = require('../utils/tokens');

const isDev = process.env.NODE_ENV !== 'production';

// POST /api/v1/auth/signup
const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email, and password are required.');
  }
  if (password.length < 8) {
    res.status(400);
    throw new Error('Password must be at least 8 characters.');
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(409);
    throw new Error('An account with that email already exists.');
  }

  const user = await User.create({ name, email, password });
  const rawToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  sendVerificationEmail({ to: user.email, rawToken });

  res.status(201).json({
    success: true,
    message: 'Account created. Check your email (simulated - see server console) to verify your account.',
    user: user.toSafeJSON(),
    ...(isDev ? { devVerificationToken: rawToken } : {}),
  });
});

// GET /api/v1/auth/verify-email?token=...
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;
  if (!token) {
    res.status(400);
    throw new Error('Verification token is required.');
  }
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    emailVerificationTokenHash: tokenHash,
    emailVerificationExpires: { $gt: Date.now() },
  }).select('+emailVerificationTokenHash +emailVerificationExpires');

  if (!user) {
    res.status(400);
    throw new Error('Verification link is invalid or has expired.');
  }

  user.isEmailVerified = true;
  user.emailVerificationTokenHash = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  res.json({ success: true, message: 'Email verified successfully. You can now log in.' });
});

// POST /api/v1/auth/resend-verification
const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() });
  // Do not leak whether the account exists.
  if (user && !user.isEmailVerified) {
    const rawToken = user.createEmailVerificationToken();
    await user.save({ validateBeforeSave: false });
    sendVerificationEmail({ to: user.email, rawToken });
  }
  res.json({
    success: true,
    message: 'If that email exists and is unverified, a new verification link has been sent.',
  });
});

// POST /api/v1/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required.');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password.');
  }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });

  setAuthCookies(res, accessToken, refreshToken);
  res.json({ success: true, user: user.toSafeJSON() });
});

// POST /api/v1/auth/refresh
// Rotates the refresh token on every use, and rejects reuse of an already-rotated token.
const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) {
    res.status(401);
    throw new Error('No refresh token provided.');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    clearAuthCookies(res);
    res.status(401);
    throw new Error('Refresh token invalid or expired. Please log in again.');
  }

  const user = await User.findById(decoded.sub).select('+refreshTokenHash');
  if (!user || user.refreshTokenHash !== hashToken(token)) {
    // Token reuse or unknown user: invalidate session defensively.
    clearAuthCookies(res);
    res.status(401);
    throw new Error('Refresh token is no longer valid. Please log in again.');
  }

  const newAccessToken = signAccessToken(user);
  const newRefreshToken = signRefreshToken(user);
  user.refreshTokenHash = hashToken(newRefreshToken);
  await user.save({ validateBeforeSave: false });

  setAuthCookies(res, newAccessToken, newRefreshToken);
  res.json({ success: true, user: user.toSafeJSON() });
});

// POST /api/v1/auth/logout
const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      await User.findByIdAndUpdate(decoded.sub, { $unset: { refreshTokenHash: 1 } });
    } catch (err) {
      // token already invalid - nothing to clean up
    }
  }
  clearAuthCookies(res);
  res.json({ success: true, message: 'Logged out.' });
});

// GET /api/v1/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toSafeJSON() });
});

// POST /api/v1/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() });

  let rawToken;
  if (user) {
    rawToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    sendPasswordResetEmail({ to: user.email, rawToken });
  }

  res.json({
    success: true,
    message: 'If that email exists, a password reset link has been sent.',
    ...(isDev && rawToken ? { devResetToken: rawToken } : {}),
  });
});

// POST /api/v1/auth/reset-password
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    res.status(400);
    throw new Error('Token and new password are required.');
  }
  if (password.length < 8) {
    res.status(400);
    throw new Error('Password must be at least 8 characters.');
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+passwordResetTokenHash +passwordResetExpires');

  if (!user) {
    res.status(400);
    throw new Error('Reset link is invalid or has expired.');
  }

  user.password = password;
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpires = undefined;
  user.refreshTokenHash = undefined; // force re-login everywhere
  await user.save();

  clearAuthCookies(res);
  res.json({ success: true, message: 'Password reset successfully. Please log in.' });
});

module.exports = {
  signup,
  verifyEmail,
  resendVerification,
  login,
  refresh,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
};
