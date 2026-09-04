
require("dotenv").config();
const pool = require("./db");
async function test() {
  try {
    const tourist = await pool.query(`INSERT INTO users (email, role, name, phone) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name RETURNING id`, ["t@t.com", "tourist", "T", "999"]);
    const tId = tourist.rows[0].id;
    
    for (let i=0; i<3; i++) {
        const result = await pool.query(
          `WITH next_inspector AS (
             SELECT id FROM users 
             WHERE role = $10 
             ORDER BY 
               CASE WHEN region = $7 THEN 0 ELSE 1 END ASC,
               (SELECT COUNT(*) FROM reports WHERE assigned_to = users.id) ASC, 
               id ASC
             LIMIT 1
           )
           INSERT INTO reports 
            (user_id, concern_type, description, latitude, longitude, business_name, region, status, risk_score, business_id, assigned_to) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $11, $8, $9, (SELECT id FROM next_inspector)) RETURNING assigned_to`,
          [tId, "Safety concern", "Test report " + i, 26.9, 75.8, "Test Biz", "Jaipur South", 10, null, "inspector", "new"]
        );
        console.log("Assigned to:", result.rows[0].assigned_to);
    }
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
test();

