const verificationService = require('../services/verificationService');

async function sendOtp(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'email is required' });

    await verificationService.sendOtp(email);
    return res.json({ message: 'OTP sent to email' });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: err.message || 'Failed to send OTP' });
  }
}

async function verifyOtp(req, res) {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ message: 'email and code are required' });

    const result = await verificationService.verifyOtp(email, code);
    if (!result.ok) {
      if (result.reason === 'expired') return res.status(400).json({ message: 'OTP expired' });
      if (result.reason === 'invalid') return res.status(400).json({ message: 'Invalid OTP' });
      return res.status(400).json({ message: 'No OTP found for this email' });
    }

    return res.json({ message: 'Email verified successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to verify OTP' });
  }
}

module.exports = { sendOtp, verifyOtp };

// Dev-only: return current OTP stored in memory for the given email
async function debugOtp(req, res) {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ message: 'Not allowed in production' });
    }
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'email query param required' });
    const code = verificationService.getOtp(email);
    if (!code) return res.status(404).json({ message: 'No OTP found for this email' });
    return res.json({ email, code });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch OTP' });
  }
}

module.exports.debugOtp = debugOtp;
