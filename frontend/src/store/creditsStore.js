import { api } from '../api/client'
import { getDemandes } from './demandesStore'

const PAYMENTS_KEY = 'kassa_payments'
const PAYMENTS_VER = 'kassa_payments_v'
const VERSION      = '1'

// ─── API calls (avec fallback localStorage) ─────────────────

export async function fetchActiveCredits() {
  try {
    return await api.get('/credits')
  } catch {
    return getActiveCredits()
  }
}

export async function fetchEcheancier(creditId) {
  try {
    return await api.get(`/credits/${creditId}/echeancier`)
  } catch {
    const credits = getActiveCredits()
    const credit  = credits.find(c => c.id === creditId)
    return credit ? getEcheancier(credit) : []
  }
}

export async function fetchEcheancesAujourdhui() {
  try {
    return await api.get('/paiements/echeances-aujourd-hui')
  } catch {
    return getEcheancesAujourdhui()
  }
}

export async function fetchImpayes() {
  try {
    return await api.get('/paiements/impayes')
  } catch {
    return getImpayes()
  }
}

export async function fetchPaiements() {
  try {
    return await api.get('/paiements')
  } catch {
    return getPayments()
  }
}

export async function enregistrerPaiement(data) {
  try {
    const result = await api.post('/paiements', data)
    // Aussi sauvegarder en localStorage comme cache
    recordPayment(data)
    return result
  } catch {
    return recordPayment(data)
  }
}

// ─── Fallback localStorage ───────────────────────────────────

export function getPayments() {
  try {
    if (localStorage.getItem(PAYMENTS_VER) !== VERSION) {
      localStorage.setItem(PAYMENTS_KEY, JSON.stringify([]))
      localStorage.setItem(PAYMENTS_VER, VERSION)
      return []
    }
    const raw = localStorage.getItem(PAYMENTS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function savePayments(list) {
  try { localStorage.setItem(PAYMENTS_KEY, JSON.stringify(list)) } catch {}
}

function creditRef(demande) {
  const year = (demande.date_decaissement || demande.date || '2026').slice(0, 4)
  const num  = String(demande.id).padStart(4, '0')
  return `CRD-${year}-${num}`
}

export function getActiveCredits() {
  return getDemandes()
    .filter(d => d.statut === 'decaissee')
    .map(d => ({
      id:         d.id,
      ref:        creditRef(d),
      client:     d.client,
      produit:    d.produit || 'Crédit',
      montant:    d.montant,
      duree:      d.duree || 12,
      mensualite: Math.round(d.montant / (d.duree || 12)),
      date_debut: d.date_decaissement || d.date || new Date().toISOString().slice(0, 10),
      telephone:  d.telephone || '',
    }))
}

export function getEcheancier(credit) {
  const payments = getPayments()
  const start    = new Date(credit.date_debut)
  const today    = new Date().toISOString().slice(0, 10)

  return Array.from({ length: credit.duree }, (_, i) => {
    const d = new Date(start)
    d.setMonth(d.getMonth() + i + 1)
    const dateStr = d.toISOString().slice(0, 10)
    const echId   = `${credit.ref}-${i + 1}`
    const paid    = payments.find(p => p.echeance_id === echId)

    return {
      id:            echId,
      num:           i + 1,
      credit_ref:    credit.ref,
      client:        credit.client,
      montant:       credit.mensualite,
      date_echeance: dateStr,
      statut:        paid ? 'paye' : dateStr < today ? 'en_retard' : 'a_payer',
      payment:       paid || null,
    }
  })
}

export function getEcheancesAujourdhui() {
  const today = new Date().toISOString().slice(0, 10)
  return getActiveCredits().flatMap(c =>
    getEcheancier(c).filter(e => e.date_echeance === today)
  )
}

export function getImpayes() {
  const today = new Date().toISOString().slice(0, 10)
  return getActiveCredits().flatMap(credit =>
    getEcheancier(credit)
      .filter(e => e.statut === 'en_retard')
      .map(e => ({
        ...e,
        jours: Math.floor((new Date(today) - new Date(e.date_echeance)) / 86400000),
        credit,
      }))
  )
}

export function recordPayment({ echeance_id, credit_ref, client, montant, mode, ref_transaction }) {
  const payment = {
    id:              Date.now().toString(),
    echeance_id,
    credit_ref,
    client,
    montant,
    mode,
    ref_transaction,
    date:            new Date().toISOString().slice(0, 10),
    heure:           new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
  }
  const list = [...getPayments(), payment]
  savePayments(list)
  return payment
}
