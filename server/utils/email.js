const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendEmail = async ({ to, subject, html, text }) => {
  console.log('Sending email to:', to);
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS exists:', !!process.env.EMAIL_PASS);
  
  if (!process.env.EMAIL_USER) {
    console.log(`[Email skipped] To: ${to}, Subject: ${subject}`);
    return;
  }
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'ShopZilla <noreply@shopzilla.com>',
    to,
    subject,
    html,
    text
  };
  return transporter.sendMail(mailOptions);
};