const express = require("express");
const pool = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// All routes in this file require the user to be an inspector or government official
router.use(requireAuth);
router.use(requireRole("inspector", "government"));

router.get("/stats", async (req, res) => {
  try {
    const isGov = req.user.role === "government";
    const regionFilter = isGov ? "1=1" : "region = $1";
    const params = isGov ? [] : [req.user.region];

    const statsResult = await pool.query(`
      SELECT 
        COUNT(*)::int as total_reports,
        COALESCE(SUM(CASE WHEN status IN ('pending', 'Under review') THEN 1 ELSE 0 END), 0)::int as pending_reports,
        COALESCE(SUM(CASE WHEN status IN ('valid', 'invalid') THEN 1 ELSE 0 END), 0)::int as resolved_reports
      FROM reports 
      WHERE ${regionFilter}
    `, params);

    res.json({
      success: true,
      stats: statsResult.rows[0]
    });
  } catch (err) {
    console.error("GET INSPECTOR STATS ERROR:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get("/reports/recent", async (req, res) => {
  try {
    const isGov = req.user.role === "government";
    const regionFilter = isGov ? "1=1" : "region = $1";
    const params = isGov ? [] : [req.user.region];

    const reportsResult = await pool.query(`
      SELECT id, concern_type, business_name, description, status, created_at, region
      FROM reports
      WHERE ${regionFilter} AND status IN ('pending', 'Under review')
      ORDER BY created_at DESC
      LIMIT 5
    `, params);

    res.json({
      success: true,
      reports: reportsResult.rows
    });
  } catch (err) {
    console.error("GET RECENT REPORTS ERROR:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
