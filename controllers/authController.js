const Account = require("../models/Account");
const sendEmail = require("../utils/email");
const crypto = require("crypto");
// const bcrypt = require("bcrypt");
const bcrypt = require("bcryptjs");

// Forgot Password Handler
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a random string (token)
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Store token in the database with expiry
    user.resetToken = resetToken;
    user.tokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send email with reset link
    const resetLink = `http://pwresetbackguvi.vercel.app/reset-password/${resetToken}`;
    const subject = 'Password Reset Request';
    const html = `<p>Click <a href="${resetLink}">here</a> to reset your password. This link expires in 1 hour.</p>`;
    await sendEmail(email, subject, '', html);

    res.json({ message: 'Password reset email sent' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Verify Token Handler
exports.verifyToken = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({ resetToken: token, tokenExpiry: { $gt: Date.now() } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    res.json({ message: 'Token is valid', userId: user._id });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Reset Password Handler
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({ resetToken: token, tokenExpiry: { $gt: Date.now() } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear token
    user.password = hashedPassword;
    user.resetToken = null;
    user.tokenExpiry = null;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update Password
exports.updatePassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Find account
    const account = await Account.findOne({ email });
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    // Hash new password and update account
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    account.password = hashedPassword;
    account.resetToken = null;
    account.resetTokenExpiry = null;
    await account.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
