const pool = require('./backend/db');
async function test() {
  try {
    const region = "Jaipur South";
    const business_name = "Some Biz";
    await pool.query(`
      INSERT INTO alerts (region, message, type)
      VALUES ($1, $2, $3)
    `, [region, `New high-priority report at ${business_name || 'unknown'}`, 'warning']);
    console.log('Insert alert success');
  } catch (e) {
    console.error('SQL ERROR:', e.message);
  } finally {
    pool.end();
  }
}
test();
