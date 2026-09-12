import { isNumber, isString, getCurrentDate, checkDateFormat } from '../utils.js';
import { briefDataValidator, checkExistingBriefId, canCreateBrief } from '../middlewares/briefs.js';
import { checkExistingCategoryId } from '../middlewares/categories.js';
import pool from '../db.js';
import express from 'express';
const router = express.Router();


router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                briefs.*,
                categories.name AS category_name
            FROM briefs
            JOIN categories
                ON briefs.category_id = categories.id
            ORDER BY
                publish_date DESC;
            `);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching briefs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/:id', checkExistingBriefId, async (req, res) => {
    const briefId = req.params.id;
    try {
        const [rows] = await pool.query('SELECT * FROM briefs WHERE id = ?', [briefId]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Brief not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching briefs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/', canCreateBrief, briefDataValidator, checkExistingCategoryId(false), async (req, res) => {
    try {
        const {title, description, deadline, budget, category_id} = req.body;
        const publish_date = getCurrentDate();


        // TODO COMMON FUNCTION FOR ALL INSERTS
        const [rows] = await pool.query(`
            INSERT
                INTO briefs 
                (title, description, deadline, budget, category_id, publish_date)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [title, description, deadline, budget, category_id, publish_date]);

        res.status(201).json({ id: rows.insertId, title, description, deadline, budget, category_id, publish_date });
    } catch (error) {
        console.error('Error creating brief:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/:id', briefDataValidator, checkExistingBriefId, checkExistingCategoryId(false), async (req, res) => {
    const briefId = req.params.id;
    const {title, description, deadline, budget, category_id, publish_date} = req.body;
    try {

        const [rows] = await pool.query(`
            UPDATE briefs
            SET title = ?,
                description = ?,
                deadline = ?,
                budget = ?,
                category_id = ?,
                publish_date = ?
            WHERE id = ?
        `, [title, description, deadline, budget, category_id, publish_date, briefId]);

        if (rows.affectedRows === 0) {
            return res.status(404).json({ error: 'Brief not found' });
        }

        console.log(`Brief with ID ${briefId} updated successfully.`);
        console.log({ id: briefId, title, description, deadline, budget, category_id, publish_date });

        res.json({ id: briefId, title, description, deadline, budget, category_id, publish_date });
    } catch (error) {
        console.error('Error updating brief:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/:id', checkExistingBriefId, async (req, res) => {
    const briefId = req.params.id;
    try {
        const [rows] = await pool.query('DELETE FROM briefs WHERE id = ?', [briefId]);
        if (rows.affectedRows === 0) {
            return res.status(404).json({ error: 'Brief not found' });
        }
        res.json({ id: briefId });
    } catch (error) {
        console.error('Error deleting brief:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;