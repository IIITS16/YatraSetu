const express = require("express");
const multer = require("multer");
const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Initialize Gemini without dummy key (will throw error if env is missing)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType
    },
  };
}

router.post("/", upload.single("bill"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image uploaded" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ success: false, message: "GEMINI_API_KEY not configured in .env" });
    }

    // Using gemini-1.5-flash for OCR capabilities
    // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });

    const prompt = `
      You are an expert fraud detection AI for a Tourism Intelligence System.
      Analyze this bill/invoice image.

      Perform these checks to identify if it is a Real or Fake/Suspicious bill:
      1. GSTIN & Identity: Is there a valid 15-character GSTIN? (Note: Missing GSTIN alone must NOT mark an informal bill as fake).
      2. Tax Math & Logic (CRITICAL): Do NOT just check the final addition. You MUST calculate the percentages. If it says "10% Service Charge", verify it is exactly 10% of the subtotal. If the percentage calculation is wrong, FLAG AS HIGH RISK.
      3. Obsolete Taxes: India uses GST. If a bill charges "VAT" and "Service Tax" instead of GST (especially multiple random VATs like 12.5% and 20%), this is HIGHLY SUSPICIOUS and indicates a potentially fake/old bill format used to overcharge. FLAG AS HIGH RISK.
      4. Subtotal/Total Math: Do all the numbers physically sum up exactly to the final total amount?
      5. Invoice Details: Is the invoice number and date present and realistic?
      6. Tampering & Pricing: Are there unusual or exorbitant prices, or signs of tampering?

      Generate a 0-100 risk score (0 = perfectly fine, 100 = definitely fraudulent).
      Label high-risk bills as "Further Verification Required".

      Respond ONLY with a valid JSON object matching this schema exactly (ensure correct data types):
      {
        "merchant_name": "string or null",
        "total_amount": 0.0,
        "gstin_detected": false,
        "math_is_correct": true,
        "requires_verification": false,
        "risk_score": 0,
        "risk_level": "Low | Medium | High",
        "detected_reasons": ["array of NEGATIVE risk factors ONLY. Keep empty if bill is perfectly fine"],
        "price_anomalies": ["array of string anomalies, if any"]
      }
    `;

    const imagePart = fileToGenerativePart(req.file.path, req.file.mimetype);

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();
    
    // Clean JSON response (Gemini sometimes wraps in markdown ```json)
    let jsonStr = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsedData = JSON.parse(jsonStr);

    res.json({
      success: true,
      data: parsedData
    });

  } catch (error) {
    console.error("SCAN ERROR:", error.message);
    res.status(500).json({ success: false, message: "AI Analysis failed: " + error.message });
  } finally {
    // Cleanup uploaded file
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  }
});

module.exports = router;

