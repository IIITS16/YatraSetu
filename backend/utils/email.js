function normalizeStaffEmail(input) {
  const email = String(input || "").trim().toLowerCase();
  if (!email) {
    throw new Error("Email is required.");
  }

  if (!email.endsWith("@iiitsonepat.ac.in")) {
    throw new Error("Use your iiitsonepat.ac.in email address.");
  }

  return email;
}

module.exports = { normalizeStaffEmail };
