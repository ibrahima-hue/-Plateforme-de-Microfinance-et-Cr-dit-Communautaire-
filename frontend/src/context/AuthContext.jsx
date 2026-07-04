import { createContext, useContext, useState } from 'react'
import { authenticate, updateUser } from '../store/usersStore'

const AuthContext = createContext(null)

const ROLE_LABELS = {
  admin:              'Administrateur',
  directeur:          'Directeur',
  responsable_agence: 'Responsable Agence',
  agent_credit:       'Agent de Crédit',
  caissier:           'Caissier',
  client:             'Client',
}

const SESSION_KEY = 'kassa_session'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY)
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  })

  const login = (email, password) => {
    const found = authenticate(email, password)
    if (found) {
      const { password: _pw, ...safeUser } = found
      const sessionUser = { ...safeUser, roleLabel: ROLE_LABELS[found.role] }
      setUser(sessionUser)
      try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser)) } catch {}
      return { success: true }
    }
    return { success: false, error: 'Email ou mot de passe incorrect' }
  }

  const logout = () => {
    setUser(null)
    try { sessionStorage.removeItem(SESSION_KEY) } catch {}
  }

  const changePassword = (newPassword) => {
    if (!user) return
    updateUser(user.id, { password: newPassword, mustChangePassword: false })
    setUser(u => ({ ...u, mustChangePassword: false }))
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
