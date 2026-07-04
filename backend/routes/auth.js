const router  = require('express').Router()
const bcrypt  = require('bcryptjs')
const jwt     = require('jsonwebtoken')
const db      = require('../db')

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' })

  try {
    const [rows] = await db.query(
      'SELECT * FROM utilisateurs WHERE email = ? AND actif = TRUE',
      [email]
    )
    const user = rows[0]
    if (!user) return res.status(401).json({ error: 'Email ou mot de passe incorrect' })

    const valid = await bcrypt.compare(password, user.mot_de_passe)
    if (!valid) return res.status(401).json({ error: 'Email ou mot de passe incorrect' })

    const payload = {
      id:           user.id,
      nom:          user.nom,
      prenom:       user.prenom,
      email:        user.email,
      role:         user.role,
      agence:       user.agence,
      institution:  user.institution,
    }
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' })

    res.json({
      token,
      user: { ...payload, mustChangePassword: !!user.must_change_password },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// POST /api/auth/change-password
const auth = require('../middleware/auth')
router.post('/change-password', auth, async (req, res) => {
  const { newPassword } = req.body
  if (!newPassword || newPassword.length < 6)
    return res.status(400).json({ error: 'Mot de passe trop court (min 6 caractères)' })

  const hash = await bcrypt.hash(newPassword, 10)
  await db.query(
    'UPDATE utilisateurs SET mot_de_passe = ?, must_change_password = FALSE WHERE id = ?',
    [hash, req.user.id]
  )
  res.json({ success: true })
})

module.exports = router
