const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/users');
const app = express();

app.use(cors());
app.use(express.json());
app.use('/users', userRoutes);
app.get('/', (req, res) => {
    res.send('✅ ShopEase Backend is Running');
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});