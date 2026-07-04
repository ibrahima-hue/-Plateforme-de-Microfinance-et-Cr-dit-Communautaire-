import { useState } from 'react'
import { Plus, Search, Trash2, Edit2, Shield, Eye, EyeOff } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import styles from './Page.module.css'
import { getUsers, addUser, updateUser, deleteUser, emailExists } from '../store/usersStore'

const ROLES = [
  { value: 'admin',              label: 'Administrateur' },
  { value: 'directeur',          label: 'Directeur' },
  { value: 'responsable_agence', label: 'Responsable Agence' },
  { value: 'agent_credit',       label: 'Agent de Crédit' },
  { value: 'caissier',           label: 'Caissier' },
  { value: 'client',             label: 'Client' },
]

const ROLE_COLORS = {
  admin:              '#8B7CF6',
  directeur:          '#34E5A0',
  responsable_agence: '#EC4899',
  agent_credit:       '#3B82F6',
  caissier:           '#F59E0B',
  client:             '#10B981',
}

const ROLE_LABELS = {
  admin:              'Administrateur',
  directeur:          'Directeur',
  responsable_agence: 'Resp. Agence',
  agent_credit:       'Agent Crédit',
  caissier:           'Caissier',
  client:             'Client',
}

export default function Utilisateurs() {
  const [users, setUsers] = useState(() => getUsers())
  const [search, setSearch] = useState('')
  const [filtreRole, setFiltreRole] = useState('tous')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filtered = users.filter(u => {
    const matchSearch = !search || `${u.prenom} ${u.nom} ${u.email}`.toLowerCase().includes(search.toLowerCase())
    const matchRole = filtreRole === 'tous' || u.role === filtreRole
    return matchSearch && matchRole
  })

  const handleSave = (data) => {
    if (editing) {
      setUsers(updateUser(editing.id, data))
    } else {
      const newUser = { ...data, id: Date.now().toString(), actif: true }
      setUsers(addUser(newUser))
    }
    setShowForm(false)
    setEditing(null)
  }

  const handleDelete = () => {
    setUsers(deleteUser(deleteTarget.id))
    setDeleteTarget(null)
  }

  const stats = {
    total: users.length,
    actifs: users.filter(u => u.actif !== false).length,
    parRole: ROLES.map(r => ({ ...r, count: users.filter(u => u.role === r.value).length })),
  }

  return (
    <div className={styles.page}>
      <PageHeader
        title="Gestion des utilisateurs"
        subtitle="Comptes d'accès à la plateforme KASSA"
        actions={
          <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true) }}>
            <Plus size={14} /> Nouvel utilisateur
          </button>
        }
      />
      <div className={styles.content}>
        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--purple-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={20} color="var(--purple)" />
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Total comptes</div>
              <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'Space Grotesk', color: 'var(--purple)' }}>{stats.total}</div>
            </div>
          </div>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--green-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={20} color="var(--green)" />
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Comptes actifs</div>
              <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'Space Grotesk', color: 'var(--green)' }}>{stats.actifs}</div>
            </div>
          </div>
          <div className="card">
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>Répartition par rôle</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {stats.parRole.filter(r => r.count > 0).map(r => (
                <span key={r.value} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: ROLE_COLORS[r.value] + '22', color: ROLE_COLORS[r.value], fontWeight: 600 }}>
                  {r.label}: {r.count}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card">
          <div className={styles.toolbar} style={{ marginBottom: 14 }}>
            <div className={styles.searchBox} style={{ flex: 1 }}>
              <Search size={13} color="var(--text-muted)" />
              <input className={styles.searchInput} placeholder="Rechercher par nom, email..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="input" style={{ width: 200 }} value={filtreRole} onChange={e => setFiltreRole(e.target.value)}>
              <option value="tous">Tous les rôles</option>
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Agence / Institution</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.prenom} {u.nom}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td>
                      <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: ROLE_COLORS[u.role] + '22', color: ROLE_COLORS[u.role], fontWeight: 600 }}>
                        {ROLE_LABELS[u.role]}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{u.institution || u.agence || '—'}</td>
                    <td>
                      <span className={`badge ${u.actif !== false ? 'badge-green' : 'badge-red'}`}>
                        {u.actif !== false ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-sm btn-ghost" title="Modifier" onClick={() => { setEditing(u); setShowForm(true) }}>
                          <Edit2 size={13} />
                        </button>
                        <button className="btn btn-sm btn-ghost" title="Supprimer" style={{ color: 'var(--red)' }} onClick={() => setDeleteTarget(u)}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showForm && (
        <UserFormModal
          user={editing}
          onClose={() => { setShowForm(false); setEditing(null) }}
          onSave={handleSave}
        />
      )}

      {deleteTarget && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h3 style={{ fontFamily: 'Space Grotesk', fontSize: 16 }}>Confirmer la suppression</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setDeleteTarget(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                Supprimer le compte de <strong style={{ color: 'var(--text-primary)' }}>{deleteTarget.prenom} {deleteTarget.nom}</strong> ({deleteTarget.email}) ?
                Cette action est irréversible.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)}>Annuler</button>
              <button className="btn btn-danger" onClick={handleDelete}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function UserFormModal({ user, onClose, onSave }) {
  const isEdit = !!user
  const [form, setForm] = useState({
    prenom: user?.prenom || '',
    nom: user?.nom || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'agent_credit',
    agence: user?.agence || '',
    institution: user?.institution || '',
    actif: user?.actif !== false,
  })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = e => {
    e.preventDefault()
    setError('')

    if (!isEdit && !form.password) {
      setError('Le mot de passe est obligatoire pour un nouveau compte.')
      return
    }
    if (emailExists(form.email, user?.id)) {
      setError('Cet email est déjà utilisé par un autre compte.')
      return
    }

    const data = { ...form }
    if (isEdit && !form.password) delete data.password
    onSave(data)
  }

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <h3 style={{ fontFamily: 'Space Grotesk', fontSize: 16 }}>
            {isEdit ? 'Modifier le compte' : 'Nouvel utilisateur'}
          </h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group">
                <label>Prénom</label>
                <input className="input" value={form.prenom} onChange={e => set('prenom', e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Nom</label>
                <input className="input" value={form.nom} onChange={e => set('nom', e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label>Adresse email (identifiant de connexion)</label>
              <input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} required placeholder="prenom.nom@institution.sn" />
            </div>

            <div className="form-group">
              <label>{isEdit ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe'}</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  required={!isEdit}
                  placeholder="••••••••"
                  style={{ paddingRight: 40 }}
                />
                <button type="button" onClick={() => setShowPw(p => !p)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Rôle</label>
              <select className="input" value={form.role} onChange={e => set('role', e.target.value)}>
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Institution / Coopérative</label>
                <input className="input" value={form.institution} onChange={e => set('institution', e.target.value)} placeholder="Caisse Centrale Dakar" />
              </div>
              <div className="form-group">
                <label>Agence</label>
                <input className="input" value={form.agence || ''} onChange={e => set('agence', e.target.value)} placeholder="Agence Principale" />
              </div>
            </div>

            {isEdit && (
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" id="actif" checked={form.actif} onChange={e => set('actif', e.target.checked)} style={{ width: 16, height: 16 }} />
                <label htmlFor="actif" style={{ marginBottom: 0, cursor: 'pointer' }}>Compte actif</label>
              </div>
            )}

            {error && <div className={styles?.error || ''} style={{ color: 'var(--red)', fontSize: 13, marginTop: 8 }}>{error}</div>}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-primary">{isEdit ? 'Enregistrer' : 'Créer le compte'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
