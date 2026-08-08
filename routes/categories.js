import { isNumber, isString } from '../utils.js';
import pool from '../db.js';
import express from 'express';
import { categoryDataValidator, requireUniqueCategory, checkExistingCategoryId } from '../middlewares/categories.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM categories ORDER BY rank');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/:id', async (req, res) => {
    const categoryId = req.params.id;
    try {
        const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [categoryId]);
        if (!rows.length){
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/', categoryDataValidator, requireUniqueCategory, async (req, res) => {
    console.log('Received request to create category with data');
    try {
        const {name, rank = '0'} = req.body;

        const [result] = await pool.query('INSERT INTO categories (name, rank) VALUES (?, ?)', [name, rank]);
        res.status(201).json({ id: result.insertId, name, rank });
    }
    catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/:id', categoryDataValidator, checkExistingCategoryId(), requireUniqueCategory, async (req, res) => {
    const categoryId = req.params.id;
    const {name, rank} = req.body;
    try{

        const [result] = await pool.query('UPDATE categories SET name = ?, rank = ? WHERE id = ?', [name, rank, categoryId]);
        res.status(201).json({id: result.insertId, name, rank})
    } 
    catch(error) {
        console.error('Error updating category:', error);
        res.status(500).json({ error: 'Internal server error'});
    }
});

router.delete('/:id', checkExistingCategoryId(), async (req, res) => {
    const categoryId = req.params.id;
    try{
        const [result] = await pool.query('DELETE FROM categories WHERE id = ?', [categoryId]);
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ error: 'Internal server error'});
    }
})


export default router;