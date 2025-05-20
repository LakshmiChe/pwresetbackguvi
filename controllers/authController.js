const Account = require("../models/Account");
const sendEmail = require("../utils/email");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

// Forgot Password Handler
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const account = await Account.findOne({ email: email.toLowerCase() });
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Store hashed token with expiry in the database
    account.resetToken = hashedToken;
    account.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await account.save();

    // Send email with reset link
    const resetLink = `http://pwresetbackguvi.vercel.app/api/auth/reset-password/${resetToken}`;
    const subject = "Password Reset Request";
    const html = `<p>Click <a href="${resetLink}">here</a> to reset your password. This link expires in 1 hour.</p>`;
    await sendEmail(email, subject, "", html);

    res.json({ message: "Password reset email sent" });
  } catch (err) {
    console.error("Error in forgotPassword:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Verify Token Handler
exports.verifyToken = async (req, res) => {
  const { token } = req.params;

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const account = await Account.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!account) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    res.json({ message: "Token is valid", userId: account._id });
  } catch (err) {
    console.error("Error in verifyToken:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Reset Password Handler
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const account = await Account.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!account) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear token fields
    account.password = hashedPassword;
    account.resetToken = null;
    account.resetTokenExpiry = null;
    await account.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Error in resetPassword:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update Password Handler
exports.updatePassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const account = await Account.findOne({ email: email.toLowerCase() });
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    // Hash new password and update account
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    account.password = hashedPassword;
    await account.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Error in updatePassword:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
