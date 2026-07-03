const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const { statut, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    let where = '';
    const params = [];
    if (statut) { where = 'WHERE dc.statut = ?'; params.push(statut); }

    const [rows] = await db.query(`
      SELECT dc.*, m.nom, m.prenom, m.telephone, coop.nom as cooperative
      FROM demandes_credit dc
      JOIN membres m ON dc.membre_id = m.id
      JOIN cooperatives coop ON m.cooperative_id = coop.id
      ${where}
      ORDER BY dc.date_demande DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM demandes_credit dc ${where}`, params
    );

    res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT dc.*, m.nom, m.prenom, m.telephone, m.email, m.profession,
             m.revenu_mensuel, m.score_solvabilite, coop.nom as cooperative
      FROM demandes_credit dc
      JOIN membres m ON dc.membre_id = m.id
      JOIN cooperatives coop ON m.cooperative_id = coop.id
      WHERE dc.id = ?
    `, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Non trouvé' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { membre_id, montant, duree_mois, taux_interet, objet } = req.body;
    const [result] = await db.query(
      `INSERT INTO demandes_credit (membre_id, montant, duree_mois, taux_interet, objet) VALUES (?,?,?,?,?)`,
      [membre_id, montant, duree_mois, taux_interet, objet]
    );
    res.status(201).json({ id: result.insertId, message: 'Demande soumise' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/statut', async (req, res) => {
  try {
    const { statut, motif_rejet } = req.body;
    await db.query(
      `UPDATE demandes_credit SET statut=?, motif_rejet=?, date_decision=NOW() WHERE id=?`,
      [statut, motif_rejet || null, req.params.id]
    );

    if (statut === 'decaisse') {
      const [[demande]] = await db.query(`SELECT * FROM demandes_credit WHERE id=?`, [req.params.id]);
      const mensualite = calculerMensualite(demande.montant, demande.taux_interet, demande.duree_mois);
      const dateDecaissement = new Date();
      const dateEcheance = new Date();
      dateEcheance.setMonth(dateEcheance.getMonth() + demande.duree_mois);

      const [creditResult] = await db.query(
        `INSERT INTO credits (demande_id, membre_id, montant_octroye, taux_interet, duree_mois, mensualite, solde_restant, date_decaissement, date_echeance)
         VALUES (?,?,?,?,?,?,?,?,?)`,
        [demande.id, demande.membre_id, demande.montant, demande.taux_interet, demande.duree_mois,
         mensualite, demande.montant, dateDecaissement.toISOString().split('T')[0],
         dateEcheance.toISOString().split('T')[0]]
      );

      await genererEcheancier(creditResult.insertId, demande.montant, demande.taux_interet, demande.duree_mois, dateDecaissement);
    }

    res.json({ message: 'Statut mis à jour' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/echeancier', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT e.* FROM echeanciers e
       JOIN credits c ON e.credit_id = c.id
       JOIN demandes_credit dc ON c.demande_id = dc.id
       WHERE dc.id = ?
       ORDER BY e.numero_echeance`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function calculerMensualite(montant, taux, duree) {
  const r = (taux / 100) / 12;
  return Math.round(montant * r * Math.pow(1 + r, duree) / (Math.pow(1 + r, duree) - 1));
}

async function genererEcheancier(creditId, montant, taux, duree, dateDebut) {
  const r = (taux / 100) / 12;
  const mensualite = calculerMensualite(montant, taux, duree);
  let solde = montant;
  const values = [];

  for (let i = 1; i <= duree; i++) {
    const interet = Math.round(solde * r);
    const principal = mensualite - interet;
    const dateEch = new Date(dateDebut);
    dateEch.setMonth(dateEch.getMonth() + i);
    solde -= principal;

    values.push([creditId, i, dateEch.toISOString().split('T')[0], principal, interet, mensualite]);
  }

  await db.query(
    `INSERT INTO echeanciers (credit_id, numero_echeance, date_echeance, montant_principal, montant_interet, montant_total) VALUES ?`,
    [values]
  );
}

module.exports = router;
