const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT) || 587,
  secure: Number(process.env.MAIL_PORT) === 465, // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function sendVerificationMail(to, code) {
  const mailOptions = {
    from: process.env.MAIL_FROM || '"VoteByte" <no-reply@votebyte.local>',
    to,
    subject: 'VoteByte — Email verification code',
    text: `Your verification code is ${code}. It expires in 5 minutes.`,
    html: `<p>Your verification code is <strong>${code}</strong>. It expires in 5 minutes.</p>`,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { sendVerificationMail };
