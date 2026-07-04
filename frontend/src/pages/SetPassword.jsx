import { useState } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function SetPassword() {
  const { user, changePassword } = useAuth()
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères.'); return }
    if (password !== confirm) { setError('Les deux mots de passe ne correspondent pas.'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))
    changePassword(password)
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 32 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#06070D', fontFamily: 'Space Grotesk' }}>K</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'Space Grotesk', color: 'var(--text-primary)', letterSpacing: 2 }}>KASSA</div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: 3 }}>CRÉDIT COMMUNAUTAIRE</div>
          </div>
        </div>

        <div className="card" style={{ padding: 32 }}>
          {/* Icône */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
            <div style={{ width: 60, height: 60, borderRadius: 16, background: 'var(--green-dim, #34E5A018)', border: '1px solid var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <Lock size={28} color="var(--green)" />
            </div>
            <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Bienvenue, {user?.prenom} !
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8, textAlign: 'center', lineHeight: 1.5 }}>
              Vous vous connectez pour la première fois.<br />
              Choisissez un mot de passe personnel pour sécuriser votre compte.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Nouveau mot de passe</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Minimum 6 caractères"
                  required
                  autoFocus
                  style={{ paddingRight: 42 }}
                />
                <button type="button" onClick={() => setShowPw(p => !p)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 0 }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {password.length > 0 && (
                <div style={{ marginTop: 6, display: 'flex', gap: 4 }}>
                  {[...Array(4)].map((_, i) => (
                    <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: password.length >= [6,8,10,12][i] ? ['var(--red)','var(--amber)','var(--green)','var(--green)'][i] : 'var(--border)' }} />
                  ))}
                </div>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Confirmer le mot de passe</label>
              <input
                className="input"
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Retapez votre mot de passe"
                required
              />
              {confirm.length > 0 && password !== confirm && (
                <div style={{ fontSize: 12, color: 'var(--red)', marginTop: 4 }}>Les mots de passe ne correspondent pas</div>
              )}
            </div>

            {error && <div style={{ fontSize: 13, color: 'var(--red)', background: 'var(--red-dim, #EF444418)', padding: '10px 12px', borderRadius: 8 }}>{error}</div>}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }} disabled={loading}>
              {loading ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Définir mon mot de passe'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
