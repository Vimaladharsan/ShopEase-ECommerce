const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const bcrypt = require('bcryptjs');
const router = express.Router();

const USERS_FILE = path.join(__dirname, '../data/users.json');
const PRODUCTS_FILE = path.join(__dirname, '../data/products.json');

const DELIVERY_FEE = 49;
const FREE_DELIVERY_ABOVE = 1000;

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

// Never send password hashes to the client
function sanitize(user) {
    const { password, ...safe } = user;
    return safe;
}

function isBcryptHash(value) {
    return typeof value === 'string' && value.startsWith('$2');
}

// Order status progresses automatically with time since placement
function computeStatus(order) {
    if (order.status === 'Cancelled') return 'Cancelled';
    const minutes = (Date.now() - new Date(order.date).getTime()) / 60000;
    if (minutes < 2) return 'Placed';
    if (minutes < 5) return 'Processing';
    if (minutes < 15) return 'Shipped';
    return 'Delivered';
}

function refreshOrderStatuses(user) {
    let changed = false;
    for (const order of user.purchaseHistory || []) {
        const status = computeStatus(order);
        if (order.status !== status) {
            order.status = status;
            changed = true;
        }
    }
    return changed;
}

function generateOrderId(user) {
    const seq = (user.purchaseHistory?.length || 0) + 1;
    return `ORD-${Date.now().toString(36).toUpperCase()}-${String(seq).padStart(3, '0')}`;
}

// Get all users (debug/admin) — sanitized
router.get('/', async (req, res) => {
    try {
        const users = await readJson(USERS_FILE);
        res.json(users.map(sanitize));
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
        const index = findUserIndex(users, username);
        if (index === -1) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const user = users[index];
        let valid;
        if (isBcryptHash(user.password)) {
            valid = await bcrypt.compare(password, user.password);
        } else {
            // Legacy plaintext password: verify, then migrate to a hash
            valid = user.password === password;
            if (valid) {
                user.password = await bcrypt.hash(password, 10);
            }
        }

        if (!valid) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const statusChanged = refreshOrderStatuses(user);
        if (statusChanged || !isBcryptHash(users[index].password)) {
            // persist hash migration and/or status updates
        }
        await writeJson(USERS_FILE, users);

        res.json(sanitize(user));
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
    if (String(newUser.username).length < 3) {
        return res.status(400).json({ message: 'Username must be at least 3 characters.' });
    }
    if (String(newUser.password).length < 5) {
        return res.status(400).json({ message: 'Password must be at least 5 characters.' });
    }

    try {
        const users = await readJson(USERS_FILE);
        if (findUserIndex(users, newUser.username) !== -1) {
            return res.status(409).json({ message: 'Username is already taken' });
        }

        const user = {
            username: newUser.username,
            password: await bcrypt.hash(String(newUser.password), 10),
            fullName: newUser.fullName || '',
            email: newUser.email || '',
            memberSince: new Date().toISOString(),
            phone: newUser.phone || '',
            address: newUser.address || '',
            purchaseHistory: []
        };

        users.push(user);
        await writeJson(USERS_FILE, users);
        res.status(201).json(sanitize(user));
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
        res.json(sanitize(user));
    } catch (err) {
        res.status(500).json({ message: 'Unable to update user.' });
    }
});

// Get the user's orders with time-progressed statuses
router.get('/:username/orders', async (req, res) => {
    try {
        const users = await readJson(USERS_FILE);
        const index = findUserIndex(users, req.params.username);
        if (index === -1) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const user = users[index];
        if (refreshOrderStatuses(user)) {
            await writeJson(USERS_FILE, users);
        }
        res.json(user.purchaseHistory || []);
    } catch (err) {
        res.status(500).json({ message: 'Unable to read orders.' });
    }
});

// Place an order — the server is the authority on prices, stock, and totals
router.post('/:username/orders', async (req, res) => {
    const { items, paymentMethod, address } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Order must contain at least one item.' });
    }
    if (!address || !String(address).trim()) {
        return res.status(400).json({ message: 'A delivery address is required.' });
    }

    try {
        const users = await readJson(USERS_FILE);
        const index = findUserIndex(users, req.params.username);
        if (index === -1) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const categories = await readJson(PRODUCTS_FILE);
        const allProducts = categories.flatMap(c => c.products);

        // Validate items against the live catalog
        const orderItems = [];
        for (const item of items) {
            const product = allProducts.find(p => p.id === item.id);
            if (!product) {
                return res.status(400).json({ message: `Product ${item.id} does not exist.` });
            }
            const quantity = Math.floor(Number(item.quantity));
            if (!Number.isFinite(quantity) || quantity < 1) {
                return res.status(400).json({ message: `Invalid quantity for ${product.name}.` });
            }
            if (product.stock < quantity) {
                return res.status(409).json({
                    message: `Only ${product.stock} × ${product.name} left in stock.`
                });
            }
            orderItems.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: quantity
            });
        }

        const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
        const deliveryFee = subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;

        const user = users[index];
        const order = {
            orderId: generateOrderId(user),
            items: orderItems,
            subtotal: subtotal,
            deliveryFee: deliveryFee,
            total: subtotal + deliveryFee,
            date: new Date().toISOString(),
            status: 'Placed',
            paymentMethod: paymentMethod === 'UPI' ? 'UPI' : 'Cash on Delivery',
            address: String(address).trim()
        };

        // Commit: decrement stock, then record the order
        for (const item of orderItems) {
            const product = allProducts.find(p => p.id === item.id);
            product.stock -= item.quantity;
        }
        await writeJson(PRODUCTS_FILE, categories);

        user.purchaseHistory = user.purchaseHistory || [];
        user.purchaseHistory.push(order);
        refreshOrderStatuses(user);
        await writeJson(USERS_FILE, users);

        res.status(201).json({ user: sanitize(user), order: order });
    } catch (err) {
        res.status(500).json({ message: 'Unable to save order.' });
    }
});

// Cancel an order (only before it ships) and restore stock
router.post('/:username/orders/:orderId/cancel', async (req, res) => {
    try {
        const users = await readJson(USERS_FILE);
        const index = findUserIndex(users, req.params.username);
        if (index === -1) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const user = users[index];
        const order = (user.purchaseHistory || []).find(o => o.orderId === req.params.orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }

        const status = computeStatus(order);
        if (status === 'Cancelled') {
            return res.status(409).json({ message: 'Order is already cancelled.' });
        }
        if (status !== 'Placed' && status !== 'Processing') {
            return res.status(409).json({ message: `Order has already ${status === 'Shipped' ? 'shipped' : 'been delivered'} and cannot be cancelled.` });
        }

        order.status = 'Cancelled';

        // Restore stock
        const categories = await readJson(PRODUCTS_FILE);
        const allProducts = categories.flatMap(c => c.products);
        for (const item of order.items) {
            const product = allProducts.find(p => p.id === item.id);
            if (product) {
                product.stock += item.quantity;
            }
        }
        await writeJson(PRODUCTS_FILE, categories);

        refreshOrderStatuses(user);
        await writeJson(USERS_FILE, users);

        res.json({ user: sanitize(user), order: order });
    } catch (err) {
        res.status(500).json({ message: 'Unable to cancel order.' });
    }
});

module.exports = router;
