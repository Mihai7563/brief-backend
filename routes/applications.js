import { getUserDataFromToken } from '../utils.js';
import pool from '../db.js';
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config.js';
import { checkExistingBriefId } from '../middlewares/briefs.js';
import { isOwner, checkExistingApplicationId } from '../middlewares/applications.js';

const router = express.Router();

// ROUTES FOR APPLICATIONS NOT TIED TO A SPECIFIC BRIEF

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