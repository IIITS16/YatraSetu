const pool = require('./backend/db');
(async () => {
  try {
    const existing = await pool.query('SELECT COUNT(*) FROM reports');
    if (existing.rows[0].count === '0') {
      console.log('Inserting sample reports...');
      await pool.query(`
        INSERT INTO reports (user_id, concern_type, business_name, region, description, status) VALUES
        (1, 'Overcharging or unclear bill', 'Saffron Courtyard', 'Jaipur South', 'They charged extra service tax incorrectly.', 'Under review'),
        (1, 'Unverified guide or business', 'Chokhi Dhani', 'Jaipur South', 'Some fake guide approached us outside.', 'pending'),
        (1, 'Safety concern', 'The Lalit Jaipur', 'Jaipur South', 'Fire exit blocked by boxes.', 'Under review'),
        (1, 'Overcharging or unclear bill', 'Raj Palace Heritage', 'Jaipur North', 'Double charged my credit card.', 'Under review'),
        (1, 'Misleading service', 'Hotel Nahargarh Haveli', 'Amer', 'Room pictures did not match reality.', 'pending'),
        (1, 'Safety concern', 'Sunrise Guest House', 'Jaipur East', 'Lock on door was broken.', 'Under review'),
        (1, 'Overcharging or unclear bill', 'Pink City Cab Services', 'Jaipur West', 'Driver refused to use meter.', 'Under review')
      `);
      console.log('Sample reports inserted.');
    } else {
      console.log('Reports already exist, updating ones with null region...');
      await pool.query(`UPDATE reports SET region = 'Jaipur South' WHERE region IS NULL AND id % 5 = 0`);
      await pool.query(`UPDATE reports SET region = 'Jaipur North' WHERE region IS NULL AND id % 5 = 1`);
      await pool.query(`UPDATE reports SET region = 'Amer' WHERE region IS NULL AND id % 5 = 2`);
      await pool.query(`UPDATE reports SET region = 'Jaipur East' WHERE region IS NULL AND id % 5 = 3`);
      await pool.query(`UPDATE reports SET region = 'Jaipur West' WHERE region IS NULL AND id % 5 = 4`);
      console.log('Updated existing reports.');
    }
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
})();
