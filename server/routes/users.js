const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const router = express.Router();

const USERS_FILE = path.join(__dirname, '../data/users.json');
const PRODUCTS_FILE = path.join(__dirname, '../data/products.json');

async function readJson(file) {
    return JSON.parse(await fs.readFile(file, 'utf8'));
}

async function writeJson(file, data) {
    await fs.writeFile(file, JSON.stringify(data, null, 2));
}

function findUserIndex(users, username) {
    const lower = String(username).toLowerCase();
    return users.findIndex(u => u.username.toLowerCase() === lower);
}

// Get all users (debug/admin)
router.get('/', async (req, res) => {
    try {
        res.json(await readJson(USERS_FILE));
    } catch (err) {
        res.status(500).json({ message: 'Unable to read users file.' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body || {};
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        const users = await readJson(USERS_FILE);
        const user = users.find(
            u => u.username.toLowerCase() === String(username).toLowerCase() && u.password === password
        );
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Unable to read users file.' });
    }
});

// Register
router.post('/register', async (req, res) => {
    const newUser = req.body || {};
    if (!newUser.username || !newUser.password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        const users = await readJson(USERS_FILE);
        if (findUserIndex(users, newUser.username) !== -1) {
            return res.status(409).json({ message: 'Username is already taken' });
        }

        const user = {
            username: newUser.username,
            password: newUser.password,
            fullName: newUser.fullName || '',
            email: newUser.email || '',
            memberSince: newUser.memberSince || new Date().toISOString(),
            phone: newUser.phone || '',
            address: newUser.address || '',
            purchaseHistory: []
        };

        users.push(user);
        await writeJson(USERS_FILE, users);
        res.status(201).json(user);
    } catch (err) {
        res.status(500).json({ message: 'Unable to save user.' });
    }
});

// Update profile
router.put('/:username', async (req, res) => {
    try {
        const users = await readJson(USERS_FILE);
        const index = findUserIndex(users, req.params.username);
        if (index === -1) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const { fullName, email, phone, address } = req.body || {};
        const user = users[index];
        if (fullName !== undefined) user.fullName = fullName;
        if (email !== undefined) user.email = email;
        if (phone !== undefined) user.phone = phone;
        if (address !== undefined) user.address = address;

        await writeJson(USERS_FILE, users);
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Unable to update user.' });
    }
});

// Place an order: append to the user's purchase history and decrement product stock
router.post('/:username/orders', async (req, res) => {
    const order = req.body || {};
    if (!Array.isArray(order.items) || order.items.length === 0) {
        return res.status(400).json({ message: 'Order must contain at least one item.' });
    }

    try {
        const users = await readJson(USERS_FILE);
        const index = findUserIndex(users, req.params.username);
        if (index === -1) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const user = users[index];
        user.purchaseHistory = user.purchaseHistory || [];
        user.purchaseHistory.push(order);
        await writeJson(USERS_FILE, users);

        // Decrement stock for ordered products
        try {
            const categories = await readJson(PRODUCTS_FILE);
            for (const item of order.items) {
                for (const category of categories) {
                    const product = category.products.find(p => p.id === item.id);
                    if (product) {
                        product.stock = Math.max(0, product.stock - item.quantity);
                    }
                }
            }
            await writeJson(PRODUCTS_FILE, categories);
        } catch (err) {
            console.error('Order saved but stock update failed:', err);
        }

        res.status(201).json(user);
    } catch (err) {
        res.status(500).json({ message: 'Unable to save order.' });
    }
});

module.exports = router;
