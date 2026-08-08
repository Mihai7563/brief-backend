import { isNumber, isString, checkDateFormat, getCurrentDate } from "../utils.js";
import pool from "../db.js";

export function briefDataValidator(req, res, next) {
    const { title, description, deadline, budget, category_id, publish_date } = req.body;
    let errors = [];
    // CHECK IF TITLE AND DESCRIPTION ARE VALID STRINGS (255 CHARACTERS MAX per title and 1020 CHARACTERS MAX per description)
    !isString(title, 8, 255) && errors.push({ field: 'title', message: 'Title value is not a valid string' });
    !isString(description, 10, 2040) && errors.push({ field: 'description', message: 'Description value is not a valid string' });

    !isNumber(category_id) && errors.push({ field: 'category_id', message: 'Category ID value is not a number' });
    !isNumber(budget, true) && errors.push({ field: 'budget', message: 'Budget value is not a valid number' });

    !checkDateFormat(deadline) && errors.push({ field: 'deadline', message: 'Deadline value is not a valid date format' });

    if(deadline < getCurrentDate()){
        errors.push({ field: 'deadline', message: 'Deadline value cannot be in the past' });
    }

    if (errors.length > 0) {
        return res.status(422).json({ errors });
    }
    next();
}

export async function checkExistingBriefId(req, res, next) {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM briefs WHERE id = ?', [id]);
    if (rows.length == 0) {
        return res.status(404).json({ error: 'Brief not found' });
    }
    next();
}