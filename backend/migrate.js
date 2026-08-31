const pool = require("./db");

async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY, phone TEXT UNIQUE, email TEXT UNIQUE,
      role TEXT NOT NULL DEFAULT 'tourist', name TEXT,
      token_version INTEGER NOT NULL DEFAULT 0, last_login_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS auth_otps (
      id SERIAL PRIMARY KEY, login_identifier TEXT NOT NULL,
      login_type TEXT NOT NULL CHECK (login_type IN ('phone', 'email')),
      otp_hash TEXT NOT NULL, otp_salt TEXT NOT NULL, expires_at TIMESTAMPTZ NOT NULL,
      attempts_left INTEGER NOT NULL DEFAULT 5, request_count INTEGER NOT NULL DEFAULT 1,
      sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), verified_at TIMESTAMPTZ,
      used_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_auth_otps_identifier_active ON auth_otps (login_identifier, created_at DESC)`);

  await pool.query(`ALTER TABLE reports ADD COLUMN IF NOT EXISTS user_id INTEGER`);
  const unassigned = await pool.query("SELECT COUNT(*)::int AS count FROM reports WHERE user_id IS NULL");

  // Keep reports created before authentication, while all new reports use req.user.id.
  if (unassigned.rows[0].count > 0) {
    const legacyUser = await pool.query(`
      INSERT INTO users (email, role, name)
      VALUES ('legacy-reports@yatrasetu.local', 'system', 'Legacy reports')
      ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
      RETURNING id
    `);
    await pool.query("UPDATE reports SET user_id = $1 WHERE user_id IS NULL", [legacyUser.rows[0].id]);
  }

  await pool.query(`ALTER TABLE reports ALTER COLUMN user_id SET NOT NULL`);
  await pool.query(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reports_user_id_fkey') THEN
        ALTER TABLE reports ADD CONSTRAINT reports_user_id_fkey
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT;
      END IF;
    END $$
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_reports_user_created_at ON reports (user_id, created_at DESC)`);
}

if (require.main === module) {
  migrate()
    .then(() => console.log("Database migration complete."))
    .catch((error) => { console.error("Database migration failed:", error.message); process.exitCode = 1; })
    .finally(() => pool.end());
}

module.exports = { migrate };
