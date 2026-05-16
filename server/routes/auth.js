const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', authCtrl.register);
router.post('/verify-otp', authCtrl.verifyOTP);
router.post('/resend-otp', authCtrl.resendOTP);
router.post('/login', authCtrl.login);
router.get('/me', protect, authCtrl.getMe);
router.put('/profile', protect, authCtrl.updateProfile);
router.put('/password', protect, authCtrl.updatePassword);
router.post('/address', protect, authCtrl.addAddress);
router.put('/address/:addressId', protect, authCtrl.updateAddress);
router.delete('/address/:addressId', protect, authCtrl.deleteAddress);

module.exports = router;
