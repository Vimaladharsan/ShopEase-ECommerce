const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const USERS_FILE = path.join(__dirname, '../data/users.json');

// Get all users
router.get('/', (req, res) => {
    fs.readFile(USERS_FILE, 'utf8', (err, data) => {

        if (err) {
            return res.status(500).json({
                message: 'Unable to read users file.'
            });
        }

        res.json(JSON.parse(data));

    });
});

module.exports = router;