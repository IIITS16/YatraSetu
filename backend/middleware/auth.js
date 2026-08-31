const jwt = require("jsonwebtoken");
const pool = require("../db");

async function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ success: false, message: "JWT secret not configured" });
    }

    const payload = jwt.verify(token, secret);
    const userResult = await pool.query(
      "SELECT id, phone, email, role, name, language, avatar_url, token_version, created_at, updated_at, last_login_at FROM users WHERE id = $1",
      [payload.sub]
    );

    const user = userResult.rows[0];
    if (!user || String(user.token_version) !== String(payload.tv)) {
      return res.status(401).json({ success: false, message: "Session expired" });
    }

    req.user = user;
    req.token = token;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
}

module.exports = { requireAuth };
