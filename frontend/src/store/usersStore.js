const STORAGE_KEY = 'kassa_users'
const VERSION_KEY = 'kassa_users_v'
const VERSION = '1'

const INITIAL_USERS = [
  { id: '1', nom: 'Diagne',  prenom: 'Aliou',    email: 'admin@kassa.sn',       password: 'password123', role: 'admin',              agence: 'Agence Principale Dakar', institution: 'Caisse Centrale Dakar', actif: true },
  { id: '2', nom: 'Niang',   prenom: 'Moussa',   email: 'directeur@kassa.sn',   password: 'password123', role: 'directeur',          agence: 'Agence Principale Dakar', institution: 'Caisse Centrale Dakar', actif: true },
  { id: '3', nom: 'Diallo',  prenom: 'Aissatou', email: 'agent@kassa.sn',       password: 'password123', role: 'agent_credit',       agence: 'Agence Principale Dakar', institution: 'Caisse Centrale Dakar', actif: true },
  { id: '4', nom: 'Seck',    prenom: 'Omar',     email: 'caissier@kassa.sn',    password: 'password123', role: 'caissier',           agence: 'Agence Principale Dakar', institution: 'Caisse Centrale Dakar', actif: true },
  { id: '5', nom: 'Fall',    prenom: 'Ibrahima', email: 'resp.agence@kassa.sn', password: 'password123', role: 'responsable_agence', agence: 'Agence Pikine',           institution: 'Coopérative Pikine',   actif: true },
  { id: '6', nom: 'Diallo',  prenom: 'Mamadou',  email: 'client@kassa.sn',      password: 'password123', role: 'client',             agence: null,                      institution: 'Caisse Centrale Dakar', actif: true },
]

function save(list) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)) } catch {}
}

export function getUsers() {
  try {
    if (localStorage.getItem(VERSION_KEY) !== VERSION) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_USERS))
      localStorage.setItem(VERSION_KEY, VERSION)
      return INITIAL_USERS
    }
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : INITIAL_USERS
  } catch {
    return INITIAL_USERS
  }
}

export function authenticate(email, password) {
  const users = getUsers()
  return users.find(u => u.email === email && u.password === password && u.actif !== false) || null
}

export function addUser(user) {
  const list = getUsers()
  const next = [...list, user]
  save(next)
  return next
}

export function updateUser(id, changes) {
  const list = getUsers()
  const next = list.map(u => u.id === id ? { ...u, ...changes } : u)
  save(next)
  return next
}

export function deleteUser(id) {
  const list = getUsers()
  const next = list.filter(u => u.id !== id)
  save(next)
  return next
}

export function emailExists(email, excludeId = null) {
  const users = getUsers()
  return users.some(u => u.email === email && u.id !== excludeId)
}

function slugify(str) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '')
}

export function generateEmail(prenom, nom) {
  const base = `${slugify(prenom)}.${slugify(nom)}@kassa.sn`
  if (!emailExists(base)) return base
  let i = 2
  while (emailExists(`${slugify(prenom)}.${slugify(nom)}${i}@kassa.sn`)) i++
  return `${slugify(prenom)}.${slugify(nom)}${i}@kassa.sn`
}

export function generateTempPassword(prenom) {
  const base = slugify(prenom).replace(/\./g, '').slice(0, 4).padEnd(4, 'x')
  return `${base}2026`
}

export function createClientAccount(membre) {
  const email = generateEmail(membre.prenom, membre.nom)
  const tempPassword = generateTempPassword(membre.prenom)
  const user = {
    id: Date.now().toString(),
    nom: membre.nom,
    prenom: membre.prenom,
    email,
    password: tempPassword,
    role: 'client',
    agence: null,
    institution: membre.cooperative || '',
    actif: true,
    mustChangePassword: true,
  }
  addUser(user)
  return { email, tempPassword }
}
