
const express = require("express");
const cors = require("cors");
const pool = require("./db");
const reportsRouter = require("./routes/reports");
const authRouter = require("./routes/auth");
const { migrate } = require("./migrate");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

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

// Reports API
app.use("/api/reports", reportsRouter);
app.use("/api/auth", authRouter);

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
