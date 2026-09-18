import { getUserDataFromToken } from '../utils.js';
import pool from '../db.js';
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config.js';
import { checkExistingBriefId } from '../middlewares/briefs.js';
import { canApplyToBrief, checkUniqueApplication } from '../middlewares/applications.js';

const router = express.Router({mergeParams: true});

// ROUTES FOR APPLICATIONS RELATED TO A SPECIFIC BRIEF

router.get('/', checkExistingBriefId, async (req, res) => {
    try {
        const briefId = req.params.briefId;
        const [rows] = await pool.query('SELECT * FROM applications WHERE brief_id = ?', [briefId]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.post('/', checkExistingBriefId, canApplyToBrief, checkUniqueApplication, async (req, res) => {
    try {
        const userData = getUserDataFromToken(req);
        const briefId = req.params.briefId;
        const demo = req.body?.demo ?? null;

        const [rows] = await pool.query(`INSERT INTO applications (user_id, brief_id, demo) VALUES (?, ?, ?)`, [userData.id, briefId, demo]);
        res.status(201).json({ id: rows.insertId, user_id: userData.id, brief_id: briefId });
    } catch (error) {
        console.error('Error applying to brief:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;