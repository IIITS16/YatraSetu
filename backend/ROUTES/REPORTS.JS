const express = require("express");
const pool = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Reports are private to the authenticated account that created them.
router.post("/", requireAuth, async (req, res) => {
  try {
    const { concern_type, description, latitude, longitude, business_name, region } = req.body;
    let mediaUrls = [];

    // 1. Detect or Create Business Record
    let bId = null;
    let riskScore = 10; // base default
    if (business_name) {
      const bRes = await pool.query("SELECT id, base_risk_score FROM businesses WHERE name ILIKE $1", [business_name]);
      if (bRes.rowCount > 0) {
        bId = bRes.rows[0].id;
        // Increase risk score for repeat offender
        await pool.query("UPDATE businesses SET base_risk_score = base_risk_score + 15 WHERE id = $1", [bId]);
        riskScore = bRes.rows[0].base_risk_score + 15;
      } else {
        const newB = await pool.query(
          "INSERT INTO businesses (name, region, base_risk_score) VALUES ($1, $2, $3) RETURNING id",
          [business_name, region, 10]
        );
        bId = newB.rows[0].id;
      }
    }

    // High risk categories
    if (['Safety concern', 'Harassment or misbehavior'].includes(concern_type)) {
      riskScore += 50;
    }

    // 2. Insert Report & Sequentially Assign safely
    const result = await pool.query(
      `WITH next_inspector AS (
         SELECT id FROM users 
         WHERE role = 'inspector' 
         ORDER BY 
           CASE WHEN region = $7 THEN 0 ELSE 1 END ASC,
           (SELECT COUNT(*) FROM reports WHERE assigned_to = users.id) ASC, 
           id ASC
         LIMIT 1
       )
       INSERT INTO reports 
        (user_id, concern_type, description, latitude, longitude, business_name, region, status, risk_score, business_id, assigned_to) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'new', $8, $9, (SELECT id FROM next_inspector)) RETURNING *`,
      [req.user.id, concern_type, description, latitude, longitude, business_name, region, riskScore, bId]
    );

    // 3. Optional: Create an Alert for inspectors in that region
    await pool.query(`
      INSERT INTO alerts (region, message, type)
      VALUES ($1, $2, $3)
    `, [region, `New high-priority report at ${business_name || 'unknown'}`, 'warning']);

    res.json({ success: true, report: result.rows[0] });
  } catch (err) {
    console.error("REPORT ERROR:", err);
    require('fs').appendFileSync('error.log', err.stack + '\\n');
    res.status(500).json({ success: false, message: err.message, stack: err.stack });
  }
});

router.get("/", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        user_id,
        concern_type,
        business_name,
        description,
        latitude,
        longitude,
        created_at,
        status
      FROM reports
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [req.user.id]);

    res.json({
      success: true,
      reports: result.rows,
    });
  } catch (error) {
    console.error("GET REPORTS ERROR:", error.message);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});



module.exports = router;
