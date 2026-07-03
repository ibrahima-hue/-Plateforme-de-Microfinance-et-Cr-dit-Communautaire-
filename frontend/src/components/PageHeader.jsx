import { Search, Bell } from 'lucide-react'
import styles from './PageHeader.module.css'

export default function PageHeader({ title, subtitle, badge, actions }) {
  const now = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className={styles.header}>
      <div className={styles.left}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{title}</h1>
          {badge && <span className={`badge badge-green`}>{badge}</span>}
        </div>
        <div className={styles.subtitle}>
          Caisse centrale · {now}
        </div>
        {subtitle && <div className={styles.desc}>{subtitle}</div>}
      </div>
      <div className={styles.right}>
        <div className={styles.searchBox}>
          <Search size={14} color="var(--text-muted)" />
          <input className={styles.searchInput} placeholder="Rechercher..." />
        </div>
        <button className={styles.iconBtn}>
          <Bell size={16} />
          <span className={styles.notifDot} />
        </button>
        <div className={styles.avatarBtn}>A</div>
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  )
}
