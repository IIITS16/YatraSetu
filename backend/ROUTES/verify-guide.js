
const express = require("express");
const pool = require("../db");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: "No QR data provided" });

    // 1. Verify Cryptographic Signature
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret");
    } catch (err) {
      return res.json({ 
        success: false, 
        status: "Fake ID", 
        message: "Cryptographic signature verification failed. This is a forged QR code." 
      });
    }

    // 2. Fetch from database
    const guideResult = await pool.query("SELECT * FROM guides WHERE id = $1", [decoded.guide_id]);
    
    if (guideResult.rowCount === 0) {
      return res.json({ 
        success: false, 
        status: "Not Found", 
        message: "QR Signature is valid, but Guide ID is not registered in the Government Database." 
      });
    }

    const guide = guideResult.rows[0];

    // 3. Return verified profile
    res.json({
      success: true,
      status: guide.status === "Active" ? "Verified" : "Suspended",
      guide: {
        id: guide.id,
        name: guide.name,
        languages: guide.languages,
        rating: guide.rating,
        status: guide.status,
        risk_score: guide.risk_score
      }
    });

  } catch (err) {
    console.error("Verify Guide Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;

