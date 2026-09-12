import { checkEmailFormat } from "../utils.js";
import pool from "../db.js";

export async function requireUniqueEmail(req, res, next) {
  try {
    const { email } = req.body;
    const id = req.params.id || null; // Get the ID from params if it exists, otherwise null
    const [rows] = await pool.query(
      `SELECT 1 FROM users WHERE email = ? ${id ? "AND id != ?" : ""} LIMIT 1`,
      id ? [email, id] : [email]
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
  const validationResult = commonRegisterDataValidator(req);
  if (validationResult) {
    return res.status(validationResult.errorCode).json({ error: validationResult.errorMessage });
  }

  // Specific brand validation implementation to be added later
  next();
}

export function creativeRegisterDataValidator(req, res, next) {
  const validationResult = commonRegisterDataValidator(req);
  if (validationResult) {
    return res.status(validationResult.errorCode).json({ error: validationResult.errorMessage });
  }

  // Specific creative validation implementation to be added later
  next();
}

function commonRegisterDataValidator(req){
  const { email, password, password_confirm } = req.body;
  if (!email || !password || !password_confirm) {
      return {errorCode: 422, errorMessage: 'All fields are required'};
  }

  // Validate email format
  if (!checkEmailFormat(email)) {
    return {errorCode: 422, errorMessage: "Invalid email format" };
  }

  // Validate password length
  const minPasswordLength = 8;
  if (password.length < minPasswordLength) {
    return {errorCode: 422, errorMessage: `Password must be at least ${minPasswordLength} characters long` };
  }

  // Validate password confirmation
  if (password !== password_confirm) {
    return {errorCode: 422, errorMessage: "Passwords do not match" };
  }

  return null; // No errors
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


