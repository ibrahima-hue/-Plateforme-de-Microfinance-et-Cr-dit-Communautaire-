const router = require('express').Router()
const bcrypt = require('bcryptjs')
const db     = require('../db')
const auth   = require('../middleware/auth')

// GET /api/membres
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.*,
             c.nom AS cooperative,
             COUNT(DISTINCT dc.id) AS nb_credits
      FROM membres m
      LEFT JOIN cooperatives c  ON c.id = m.cooperative_id
      LEFT JOIN demandes_credit dc ON dc.membre_id = m.id AND dc.statut != 'rejetee'
      GROUP BY m.id
      ORDER BY m.created_at DESC
    `)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/membres/cooperatives/list
router.get('/cooperatives/list', auth, async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM cooperatives WHERE statut='active' ORDER BY nom`)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/membres/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const [[membre]] = await db.query(
      `SELECT m.*, c.nom AS cooperative FROM membres m
       LEFT JOIN cooperatives c ON c.id = m.cooperative_id
       WHERE m.id = ?`, [req.params.id]
    )
    if (!membre) return res.status(404).json({ error: 'Membre introuvable' })
    res.json(membre)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/membres  — crée le membre + le compte utilisateur client
router.post('/', auth, async (req, res) => {
  const { nom, prenom, cin, telephone, email, adresse, date_naissance, profession, revenu_mensuel, cooperative, cooperative_id } = req.body
  if (!nom || !prenom) return res.status(400).json({ error: 'Nom et prénom obligatoires' })

  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()

    let coopId = cooperative_id || null
    if (!coopId && cooperative) {
      const [coops] = await conn.query('SELECT id FROM cooperatives WHERE nom = ? LIMIT 1', [cooperative])
      if (coops.length) coopId = coops[0].id
    }

    const [mResult] = await conn.query(
      `INSERT INTO membres (cooperative_id, nom, prenom, cin, telephone, email, adresse, date_naissance, profession, revenu_mensuel)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [coopId, nom, prenom, cin || null, telephone || null, email || null,
       adresse || null, date_naissance || null, profession || null, revenu_mensuel || null]
    )

    // Compte client automatique
    const base        = `${slugify(prenom)}.${slugify(nom)}`
    const userEmail   = await uniqueEmail(conn, base)
    const tempPwd     = `${slugify(prenom).replace(/\./g, '').slice(0, 4).padEnd(4, 'x')}2026`
    const hash        = await bcrypt.hash(tempPwd, 10)

    await conn.query(
      `INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, role, institution, cooperative_id, must_change_password)
       VALUES (?,?,?,?,?,?,?,?)`,
      [nom, prenom, userEmail, hash, 'client', cooperative || '', coopId, true]
    )

    await conn.commit()
    const [rows] = await db.query('SELECT * FROM membres WHERE id = ?', [mResult.insertId])
    res.status(201).json({ membre: rows[0], compte: { email: userEmail, tempPassword: tempPwd } })
  } catch (err) {
    await conn.rollback()
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'CIN ou email déjà utilisé' })
    res.status(500).json({ error: err.message })
  } finally {
    conn.release()
  }
})

// PUT /api/membres/:id
router.put('/:id', auth, async (req, res) => {
  const { nom, prenom, cin, telephone, email, adresse, date_naissance, profession, revenu_mensuel, statut } = req.body
  try {
    await db.query(
      `UPDATE membres SET nom=?, prenom=?, cin=?, telephone=?, email=?, adresse=?,
       date_naissance=?, profession=?, revenu_mensuel=?, statut=? WHERE id=?`,
      [nom, prenom, cin || null, telephone || null, email || null, adresse || null,
       date_naissance || null, profession || null, revenu_mensuel || null, statut || 'actif', req.params.id]
    )
    const [rows] = await db.query('SELECT * FROM membres WHERE id = ?', [req.params.id])
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/membres/:id
router.delete('/:id', auth, async (req, res) => {
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()
    const [[m]] = await conn.query('SELECT nom, prenom FROM membres WHERE id = ?', [req.params.id])
    if (!m) { await conn.rollback(); return res.status(404).json({ error: 'Membre introuvable' }) }

    await conn.query('DELETE FROM membres WHERE id = ?', [req.params.id])
    await conn.query(
      "UPDATE utilisateurs SET actif = FALSE WHERE role = 'client' AND nom = ? AND prenom = ?",
      [m.nom, m.prenom]
    )
    await conn.commit()
    res.json({ success: true })
  } catch (err) {
    await conn.rollback()
    res.status(500).json({ error: err.message })
  } finally {
    conn.release()
  }
})

function slugify(str) {
  return (str || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '')
}

async function uniqueEmail(conn, base) {
  const candidate = `${base}@kassa.sn`
  const [r] = await conn.query('SELECT id FROM utilisateurs WHERE email = ?', [candidate])
  if (!r.length) return candidate
  let i = 2
  while (true) {
    const c = `${base}${i}@kassa.sn`
    const [r2] = await conn.query('SELECT id FROM utilisateurs WHERE email = ?', [c])
    if (!r2.length) return c
    i++
  }
}

module.exports = router
