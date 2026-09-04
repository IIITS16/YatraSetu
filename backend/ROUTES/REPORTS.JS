const express = require("express");
const pool = require("../db");
const { requireAuth } = require("../middleware/auth");
const realtimeHub = require("../services/realtime");

const router = express.Router();

// Reports are private to the authenticated account that created them.
router.post("/", requireAuth, async (req, res) => {
  try {
    const { concern_type, description, latitude, longitude, business_name, region } = req.body;

    // 0. Deduplication guard: Prevent double submission if identical request arrived within 5s
    const existing = await pool.query(`
      SELECT * FROM reports 
      WHERE user_id = $1 
        AND concern_type = $2 
        AND (business_name = $3 OR (business_name IS NULL AND $3 IS NULL))
        AND description = $4
        AND created_at > NOW() - INTERVAL '5 seconds'
      ORDER BY created_at DESC LIMIT 1
    `, [req.user.id, concern_type, business_name || null, description]);

    if (existing.rowCount > 0) {
      return res.json({ success: true, report: existing.rows[0], deduplicated: true });
    }

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

    // 2. Sequential Inspector Assignment (Thread-safe via PostgreSQL atomic cursor row-lock)
    let assignedInspectorId = null;
    const normalizedRegion = region || "Jaipur South";

    // Find candidate inspectors for this region (handling Amer alias)
    let candidateInspectors = await pool.query(`
      SELECT id, name, email, region 
      FROM users 
      WHERE role = 'inspector' 
        AND (
          region = $1 
          OR ($1 = 'Amer' AND region = 'Amer / Old City') 
          OR ($1 = 'Amer / Old City' AND region = 'Amer')
        )
      ORDER BY id
    `, [normalizedRegion]);

    // If no inspector assigned specifically to this region, fallback to all active inspectors
    if (candidateInspectors.rowCount === 0) {
      candidateInspectors = await pool.query(`
        SELECT id, name, email, region 
        FROM users 
        WHERE role = 'inspector' 
        ORDER BY id
      `);
    }

    if (candidateInspectors.rowCount === 1) {
      assignedInspectorId = candidateInspectors.rows[0].id;
    } else if (candidateInspectors.rowCount > 1) {
      // Atomic sequential round-robin using ON CONFLICT DO UPDATE
      const numInspectors = candidateInspectors.rowCount;
      const cursorRes = await pool.query(`
        INSERT INTO inspector_assignment_cursors (region, last_assigned_index, updated_at)
        VALUES ($1, 0, NOW())
        ON CONFLICT (region)
        DO UPDATE SET 
          last_assigned_index = (inspector_assignment_cursors.last_assigned_index + 1) % $2,
          updated_at = NOW()
        RETURNING last_assigned_index
      `, [normalizedRegion, numInspectors]);

      const cursorIndex = cursorRes.rows[0].last_assigned_index;
      assignedInspectorId = candidateInspectors.rows[cursorIndex].id;
    }

    // 3. Insert Report with assigned_to
    const result = await pool.query(
      `INSERT INTO reports 
        (user_id, concern_type, description, latitude, longitude, business_name, region, status, risk_score, business_id, assigned_to) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'new', $8, $9, $10) RETURNING *`,
      [req.user.id, concern_type, description, latitude, longitude, business_name, region, riskScore, bId, assignedInspectorId]
    );

    const savedReport = result.rows[0];

    // 4. Create an Alert for inspectors in that region
    await pool.query(`
      INSERT INTO alerts (user_id, region, message, type)
      VALUES ($1, $2, $3, $4)
    `, [assignedInspectorId, region, `New report assigned at ${business_name || 'unknown location'}`, 'warning']);

    // 5. Broadcast to Realtime SSE Hub for instant UI refresh without manual reload
    realtimeHub.broadcast({
      type: "NEW_REPORT",
      report: savedReport,
      assignedTo: assignedInspectorId,
      region: region
    }, assignedInspectorId, region);

    res.json({ success: true, report: savedReport });
  } catch (err) {
    console.error("REPORT ERROR:", err);
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
