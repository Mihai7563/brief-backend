import { isNumber, isString } from '../utils.js';
import pool from '../db.js';
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { creativeRegisterDataValidator, brandRegisterDataValidator, requireUniqueEmail, loginDataValidator } from '../middlewares/auth.js';

const router = express.Router();

router.post('/login', loginDataValidator, async (req, res) => {
    try {
        const { email, password } = req.body;

        const [rows] = await pool.query(`SELECT * FROM users WHERE email = ?`, [email]);

        if (!rows.length) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = createJWTToken(user._id, user.email);
        res.json({ token });
    }
    catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/register/brand', brandRegisterDataValidator, requireUniqueEmail, async (req, res) => {
    const brandRoleId = await findRoleIdByName('brand');

    console.log(req.body)
    const { email, password, password_confirm } = req.body;

    const saltRounds = 12;

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('Hashed password:', hashedPassword); 
    
    const [rows] = await pool.query(`
        INSERT
            INTO users 
            (email, password, role_id)
        VALUES (?, ?, ?)`,
        [email, hashedPassword, brandRoleId]);
    
    const token = createJWTToken(rows.insertId, email);
    res.status(201).json({ message: 'User registered successfully', token });
});

router.post('/register/creative', creativeRegisterDataValidator, requireUniqueEmail, async (req, res) => {
    const creativeRoleId = await findRoleIdByName('creative');

    console.log(req.body)
    const { email, password, password_confirm } = req.body;

    const saltRounds = 12;

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('Hashed password:', hashedPassword); 
    
    const [rows] = await pool.query(`
        INSERT
            INTO users 
            (email, password, role_id)
        VALUES (?, ?, ?)`,
        [email, hashedPassword, creativeRoleId]);

    const token = createJWTToken(rows.insertId, email);
    res.status(201).json({ message: 'User registered successfully', token });
});

// LOCAL FUNCTIONS

function createJWTToken(userId, email) {
    return jwt.sign(
        { id: userId, email: email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
}


async function findRoleIdByName(roleName) {
    const rows = await pool.query(`SELECT id FROM roles WHERE name = ?`, [roleName]);
    if (rows.length) {
        return rows[0].id;
    } else {
        throw new Error(`Role ${roleName} not found`);
    }
}

export default router;