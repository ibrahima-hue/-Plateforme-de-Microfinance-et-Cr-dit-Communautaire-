import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

// Comptes de démonstration par rôle
const DEMO_USERS = [
  { id: '1', nom: 'Diagne', prenom: 'Aliou',    email: 'admin@kassa.sn',         role: 'admin',              agence: 'Agence Principale Dakar', institution: 'Caisse Centrale Dakar' },
  { id: '2', nom: 'Niang',  prenom: 'Moussa',   email: 'directeur@kassa.sn',     role: 'directeur',          agence: 'Agence Principale Dakar', institution: 'Caisse Centrale Dakar' },
  { id: '3', nom: 'Diallo', prenom: 'Aissatou', email: 'agent@kassa.sn',         role: 'agent_credit',       agence: 'Agence Principale Dakar', institution: 'Caisse Centrale Dakar' },
  { id: '4', nom: 'Seck',   prenom: 'Omar',     email: 'caissier@kassa.sn',      role: 'caissier',           agence: 'Agence Principale Dakar', institution: 'Caisse Centrale Dakar' },
  { id: '5', nom: 'Fall',   prenom: 'Ibrahima', email: 'resp.agence@kassa.sn',   role: 'responsable_agence', agence: 'Agence Pikine',           institution: 'Coopérative Pikine'    },
  { id: '6', nom: 'Diallo', prenom: 'Mamadou',  email: 'client@kassa.sn',        role: 'client',             agence: null,                      institution: 'Caisse Centrale Dakar' },
]

const ROLE_LABELS = {
  admin:              'Administrateur',
  directeur:          'Directeur',
  responsable_agence: 'Responsable Agence',
  agent_credit:       'Agent de Crédit',
  caissier:           'Caissier',
  client:             'Client',
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  const login = (email, password) => {
    const found = DEMO_USERS.find(u => u.email === email)
    if (found && password === 'password123') {
      setUser({ ...found, roleLabel: ROLE_LABELS[found.role] })
      return { success: true }
    }
    return { success: false, error: 'Email ou mot de passe incorrect' }
  }

  const logout = () => setUser(null)

  const can = (action, resource) => {
    if (!user) return false
    if (user.role === 'admin') return true
    const perms = PERMISSIONS[user.role] || []
    return perms.includes(`${resource}:${action}`) || perms.includes(`${resource}:*`)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, can, ROLE_LABELS }}>
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
