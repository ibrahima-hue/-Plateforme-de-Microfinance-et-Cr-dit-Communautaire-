import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import styles from './Login.module.css'

const DEMO_ACCOUNTS = [
  { role: 'Admin',              email: 'admin@kassa.sn',       color: '#8B7CF6' },
  { role: 'Directeur',         email: 'directeur@kassa.sn',   color: '#34E5A0' },
  { role: 'Agent de Crédit',   email: 'agent@kassa.sn',       color: '#3B82F6' },
  { role: 'Caissier',          email: 'caissier@kassa.sn',    color: '#F59E0B' },
  { role: 'Resp. Agence',      email: 'resp.agence@kassa.sn', color: '#EC4899' },
  { role: 'Client',            email: 'client@kassa.sn',      color: '#10B981' },
]

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))
    const result = login(email, password)
    if (!result.success) setError(result.error)
    setLoading(false)
  }

  const fillDemo = demoEmail => {
    setEmail(demoEmail)
    setPassword('password123')
    setError('')
  }

  return (
    <div className={styles.page}>
      {/* Background blobs */}
      <div className={styles.blob1} />
      <div className={styles.blob2} />

      <div className={styles.container}>
        {/* Logo */}
        <div className={styles.logoSection}>
          <div className={styles.logoIcon}>K</div>
          <div>
            <div className={styles.logoName}>KASSA</div>
            <div className={styles.logoSub}>CRÉDIT COMMUNAUTAIRE</div>
          </div>
        </div>

        <div className={styles.card}>
          <h1 className={styles.title}>Connexion</h1>
          <p className={styles.subtitle}>Accédez à votre espace selon votre rôle</p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label>Adresse email</label>
              <input
                type="email"
                className="input"
                placeholder="vous@kassa.sn"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label>Mot de passe</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
              {loading ? <span className="spinner" style={{width:16,height:16,borderWidth:2}} /> : 'Se connecter'}
            </button>
          </form>

          <div className={styles.divider}><span>Comptes de démonstration</span></div>

          <div className={styles.demoGrid}>
            {DEMO_ACCOUNTS.map(acc => (
              <button
                key={acc.email}
                className={styles.demoBtn}
                style={{'--role-color': acc.color}}
                onClick={() => fillDemo(acc.email)}
                title={acc.email}
              >
                <span className={styles.demoAvatar} style={{background: acc.color + '22', color: acc.color}}>
                  {acc.role[0]}
                </span>
                <span className={styles.demoRole}>{acc.role}</span>
              </button>
            ))}
          </div>

          <p className={styles.hint}>Mot de passe demo : <code>password123</code></p>
        </div>
      </div>
    </div>
  )
}
