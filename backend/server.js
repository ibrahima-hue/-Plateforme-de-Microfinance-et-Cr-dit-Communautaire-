const express = require('express')
const cors    = require('cors')
require('dotenv').config()

const app = express()

app.use(cors({ origin: '*', credentials: true }))
app.use(express.json())

// ─── Routes ─────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'))
app.use('/api/users',         require('./routes/users'))
app.use('/api/membres',       require('./routes/membres'))
app.use('/api/demandes',      require('./routes/demandes'))
app.use('/api/credits',       require('./routes/credits'))
app.use('/api/paiements',     require('./routes/paiements'))
app.use('/api/dashboard',     require('./routes/dashboard'))
app.use('/api/solvabilite',   require('./routes/solvabilite'))

// ─── Santé ──────────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date().toISOString() }))

// ─── 404 ────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: `Route ${req.method} ${req.path} introuvable` }))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`✓ KASSA API  →  http://localhost:${PORT}`))
