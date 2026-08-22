import { isNumber, isString } from '../utils.js';
import pool from '../db.js';
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config.js';
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
        
        
        const role = await findRoleById(user.role_id);
        const token = createJWTToken(user.id, user.email, role);
        res.json({ token });
    }
    catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.post(`/register/${config.brandRoleName}`, brandRegisterDataValidator, requireUniqueEmail, async (req, res) => {
    const role = await findRoleByName(config.brandRoleName);

    const { email, password, password_confirm } = req.body;

    const hashedPassword = await bcrypt.hash(password, config.bcryptSaltRounds);
    
    const [rows] = await pool.query(`
        INSERT
            INTO users 
            (email, password, role_id)
        VALUES (?, ?, ?)`,
        [email, hashedPassword, role.id]);
    
    const token = createJWTToken(rows.insertId, email, role);
    res.status(201).json({ message: 'User registered successfully', token });
});


router.post(`/register/${config.creativeRoleName}`, creativeRegisterDataValidator, requireUniqueEmail, async (req, res) => {
    const role = await findRoleByName(config.creativeRoleName);

    const { email, password, password_confirm } = req.body;

    const hashedPassword = await bcrypt.hash(password, config.bcryptSaltRounds);

    const [rows] = await pool.query(`
        INSERT
            INTO users 
            (email, password, role_id)
        VALUES (?, ?, ?)`,
        [email, hashedPassword, role.id]);
    

    const token = createJWTToken(rows.insertId, email, role);
    res.status(201).json({ message: 'User registered successfully', token });
});

// LOCAL FUNCTIONS

function createJWTToken(userId, email, role) {
    return jwt.sign(
        { id: userId, email, role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
}


async function findRoleIdByName(roleName) {
    const role = await findRoleByName(roleName);
    return role.id;
}


async function findRoleByName(roleName) {
    const [rows] = await pool.query(`SELECT * FROM roles WHERE name = ?`, [roleName]);
    if (rows.length) {
        return mapRoleRow(rows[0]);
    } else {
        throw new Error(`Role ${roleName} not found`);
    }
}

async function findRoleById(roleId) {
    const [rows] = await pool.query(`SELECT * FROM roles WHERE id = ?`, [roleId]);
    if (rows.length) {
        return mapRoleRow(rows[0]);
    } else {
        throw new Error(`Role with ID ${roleId} not found`);
    }
}


function mapRoleRow(roleRow) {
    return {
        id: roleRow.id,
        name: roleRow.name
    };
}

export default router;