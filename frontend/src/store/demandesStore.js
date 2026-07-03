const STORAGE_KEY = 'kassa_demandes'
const VERSION_KEY  = 'kassa_demandes_v'
const VERSION      = '3'

// Données initiales cohérentes entre tous les portails :
//   statut 'soumise'           → file N1 (Responsable Agence)
//   statut 'en_validation_n2'  → file N2 (Directeur)
//   statut 'en_validation_n3'  → file N3 (Directeur)
//   statut 'approuvee'         → approuvée définitivement
//   statut 'rejetee'           → rejetée
const INITIAL = [
  { id:1, client:'Mamadou Diallo', montant:2500000, produit:'Crédit Équipement',  score:82, statut:'en_validation_n2', agent:'Aissatou Diallo', date:'2026-07-01', duree:24, objet:'Achat matériel' },
  { id:2, client:'Aminata Ba',     montant:600000,  produit:'Fonds de Roulement', score:71, statut:'soumise',          agent:'Aissatou Diallo', date:'2026-07-02', duree:12, objet:'Fonds de roulement' },
  { id:3, client:'Oumar Kane',     montant:3000000, produit:'Crédit Équipement',  score:79, statut:'en_validation_n3', agent:'Aissatou Diallo', date:'2026-06-28', duree:36, objet:'Équipement industriel' },
  { id:4, client:'Marième Fall',   montant:1200000, produit:'Fonds de Roulement', score:88, statut:'approuvee',        agent:'Aissatou Diallo', date:'2026-06-25', duree:18, objet:'Commerce' },
  { id:5, client:'Rokhaya Diop',   montant:500000,  produit:'Fonds de Roulement', score:72, statut:'soumise',          agent:'Aissatou Diallo', date:'2026-07-03', duree:12, objet:'Activité commerciale' },
  { id:6, client:'Binta Cissé',    montant:4000000, produit:'Crédit Habitat',     score:91, statut:'en_validation_n2', agent:'Ibrahima Fall',   date:'2026-07-02', duree:48, objet:'Construction maison' },
  { id:7, client:'Lamine Ndiaye',  montant:5000000, produit:'Crédit Immobilier',  score:84, statut:'en_validation_n3', agent:'Ibrahima Fall',   date:'2026-06-30', duree:60, objet:'Investissement immobilier' },
  { id:8, client:'Fatou Sow',      montant:350000,  produit:'Crédit Agricole',    score:65, statut:'soumise',          agent:'Ibrahima Fall',   date:'2026-07-02', duree:12, objet:'Agriculture' },
  { id:9, client:'Amadou Diop',    montant:2000000, produit:'Crédit Équipement',  score:75, statut:'soumise',          agent:'Ibrahima Fall',   date:'2026-06-30', duree:24, objet:'Équipement professionnel' },
]

export function getDemandes() {
  try {
    if (localStorage.getItem(VERSION_KEY) !== VERSION) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL))
      localStorage.setItem(VERSION_KEY, VERSION)
      return INITIAL
    }
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : INITIAL
  } catch {
    return INITIAL
  }
}

function save(list) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)) } catch {}
}

export function addDemande(d) {
  const list = getDemandes()
  const next = [d, ...list]
  save(next)
  return next
}

export function updateDemande(id, changes) {
  const list = getDemandes()
  const next = list.map(d => d.id === id ? { ...d, ...changes } : d)
  save(next)
  return next
}
