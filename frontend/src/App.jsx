import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import RoleSidebar from './components/shared/RoleSidebar'

import Dashboard from './pages/Dashboard'
import DemandesCredit from './pages/DemandesCredit'
import Portefeuille from './pages/Portefeuille'
import Remboursements from './pages/Remboursements'
import Solvabilite from './pages/Solvabilite'
import Membres from './pages/Membres'
import Rapports from './pages/Rapports'
import Utilisateurs from './pages/Utilisateurs'
import SetPassword from './pages/SetPassword'

import DirecteurPortal from './portals/DirecteurPortal'
import AgentPortal from './portals/AgentPortal'
import CaissierPortal from './portals/CaissierPortal'
import ClientPortal from './portals/ClientPortal'
import ResponsableAgencePortal from './portals/ResponsableAgencePortal'

import './App.css'

// Fix: create admin page JSX lazily on each render so components remount on navigation
function getAdminPage(page) {
  switch (page) {
    case 'dashboard':      return <Dashboard />
    case 'credits':        return <DemandesCredit />
    case 'portefeuille':   return <Portefeuille />
    case 'remboursements': return <Remboursements />
    case 'solvabilite':    return <Solvabilite />
    case 'membres':        return <Membres />
    case 'utilisateurs':   return <Utilisateurs />
    case 'rapports':       return <Rapports />
    default:               return <Dashboard />
  }
}

function AppShell() {
  const { user } = useAuth()
  const [page, setPage] = useState('dashboard')

  if (!user) return <Login />
  if (user.mustChangePassword) return <SetPassword />

  const renderPortalContent = () => {
    switch (user.role) {
      case 'admin':
        return getAdminPage(page)
      case 'responsable_agence':
        return <ResponsableAgencePortal page={page} />
      case 'directeur':
        return <DirecteurPortal page={page} />
      case 'agent_credit':
        // Fix: pass onNavigate so AgentPortal can navigate back from full-page views
        return <AgentPortal page={page} onNavigate={setPage} />
      case 'caissier':
        return <CaissierPortal page={page} />
      case 'client':
        return <ClientPortal page={page} />
      default:
        return getAdminPage(page)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <RoleSidebar activePage={page} onNavigate={setPage} />
      <main style={{ flex: 1, overflow: 'auto', minWidth: 0 }}>
        {renderPortalContent()}
      </main>
    </div>
  )
}

// Fix: key AppShell on user id so page state resets when a different user logs in
function AppShellKeyed() {
  const { user } = useAuth()
  return <AppShell key={user?.id ?? 'guest'} />
}

export default function App() {
  return (
    <AuthProvider>
      <AppShellKeyed />
    </AuthProvider>
  )
}
