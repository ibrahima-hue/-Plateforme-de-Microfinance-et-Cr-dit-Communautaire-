const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const { search, cooperative_id, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    const conditions = [];

    if (search) {
      conditions.push('(m.nom LIKE ? OR m.prenom LIKE ? OR m.cin LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (cooperative_id) {
      conditions.push('m.cooperative_id = ?');
      params.push(cooperative_id);
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

    const [rows] = await db.query(`
      SELECT m.*, coop.nom as cooperative,
             COUNT(DISTINCT dc.id) as nb_credits,
             COALESCE(SUM(CASE WHEN c.statut='actif' THEN c.solde_restant END), 0) as encours
      FROM membres m
      LEFT JOIN cooperatives coop ON m.cooperative_id = coop.id
      LEFT JOIN demandes_credit dc ON m.id = dc.membre_id AND dc.statut != 'rejete'
      LEFT JOIN credits c ON m.id = c.membre_id
      ${where}
      GROUP BY m.id
      ORDER BY m.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM membres m ${where}`, params
    );

    res.json({ data: rows, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [[membre]] = await db.query(`
      SELECT m.*, coop.nom as cooperative FROM membres m
      LEFT JOIN cooperatives coop ON m.cooperative_id = coop.id
      WHERE m.id = ?
    `, [req.params.id]);

    const [credits] = await db.query(`
      SELECT c.*, dc.objet FROM credits c
      JOIN demandes_credit dc ON c.demande_id = dc.id
      WHERE c.membre_id = ?
      ORDER BY c.created_at DESC
    `, [req.params.id]);

    res.json({ ...membre, credits });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { cooperative_id, nom, prenom, cin, telephone, email, adresse, date_naissance, profession, revenu_mensuel } = req.body;
    const [result] = await db.query(
      `INSERT INTO membres (cooperative_id, nom, prenom, cin, telephone, email, adresse, date_naissance, profession, revenu_mensuel) VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [cooperative_id, nom, prenom, cin, telephone, email, adresse, date_naissance, profession, revenu_mensuel]
    );
    res.status(201).json({ id: result.insertId, message: 'Membre créé' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { nom, prenom, telephone, email, adresse, profession, revenu_mensuel, statut } = req.body;
    await db.query(
      `UPDATE membres SET nom=?, prenom=?, telephone=?, email=?, adresse=?, profession=?, revenu_mensuel=?, statut=? WHERE id=?`,
      [nom, prenom, telephone, email, adresse, profession, revenu_mensuel, statut, req.params.id]
    );
    res.json({ message: 'Membre mis à jour' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/cooperatives/list', async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM cooperatives WHERE statut='active' ORDER BY nom`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
