const pool = require("./db");

async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY, phone TEXT UNIQUE, email TEXT UNIQUE,
      role TEXT NOT NULL DEFAULT 'tourist', name TEXT,
      language TEXT DEFAULT 'English', avatar_url TEXT,
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

  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'English'`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS region TEXT`);
  
  const inspectors = [
    { email: 'mohakcse12511069@iiitsonepat.ac.in', name: 'Mohak', region: 'Jaipur South' },
    { email: 'akshatcse12511007@iiitsonepat.ac.in', name: 'Akshat', region: 'Jaipur North' },
    { email: 'yashcse12511118@iiitsonepat.ac.in', name: 'Yash', region: 'Amer' },
    { email: 'devcse12511030@iiitsonepat.ac.in', name: 'Dev', region: 'Jaipur East' },
    { email: 'ishantcse12511049@iiitsonepat.ac.in', name: 'Ishant', region: 'Jaipur West' }
  ];

  for (const inspector of inspectors) {
    await pool.query(`
      INSERT INTO users (email, name, role, region)
      VALUES ($1, $2, 'inspector', $3)
      ON CONFLICT (email) DO UPDATE SET 
        name = EXCLUDED.name,
        role = 'inspector',
        region = EXCLUDED.region
    `, [inspector.email, inspector.name, inspector.region]);
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS reports (
      id SERIAL PRIMARY KEY,
      concern_type TEXT NOT NULL,
      business_name TEXT,
      description TEXT,
      latitude DOUBLE PRECISION,
      longitude DOUBLE PRECISION,
      media_urls TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`ALTER TABLE reports ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending'`);
  await pool.query(`ALTER TABLE reports ADD COLUMN IF NOT EXISTS user_id INTEGER`);
  await pool.query(`ALTER TABLE reports ADD COLUMN IF NOT EXISTS region TEXT`);
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
  
  // Phase 2C & 3: Inspector Advanced Features
  await pool.query(`
    CREATE TABLE IF NOT EXISTS businesses (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      region VARCHAR(100),
      base_risk_score INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS action_history (
      id SERIAL PRIMARY KEY,
      report_id INTEGER REFERENCES reports(id) ON DELETE CASCADE,
      actor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      action_type VARCHAR(50) NOT NULL,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS alerts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      region VARCHAR(100),
      message TEXT NOT NULL,
      type VARCHAR(50) DEFAULT 'info',
      is_read BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Add new columns to reports table
  await pool.query(`ALTER TABLE reports ADD COLUMN IF NOT EXISTS risk_score INTEGER DEFAULT 0`);
  await pool.query(`ALTER TABLE reports ADD COLUMN IF NOT EXISTS business_id INTEGER REFERENCES businesses(id) ON DELETE SET NULL`);
  
  // Phase 2B: Inspector Review columns
  await pool.query(`ALTER TABLE reports ADD COLUMN IF NOT EXISTS reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL`);
  await pool.query(`ALTER TABLE reports ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ`);
  await pool.query(`ALTER TABLE reports ADD COLUMN IF NOT EXISTS reviewer_notes TEXT`);
  await pool.query(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reports_user_id_fkey') THEN
        ALTER TABLE reports ADD CONSTRAINT reports_user_id_fkey
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT;
      END IF;
    END $$
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS guides (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      languages VARCHAR(255),
      rating DECIMAL(3,1),
      photo_url VARCHAR(500),
      status VARCHAR(50) DEFAULT 'Active',
      risk_score INTEGER DEFAULT 0
    );
  `);
}

if (require.main === module) {
  migrate()
    .then(() => console.log("Database migration complete."))
    .catch((error) => { console.error("Database migration failed:", error.message); process.exitCode = 1; })
    .finally(() => pool.end());
}

module.exports = { migrate };
