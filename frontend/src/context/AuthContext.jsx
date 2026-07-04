import { createContext, useContext, useState } from 'react'
import { authenticate as authenticateLocal } from '../store/usersStore'

const AuthContext  = createContext(null)
const SESSION_KEY  = 'kassa_session'
const BASE         = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const ROLE_LABELS = {
  admin:              'Administrateur',
  directeur:          'Directeur',
  responsable_agence: 'Responsable Agence',
  agent_credit:       'Agent de Crédit',
  caissier:           'Caissier',
  client:             'Client',
}

function loadSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveSession(user) {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(user)) } catch {}
}

function clearSession() {
  try { sessionStorage.removeItem(SESSION_KEY) } catch {}
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadSession)

  const login = async (email, password) => {
    try {
      const res = await fetch(`${BASE}/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) return { success: false, error: data.error || 'Email ou mot de passe incorrect' }

      const sessionUser = { ...data.user, token: data.token, roleLabel: ROLE_LABELS[data.user.role] }
      setUser(sessionUser)
      saveSession(sessionUser)
      return { success: true }
    } catch {
      // Fallback localStorage si le backend est inaccessible
      const found = authenticateLocal(email, password)
      if (found) {
        const { password: _pw, ...safe } = found
        const sessionUser = { ...safe, roleLabel: ROLE_LABELS[found.role] }
        setUser(sessionUser)
        saveSession(sessionUser)
        return { success: true }
      }
      return { success: false, error: 'Email ou mot de passe incorrect' }
    }
  }

  const logout = () => {
    setUser(null)
    clearSession()
  }

  const changePassword = async (newPassword) => {
    if (!user) return
    try {
      await fetch(`${BASE}/auth/change-password`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body:    JSON.stringify({ newPassword }),
      })
    } catch { /* offline */ }
    const updated = { ...user, mustChangePassword: false }
    setUser(updated)
    saveSession(updated)
  }

  const can = (action, resource) => {
    if (!user) return false
    if (user.role === 'admin') return true
    const perms = PERMISSIONS[user.role] || []
    return perms.includes(`${resource}:${action}`) || perms.includes(`${resource}:*`)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, changePassword, can, ROLE_LABELS }}>
      {children}
    </AuthContext.Provider>
  )
}


const PERMISSIONS = {
  directeur:          ['dashboard:read','credits:read','credits:approve','clients:read','remboursements:read','rapports:read','alertes:read'],
  agent_credit:       ['demandes:create','demandes:read','clients:create','clients:read','scoring:read'],
  caissier:           ['remboursements:create','remboursements:read','echeancier:read','credits:read'],
  responsable_agence: ['demandes:approve','credits:read','clients:read','rapports:read'],
  client:             ['mes_credits:read','mes_remboursements:read','mon_profil:read'],
}

export const useAuth = () => useContext(AuthContext)
export { ROLE_LABELS }
