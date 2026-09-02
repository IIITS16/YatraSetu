const pool = require('./backend/db');
async function test() {
  try {
    const result = await pool.query(
      `INSERT INTO reports 
        (user_id, concern_type, description, latitude, longitude, business_name, region, status, risk_score, business_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'new', $8, $9) RETURNING *`,
      [1, 'Safety', 'Test', 26.9, 75.8, 'Test Biz', 'Jaipur South', 10, null]
    );
    console.log('Insert report success:', result.rows[0].id);
  } catch (e) {
    console.error('SQL ERROR:', e.message);
  } finally {
    pool.end();
  }
}
test();
