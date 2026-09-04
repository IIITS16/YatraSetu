
require("dotenv").config({ path: __dirname + "/.env" });
const pool = require("./db");
const jwt = require("jsonwebtoken");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");

const guides = [
  { id: "IITG-2024-001", name: "Ramesh Sharma", languages: "English, Hindi", rating: 4.8 },
  { id: "IITG-2024-002", name: "Amit Patel", languages: "Gujarati, Hindi", rating: 4.5 },
  { id: "IITG-2024-003", name: "Sunita Reddy", languages: "Telugu, English", rating: 4.9 },
  { id: "IITG-2024-004", name: "Arun Kumar", languages: "Tamil, English", rating: 4.2 },
  { id: "IITG-2024-005", name: "Priya Singh", languages: "Hindi, French", rating: 4.7 },
  { id: "IITG-2024-006", name: "Vikram Singh", languages: "Hindi, English", rating: 4.6 },
  { id: "IITG-2024-007", name: "Neha Gupta", languages: "English, German", rating: 4.4 },
  { id: "IITG-2024-008", name: "Rajesh Khanna", languages: "Hindi, Marathi", rating: 4.1 },
  { id: "IITG-2024-009", name: "Anjali Desai", languages: "Gujarati, English", rating: 4.8 },
  { id: "IITG-2024-010", name: "Kiran Rao", languages: "Kannada, English", rating: 4.9 }
];

async function generate() {
  try {
    for (const g of guides) {
      // 1. Insert into database
      await pool.query(`
        INSERT INTO guides (id, name, languages, rating) 
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO NOTHING
      `, [g.id, g.name, g.languages, g.rating]);

      // 2. Generate Cryptographically Signed JWT Token
      // This proves that YatraSetu (or Govt) issued this QR code
      const token = jwt.sign({ guide_id: g.id, role: "guide" }, process.env.JWT_SECRET || "default_secret");

      // 3. Generate QR code image
      const qrPath = path.join(__dirname, "public", "qrcodes", `${g.id}.png`);
      await QRCode.toFile(qrPath, token, {
        color: { dark: "#0f172a", light: "#ffffff" },
        width: 300
      });
      console.log(`Generated QR for ${g.name} -> ${qrPath}`);
    }
    
    // Also generate one FAKE qr code that has a valid JWT signature but an ID not in the database
    const fakeToken = jwt.sign({ guide_id: "IITG-FAKE-999", role: "guide" }, process.env.JWT_SECRET || "default_secret");
    await QRCode.toFile(path.join(__dirname, "public", "qrcodes", "FAKE_GUIDE.png"), fakeToken, {
      width: 300
    });
    console.log("Generated FAKE_GUIDE.png (Valid signature, but not in DB)");

    // Generate one FAKE qr code that has an INVALID JWT signature
    const invalidToken = jwt.sign({ guide_id: "IITG-2024-001", role: "guide" }, "WRONG_SECRET");
    await QRCode.toFile(path.join(__dirname, "public", "qrcodes", "INVALID_SIGNATURE.png"), invalidToken, {
      width: 300
    });
    console.log("Generated INVALID_SIGNATURE.png (Forged QR Code)");

    console.log("All done!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

generate();

