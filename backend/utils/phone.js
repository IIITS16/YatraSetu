function normalizeIndianPhone(input) {
  const raw = String(input || "").replace(/\D/g, "");
  if (!raw) {
    throw new Error("Phone number is required.");
  }

  let digits = raw;
  if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  }
  if (digits.length === 10) {
    digits = `91${digits}`;
  }

  if (!/^91[6-9]\d{9}$/.test(digits)) {
    throw new Error("Enter a valid Indian mobile number.");
  }

  return `+${digits}`;
}

module.exports = { normalizeIndianPhone };
