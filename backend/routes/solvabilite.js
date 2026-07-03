const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/analyser', async (req, res) => {
  try {
    const { membre_id, montant, duree_mois } = req.body;

    const [[membre]] = await db.query(
      `SELECT m.*, COUNT(DISTINCT c.id) as nb_credits_actifs,
              COALESCE(SUM(CASE WHEN c.statut='actif' THEN c.solde_restant END),0) as encours_actuel,
              COUNT(DISTINCT CASE WHEN e.statut IN ('en_retard','impaye') THEN e.id END) as nb_retards
       FROM membres m
       LEFT JOIN credits c ON m.id = c.membre_id
       LEFT JOIN echeanciers e ON c.id = e.credit_id
       WHERE m.id = ?
       GROUP BY m.id`,
      [membre_id]
    );

    if (!membre) return res.status(404).json({ error: 'Membre non trouvé' });

    const score = calculerScore(membre, montant, duree_mois);
    await db.query(`UPDATE membres SET score_solvabilite=? WHERE id=?`, [score.total, membre_id]);

    res.json(score);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/membre/:id', async (req, res) => {
  try {
    const [[membre]] = await db.query(
      `SELECT m.*, COUNT(DISTINCT c.id) as nb_credits,
              COALESCE(SUM(CASE WHEN c.statut='actif' THEN c.solde_restant END),0) as encours,
              COUNT(DISTINCT CASE WHEN e.statut IN ('en_retard','impaye') THEN e.id END) as nb_retards
       FROM membres m
       LEFT JOIN credits c ON m.id = c.membre_id
       LEFT JOIN echeanciers e ON c.id = e.credit_id
       WHERE m.id = ?
       GROUP BY m.id`,
      [req.params.id]
    );

    if (!membre) return res.status(404).json({ error: 'Membre non trouvé' });
    res.json({ score: membre.score_solvabilite, ...getScoreDetails(membre) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function calculerScore(membre, montantDemande, duree) {
  const criteres = [];

  // Capacité de remboursement (30 pts)
  const mensualite = montantDemande / duree;
  const ratioEndettement = membre.revenu_mensuel > 0 ? mensualite / membre.revenu_mensuel : 1;
  let scoreCapacite = 0;
  if (ratioEndettement <= 0.3) scoreCapacite = 30;
  else if (ratioEndettement <= 0.4) scoreCapacite = 22;
  else if (ratioEndettement <= 0.5) scoreCapacite = 15;
  else scoreCapacite = 5;
  criteres.push({ nom: 'Capacité de remboursement', score: scoreCapacite, max: 30, ratio: Math.round(ratioEndettement * 100) });

  // Historique crédit (25 pts)
  let scoreHistorique = 25;
  if (membre.nb_retards > 0) scoreHistorique -= membre.nb_retards * 8;
  scoreHistorique = Math.max(0, scoreHistorique);
  criteres.push({ nom: 'Historique crédit', score: scoreHistorique, max: 25, nb_retards: membre.nb_retards });

  // Ancienneté membre (20 pts)
  const anciennete = new Date().getFullYear() - new Date(membre.created_at || Date.now()).getFullYear();
  let scoreAnciennete = Math.min(20, anciennete * 5);
  criteres.push({ nom: 'Ancienneté', score: scoreAnciennete, max: 20, annees: anciennete });

  // Encours actuel (15 pts)
  const nbCreditsActifs = membre.nb_credits_actifs || 0;
  let scoreEncours = nbCreditsActifs === 0 ? 15 : nbCreditsActifs === 1 ? 10 : nbCreditsActifs === 2 ? 5 : 0;
  criteres.push({ nom: 'Encours actuel', score: scoreEncours, max: 15, nb_actifs: nbCreditsActifs });

  // Revenus stables (10 pts)
  let scoreRevenus = membre.revenu_mensuel >= 300000 ? 10 : membre.revenu_mensuel >= 150000 ? 7 : membre.revenu_mensuel >= 80000 ? 4 : 2;
  criteres.push({ nom: 'Stabilité revenus', score: scoreRevenus, max: 10, revenu: membre.revenu_mensuel });

  const total = criteres.reduce((s, c) => s + c.score, 0);
  const decision = total >= 70 ? 'APPROUVÉ' : total >= 50 ? 'SOUS CONDITIONS' : 'REFUSÉ';
  const risque = total >= 70 ? 'Faible' : total >= 50 ? 'Modéré' : 'Élevé';

  return { total, decision, risque, criteres, membre: { nom: membre.nom, prenom: membre.prenom } };
}

function getScoreDetails(membre) {
  return {
    revenu_mensuel: membre.revenu_mensuel,
    nb_credits: membre.nb_credits,
    encours: membre.encours,
    nb_retards: membre.nb_retards,
    niveau_risque: membre.score_solvabilite >= 70 ? 'Faible' : membre.score_solvabilite >= 50 ? 'Modéré' : 'Élevé',
  };
}

module.exports = router;
