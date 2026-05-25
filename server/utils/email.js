const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendEmail = async ({ to, subject, html, text }) => {
  if (!process.env.EMAIL_USER) {
    console.log(`[Email skipped] To: ${to}`);
    return;
  }
  try {
    const result = await transporter.sendMail({
      from: `ShopZilla <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text
    });
    console.log('✅ Email sent:', result.messageId);
    return result;
  } catch (err) {
    console.error('❌ Email error:', err.message);
  }
};