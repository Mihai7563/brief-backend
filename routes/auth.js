import { isNumber, isString } from '../utils.js';
import pool from '../db.js';
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { requireUniqueEmail } from '../middlewares/auth.js';

const router = express.Router();

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

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

router.post('/register', requireUniqueEmail, async (req, res) => {

    console.log(req.body)
    const { email, password, password_confirm } = req.body;

    if (!email || !password || !password_confirm) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (password !== password_confirm) {
        return res.status(400).json({ error: 'Passwords do not match' });
    }

    const saltRounds = 12;

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('Hashed password:', hashedPassword); 
    
    const [rows] = await pool.query(`
        INSERT
            INTO users 
            (email, password)
        VALUES (?, ?)`,
        [email, hashedPassword]);
    
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

export default router;