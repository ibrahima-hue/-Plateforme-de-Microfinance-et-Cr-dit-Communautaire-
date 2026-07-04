import { api } from '../api/client'

const STORAGE_KEY = 'kassa_demandes'
const VERSION_KEY  = 'kassa_demandes_v'
const VERSION      = '4'

const INITIAL = [
  { id:1,  client:'Mamadou Diallo', montant:2500000, produit:'Crédit Équipement',  score:82, statut:'en_validation_n2', agent:'Aissatou Diallo', date:'2026-07-01', duree:24, objet:'Achat matériel' },
  { id:2,  client:'Aminata Ba',     montant:600000,  produit:'Fonds de Roulement', score:71, statut:'soumise',          agent:'Aissatou Diallo', date:'2026-07-02', duree:12, objet:'Fonds de roulement' },
  { id:3,  client:'Oumar Kane',     montant:3000000, produit:'Crédit Équipement',  score:79, statut:'en_validation_n3', agent:'Aissatou Diallo', date:'2026-06-28', duree:36, objet:'Équipement industriel' },
  { id:4,  client:'Marième Fall',   montant:1200000, produit:'Fonds de Roulement', score:88, statut:'approuvee',        agent:'Aissatou Diallo', date:'2026-06-25', duree:18, objet:'Commerce' },
  { id:5,  client:'Rokhaya Diop',   montant:500000,  produit:'Fonds de Roulement', score:72, statut:'soumise',          agent:'Aissatou Diallo', date:'2026-07-03', duree:12, objet:'Activité commerciale' },
  { id:6,  client:'Binta Cissé',    montant:4000000, produit:'Crédit Habitat',     score:91, statut:'en_validation_n2', agent:'Ibrahima Fall',   date:'2026-07-02', duree:48, objet:'Construction maison' },
  { id:7,  client:'Lamine Ndiaye',  montant:5000000, produit:'Crédit Immobilier',  score:84, statut:'en_validation_n3', agent:'Ibrahima Fall',   date:'2026-06-30', duree:60, objet:'Investissement immobilier' },
  { id:8,  client:'Fatou Sow',      montant:350000,  produit:'Crédit Agricole',    score:65, statut:'soumise',          agent:'Ibrahima Fall',   date:'2026-07-02', duree:12, objet:'Agriculture' },
  { id:9,  client:'Amadou Diop',    montant:2000000, produit:'Crédit Équipement',  score:75, statut:'soumise',          agent:'Ibrahima Fall',   date:'2026-06-30', duree:24, objet:'Équipement professionnel' },
  { id:10, client:'Modou Sarr',     montant:1020000, produit:'Fonds de Roulement', score:77, statut:'decaissee', agent:'Aissatou Diallo', date:'2025-07-03', duree:12, objet:'Commerce général',      date_decaissement:'2025-07-04', telephone:'+221 77 901 2345' },
  { id:11, client:'Fatou Sow',      montant:852000,  produit:'Crédit Agricole',    score:65, statut:'decaissee', agent:'Ibrahima Fall',   date:'2025-10-01', duree:12, objet:'Campagne agricole',     date_decaissement:'2025-10-05', telephone:'+221 77 234 5678' },
  { id:12, client:'Cheikh Mbaye',   montant:600000,  produit:'Fonds de Roulement', score:68, statut:'decaissee', agent:'Aissatou Diallo', date:'2026-02-10', duree:12, objet:'Stock marchandises',    date_decaissement:'2026-02-15', telephone:'+221 77 789 0123' },
  { id:13, client:'Ibrahima Ndiaye',montant:1140000, produit:'Crédit Équipement',  score:68, statut:'decaissee', agent:'Ibrahima Fall',   date:'2025-12-01', duree:12, objet:'Matériel agricole',     date_decaissement:'2025-12-05', telephone:'+221 77 345 6789' },
  { id:14, client:'Rokhaya Diop',   montant:480000,  produit:'Fonds de Roulement', score:72, statut:'decaissee', agent:'Aissatou Diallo', date:'2026-03-01', duree:12, objet:'Activité commerciale',  date_decaissement:'2026-03-03', telephone:'+221 77 890 1234' },
  { id:15, client:'Binta Cissé',    montant:4656000, produit:'Crédit Habitat',     score:91, statut:'decaissee', agent:'Ibrahima Fall',   date:'2026-01-15', duree:48, objet:'Construction maison',   date_decaissement:'2026-01-20', telephone:'+221 77 012 3456' },
  { id:16, client:'Oumar Kane',     montant:3216000, produit:'Crédit Équipement',  score:79, statut:'decaissee', agent:'Aissatou Diallo', date:'2026-04-01', duree:36, objet:'Équipement atelier',    date_decaissement:'2026-04-05', telephone:'+221 77 567 8901' },
]

// ─── API calls (avec fallback localStorage) ─────────────────

export async function fetchDemandes() {
  try {
    return await api.get('/demandes')
  } catch {
    return getDemandes()
  }
}

export async function createDemande(data) {
  try {
    return await api.post('/demandes', data)
  } catch {
    return addDemande({ ...data, id: Date.now() })
  }
}

export async function patchDemande(id, changes) {
  try {
    return await api.patch(`/demandes/${id}`, changes)
  } catch {
    return updateDemande(id, changes)
  }
}

// ─── Fallback localStorage ───────────────────────────────────

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
