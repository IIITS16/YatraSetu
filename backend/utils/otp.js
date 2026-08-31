const crypto = require("crypto");

function generateOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

function hashOtp(otp, salt) {
  return crypto.pbkdf2Sync(String(otp), salt, 100000, 64, "sha512").toString("hex");
}

function createOtpRecord(otp) {
  const salt = crypto.randomBytes(16).toString("hex");
  return {
    salt,
    hash: hashOtp(otp, salt),
  };
}

module.exports = {
  generateOtp,
  hashOtp,
  createOtpRecord,
};
