import { getUserDataFromToken } from '../utils.js';
import pool from '../db.js';
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config.js';
import { checkExistingBriefId } from '../middlewares/briefs.js';
import { isOwner, checkExistingApplicationId, canApplyToBrief, checkUniqueApplication } from '../middlewares/applications.js';

const router = express.Router();

router.get('/:id', checkExistingApplicationId, async (req, res) => {
    try {
        const applicationId = req.params.id;
        const [rows] = await pool.query('SELECT * FROM applications WHERE id = ?', [applicationId]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }
        res.json(rows[0]);
    }
    catch (error) {
        console.error('Error fetching application:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})


router.get('/', checkExistingBriefId, async (req, res) => {
    try {
        const briefId = req.query.briefId;
        const [rows] = await pool.query('SELECT * FROM applications WHERE brief_id = ?', [briefId]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.post('/', checkExistingBriefId(req => req.body.briefId), canApplyToBrief, checkUniqueApplication, async (req, res) => {
    try {
        const userData = getUserDataFromToken(req);
        const { briefId, demo = null } = req.body;

        const [rows] = await pool.query(`INSERT INTO applications (user_id, brief_id, demo) VALUES (?, ?, ?)`, [userData.id, briefId, demo]);
        res.status(201).json({ id: rows.insertId, user_id: userData.id, brief_id: briefId });
    } catch (error) {
        console.error('Error applying to brief:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.put('/:id', checkExistingApplicationId, isOwner, async (req, res) => {
    try {
        const demo = req.body?.demo ?? null;
        const applicationId = req.params.id;

        const [rows] = await pool.query(`UPDATE applications SET demo = ? WHERE id = ?`, [demo, applicationId]);
        if (rows.affectedRows === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }
        res.status(200).json({ id: applicationId, demo });
    } catch (error) {
        console.error('Error updating application:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.delete('/:id', checkExistingApplicationId, isOwner, async (req, res) => {
    try {
        const applicationId = req.params.id;

        const [rows] = await pool.query('DELETE FROM applications WHERE id = ?', [applicationId]);
        if (rows.affectedRows === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }
        res.status(200).json({ message: 'Application deleted successfully' });
    } catch (error) {
        console.error('Error deleting application:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;