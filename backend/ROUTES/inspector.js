const express = require("express");
const pool = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");
const realtimeHub = require("../services/realtime");

const router = express.Router();

// All routes in this file require the user to be an inspector or government official
router.use(requireAuth);
router.use(requireRole("inspector", "government"));

// Helper to build inspector jurisdiction / assignment filter
function buildInspectorFilter(user, tablePrefix = "reports.") {
  const isGov = user.role === "government";
  if (isGov) {
    return { clause: "1=1", params: [] };
  }
  const prefix = tablePrefix || "";
  const clause = `(
    ${prefix}assigned_to = $1 
    OR (${prefix}assigned_to IS NULL AND (
      ${prefix}region = $2 
      OR ($2 = 'Amer' AND ${prefix}region = 'Amer / Old City') 
      OR ($2 = 'Amer / Old City' AND ${prefix}region = 'Amer')
    ))
  )`;
  return { clause, params: [user.id, user.region || ""] };
}

// Realtime Server-Sent Events stream for instant updates without manual refresh
router.get("/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  if (typeof res.flushHeaders === "function") res.flushHeaders();

  const removeClient = realtimeHub.addClient(req.user, res);
  req.on("close", removeClient);
});

router.get("/stats", requireAuth, async (req, res) => {
  try {
    const { clause, params } = buildInspectorFilter(req.user, "");

    const statsResult = await pool.query(`
      SELECT 
        COUNT(*)::int as total_reports,
        COALESCE(SUM(CASE WHEN status IN ('new', 'review', 'investigating', 'escalated', 'pending', 'Under review') THEN 1 ELSE 0 END), 0)::int as pending_reports,
        COALESCE(SUM(CASE WHEN status IN ('valid', 'resolved') THEN 1 ELSE 0 END), 0)::int as resolved_reports,
        COALESCE(SUM(CASE WHEN status IN ('invalid', 'discarded') THEN 1 ELSE 0 END), 0)::int as discarded_reports,
        COALESCE(SUM(CASE WHEN risk_score >= 60 AND status IN ('new', 'review', 'investigating', 'escalated', 'pending', 'Under review') THEN 1 ELSE 0 END), 0)::int as high_risk_reports
      FROM reports 
      WHERE ${clause}
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
    const { clause, params } = buildInspectorFilter(req.user, "");

    const reportsResult = await pool.query(`
      SELECT id, concern_type, business_name, description, status, created_at, region, latitude, longitude, risk_score, assigned_to
      FROM reports
      WHERE ${clause} AND status IN ('new', 'pending', 'Under review', 'review', 'investigating')
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
    const { clause, params } = buildInspectorFilter(req.user, "reports.");

    const reportsResult = await pool.query(`
      SELECT 
        reports.id, reports.concern_type, reports.business_name, reports.description, reports.status, 
        reports.created_at, reports.region, reports.reviewed_at, reports.reviewer_notes,
        reports.risk_score, reports.business_id, reports.latitude, reports.longitude,
        reports.assigned_to,
        users.name AS reviewer_name,
        reporter.name AS reporter_name,
        reporter.phone AS reporter_phone
      FROM reports
      LEFT JOIN users ON reports.reviewed_by = users.id
      LEFT JOIN users reporter ON reports.user_id = reporter.id
      WHERE ${clause}
      ORDER BY 
        CASE WHEN reports.status IN ('new', 'pending', 'Under review', 'review', 'investigating') THEN 0 ELSE 1 END,
        reports.risk_score DESC, 
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
    
    const isAmer = (report.region === "Amer" && req.user.region === "Amer / Old City") ||
                   (report.region === "Amer / Old City" && req.user.region === "Amer");
    const isAssigned = report.assigned_to === req.user.id;
    const isRegionMatch = report.region === req.user.region || isAmer;

    if (!isGov && !isAssigned && !isRegionMatch) {
      return res.status(403).json({ success: false, message: "Forbidden" });
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

    const validStatuses = ['new', 'review', 'investigating', 'resolved', 'escalated', 'valid', 'invalid', 'discarded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const isGov = req.user.role === "government";
    const checkResult = await pool.query("SELECT region, assigned_to FROM reports WHERE id = $1", [id]);
    if (checkResult.rowCount === 0) return res.status(404).json({ success: false, message: "Report not found" });
    
    const rep = checkResult.rows[0];
    const isAmer = (rep.region === "Amer" && req.user.region === "Amer / Old City") ||
                   (rep.region === "Amer / Old City" && req.user.region === "Amer");
    const isAssigned = rep.assigned_to === req.user.id;
    const isRegionMatch = rep.region === req.user.region || isAmer;

    if (!isGov && !isAssigned && !isRegionMatch) {
      return res.status(403).json({ success: false, message: "Report outside jurisdiction" });
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
      RETURNING id, status, reviewer_notes, reviewed_at, region, assigned_to, user_id
    `, [status, reviewer_notes || null, req.user.id, id]);

    // Log to Action History
    await pool.query(`
      INSERT INTO action_history (report_id, actor_id, action_type, notes)
      VALUES ($1, $2, $3, $4)
    `, [id, req.user.id, `Status updated to ${status}`, reviewer_notes]);

    const updatedReport = result.rows[0];

    // Broadcast review update via SSE
    realtimeHub.broadcast({
      type: "REPORT_REVIEWED",
      reportId: Number(id),
      status: updatedReport.status,
      assignedTo: updatedReport.assigned_to,
      region: updatedReport.region,
      userId: updatedReport.user_id
    }, updatedReport.assigned_to, updatedReport.region);

    res.json({
      success: true,
      message: "Report reviewed successfully",
      report: updatedReport
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
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND ${regionFilter}
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
