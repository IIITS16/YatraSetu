const express = require("express");
const pool = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Reports are private to the authenticated account that created them.
router.use(requireAuth);

router.get("/", async (req, res) => {
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

router.post("/", async (req, res) => {
  try {
    const { concern_type, business_name, region, description, latitude, longitude } =
      req.body;

    if (!concern_type || !description) {
      return res.status(400).json({
        success: false,
        message: "Concern type and description are required.",
      });
    }

    const lat =
      latitude === "" || latitude == null ? null : Number(latitude);
    const lng =
      longitude === "" || longitude == null ? null : Number(longitude);

    const result = await pool.query(
      `
      INSERT INTO reports (
        user_id,
        concern_type,
        business_name,
        region,
        description,
        latitude,
        longitude,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'Under review')
      RETURNING
        id,
        user_id,
        concern_type,
        business_name,
        region,
        description,
        latitude,
        longitude,
        created_at,
        status
      `,
      [req.user.id, concern_type, business_name || null, region || null, description, lat, lng]
    );

    res.status(201).json({
      success: true,
      message: "Report submitted successfully.",
      report: result.rows[0],
    });
  } catch (error) {
    console.error("CREATE REPORT ERROR:", error.message);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
