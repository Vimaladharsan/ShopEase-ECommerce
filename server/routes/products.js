const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const router = express.Router();

const PRODUCTS_FILE = path.join(__dirname, '../data/products.json');

// Get all categories with their products
router.get('/', async (req, res) => {
    try {
        const categories = JSON.parse(await fs.readFile(PRODUCTS_FILE, 'utf8'));
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: 'Unable to read products file.' });
    }
});

module.exports = router;
