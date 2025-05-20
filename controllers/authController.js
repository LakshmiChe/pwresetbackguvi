const Account = require("../models/Account");
const sendEmail = require("../utils/email");
const crypto = require("crypto");
// const bcrypt = require("bcrypt");
const bcrypt = require("bcryptjs");

// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if the account exists
    const account = await Account.findOne({ email });
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    // Generate a random token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + parseInt(process.env.RESET_LINK_EXPIRY);

    // Update account in the database
    account.resetToken = resetToken;
    account.resetTokenExpiry = resetTokenExpiry;
    await account.save();

    // Send email
    //const resetLink = `${req.protocol}://${req.get("host")}/api/auth/reset-password/${resetToken}`;
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await sendEmail(account.email, "Password Reset", `<p>Click <a href="${resetLink}">here</a> to reset your password. The link expires in 1 hour.</p>`);

    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;

    // Find account with the token
    const account = await Account.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!account) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    res.status(200).json({ message: "Token is valid", email: account.email });
  } catch (error) {
    res.status(500).json({ message: error.message });
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

// Show Reset Form
exports.showResetForm = async (req, res) => {
  try {
    const { token } = req.params;

    // Find account with the token
    const account = await Account.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!account) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    res.status(200).json({ message: "Token is valid. Show reset form", email: account.email });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
