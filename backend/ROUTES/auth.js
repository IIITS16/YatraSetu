const express = require("express");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const { normalizeIndianPhone } = require("../utils/phone");
const { normalizeStaffEmail } = require("../utils/email");
const { generateOtp, createOtpRecord } = require("../utils/otp");
const { MockSmsService } = require("../services/smsService");
const { MockEmailService } = require("../services/emailService");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
const smsService = new MockSmsService();
const emailService = new MockEmailService();

function nowPlusMinutes(minutes) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

router.post("/send-otp", async (req, res) => {
  try {
    const channel = String(req.body.channel || "phone").toLowerCase();
    const loginType = channel === "email" ? "email" : "phone";
    const loginIdentifier =
      loginType === "email"
        ? normalizeStaffEmail(req.body.email)
        : normalizeIndianPhone(req.body.phone);
    const recentCountResult = await pool.query(
      `
      SELECT COUNT(*)::int AS count
      FROM auth_otps
      WHERE login_identifier = $1
        AND created_at > NOW() - INTERVAL '15 minutes'
      `,
      [loginIdentifier]
    );

    if (recentCountResult.rows[0].count >= 5) {
      return res.status(429).json({
        success: false,
        message: "Too many OTP requests. Please try again later.",
      });
    }

    const otp = generateOtp();
    const { salt, hash } = createOtpRecord(otp);
    const expiresAt = nowPlusMinutes(5);

    await pool.query(
      `
      INSERT INTO auth_otps (login_identifier, login_type, otp_hash, otp_salt, expires_at, attempts_left, request_count, sent_at)
      VALUES ($1, $2, $3, $4, $5, 5, 1, NOW())
      `,
      [loginIdentifier, loginType, hash, salt, expiresAt]
    );

    if (loginType === "email") {
      await emailService.sendOtp(loginIdentifier, otp);
    } else {
      await smsService.sendOtp(loginIdentifier, otp);
    }

    res.json({
      success: true,
      message: "OTP sent successfully",
      otp: otp // Added for development/testing purposes so we can easily login
    });
  } catch (error) {
    const message = error.message || "Failed to send OTP";
    const status = message.includes("valid Indian mobile number") ? 400 : 500;
    res.status(status).json({ success: false, message });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const channel = String(req.body.channel || "phone").toLowerCase();
    const loginType = channel === "email" ? "email" : "phone";
    const loginIdentifier =
      loginType === "email"
        ? normalizeStaffEmail(req.body.email)
        : normalizeIndianPhone(req.body.phone);
    const otp = String(req.body.otp || "").trim();

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 6-digit OTP.",
      });
    }

    const otpRowResult = await pool.query(
      `
      SELECT *
      FROM auth_otps
      WHERE login_identifier = $1
        AND login_type = $2
        AND used_at IS NULL
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [loginIdentifier, loginType]
    );

    const otpRow = otpRowResult.rows[0];
    if (!otpRow) {
      console.log("OTP DEBUG: No row found for identifier", loginIdentifier);
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP.",
      });
    }

    const expiryTime = new Date(otpRow.expires_at).getTime();
    const currentTime = Date.now();
    if (expiryTime < currentTime) {
      console.log(`OTP DEBUG: Expired. Expiry: ${expiryTime}, Current: ${currentTime}`);
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP.",
      });
    }

    if (otpRow.attempts_left <= 0) {
      console.log("OTP DEBUG: No attempts left.");
      return res.status(429).json({
        success: false,
        message: "Too many invalid attempts. Request a new OTP.",
      });
    }

    const candidateHash = crypto
      .pbkdf2Sync(otp, otpRow.otp_salt, 100000, 64, "sha512")
      .toString("hex");

    if (candidateHash !== otpRow.otp_hash) {
      console.log("OTP DEBUG: Hash mismatch.");
      await pool.query(
        "UPDATE auth_otps SET attempts_left = attempts_left - 1 WHERE id = $1",
        [otpRow.id]
      );

      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP.",
      });
    }

    await pool.query("UPDATE auth_otps SET used_at = NOW(), verified_at = NOW() WHERE id = $1", [
      otpRow.id,
    ]);

    const name = req.body.name ? String(req.body.name).trim() : null;
    const role =
      loginType === "email"
        ? ["inspector", "government"].includes(String(req.body.role || "").toLowerCase())
          ? String(req.body.role).toLowerCase()
          : "inspector"
        : "tourist";
    const email = loginType === "email" ? loginIdentifier : null;
    const phone = loginType === "phone" ? loginIdentifier : null;

    const existingUserResult = await pool.query(
      `
      SELECT id, phone, email, role, name, created_at, updated_at, last_login_at, token_version
      FROM users
      WHERE ($1::text IS NOT NULL AND phone = $1)
         OR ($2::text IS NOT NULL AND email = $2)
      LIMIT 1
      `,
      [phone, email]
    );

    let user;

    if (existingUserResult.rows[0]) {
      const updateResult = await pool.query(
        `
        UPDATE users
        SET
          phone = COALESCE($1, phone),
          email = COALESCE($2, email),
          role = COALESCE($3, role),
          name = COALESCE($4, name),
          last_login_at = NOW(),
          updated_at = NOW()
        WHERE id = $5
        RETURNING id, phone, email, role, name, created_at, updated_at, last_login_at, token_version
        `,
        [phone, email, role, name, existingUserResult.rows[0].id]
      );
      user = updateResult.rows[0];
    } else {
      const insertResult = await pool.query(
        `
        INSERT INTO users (phone, email, role, name, last_login_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING id, phone, email, role, name, created_at, updated_at, last_login_at, token_version
        `,
        [phone, email, role, name]
      );
      user = insertResult.rows[0];
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({
        success: false,
        message: "JWT secret not configured",
      });
    }

    const token = jwt.sign(
      { phone: user.phone, tv: user.token_version },
      secret,
      {
        subject: String(user.id),
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      }
    );

    res.json({
      success: true,
      message: "OTP verified successfully",
      token,
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        role: user.role,
        name: user.name,
        created_at: user.created_at,
        updated_at: user.updated_at,
        last_login_at: user.last_login_at,
      },
    });
  } catch (error) {
    const message = error.message || "Failed to verify OTP";
    const status = message.includes("valid Indian mobile number") ? 400 : 500;
    res.status(status).json({ success: false, message });
  }
});

router.post("/logout", requireAuth, async (req, res) => {
  await pool.query(
    "UPDATE users SET token_version = token_version + 1, updated_at = NOW() WHERE id = $1",
    [req.user.id]
  );

  res.json({ success: true, message: "Logged out successfully" });
});

router.get("/me", requireAuth, async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id,
      phone: req.user.phone,
      email: req.user.email,
      role: req.user.role,
      name: req.user.name,
      created_at: req.user.created_at,
      updated_at: req.user.updated_at,
      last_login_at: req.user.last_login_at,
    },
  });
});

module.exports = router;
