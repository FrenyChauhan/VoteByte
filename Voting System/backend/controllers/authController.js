const authService = require('../services/authService');
const uploadToCloudinary = require('../utils/uploadToCloudinary');
const verificationService = require('../services/verificationService');

async function register(req, res) {
  try {
    const { fullname, email, password, role, phone_number, gender, date_of_birth, address } = req.body;

    if (!fullname || !email || !password) {
      return res.status(400).json({ message: 'fullname, email and password are required' });
    }

    // If a file was uploaded via multer memory storage, upload to Cloudinary
    let profilePhotoUrl = '';
    if (req.file && req.file.buffer) {
      try {
        profilePhotoUrl = await uploadToCloudinary(req.file.buffer, 'profile_photos');
      } catch (uploadErr) {
        console.error('Cloudinary upload error', uploadErr);
        return res.status(500).json({ message: 'Failed to upload profile photo' });
      }
    } else if (req.body.profile_photo) {
      // fallback: client provided a URL in the body
      profilePhotoUrl = req.body.profile_photo;
    }

    const user = await authService.registerUser({
      fullname,
      email,
      password,
      role: role || 'USER',
      phone_number: phone_number || null,
      gender: gender || 'OTHER',
      date_of_birth: date_of_birth ? new Date(date_of_birth) : new Date(),
      address: address || '',
      profile_photo: profilePhotoUrl,
    });

    // send verification OTP to the user's email (fire-and-forget; failure shouldn't block signup)
    try {
      await verificationService.sendOtp(user.email);
    } catch (mailErr) {
      console.error('Failed to send verification email', mailErr);
      // still return created user but inform about email send failure
      return res.status(201).json({ user, message: 'User created but failed to send verification email. Please request a resend.' });
    }

    return res.status(201).json({ user, message: 'User created. Verification code sent to email.' });
  } catch (err) {
    console.error(err);
    if (err.code === 'P2002') {
      return res.status(409).json({ message: 'Email already in use' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'email and password required' });

    const { token, user } = await authService.authenticateUser(email, password);

    // set token as httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ user });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: err.message || 'Invalid credentials' });
  }
}

async function logout(req, res) {
  // clear cookie
  res.clearCookie('token');
  // destroy express-session if used
  if (req.session) {
    req.session.destroy(() => {});
  }
  return res.json({ message: 'Logged out' });
}

async function me(req, res) {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  // send user without password
  const { password, ...rest } = req.user;
  return res.json({ user: rest });
}

module.exports = { register, login, logout, me };
