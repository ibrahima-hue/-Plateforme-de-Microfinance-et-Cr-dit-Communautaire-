import { useState } from 'react'
import { Plus, Users, Building2, Search, User, Copy, Trash2 } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import styles from './Page.module.css'
import { getMembres, addMembre, deleteMembre } from '../store/membresStore'
import { createClientAccount, deleteUser, getUsers } from '../store/usersStore'

const fmtMoney = n => new Intl.NumberFormat('fr-FR').format(n) + ' FCFA'

const COOPS = ['Toutes', 'Caisse Centrale Dakar', 'Coopérative Pikine', 'Mutuelle Thiès', 'Caisse Ziguinchor']

const STATUT_BADGE = { actif: 'badge-green', inactif: 'badge-gray', suspendu: 'badge-red' }
const STATUT_LABEL = { actif: 'Actif', inactif: 'Inactif', suspendu: 'Suspendu' }

export default function Membres() {
  const [membres, setMembres] = useState(() => getMembres())
  const [search, setSearch] = useState('')
  const [filtreComp, setFiltreComp] = useState('Toutes')
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState(null)
  const [newAccount, setNewAccount] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const handleDelete = (m) => {
    setMembres(deleteMembre(m.id))
    const users = getUsers()
    const linked = users.find(u => u.nom === m.nom && u.prenom === m.prenom && u.role === 'client')
    if (linked) deleteUser(linked.id)
    setDeleteTarget(null)
  }

  const filtered = membres.filter(m => {
    const matchSearch = !search || `${m.nom} ${m.prenom} ${m.cin}`.toLowerCase().includes(search.toLowerCase())
    const matchComp = filtreComp === 'Toutes' || m.cooperative === filtreComp
    return matchSearch && matchComp
  })

  const stats = {
    total: membres.length,
    actifs: membres.filter(m => m.statut === 'actif').length,
    avecCredit: membres.filter(m => m.nb_credits > 0).length,
  }

  return (
    <div className={styles.page}>
      <PageHeader
        title="Membres & Coopératives"
        subtitle="Gestion des membres et coopératives affiliées"
        actions={
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={14} /> Nouveau membre
          </button>
        }
      />
      <div className={styles.content}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
          {[
            { label:'Total membres', val: stats.total, color:'var(--purple)', icon: Users },
            { label:'Membres actifs', val: stats.actifs, color:'var(--green)', icon: User },
            { label:'Avec crédit actif', val: stats.avecCredit, color:'var(--blue)', icon: Building2 },
          ].map(({ label, val, color, icon: Icon }) => (
            <div key={label} className="card" style={{display:'flex',alignItems:'center',gap:14}}>
              <div style={{width:42,height:42,borderRadius:10,background:`${color}18`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <Icon size={20} color={color} />
              </div>
              <div>
                <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:4}}>{label}</div>
                <div style={{fontSize:22,fontWeight:700,fontFamily:'Space Grotesk',color}}>{val}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className={styles.toolbar} style={{marginBottom:14}}>
            <div className={styles.searchBox} style={{flex:1}}>
              <Search size={13} color="var(--text-muted)" />
              <input className={styles.searchInput} placeholder="Rechercher par nom, CIN..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="input" style={{width:200}} value={filtreComp} onChange={e => setFiltreComp(e.target.value)}>
              {COOPS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="table-container">
            <table>
              <thead><tr>
                <th>Membre</th><th>CIN</th><th>Téléphone</th><th>Profession</th>
                <th>Revenu</th><th>Coopérative</th><th>Score</th><th>Encours</th><th>Statut</th><th></th>
              </tr></thead>
              <tbody>
                {filtered.map(m => (
                  <tr key={m.id}>
                    <td style={{color:'var(--text-primary)',fontWeight:500,cursor:'pointer'}} onClick={() => setSelected(m)}>{m.prenom} {m.nom}</td>
                    <td style={{fontFamily:'monospace',fontSize:12}}>{m.cin}</td>
                    <td>{m.telephone}</td>
                    <td>{m.profession}</td>
                    <td>{fmtMoney(m.revenu_mensuel)}</td>
                    <td>{m.cooperative}</td>
                    <td style={{color: m.score>=70?'var(--green)':m.score>=50?'var(--amber)':'var(--red)',fontWeight:600}}>{m.score}</td>
                    <td style={{color:'var(--text-primary)',fontWeight: m.encours>0 ? 500 : 400}}>{m.encours > 0 ? fmtMoney(m.encours) : '—'}</td>
                    <td><span className={`badge ${STATUT_BADGE[m.statut]}`}>{STATUT_LABEL[m.statut]}</span></td>
                    <td>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{color:'var(--red)'}}
                        title="Supprimer ce membre"
                        onClick={e => { e.stopPropagation(); setDeleteTarget(m) }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showForm && <NouveauMembreModal onClose={() => setShowForm(false)} onAdd={m => {
        setMembres(addMembre(m))
        const account = createClientAccount(m)
        setNewAccount({ nom: `${m.prenom} ${m.nom}`, ...account })
        setShowForm(false)
      }} />}
      {selected && <MembreDetailModal membre={selected} onClose={() => setSelected(null)} />}
      {newAccount && <AccountCreatedModal account={newAccount} onClose={() => setNewAccount(null)} />}
      {deleteTarget && (
        <div className="modal-overlay">
          <div className="modal" style={{maxWidth:420}}>
            <div className="modal-header">
              <h3 style={{fontFamily:'Space Grotesk',fontSize:16}}>Confirmer la suppression</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setDeleteTarget(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{color:'var(--text-secondary)',fontSize:14,lineHeight:1.6}}>
                Supprimer le membre <strong style={{color:'var(--text-primary)'}}>{deleteTarget.prenom} {deleteTarget.nom}</strong> ?
                <br />
                <span style={{fontSize:12,color:'var(--red)'}}>
                  Son compte de connexion sera également supprimé. Cette action est irréversible.
                </span>
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)}>Annuler</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteTarget)}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function NouveauMembreModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ prenom:'', nom:'', cin:'', telephone:'', email:'', adresse:'', profession:'', revenu_mensuel:'', cooperative:'Caisse Centrale Dakar', date_naissance:'' })
  const set = (k,v) => setForm(p => ({...p,[k]:v}))

  const handleSubmit = e => {
    e.preventDefault()
    onAdd({ ...form, id: Date.now(), statut:'actif', score:0, nb_credits:0, encours:0, revenu_mensuel: parseFloat(form.revenu_mensuel) })
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 style={{fontFamily:'Space Grotesk',fontSize:16}}>Nouveau membre</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group"><label>Prénom</label><input className="input" value={form.prenom} onChange={e=>set('prenom',e.target.value)} required /></div>
              <div className="form-group"><label>Nom</label><input className="input" value={form.nom} onChange={e=>set('nom',e.target.value)} required /></div>
            </div>
            <div className="form-grid">
              <div className="form-group"><label>CIN / N° Pièce</label><input className="input" value={form.cin} onChange={e=>set('cin',e.target.value)} /></div>
              <div className="form-group"><label>Date de naissance</label><input className="input" type="date" value={form.date_naissance} onChange={e=>set('date_naissance',e.target.value)} /></div>
            </div>
            <div className="form-grid">
              <div className="form-group"><label>Téléphone</label><input className="input" value={form.telephone} onChange={e=>set('telephone',e.target.value)} required /></div>
              <div className="form-group"><label>Email</label><input className="input" type="email" value={form.email} onChange={e=>set('email',e.target.value)} /></div>
            </div>
            <div className="form-group"><label>Adresse</label><input className="input" value={form.adresse} onChange={e=>set('adresse',e.target.value)} /></div>
            <div className="form-grid">
              <div className="form-group"><label>Profession</label><input className="input" value={form.profession} onChange={e=>set('profession',e.target.value)} /></div>
              <div className="form-group"><label>Revenu mensuel (FCFA)</label><input className="input" type="number" value={form.revenu_mensuel} onChange={e=>set('revenu_mensuel',e.target.value)} /></div>
            </div>
            <div className="form-group">
              <label>Coopérative</label>
              <select className="input" value={form.cooperative} onChange={e=>set('cooperative',e.target.value)}>
                <option>Caisse Centrale Dakar</option><option>Coopérative Pikine</option>
                <option>Mutuelle Thiès</option><option>Caisse Ziguinchor</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-primary">Créer le membre</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function MembreDetailModal({ membre: m, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 style={{fontFamily:'Space Grotesk',fontSize:16}}>{m.prenom} {m.nom}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:20,padding:'14px',background:'var(--bg-card2)',borderRadius:'var(--radius-sm)'}}>
            <div style={{width:52,height:52,borderRadius:50,background:'var(--purple-dim)',border:'2px solid var(--purple)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,fontWeight:700,color:'var(--purple)'}}>
              {m.prenom[0]}
            </div>
            <div>
              <div style={{fontSize:16,fontWeight:600,color:'var(--text-primary)'}}>{m.prenom} {m.nom}</div>
              <div style={{fontSize:12,color:'var(--text-muted)'}}>{m.cooperative}</div>
              <span className={`badge ${STATUT_BADGE[m.statut]}`} style={{marginTop:4,display:'inline-flex'}}>{STATUT_LABEL[m.statut]}</span>
            </div>
            <div style={{marginLeft:'auto',textAlign:'right'}}>
              <div style={{fontSize:11,color:'var(--text-muted)'}}>Score solvabilité</div>
              <div style={{fontSize:28,fontWeight:700,fontFamily:'Space Grotesk',color: m.score>=70?'var(--green)':m.score>=50?'var(--amber)':'var(--red)'}}>{m.score}</div>
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            {[
              ['CIN', m.cin], ['Téléphone', m.telephone],
              ['Profession', m.profession], ['Revenu', fmtMoney(m.revenu_mensuel)],
              ['Nombre de crédits', m.nb_credits], ['Encours actuel', m.encours > 0 ? fmtMoney(m.encours) : '—'],
            ].map(([l,v]) => (
              <div key={l}>
                <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:3}}>{l}</div>
                <div style={{fontSize:13,fontWeight:500,color:'var(--text-primary)'}}>{v}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  )
}

function AccountCreatedModal({ account, onClose }) {
  const [copied, setCopied] = useState(null)

  const copy = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 460 }}>
        <div className="modal-header">
          <h3 style={{ fontFamily: 'Space Grotesk', fontSize: 16, color: 'var(--green)' }}>
            ✓ Compte créé pour {account.nom}
          </h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
            Un compte client a été créé automatiquement. Communiquez ces identifiants au membre — il devra configurer son propre mot de passe à la première connexion.
          </p>

          {[
            { label: 'Adresse email', value: account.email, key: 'email' },
            { label: 'Mot de passe temporaire', value: account.tempPassword, key: 'pw' },
          ].map(({ label, value, key }) => (
            <div key={key} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{label}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px' }}>
                <code style={{ flex: 1, fontSize: 14, color: 'var(--green)', fontFamily: 'monospace' }}>{value}</code>
                <button className="btn btn-ghost btn-sm" onClick={() => copy(value, key)} title="Copier" style={{ flexShrink: 0 }}>
                  {copied === key ? '✓' : <Copy size={13} />}
                </button>
              </div>
            </div>
          ))}

          <div style={{ marginTop: 14, padding: '10px 12px', background: '#F59E0B18', borderRadius: 8, border: '1px solid #F59E0B30', fontSize: 12, color: '#F59E0B' }}>
            Le client devra changer ce mot de passe temporaire lors de sa première connexion.
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>Compris</button>
        </div>
      </div>
    </div>
  )
}
