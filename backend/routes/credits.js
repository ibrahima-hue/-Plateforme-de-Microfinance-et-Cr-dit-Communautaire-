const router = require('express').Router()
const db     = require('../db')
const auth   = require('../middleware/auth')

// GET /api/credits  — tous les crédits actifs
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM credits WHERE statut = 'actif' ORDER BY created_at DESC`)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/credits/:id/echeancier  — échéancier calculé
router.get('/:id/echeancier', auth, async (req, res) => {
  try {
    const [[credit]] = await db.query('SELECT * FROM credits WHERE id = ?', [req.params.id])
    if (!credit) return res.status(404).json({ error: 'Crédit introuvable' })

    const [payments] = await db.query(
      'SELECT * FROM paiements WHERE credit_id = ?', [credit.id]
    )
    const today = new Date().toISOString().slice(0, 10)
    const start = new Date(credit.date_debut)

    const echeancier = Array.from({ length: credit.duree }, (_, i) => {
      const d = new Date(start)
      d.setMonth(d.getMonth() + i + 1)
      const dateStr  = d.toISOString().slice(0, 10)
      const echId    = `${credit.ref}-${i + 1}`
      const payment  = payments.find(p => p.echeance_id === echId)

      return {
        id:            echId,
        num:           i + 1,
        credit_ref:    credit.ref,
        client:        credit.client,
        montant:       credit.mensualite,
        date_echeance: dateStr,
        statut:        payment ? 'paye' : dateStr < today ? 'en_retard' : 'a_payer',
        payment:       payment || null,
      }
    })

    res.json(echeancier)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
