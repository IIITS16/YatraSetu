

const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

if (!process.env.DB_PASSWORD) {
  console.error("ERROR: DB_PASSWORD is missing from .env");
}

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "YatraSetu",
  password: String(process.env.DB_PASSWORD || ""),
  port: Number(process.env.DB_PORT || 5432),
});

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL error:", err.message);
});

module.exports = pool;