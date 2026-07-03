const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const [rows] = await db.query(`
      SELECT r.*, m.nom, m.prenom, c.montant_octroye
      FROM remboursements r
      JOIN credits c ON r.credit_id = c.id
      JOIN membres m ON c.membre_id = m.id
      ORDER BY r.date_paiement DESC
      LIMIT ? OFFSET ?
    `, [parseInt(limit), parseInt(offset)]);

    const [[{ total }]] = await db.query(`SELECT COUNT(*) as total FROM remboursements`);
    res.json({ data: rows, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { credit_id, echeance_id, montant, date_paiement, mode_paiement, reference, caissier, notes } = req.body;

    const [result] = await db.query(
      `INSERT INTO remboursements (credit_id, echeance_id, montant, date_paiement, mode_paiement, reference, caissier, notes) VALUES (?,?,?,?,?,?,?,?)`,
      [credit_id, echeance_id || null, montant, date_paiement, mode_paiement, reference, caissier, notes]
    );

    await db.query(
      `UPDATE credits SET montant_rembourse = montant_rembourse + ?, solde_restant = solde_restant - ? WHERE id=?`,
      [montant, montant, credit_id]
    );

    if (echeance_id) {
      await db.query(
        `UPDATE echeanciers SET montant_paye = montant_paye + ?, statut = CASE WHEN montant_paye + ? >= montant_total THEN 'paye' ELSE 'partiellement_paye' END, date_paiement = ? WHERE id=?`,
        [montant, montant, date_paiement, echeance_id]
      );
    }

    const [[credit]] = await db.query(`SELECT solde_restant FROM credits WHERE id=?`, [credit_id]);
    if (credit.solde_restant <= 0) {
      await db.query(`UPDATE credits SET statut='cloture' WHERE id=?`, [credit_id]);
    }

    res.status(201).json({ id: result.insertId, message: 'Remboursement enregistré' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/impayees', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT e.*, m.nom, m.prenom, m.telephone, c.id as credit_id,
             DATEDIFF(CURDATE(), e.date_echeance) as jours_retard
      FROM echeanciers e
      JOIN credits c ON e.credit_id = c.id
      JOIN membres m ON c.membre_id = m.id
      WHERE e.statut IN ('en_retard','impaye') AND e.date_echeance < CURDATE()
      ORDER BY jours_retard DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
