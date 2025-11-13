const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../config/multer-config');
const verificationController = require('../controllers/verificationController');

// register with optional profile photo upload (field name: profile_photo)
router.post('/register', upload.single('profile_photo'), authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', authMiddleware, authController.me);

// verification routes
router.post('/send-otp', verificationController.sendOtp);
router.post('/verify-otp', verificationController.verifyOtp);
router.post('/resend-otp', verificationController.sendOtp); // alias for send-otp for resend use case
// dev-only debug route to read OTP from server memory (only when NODE_ENV !== 'production')
router.get('/debug-otp', verificationController.debugOtp);

module.exports = router;
