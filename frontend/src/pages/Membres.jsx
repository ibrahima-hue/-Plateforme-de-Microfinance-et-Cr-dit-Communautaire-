import { useState } from 'react'
import { Plus, Users, Building2, Search, User } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import styles from './Page.module.css'

const fmtMoney = n => new Intl.NumberFormat('fr-FR').format(n) + ' FCFA'

const MEMBRES = [
  { id:1, nom:'Diallo', prenom:'Mamadou', cin:'1199012345', telephone:'+221 77 123 4567', profession:'Commerçant', revenu_mensuel:350000, cooperative:'Caisse Centrale Dakar', statut:'actif', score:82, nb_credits:2, encours:1850000 },
  { id:2, nom:'Sow', prenom:'Fatou', cin:'2198098765', telephone:'+221 77 234 5678', profession:'Artisane', revenu_mensuel:180000, cooperative:'Caisse Centrale Dakar', statut:'actif', score:74, nb_credits:1, encours:0 },
  { id:3, nom:'Ndiaye', prenom:'Ibrahima', cin:'1195076543', telephone:'+221 77 345 6789', profession:'Agriculteur', revenu_mensuel:220000, cooperative:'Caisse Centrale Dakar', statut:'suspendu', score:68, nb_credits:1, encours:1500000 },
  { id:4, nom:'Ba', prenom:'Aminata', cin:'2200054321', telephone:'+221 77 456 7890', profession:'Couturière', revenu_mensuel:150000, cooperative:'Coopérative Pikine', statut:'actif', score:71, nb_credits:1, encours:420000 },
  { id:5, nom:'Kane', prenom:'Oumar', cin:'1197043210', telephone:'+221 77 567 8901', profession:'Mécanicien', revenu_mensuel:280000, cooperative:'Coopérative Pikine', statut:'actif', score:79, nb_credits:1, encours:2680000 },
  { id:6, nom:'Fall', prenom:'Marième', cin:'2201032109', telephone:'+221 77 678 9012', profession:'Enseignante', revenu_mensuel:320000, cooperative:'Mutuelle Thiès', statut:'actif', score:88, nb_credits:2, encours:780000 },
  { id:7, nom:'Mbaye', prenom:'Cheikh', cin:'1196021098', telephone:'+221 77 789 0123', profession:'Pêcheur', revenu_mensuel:200000, cooperative:'Mutuelle Thiès', statut:'actif', score:65, nb_credits:0, encours:0 },
  { id:8, nom:'Diop', prenom:'Rokhaya', cin:'2199010987', telephone:'+221 77 890 1234', profession:'Vendeuse', revenu_mensuel:160000, cooperative:'Caisse Ziguinchor', statut:'actif', score:72, nb_credits:1, encours:400000 },
  { id:9, nom:'Sarr', prenom:'Modou', cin:'1200009876', telephone:'+221 77 901 2345', profession:'Chauffeur', revenu_mensuel:240000, cooperative:'Caisse Centrale Dakar', statut:'actif', score:77, nb_credits:1, encours:1650000 },
  { id:10, nom:'Cissé', prenom:'Binta', cin:'2202098765', telephone:'+221 77 012 3456', profession:'Infirmière', revenu_mensuel:380000, cooperative:'Coopérative Pikine', statut:'actif', score:91, nb_credits:1, encours:3920000 },
]

const COOPS = ['Toutes', 'Caisse Centrale Dakar', 'Coopérative Pikine', 'Mutuelle Thiès', 'Caisse Ziguinchor']

const STATUT_BADGE = { actif: 'badge-green', inactif: 'badge-gray', suspendu: 'badge-red' }
const STATUT_LABEL = { actif: 'Actif', inactif: 'Inactif', suspendu: 'Suspendu' }

export default function Membres() {
  const [membres, setMembres] = useState(MEMBRES)
  const [search, setSearch] = useState('')
  const [filtreComp, setFiltreComp] = useState('Toutes')
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState(null)

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
                <th>Revenu</th><th>Coopérative</th><th>Score</th><th>Encours</th><th>Statut</th>
              </tr></thead>
              <tbody>
                {filtered.map(m => (
                  <tr key={m.id} style={{cursor:'pointer'}} onClick={() => setSelected(m)}>
                    <td style={{color:'var(--text-primary)',fontWeight:500}}>{m.prenom} {m.nom}</td>
                    <td style={{fontFamily:'monospace',fontSize:12}}>{m.cin}</td>
                    <td>{m.telephone}</td>
                    <td>{m.profession}</td>
                    <td>{fmtMoney(m.revenu_mensuel)}</td>
                    <td>{m.cooperative}</td>
                    <td style={{color: m.score>=70?'var(--green)':m.score>=50?'var(--amber)':'var(--red)',fontWeight:600}}>{m.score}</td>
                    <td style={{color:'var(--text-primary)',fontWeight: m.encours>0 ? 500 : 400}}>{m.encours > 0 ? fmtMoney(m.encours) : '—'}</td>
                    <td><span className={`badge ${STATUT_BADGE[m.statut]}`}>{STATUT_LABEL[m.statut]}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showForm && <NouveauMembreModal onClose={() => setShowForm(false)} onAdd={m => { setMembres(p => [m,...p]); setShowForm(false) }} />}
      {selected && <MembreDetailModal membre={selected} onClose={() => setSelected(null)} />}
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
