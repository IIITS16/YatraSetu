-- YatraSetu uses one shared PostgreSQL database. Each report belongs to one user.
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  phone TEXT UNIQUE,
  email TEXT UNIQUE,
  role TEXT NOT NULL DEFAULT 'tourist',
  name TEXT,
  token_version INTEGER NOT NULL DEFAULT 0,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  concern_type TEXT NOT NULL,
  business_name TEXT,
  description TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  status TEXT NOT NULL DEFAULT 'Under review',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_user_created_at
  ON reports (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS auth_otps (
  id SERIAL PRIMARY KEY,
  login_identifier TEXT NOT NULL,
  login_type TEXT NOT NULL CHECK (login_type IN ('phone', 'email')),
  otp_hash TEXT NOT NULL,
  otp_salt TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts_left INTEGER NOT NULL DEFAULT 5,
  request_count INTEGER NOT NULL DEFAULT 1,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_otps_identifier_active
  ON auth_otps (login_identifier, created_at DESC);
