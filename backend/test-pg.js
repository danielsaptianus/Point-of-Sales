const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:123456@localhost:5432/arto_pos_db?schema=public' });

async function main() {
  const users = await pool.query('SELECT * FROM "users"');
  console.log("Users:", users.rows);
  const emps = await pool.query('SELECT * FROM "employees"');
  console.log("Employees:", emps.rows);
  const pos = await pool.query('SELECT * FROM "positions"');
  console.log("Positions:", pos.rows);
}
main().catch(console.error).finally(() => pool.end());
