const express = require("express");
const pool = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// All routes in this file require the user to be an inspector or government official
router.use(requireAuth);
router.use(requireRole("inspector", "government"));

router.get("/stats", requireAuth, async (req, res) => {
  try {
    const isGov = req.user.role === "government";
    const filter = isGov ? "1=1" : "assigned_to = $1";
    const params = isGov ? [] : [req.user.id];

    const statsResult = await pool.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN status != 'invalid' THEN 1 ELSE 0 END), 0)::int as total_reports,
        COALESCE(SUM(CASE WHEN status IN ('new', 'review', 'investigating', 'escalated', 'pending', 'Under review') THEN 1 ELSE 0 END), 0)::int as pending_reports,
        COALESCE(SUM(CASE WHEN status IN ('valid', 'resolved') THEN 1 ELSE 0 END), 0)::int as resolved_reports,
        COALESCE(SUM(CASE WHEN status = 'invalid' THEN 1 ELSE 0 END), 0)::int as discarded_reports
      FROM reports 
      WHERE ${filter}
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
    const filter = isGov ? "1=1" : "assigned_to = $1";
    const params = isGov ? [] : [req.user.id];

    const reportsResult = await pool.query(`
      SELECT id, concern_type, business_name, description, status, created_at, region, risk_score
      FROM reports
      WHERE ${filter} AND status IN ('pending', 'Under review', 'new', 'review', 'investigating')
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

router.get("/reports", async (req, res) => {
  try {
    const isGov = req.user.role === "government";
    const filter = isGov ? "1=1" : "reports.assigned_to = $1";
    const params = isGov ? [] : [req.user.id];

    const reportsResult = await pool.query(`
      SELECT 
        reports.id, concern_type, business_name, description, status, 
        reports.created_at, reports.region, reviewed_at, reviewer_notes,
        reports.risk_score, reports.business_id,
        users.name AS reviewer_name
      FROM reports
      LEFT JOIN users ON reports.reviewed_by = users.id
      WHERE ${filter}
      ORDER BY 
        CASE WHEN status IN ('pending', 'Under review', 'new', 'review') THEN 0 ELSE 1 END,
        risk_score DESC, 
        reports.created_at DESC
    `, params);

    res.json({
      success: true,
      reports: reportsResult.rows
    });
  } catch (err) {
    console.error("GET ALL REPORTS ERROR:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get("/reports/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const isGov = req.user.role === "government";
    
    // Get Report
    const reportRes = await pool.query(`
      SELECT r.*, u.name as reporter_name, u.phone as reporter_phone 
      FROM reports r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.id = $1
    `, [id]);
    
    if (reportRes.rowCount === 0) return res.status(404).json({ success: false, message: "Not found" });
    const report = reportRes.rows[0];
    
    if (!isGov && report.assigned_to !== req.user.id) {
      return res.status(403).json({ success: false, message: "Forbidden: Not assigned to you" });
    }
    
    // Get Action History
    const historyRes = await pool.query(`
      SELECT a.*, u.name as actor_name, u.role as actor_role
      FROM action_history a
      LEFT JOIN users u ON a.actor_id = u.id
      WHERE a.report_id = $1
      ORDER BY a.created_at DESC
    `, [id]);

    res.json({ success: true, report, history: historyRes.rows });
  } catch (err) {
    console.error("GET REPORT ERROR:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.patch("/reports/:id/review", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewer_notes } = req.body;

    const validStatuses = ['new', 'review', 'investigating', 'resolved', 'escalated', 'valid', 'invalid'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const isGov = req.user.role === "government";
    const checkResult = await pool.query("SELECT assigned_to FROM reports WHERE id = $1", [id]);
    if (checkResult.rowCount === 0) return res.status(404).json({ success: false, message: "Report not found" });
    if (!isGov && checkResult.rows[0].assigned_to !== req.user.id) {
      return res.status(403).json({ success: false, message: "Forbidden: Not assigned to you" });
    }

    // Update Report
    const result = await pool.query(`
      UPDATE reports 
      SET 
        status = $1, 
        reviewer_notes = $2, 
        reviewed_by = $3, 
        reviewed_at = NOW()
      WHERE id = $4
      RETURNING id, status, reviewer_notes, reviewed_at
    `, [status, reviewer_notes || null, req.user.id, id]);

    // Log to Action History
    await pool.query(`
      INSERT INTO action_history (report_id, actor_id, action_type, notes)
      VALUES ($1, $2, $3, $4)
    `, [id, req.user.id, `Status updated to ${status}`, reviewer_notes]);

    res.json({
      success: true,
      message: "Report reviewed successfully",
      report: result.rows[0]
    });
  } catch (err) {
    console.error("REVIEW REPORT ERROR:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get("/heatmap", async (req, res) => {
  try {
    const isGov = req.user.role === "government";
    const regionFilter = isGov ? "1=1" : "region = $1";
    const params = isGov ? [] : [req.user.region];

    const result = await pool.query(`
      SELECT id, latitude, longitude, risk_score, concern_type
      FROM reports
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND status != 'invalid' AND ${regionFilter}
    `, params);

    res.json({ success: true, points: result.rows });
  } catch (err) {
    console.error("HEATMAP ERROR:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get("/alerts", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM alerts 
      WHERE user_id = $1 OR region = $2
      ORDER BY created_at DESC LIMIT 20
    `, [req.user.id, req.user.region]);
    res.json({ success: true, alerts: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching alerts" });
  }
});

router.get("/businesses", async (req, res) => {
  try {
    const isGov = req.user.role === "government";
    const regionFilter = isGov ? "1=1" : "region = $1";
    const params = isGov ? [] : [req.user.region];

    const result = await pool.query(`
      SELECT b.*, COUNT(r.id) as report_count
      FROM businesses b
      LEFT JOIN reports r ON b.id = r.business_id
      WHERE b.${regionFilter}
      GROUP BY b.id
      ORDER BY b.base_risk_score DESC
    `, params);
    res.json({ success: true, businesses: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching businesses" });
  }
});

router.get("/analytics", async (req, res) => {
  try {
    if (req.user.role !== "government") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    const result = await pool.query(`
      SELECT region, COUNT(*) as total_reports, 
             SUM(CASE WHEN concern_type = 'Overcharging or unclear bill' THEN 1 ELSE 0 END) as tax_evasion_flags
      FROM reports
      GROUP BY region
    `);
    res.json({ success: true, analytics: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching analytics" });
  }
});

module.exports = router;
