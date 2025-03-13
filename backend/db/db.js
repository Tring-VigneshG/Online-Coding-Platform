import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
  host: process.env.PG_HOST,
  user: process.env.PG_USER,
  password:process.env.PG_PASSWORD,
  port:process.env.PG_PORT,
  database: process.env.PG_DATABASE,
});

export function connect() {
  return pool.connect();
}


export function query(text, params) {
  return pool.query(text, params);
}

export default pool;
