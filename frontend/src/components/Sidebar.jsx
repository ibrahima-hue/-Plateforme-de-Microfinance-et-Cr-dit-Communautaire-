import { LayoutDashboard, FileText, Briefcase, RefreshCw, BarChart2, Users, FileBarChart, TrendingUp, X, Menu } from 'lucide-react'
import { useState } from 'react'
import styles from './Sidebar.module.css'

const nav = [
  { section: 'PILOTAGE', items: [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'credits', label: 'Demandes de crédit', icon: FileText },
    { id: 'portefeuille', label: 'Portefeuille', icon: Briefcase },
    { id: 'remboursements', label: 'Remboursements', icon: RefreshCw },
    { id: 'solvabilite', label: 'Analyse solvabilité', icon: BarChart2 },
  ]},
  { section: 'RÉSEAU', items: [
    { id: 'membres', label: 'Membres & coopératives', icon: Users },
    { id: 'rapports', label: 'Rapports', icon: FileBarChart },
  ]},
]

export default function Sidebar({ activePage, onNavigate }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>K</div>
        {!collapsed && (
          <div>
            <div className={styles.logoName}>KASSA</div>
            <div className={styles.logoSub}>CRÉDIT COMMUNAUTAIRE</div>
          </div>
        )}
        <button className={styles.toggleBtn} onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <Menu size={16} /> : <X size={16} />}
        </button>
      </div>

      <nav className={styles.nav}>
        {nav.map(({ section, items }) => (
          <div key={section} className={styles.navSection}>
            {!collapsed && <div className={styles.sectionLabel}>{section}</div>}
            {items.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`${styles.navItem} ${activePage === id ? styles.active : ''}`}
                onClick={() => onNavigate(id)}
                title={collapsed ? label : ''}
              >
                <Icon size={16} />
                {!collapsed && <span>{label}</span>}
                {!collapsed && activePage === id && <div className={styles.activeIndicator} />}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className={styles.footer}>
        {!collapsed && (
          <div className={styles.userInfo}>
            <div className={styles.avatar}>A</div>
            <div>
              <div className={styles.userName}>Admin</div>
              <div className={styles.userRole}>Directeur</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
