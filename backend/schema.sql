CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  concern_type TEXT NOT NULL,
  business_name TEXT,
  description TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  status TEXT NOT NULL DEFAULT 'Under review',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
