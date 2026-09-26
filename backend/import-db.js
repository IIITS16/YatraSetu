const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

// Load .env
dotenv.config({ path: path.resolve(__dirname, ".env") });

async function importDb() {
  const dbUser = process.env.DB_USER || "postgres";
  const dbPassword = String(process.env.DB_PASSWORD || "");
  const dbHost = process.env.DB_HOST || "localhost";
  const dbPort = Number(process.env.DB_PORT || 5432);
  const dbName = process.env.DB_NAME || "YatraSetu";

  // First connect to default postgres db to create target db if missing
  const adminPool = new Pool({
    user: dbUser,
    host: dbHost,
    database: "postgres",
    password: dbPassword,
    port: dbPort,
  });

  try {
    console.log(`Checking if database "${dbName}" exists...`);
    const res = await adminPool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );
    if (res.rowCount === 0) {
      console.log(`Creating database "${dbName}"...`);
      await adminPool.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database "${dbName}" created successfully.`);
    } else {
      console.log(`Database "${dbName}" already exists.`);
    }
  } catch (err) {
    console.error("Error creating database:", err.message);
  } finally {
    await adminPool.end();
  }

  // Now connect to target db and run the SQL dump
  const targetPool = new Pool({
    user: dbUser,
    host: dbHost,
    database: dbName,
    password: dbPassword,
    port: dbPort,
  });

  try {
    const backupPath = path.resolve(__dirname, "backup.sql");
    if (!fs.existsSync(backupPath)) {
      console.error(`Backup file not found at ${backupPath}`);
      process.exit(1);
    }

    console.log(`Reading SQL backup from ${backupPath}...`);
    const sql = fs.readFileSync(backupPath, "utf8");

    console.log(`Executing SQL script... This may take a moment.`);
    await targetPool.query(sql);
    console.log(`Database import completed successfully! All tables and data are restored.`);
  } catch (err) {
    console.error("Error importing data:", err.message);
  } finally {
    await targetPool.end();
  }
}

importDb();
