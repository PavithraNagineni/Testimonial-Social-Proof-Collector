/**
 * Email verification / password reset "simulation".
 *
 * No real mail transport is required to run this project locally. When
 * SMTP_HOST is not configured, we log the email content to the server
 * console (so you can copy the link during development/testing) and, in
 * non-production environments, echo the raw token back in the API
 * response so the frontend can auto-fill it. This mirrors the assessment
 * brief's "Email Verification simulation" requirement without requiring
 * a third-party mail account.
 *
 * To send real emails, plug in nodemailer + the SMTP_* env vars here.
 */

function logSimulatedEmail({ to, subject, body }) {
  console.log('\n──────── SIMULATED EMAIL ────────');
  console.log(`From: ${process.env.EMAIL_FROM}`);
  console.log(`To:   ${to}`);
  console.log(`Subj: ${subject}`);
  console.log(body);
  console.log('──────────────────────────────────\n');
}

function sendVerificationEmail({ to, rawToken }) {
  const link = `${process.env.CLIENT_URL}/verify-email?token=${rawToken}`;
  logSimulatedEmail({
    to,
    subject: 'Verify your email',
    body: `Welcome! Please verify your email by visiting:\n${link}\n\nThis link expires in 24 hours.`,
  });
}

function sendPasswordResetEmail({ to, rawToken }) {
  const link = `${process.env.CLIENT_URL}/reset-password?token=${rawToken}`;
  logSimulatedEmail({
    to,
    subject: 'Reset your password',
    body: `We received a request to reset your password. Visit:\n${link}\n\nThis link expires in 1 hour. If you did not request this, ignore this email.`,
  });
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
