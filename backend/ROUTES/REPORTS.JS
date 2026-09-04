const express = require("express");
const pool = require("../db");
const { requireAuth } = require("../middleware/auth");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const multer = require("multer");
const fs = require("fs");

const upload = multer({ dest: "uploads/" });
const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy");

// Async function to evaluate severity using AI without blocking the user
async function analyzeRiskAsync(reportId, concern_type, description, filePath, mimeType) {
  if (!process.env.GEMINI_API_KEY) return;
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });
    const prompt = `
      You are an AI Inspector for the YatraSetu tourist safety platform.
      Analyze the following tourist report and determine the fraud/safety risk severity.
      Concern Type: "${concern_type}"
      Description: "${description}"
      ${filePath ? "An image has also been attached as evidence. Please analyze it visually." : ""}
      
      Important Scoring Guidelines:
      - Minor complaints (bad service, mild pricing issues): 0 to 20
      - Clear Fraud/Scams (fake GST, illegal taxes, intentional overcharging): 50 to 80
      - Severe Safety Threats / Harassment: 80 to 90
      
      Respond STRICTLY with a valid JSON object in this exact format:
      {
        "ai_risk_modifier": <number between 0 and 90 based on severity>,
        "ai_reasoning": "<short 1-sentence explanation of why this score was given>"
      }
    `;
    
    let contentParts = [prompt];
    
    if (filePath && fs.existsSync(filePath)) {
      contentParts.unshift({
        inlineData: {
          data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
          mimeType: mimeType || "image/jpeg"
        }
      });
    }

    const result = await model.generateContent(contentParts);
    const text = result.response.text().trim();
    
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (parseErr) {
      // Fallback robust parsing if API ignores responseMimeType
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { ai_risk_modifier: 0, ai_reasoning: "AI analysis failed to parse." };
    }
    
    const modifier = typeof parsed.ai_risk_modifier === 'number' ? parsed.ai_risk_modifier : 0;
    const reasoning = parsed.ai_reasoning || "AI analysis completed.";
    
    await pool.query(
      "UPDATE reports SET risk_score = risk_score + $1, reviewer_notes = $2 WHERE id = $3",
      [modifier, `AI Insight: ${reasoning}`, reportId]
    );
    console.log(`[AI Risk Engine] Updated report ${reportId} with modifier +${modifier}`);
  } catch (err) {
    console.error("[AI Risk Engine] Failed:", err.message);
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

// Reports are private to the authenticated account that created them.
router.post("/", requireAuth, upload.single("evidence"), async (req, res) => {
  console.log("Headers:", req.headers['content-type']);
  console.log("Body:", req.body);
  console.log("File:", req.file);
  try {
    const body = req.body || {};
    const { concern_type, description, latitude, longitude, business_name, region } = body;
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

    // 4. Trigger Async AI Risk Analysis in Background (Non-blocking)
    if (description || req.file) {
      analyzeRiskAsync(
        result.rows[0].id, 
        concern_type, 
        description || "No description provided", 
        req.file ? req.file.path : null,
        req.file ? req.file.mimetype : null
      );
    }
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
