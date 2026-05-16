// server/utils/otp.js
const crypto = require('crypto');

// Generate 6 digit OTP
exports.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate OTP expiry (10 minutes)
exports.generateOTPExpiry = () => {
  return new Date(Date.now() + 10 * 60 * 1000);
};

// OTP Email HTML Template
exports.otpEmailTemplate = (name, otp) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification - ShopZilla</title>
  </head>
  <body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',sans-serif;">
    <div style="max-width:480px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#f97316,#8b5cf6);padding:32px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:28px;font-weight:800;letter-spacing:-0.5px;">🛍️ ShopZilla</h1>
        <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Your Premium Shopping Destination</p>
      </div>

      <!-- Body -->
      <div style="padding:40px 32px;">
        <h2 style="color:#0f172a;font-size:22px;margin:0 0 8px;">Verify Your Email 📧</h2>
        <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 28px;">
          Hi <strong>${name}</strong>! Welcome to ShopZilla. Use the OTP below to verify your email address and activate your account.
        </p>

        <!-- OTP Box -->
        <div style="background:#fff7ed;border:2px dashed #f97316;border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;">
          <p style="color:#9a3412;font-size:13px;margin:0 0 8px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Your OTP Code</p>
          <div style="font-size:42px;font-weight:800;color:#f97316;letter-spacing:8px;font-family:monospace;">${otp}</div>
          <p style="color:#9a3412;font-size:12px;margin:12px 0 0;">⏰ Valid for <strong>10 minutes</strong> only</p>
        </div>

        <p style="color:#64748b;font-size:13px;margin:0 0 8px;">🔒 If you didn't request this, please ignore this email.</p>
        <p style="color:#64748b;font-size:13px;margin:0;">Never share your OTP with anyone.</p>
      </div>

      <!-- Footer -->
      <div style="background:#f8fafc;padding:20px 32px;text-align:center;border-top:1px solid #e2e8f0;">
        <p style="color:#94a3b8;font-size:12px;margin:0;">Made with ❤️ by <strong>Muzahid Saifi</strong> | ShopZilla © ${new Date().getFullYear()}</p>
      </div>
    </div>
  </body>
  </html>
  `;
};
