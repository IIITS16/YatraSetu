const pool = require('./backend/db');
(async () => {
  try {
    await pool.query("UPDATE reports SET region = 'Jaipur South' WHERE id = 1");
    console.log('Assigned report 1 to Jaipur South');
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
})();
