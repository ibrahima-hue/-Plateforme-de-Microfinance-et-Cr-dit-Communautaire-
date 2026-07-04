import { api } from '../api/client'

const STORAGE_KEY = 'kassa_membres'
const VERSION_KEY  = 'kassa_membres_v'
const VERSION      = '1'

const INITIAL = [
  { id:1,  nom:'Diallo', prenom:'Mamadou', cin:'1199012345', telephone:'+221 77 123 4567', profession:'Commerçant',  revenu_mensuel:350000, cooperative:'Caisse Centrale Dakar', statut:'actif',    score:82, nb_credits:2, encours:1850000 },
  { id:2,  nom:'Sow',    prenom:'Fatou',   cin:'2198098765', telephone:'+221 77 234 5678', profession:'Artisane',    revenu_mensuel:180000, cooperative:'Caisse Centrale Dakar', statut:'actif',    score:74, nb_credits:1, encours:0       },
  { id:3,  nom:'Ndiaye', prenom:'Ibrahima',cin:'1195076543', telephone:'+221 77 345 6789', profession:'Agriculteur', revenu_mensuel:220000, cooperative:'Caisse Centrale Dakar', statut:'suspendu', score:68, nb_credits:1, encours:1500000 },
  { id:4,  nom:'Ba',     prenom:'Aminata', cin:'2200054321', telephone:'+221 77 456 7890', profession:'Couturière',  revenu_mensuel:150000, cooperative:'Coopérative Pikine',   statut:'actif',    score:71, nb_credits:1, encours:420000  },
  { id:5,  nom:'Kane',   prenom:'Oumar',   cin:'1197043210', telephone:'+221 77 567 8901', profession:'Mécanicien', revenu_mensuel:280000, cooperative:'Coopérative Pikine',   statut:'actif',    score:79, nb_credits:1, encours:2680000 },
  { id:6,  nom:'Fall',   prenom:'Marième', cin:'2201032109', telephone:'+221 77 678 9012', profession:'Enseignante', revenu_mensuel:320000, cooperative:'Mutuelle Thiès',       statut:'actif',    score:88, nb_credits:2, encours:780000  },
  { id:7,  nom:'Mbaye',  prenom:'Cheikh',  cin:'1196021098', telephone:'+221 77 789 0123', profession:'Pêcheur',    revenu_mensuel:200000, cooperative:'Mutuelle Thiès',       statut:'actif',    score:65, nb_credits:0, encours:0       },
  { id:8,  nom:'Diop',   prenom:'Rokhaya', cin:'2199010987', telephone:'+221 77 890 1234', profession:'Vendeuse',   revenu_mensuel:160000, cooperative:'Caisse Ziguinchor',    statut:'actif',    score:72, nb_credits:1, encours:400000  },
  { id:9,  nom:'Sarr',   prenom:'Modou',   cin:'1200009876', telephone:'+221 77 901 2345', profession:'Chauffeur',  revenu_mensuel:240000, cooperative:'Caisse Centrale Dakar', statut:'actif',    score:77, nb_credits:1, encours:1650000 },
  { id:10, nom:'Cissé',  prenom:'Binta',   cin:'2202098765', telephone:'+221 77 012 3456', profession:'Infirmière', revenu_mensuel:380000, cooperative:'Coopérative Pikine',   statut:'actif',    score:91, nb_credits:1, encours:3920000 },
]

// ─── API calls (avec fallback localStorage) ─────────────────

export async function fetchMembres() {
  try {
    return await api.get('/membres')
  } catch {
    return getMembres()
  }
}

export async function createMembre(data) {
  try {
    return await api.post('/membres', data)
  } catch {
    const m = { ...data, id: Date.now(), nb_credits: 0, encours: 0, statut: 'actif' }
    addMembre(m)
    return { membre: m, compte: null }
  }
}

export async function removeMembre(id) {
  try {
    await api.delete(`/membres/${id}`)
    deleteMembre(id)
  } catch {
    deleteMembre(id)
  }
}

// ─── Fallback localStorage ───────────────────────────────────

export function getMembres() {
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

export function addMembre(m) {
  const list = getMembres()
  const next = [m, ...list]
  save(next)
  return next
}

export function updateMembre(id, changes) {
  const list = getMembres()
  const next = list.map(m => m.id === id ? { ...m, ...changes } : m)
  save(next)
  return next
}

export function deleteMembre(id) {
  const list = getMembres()
  const next = list.filter(m => m.id !== id)
  save(next)
  return next
}
