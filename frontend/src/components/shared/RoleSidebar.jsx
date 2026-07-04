import { useState } from 'react'
import {
  LayoutDashboard, FileText, Briefcase, RefreshCw, BarChart2,
  Users, FileBarChart, AlertTriangle, CheckSquare, User,
  CreditCard, Bell, Menu, X, LogOut, ChevronRight,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import styles from './RoleSidebar.module.css'

const NAV_BY_ROLE = {
  admin: [
    { section: 'PILOTAGE', items: [
      { id: 'dashboard',       label: 'Tableau de bord',        icon: LayoutDashboard },
      { id: 'credits',         label: 'Demandes de crédit',     icon: FileText },
      { id: 'portefeuille',    label: 'Portefeuille',           icon: Briefcase },
      { id: 'remboursements',  label: 'Remboursements',         icon: RefreshCw },
      { id: 'solvabilite',     label: 'Analyse solvabilité',    icon: BarChart2 },
    ]},
    { section: 'RÉSEAU', items: [
      { id: 'membres',         label: 'Membres & coopératives', icon: Users },
      { id: 'utilisateurs',    label: 'Utilisateurs',           icon: User },
      { id: 'rapports',        label: 'Rapports',               icon: FileBarChart },
    ]},
  ],
  directeur: [
    { section: 'PILOTAGE', items: [
      { id: 'dashboard',       label: 'Centre de pilotage',     icon: LayoutDashboard },
      { id: 'validation',      label: 'Validation crédits',     icon: CheckSquare },
      { id: 'portefeuille',    label: 'Portefeuille',           icon: Briefcase },
      { id: 'alertes',         label: 'Alertes risques',        icon: AlertTriangle },
      { id: 'rapports',        label: 'Rapports',               icon: FileBarChart },
    ]},
  ],
  responsable_agence: [
    { section: 'AGENCE', items: [
      { id: 'dashboard',       label: 'Tableau de bord',        icon: LayoutDashboard },
      { id: 'validation',      label: 'Validation N1',          icon: CheckSquare },
      { id: 'decaissement',    label: 'Décaissement',           icon: CreditCard },
      { id: 'credits',         label: 'Dossiers crédit',        icon: FileText },
      { id: 'membres',         label: 'Clients agence',         icon: Users },
    ]},
  ],
  agent_credit: [
    { section: 'MON TRAVAIL', items: [
      { id: 'dashboard',       label: 'Mes demandes',           icon: LayoutDashboard },
      { id: 'nouvelle_demande',label: 'Nouvelle demande',       icon: FileText },
      { id: 'clients',         label: 'Mes clients',            icon: Users },
      { id: 'solvabilite',     label: 'Analyse solvabilité',    icon: BarChart2 },
    ]},
  ],
  caissier: [
    { section: 'CAISSE', items: [
      { id: 'dashboard',       label: 'Tableau de caisse',      icon: LayoutDashboard },
      { id: 'remboursements',  label: 'Encaisser paiement',     icon: RefreshCw },
      { id: 'echeancier',      label: 'Échéanciers',            icon: CreditCard },
      { id: 'alertes',         label: 'Impayés du jour',        icon: AlertTriangle },
    ]},
  ],
  client: [
    { section: 'MON ESPACE', items: [
      { id: 'dashboard',       label: 'Mon tableau de bord',    icon: LayoutDashboard },
      { id: 'mes_credits',     label: 'Mes crédits',            icon: CreditCard },
      { id: 'mes_paiements',   label: 'Mes paiements',          icon: RefreshCw },
      { id: 'mon_profil',      label: 'Mon profil',             icon: User },
    ]},
  ],
}

const ROLE_COLORS = {
  admin:              '#8B7CF6',
  directeur:          '#34E5A0',
  responsable_agence: '#EC4899',
  agent_credit:       '#3B82F6',
  caissier:           '#F59E0B',
  client:             '#10B981',
}

export default function RoleSidebar({ activePage, onNavigate }) {
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  if (!user) return null

  const nav     = NAV_BY_ROLE[user.role] || NAV_BY_ROLE.admin
  const color   = ROLE_COLORS[user.role] || '#34E5A0'
  const initials = `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}`.toUpperCase()

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoIcon}>K</div>
        {!collapsed && (
          <div>
            <div className={styles.logoName}>KASSA</div>
            <div className={styles.logoSub}>CRÉDIT COMMUNAUTAIRE</div>
          </div>
        )}
        <button className={styles.toggleBtn} onClick={() => setCollapsed(c => !c)}>
          {collapsed ? <Menu size={15} /> : <X size={15} />}
        </button>
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div className={styles.roleBadge} style={{ '--role-color': color }}>
          <span className={styles.roleDot} style={{ background: color }} />
          {user.roleLabel}
        </div>
      )}

      {/* Navigation */}
      <nav className={styles.nav}>
        {nav.map(({ section, items }) => (
          <div key={section} className={styles.section}>
            {!collapsed && <div className={styles.sectionLabel}>{section}</div>}
            {items.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`${styles.navItem} ${activePage === id ? styles.active : ''}`}
                style={activePage === id ? { '--active-color': color } : {}}
                onClick={() => onNavigate(id)}
                title={collapsed ? label : ''}
              >
                <Icon size={15} />
                {!collapsed && <span>{label}</span>}
                {!collapsed && activePage === id && (
                  <div className={styles.activeLine} style={{ background: color }} />
                )}
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer user */}
      <div className={styles.footer}>
        {!collapsed ? (
          <div className={styles.userRow}>
            <div className={styles.avatar} style={{ background: color + '22', color, borderColor: color }}>
              {initials}
            </div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>{user.prenom} {user.nom}</div>
              <div className={styles.userRole}>{user.agence || 'Client'}</div>
            </div>
            <button className={styles.logoutBtn} onClick={logout} title="Déconnexion">
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <button className={styles.logoutBtnCollapsed} onClick={logout} title="Déconnexion">
            <LogOut size={15} />
          </button>
        )}
      </div>
    </aside>
  )
}
