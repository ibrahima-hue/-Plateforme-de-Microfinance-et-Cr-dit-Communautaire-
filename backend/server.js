const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/credits', require('./routes/credits'));
app.use('/api/remboursements', require('./routes/remboursements'));
app.use('/api/membres', require('./routes/membres'));
app.use('/api/solvabilite', require('./routes/solvabilite'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`KASSA API running on port ${PORT}`));
