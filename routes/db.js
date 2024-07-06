import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const db = new pg.Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

db.connect();

// async function check() {
//     const response = await db.query("SELECT * FROM users WHERE id=$1", [2]);
//     console.log(response.rows);
// }

// check();

export default db;