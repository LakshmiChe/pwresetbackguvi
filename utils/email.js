// emailService.js
const nodemailer = require('nodemailer');
require('dotenv').config(); // Ensure to load environment variables

// Configure the transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Fetches from .env
    pass: process.env.EMAIL_PASS, // Fetches from .env
  },
});

// Function to send email
async function sendEmail(to, subject, text, html) {
  const mailOptions = {
    from: process.env.EMAIL_USER, // Sender email
    to, // Recipient email
    subject, // Email subject
    text, // Plain text body
    html, // HTML body
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return info;
  } catch (error) {
    console.error('Error sending email: ', error);
    throw error;
  }
}

module.exports = sendEmail;