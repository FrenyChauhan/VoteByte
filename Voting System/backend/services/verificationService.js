const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const mailer = require('../utils/mailer');

// In-memory OTP store: email -> { code, expiresAt }
// NOTE: For production use a persistent store (DB / Redis) so OTPs survive restarts and multiple instances.
const otpStore = new Map();

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOtp(email) {
  // Ensure user exists
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('User not found');
  if (user.status === 'ACTIVE') throw new Error('User already verified');

  const code = generateOtp();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
  otpStore.set(email, { code, expiresAt });

  // send email
  await mailer.sendVerificationMail(email, code);

  return true;
}

async function verifyOtp(email, code) {
  const entry = otpStore.get(email);
  if (!entry) return { ok: false, reason: 'no_otp' };
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(email);
    return { ok: false, reason: 'expired' };
  }
  if (String(code) !== String(entry.code)) return { ok: false, reason: 'invalid' };

  // mark user as ACTIVE
  await prisma.user.update({ where: { email }, data: { status: 'ACTIVE' } });
  otpStore.delete(email);
  return { ok: true };
}

module.exports = { sendOtp, verifyOtp };

// Development helper: return OTP for an email (undefined in production)
function getOtp(email) {
  return otpStore.get(email)?.code;
}

module.exports.getOtp = getOtp;
