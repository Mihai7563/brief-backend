import { isNumber, isString } from "../utils.js";
import pool from "../db.js";

export function categoryDataValidator(req, res, next) {
  const { name, rank = "0" } = req.body;
  let errors = [];

  if (!isNumber(rank)) {
    errors.push({ field: "rank", message: "Rank value is not a valid number" });
  }

  if (!isString(name, 2, 100)) {
    errors.push({ field: "name", message: "Name value is not a valid string" });
  }

  if (errors.length > 0) {
    return res.status(422).json({ errors });
  }

  next();
}

export async function requireUniqueCategory(req, res, next) {
  try {
    const { name } = req.body;
    const id = req.params.id || null; // Get the ID from params if it exists, otherwise null
    const [rows] = await pool.query(
      `SELECT * FROM categories WHERE name = ? ${id ? "AND id != ?" : ""}`,
      [name, id],
    );
    if (rows.length) {
      return res.status(422).json({ error: "Category name must be unique" });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

export function checkExistingCategoryId(queryParameter = true) {
    return async (req, res, next) => {
        const id = queryParameter ? req.params.id : req.body.category_id;
        const [rows] = await pool.query("SELECT * FROM categories WHERE id = ?", [id]);
        if (rows.length == 0) {
            return res.status(404).json({ error: "Category not found" });
        }
        next();
    }
}
