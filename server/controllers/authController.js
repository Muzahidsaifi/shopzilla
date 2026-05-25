const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendEmail } = require('../utils/email');
const { generateOTP, generateOTPExpiry, otpEmailTemplate } = require('../utils/otp');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRE || '30d'
});

const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({ success: true, token, user });
};

// STEP 1: Register — send OTP only
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required.' });
    }

    const otp = generateOTP();
    const otpExpiry = generateOTPExpiry();

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.emailVerified) {
      return res.status(400).json({ error: 'Email already registered. Please login.' });
    }

    if (existingUser && !existingUser.emailVerified) {
      existingUser.name = name;
      existingUser.emailOTP = otp;
      existingUser.emailOTPExpiry = otpExpiry;
      if (password) existingUser.password = password;
      await existingUser.save();
    } else {
      await User.create({
        name, email, password, phone,
        emailVerified: false,
        emailOTP: otp,
        emailOTPExpiry: otpExpiry,
      });
    }

    // Send OTP email — only once
    try {
      await sendEmail({
        to: email,
        subject: '🔐 Verify Your Email - ShopZilla OTP',
        html: otpEmailTemplate(name, otp),
      });
    } catch (emailErr) {
      console.error('Email failed:', emailErr.message);
    }

    res.status(200).json({
      success: true,
      message: `OTP sent to ${email}.`,
      email,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// STEP 2: Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required.' });
    }

    const user = await User.findOne({ email }).select('+emailOTP +emailOTPExpiry');
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    if (user.emailOTP !== otp) {
      return res.status(400).json({ error: 'Invalid OTP. Please try again.' });
    }
    if (new Date() > user.emailOTPExpiry) {
      return res.status(400).json({ error: 'OTP expired. Please request a new one.' });
    }

    user.emailVerified = true;
    user.emailOTP = undefined;
    user.emailOTPExpiry = undefined;
    await user.save();

    // Welcome email
    try {
      await sendEmail({
        to: email,
        subject: '🎉 Welcome to ShopZilla!',
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;">
            <h2 style="color:#f97316;">Welcome to ShopZilla, ${user.name}! 🎉</h2>
            <p>Your account has been verified. Start shopping now!</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error('Welcome email failed:', emailErr.message);
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Resend OTP
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (user.emailVerified) return res.status(400).json({ error: 'Email already verified.' });

    const otp = generateOTP();
    const otpExpiry = generateOTPExpiry();
    user.emailOTP = otp;
    user.emailOTPExpiry = otpExpiry;
    await user.save();

    

    try {
      await sendEmail({
        to: email,
        subject: '🔐 New OTP - ShopZilla',
        html: otpEmailTemplate(user.name, otp),
      });
    } catch (emailErr) {
      console.error('Resend email failed:', emailErr.message);
    }

    res.json({ success: true, message: 'New OTP sent.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    if (!user.isActive) {
      return res.status(401).json({ error: 'Account deactivated.' });
    }
    if (!user.emailVerified) {
      const otp = generateOTP();
      user.emailOTP = otp;
      user.emailOTPExpiry = generateOTPExpiry();
      await user.save();
      try {
        await sendEmail({
          to: email,
          subject: '🔐 Verify Your Email - ShopZilla',
          html: otpEmailTemplate(user.name, otp),
        });
      } catch (emailErr) {
        console.error('Login OTP email failed:', emailErr.message);
      }
      return res.status(403).json({
        error: 'Email not verified.',
        requiresVerification: true,
        email,
        message: 'OTP sent to your email.',
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist', 'name price images rating');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id, { name, phone, avatar },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }
    user.password = newPassword;
    await user.save();
    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (req.body.isDefault) user.addresses.forEach(a => a.isDefault = false);
    user.addresses.push(req.body);
    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const addr = user.addresses.id(req.params.addressId);
    if (!addr) return res.status(404).json({ error: 'Address not found.' });
    if (req.body.isDefault) user.addresses.forEach(a => a.isDefault = false);
    Object.assign(addr, req.body);
    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.addresses = user.addresses.filter(a => a._id.toString() !== req.params.addressId);
    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};