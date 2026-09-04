const pool = require('./backend/db');
pool.query(`
  SELECT 
    COUNT(*)::int as total,
    COALESCE(SUM(CASE WHEN status = 'valid' THEN 1 ELSE 0 END), 0)::int as valid_count,
    COALESCE(SUM(CASE WHEN status = 'invalid' THEN 1 ELSE 0 END), 0)::int as invalid_count,
    COALESCE(SUM(CASE WHEN status IN ('pending', 'Under review') THEN 1 ELSE 0 END), 0)::int as pending_count
  FROM reports WHERE user_id = 2
`).then(res => {
  console.log(res.rows[0]);
  process.exit(0);
}).catch(e => {
  console.error(e.message);
  process.exit(1);
});
