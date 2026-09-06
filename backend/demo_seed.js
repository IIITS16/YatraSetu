require("dotenv").config({ path: __dirname + "/.env" });
const pool = require("./db");

async function seed() {
  console.log("Seeding Hackathon Demo Data...");
  try {
    const sysUser = await pool.query(`
      INSERT INTO users (email, name, role, region)
      VALUES ('demo-tourist@yatrasetu.local', 'Demo Tourist', 'tourist', 'Jaipur')
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `);
    const uId = sysUser.rows[0].id;

    const inspector = await pool.query(`
      SELECT id FROM users WHERE role = 'inspector' AND region = 'Jaipur' LIMIT 1
    `);
    const iId = inspector.rows.length > 0 ? inspector.rows[0].id : null;

    await pool.query("DELETE FROM reports WHERE user_id = $1", [uId]);
    await pool.query("DELETE FROM businesses WHERE name LIKE '%(Demo)%'");

    const b1 = await pool.query(`
      INSERT INTO businesses (name, region, base_risk_score)
      VALUES ('Saffron Courtyard (Demo)', 'Jaipur', 84) RETURNING id
    `);
    const b2 = await pool.query(`
      INSERT INTO businesses (name, region, base_risk_score)
      VALUES ('Laxmi Mishthan Bhandar (Demo)', 'Jaipur', 10) RETURNING id
    `);
    const b3 = await pool.query(`
      INSERT INTO businesses (name, region, base_risk_score)
      VALUES ('Highway Dhaba 99 (Demo)', 'Jaipur', 45) RETURNING id
    `);
    
    const aiJsonHigh = JSON.stringify({
      modifier: 59,
      signals: ["Arithmetic mismatch", "Tax inconsistency", "Price anomaly", "Repeat merchant complaints"],
      reasoning: "The scanned bill exhibits illegal tax surcharges and significant overcharging compared to standard rates."
    });
    
    await pool.query(`
      INSERT INTO reports (user_id, business_id, business_name, concern_type, description, status, risk_score, region, reviewer_notes, assigned_to, latitude, longitude)
      VALUES ($1, $2, $3, 'Pricing issue', 'They charged me GST twice on the bill and inflated the price of water bottles. Very suspicious.', 'new', 84, 'Jaipur', $4, $5, 26.9124, 75.7873)
    `, [uId, b1.rows[0].id, 'Saffron Courtyard (Demo)', `AI_JSON: ${aiJsonHigh}`, iId]);

    const aiJsonMed = JSON.stringify({
      modifier: 20,
      signals: ["Service discrepancy"],
      reasoning: "The menu prices slightly differ from the final bill, possibly due to outdated menus."
    });

    await pool.query(`
      INSERT INTO reports (user_id, business_id, business_name, concern_type, description, status, risk_score, region, reviewer_notes, assigned_to, latitude, longitude)
      VALUES ($1, $2, $3, 'Misleading service', 'The food was not what they promised on the menu, and they refused to change it.', 'investigating', 45, 'Jaipur', $4, $5, 26.8450, 75.7300)
    `, [uId, b3.rows[0].id, 'Highway Dhaba 99 (Demo)', `AI_JSON: ${aiJsonMed}`, iId]);

    const aiJsonLow = JSON.stringify({
      modifier: 0,
      signals: ["No fraud indicators"],
      reasoning: "The bill appears standard and all calculations are correct."
    });

    await pool.query(`
      INSERT INTO reports (user_id, business_id, business_name, concern_type, description, status, risk_score, region, reviewer_notes, assigned_to, latitude, longitude)
      VALUES ($1, $2, $3, 'Safety concern', 'The table was slightly dirty when we sat down.', 'invalid', 10, 'Jaipur', $4, $5, 26.9218, 75.8082)
    `, [uId, b2.rows[0].id, 'Laxmi Mishthan Bhandar (Demo)', `AI_JSON: ${aiJsonLow}`, iId]);

    console.log("Synthetic Hackathon Demo Data Seeded Successfully!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
seed();
