import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

dotenv.config();

const connect = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});
(async () => {
  try {
    const connection = await connect.getConnection();
    console.log("Database connected successfully");
    connection.release();
  } catch (error) {
    console.log("Database connection failed:", error.message);
  }
})();

export default connect