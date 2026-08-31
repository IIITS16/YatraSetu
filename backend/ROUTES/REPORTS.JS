const express = require("express");
const pool = require("../db");

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        concern_type,
        business_name,
        description,
        latitude,
        longitude,
        created_at,
        status
      FROM reports
      ORDER BY created_at DESC
    `);

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
    const { concern_type, business_name, description, latitude, longitude } =
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
        concern_type,
        business_name,
        description,
        latitude,
        longitude,
        status
      )
      VALUES ($1, $2, $3, $4, $5, 'Under review')
      RETURNING
        id,
        concern_type,
        business_name,
        description,
        latitude,
        longitude,
        created_at,
        status
      `,
      [concern_type, business_name || null, description, lat, lng]
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
