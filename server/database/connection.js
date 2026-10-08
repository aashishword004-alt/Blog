
import dotenv from "dotenv"
import mysql from "mysql2/promise";

dotenv.config();

const con = mysql.createPool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASS,
  database: process.env.NAME,
  port: process.env.PORT,
});

(async () => {
  try {
    const connection = await con.getConnection();
    console.log("Database connected successfully");
    connection.release();
  } catch (error) {
    console.log("Database connection failed:", error.message);
  }
})();

export default con;