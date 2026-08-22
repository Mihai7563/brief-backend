import { checkEmailFormat } from "../utils.js";
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


export function brandRegisterDataValidator(req, res, next) {
  const { email, password, password_confirm } = req.body;
  if (!email || !password || !password_confirm) {
      return res.status(422).json({ error: 'All fields are required' });
  }

  // Validate email format
  if (!checkEmailFormat(email)) {
    return res.status(422).json({ error: "Invalid email format" });
  }

  // Validate password length
  const minPasswordLength = 8;
  if (password.length < minPasswordLength) {
    return res.status(422).json({ error: `Password must be at least ${minPasswordLength} characters long` });
  }

  // Validate password confirmation
  if (password !== password_confirm) {
    return res.status(422).json({ error: "Passwords do not match" });
  }

  next();
}

export function creativeRegisterDataValidator(req, res, next) {
  const { email, password, password_confirm } = req.body;
  if (!email || !password || !password_confirm) {
      return res.status(422).json({ error: 'All fields are required' });
  }

  // Validate email format
  if (!checkEmailFormat(email)) {
    return res.status(422).json({ error: "Invalid email format" });
  }

  // Validate password length
  const minPasswordLength = 8;
  if (password.length < minPasswordLength) {
    return res.status(422).json({ error: `Password must be at least ${minPasswordLength} characters long` });
  }

  // Validate password confirmation
  if (password !== password_confirm) {
    return res.status(422).json({ error: "Passwords do not match" });
  }

  next();
}


export function loginDataValidator(req, res, next) {
  const { email, password } = req.body;
  
  if (!email || !password) {
      return res.status(422).json({ error: 'Email and password are required' });
  }

  if (!checkEmailFormat(email)) {
    return res.status(422).json({ error: "Invalid email format" });
  }

  next();
}
