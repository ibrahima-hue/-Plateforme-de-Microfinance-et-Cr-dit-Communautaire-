const router = require('express').Router()
const db     = require('../db')
const auth   = require('../middleware/auth')

// GET /api/demandes
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM demandes_credit ORDER BY created_at DESC`
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/demandes
router.post('/', auth, async (req, res) => {
  const { client, produit, montant, duree, objet, score, agent, telephone, date } = req.body
  if (!client || !montant || !duree) return res.status(400).json({ error: 'Champs obligatoires manquants' })

  try {
    const [result] = await db.query(
      `INSERT INTO demandes_credit (client, produit, montant, duree, objet, score, statut, agent, agent_id, telephone, date)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [client, produit || 'Crédit', montant, duree, objet || '', score || null,
       'soumise', agent || req.user.prenom + ' ' + req.user.nom, req.user.id,
       telephone || null, date || new Date().toISOString().slice(0, 10)]
    )
    const [rows] = await db.query('SELECT * FROM demandes_credit WHERE id = ?', [result.insertId])
    res.status(201).json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/demandes/:id  — mise à jour partielle de statut ou champs
router.patch('/:id', auth, async (req, res) => {
  const allowed = ['statut', 'score', 'motif_rejet', 'date_decaissement', 'produit', 'objet', 'agent']
  const fields  = Object.keys(req.body).filter(k => allowed.includes(k))
  if (!fields.length) return res.status(400).json({ error: 'Aucun champ valide fourni' })

  const sets   = fields.map(f => `${f} = ?`).join(', ')
  const values = fields.map(f => req.body[f])

  try {
    await db.query(`UPDATE demandes_credit SET ${sets} WHERE id = ?`, [...values, req.params.id])

    // Si décaissée → créer/mettre à jour le crédit correspondant
    if (req.body.statut === 'decaissee') {
      const [[d]] = await db.query('SELECT * FROM demandes_credit WHERE id = ?', [req.params.id])
      const dateDebut = d.date_decaissement || new Date().toISOString().slice(0, 10)
      const year      = dateDebut.slice(0, 4)
      const ref       = `CRD-${year}-${String(d.id).padStart(4, '0')}`
      const mensualite = Math.round(d.montant / d.duree)

      // Upsert crédit
      await db.query(
        `INSERT INTO credits (demande_id, ref, client, produit, montant, duree, mensualite, date_debut, telephone)
         VALUES (?,?,?,?,?,?,?,?,?)
         ON DUPLICATE KEY UPDATE
           ref=VALUES(ref), mensualite=VALUES(mensualite), date_debut=VALUES(date_debut)`,
        [d.id, ref, d.client, d.produit || 'Crédit', d.montant, d.duree, mensualite, dateDebut, d.telephone || null]
      )
    }

    const [rows] = await db.query('SELECT * FROM demandes_credit WHERE id = ?', [req.params.id])
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
