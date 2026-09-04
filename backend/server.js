const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./db");
const reportsRouter = require("./routes/reports");
const authRouter = require("./routes/auth");
const inspectorRouter = require("./routes/inspector");
const { migrate } = require("./migrate");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.static("public"));

// Home
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "YatraSetu Backend is running!",
  });
});

// Test database
app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS time");

    res.json({
      success: true,
      message: "YatraSetu database connected!",
      time: result.rows[0].time,
    });
  } catch (error) {
    console.error("DATABASE ERROR:", error.message);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

const scanRouter = require("./routes/scan");
const verifyGuideRouter = require("./routes/verify-guide");

// API routes
app.use("/api/reports", reportsRouter);
app.use("/api/auth", authRouter);
app.use("/api/inspector", inspectorRouter);
app.use("/api/scan-bill", scanRouter);
app.use("/api/verify-guide", verifyGuideRouter);

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

// Start only after required database tables have been created.
migrate()
  .then(() => app.listen(PORT, () => {
    console.log(`YatraSetu backend running on http://localhost:${PORT}`);
  }))
  .catch((error) => {
    console.error("Unable to start backend:", error.message);
    process.exit(1);
  });
