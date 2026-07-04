const router = require('express').Router()
const db     = require('../db')
const auth   = require('../middleware/auth')

// GET /api/paiements
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM paiements ORDER BY created_at DESC`)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/paiements/echeances-aujourd-hui
router.get('/echeances-aujourd-hui', auth, async (req, res) => {
  const today = new Date().toISOString().slice(0, 10)
  try {
    const [credits] = await db.query(`SELECT * FROM credits WHERE statut = 'actif'`)
    const [payments] = await db.query(`SELECT * FROM paiements`)
    const echeances = []

    for (const c of credits) {
      const start = new Date(c.date_debut)
      for (let i = 0; i < c.duree; i++) {
        const d = new Date(start)
        d.setMonth(d.getMonth() + i + 1)
        const dateStr = d.toISOString().slice(0, 10)
        if (dateStr !== today) continue

        const echId  = `${c.ref}-${i + 1}`
        const paid   = payments.find(p => p.echeance_id === echId)
        echeances.push({
          id:            echId,
          num:           i + 1,
          credit_ref:    c.ref,
          credit_id:     c.id,
          client:        c.client,
          montant:       c.mensualite,
          date_echeance: dateStr,
          statut:        paid ? 'paye' : 'a_payer',
          payment:       paid || null,
        })
      }
    }
    res.json(echeances)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/paiements/impayes
router.get('/impayes', auth, async (req, res) => {
  const today = new Date().toISOString().slice(0, 10)
  try {
    const [credits]  = await db.query(`SELECT * FROM credits WHERE statut = 'actif'`)
    const [payments] = await db.query(`SELECT * FROM paiements`)
    const impayes = []

    for (const c of credits) {
      const start = new Date(c.date_debut)
      for (let i = 0; i < c.duree; i++) {
        const d = new Date(start)
        d.setMonth(d.getMonth() + i + 1)
        const dateStr = d.toISOString().slice(0, 10)
        if (dateStr >= today) continue

        const echId = `${c.ref}-${i + 1}`
        const paid  = payments.find(p => p.echeance_id === echId)
        if (paid) continue

        impayes.push({
          id:            echId,
          num:           i + 1,
          credit_ref:    c.ref,
          credit_id:     c.id,
          client:        c.client,
          montant:       c.mensualite,
          date_echeance: dateStr,
          statut:        'en_retard',
          jours:         Math.floor((new Date(today) - new Date(dateStr)) / 86400000),
        })
      }
    }
    res.json(impayes)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/paiements  — enregistrer un paiement
router.post('/', auth, async (req, res) => {
  const { echeance_id, credit_ref, credit_id, client, montant, mode, ref_transaction, echeance_num } = req.body
  if (!echeance_id || !credit_ref || !montant)
    return res.status(400).json({ error: 'echeance_id, credit_ref et montant sont obligatoires' })

  const now  = new Date()
  const date = now.toISOString().slice(0, 10)
  const heure = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  try {
    // Trouver le credit_id si pas fourni
    let cid = credit_id
    if (!cid) {
      const [[c]] = await db.query('SELECT id FROM credits WHERE ref = ?', [credit_ref])
      if (!c) return res.status(404).json({ error: 'Crédit introuvable' })
      cid = c.id
    }

    const [result] = await db.query(
      `INSERT INTO paiements (credit_id, credit_ref, echeance_num, echeance_id, client, montant, mode, ref_transaction, date_paiement, heure, caissier_id)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [cid, credit_ref, echeance_num || 0, echeance_id, client || '', montant,
       mode || 'especes', ref_transaction || null, date, heure, req.user.id]
    )

    const [rows] = await db.query('SELECT * FROM paiements WHERE id = ?', [result.insertId])
    res.status(201).json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
