const pool = require('./db.js');
pool.query("SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'media_urls'")
  .then(res => { console.log(JSON.stringify(res.rows, null, 2)); pool.end(); })
  .catch(e => { console.error(e); pool.end(); });
