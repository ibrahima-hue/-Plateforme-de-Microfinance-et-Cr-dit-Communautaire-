const router = require('express').Router()
const bcrypt = require('bcryptjs')
const db     = require('../db')
const auth   = require('../middleware/auth')

const SAFE_FIELDS = 'id, nom, prenom, email, role, agence, institution, cooperative_id, actif, must_change_password, created_at'

// GET /api/users
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT ${SAFE_FIELDS} FROM utilisateurs ORDER BY created_at DESC`)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/users
router.post('/', auth, async (req, res) => {
  const { nom, prenom, email, password, role, agence, institution, cooperative_id } = req.body
  if (!nom || !prenom || !email || !password || !role)
    return res.status(400).json({ error: 'Champs obligatoires manquants' })

  const hash = await bcrypt.hash(password, 10)
  try {
    const [result] = await db.query(
      'INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, role, agence, institution, cooperative_id, must_change_password) VALUES (?,?,?,?,?,?,?,?,?)',
      [nom, prenom, email, hash, role, agence || null, institution || null, cooperative_id || null, true]
    )
    const [rows] = await db.query(`SELECT ${SAFE_FIELDS} FROM utilisateurs WHERE id = ?`, [result.insertId])
    res.status(201).json(rows[0])
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email déjà utilisé' })
    res.status(500).json({ error: err.message })
  }
})

// PUT /api/users/:id
router.put('/:id', auth, async (req, res) => {
  const { nom, prenom, email, role, agence, institution, actif } = req.body
  try {
    await db.query(
      'UPDATE utilisateurs SET nom=?, prenom=?, email=?, role=?, agence=?, institution=?, actif=? WHERE id=?',
      [nom, prenom, email, role, agence || null, institution || null, actif !== false, req.params.id]
    )
    const [rows] = await db.query(`SELECT ${SAFE_FIELDS} FROM utilisateurs WHERE id = ?`, [req.params.id])
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/users/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('UPDATE utilisateurs SET actif = FALSE WHERE id = ?', [req.params.id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
