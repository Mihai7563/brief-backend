// import {  } from "../utils.js";
import pool from "../db.js";

// promitem sa o mutam cand cineva va avea nevoie inca o data de asta
export async function requireUniqueEmail(req, res, next) {
  try {
    const { email } = req.body;
    const id = req.params.id || null; // Get the ID from params if it exists, otherwise null
    const [rows] = await pool.query(
      `SELECT * FROM users WHERE email = ? ${id ? "AND id != ?" : ""}`,
      [email, id],
    );

    if (rows.length) {
      return res.status(422).json({ error: "Email must be unique" });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}


// register login logout routes