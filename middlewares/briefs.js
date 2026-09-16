import { isNumber, isString, checkDateFormat, getCurrentDate, getUserDataFromToken } from "../utils.js";
import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
import pool from "../db.js";
import config from "../config.js";

export async function briefDataValidator(req, res, next) {
    !req.headers.authorization && res.status(401).json({ error: 'Unauthorized' });

    const { title, description, deadline, budget, category_id, publish_date } = req.body;
    let errors = [];
    // CHECK IF TITLE AND DESCRIPTION ARE VALID STRINGS (255 CHARACTERS MAX per title and 1020 CHARACTERS MAX per description)
    !isString(title, 8, 255) && errors.push({ field: 'title', message: 'Title value is not a valid string' });
    !isString(description, 10, 2040) && errors.push({ field: 'description', message: 'Description value is not a valid string' });
    
    !isNumber(category_id) && errors.push({ field: 'category_id', message: 'Category ID value is not a number' });
    !isNumber(budget, true) && errors.push({ field: 'budget', message: 'Budget value is not a valid number' });
    
    !checkDateFormat(deadline) && errors.push({ field: 'deadline', message: 'Deadline value is not a valid date format' });
    
    const currentDate = getCurrentDate();
    if(deadline < currentDate){
        errors.push({ field: 'deadline', message: 'Deadline value cannot be in the past' });
    }

    const { id } = req.params;
    const [rows] = await pool.query(`SELECT DATE_FORMAT(publish_date, '%Y-%m-%d') as publish_date FROM briefs WHERE id = ?`, [id]);

    if(rows[0] && rows[0].publish_date < currentDate && publish_date !== rows[0].publish_date){
        errors.push({ field: 'publish_date', message: 'Cannot update brief publish date if the original date is in the past' });
    }

    !checkDateFormat(publish_date) && errors.push({ field: 'publish_date', message: 'Publish date value is not a valid date format' });

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

export async function canCreateBrief(req, res, next) {
    const userData = getUserDataFromToken(req);
    
    if (!userData) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if(userData.role.name !== config.brandRoleName) {
        return res.status(403).json({ error: `Forbidden: Only users with the ${config.brandRoleName} role can create briefs` });
    }

    next();
}