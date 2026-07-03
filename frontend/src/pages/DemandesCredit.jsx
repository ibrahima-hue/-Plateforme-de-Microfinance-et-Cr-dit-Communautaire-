import { useState, useEffect } from 'react'
import { Plus, Eye, CheckCircle, XCircle, Search, Filter, ChevronDown } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import styles from './Page.module.css'

const API = 'http://localhost:5000/api'
const fmtMoney = n => new Intl.NumberFormat('fr-FR').format(n) + ' FCFA'

const DEMO = [
  { id: 1, nom: 'Diallo', prenom: 'Mamadou', cooperative: 'Caisse Centrale Dakar', montant: 2500000, duree_mois: 24, taux_interet: 12.5, objet: 'Extension boutique', statut: 'approuve', score_analyse: 82, date_demande: '2026-01-15' },
  { id: 2, nom: 'Sow', prenom: 'Fatou', cooperative: 'Caisse Centrale Dakar', montant: 800000, duree_mois: 12, taux_interet: 14.0, objet: 'Matériel couture', statut: 'decaisse', score_analyse: 74, date_demande: '2026-01-22' },
  { id: 3, nom: 'Ndiaye', prenom: 'Ibrahima', cooperative: 'Caisse Centrale Dakar', montant: 1500000, duree_mois: 18, taux_interet: 13.0, objet: 'Intrants agricoles', statut: 'en_analyse', score_analyse: 68, date_demande: '2026-02-10' },
  { id: 4, nom: 'Ba', prenom: 'Aminata', cooperative: 'Coopérative Pikine', montant: 600000, duree_mois: 12, taux_interet: 14.5, objet: 'Stock marchandises', statut: 'en_attente', score_analyse: null, date_demande: '2026-02-18' },
  { id: 5, nom: 'Kane', prenom: 'Oumar', cooperative: 'Coopérative Pikine', montant: 3000000, duree_mois: 36, taux_interet: 11.5, objet: 'Atelier mécanique', statut: 'approuve', score_analyse: 79, date_demande: '2026-03-05' },
  { id: 6, nom: 'Fall', prenom: 'Marième', cooperative: 'Mutuelle Thiès', montant: 1200000, duree_mois: 12, taux_interet: 12.0, objet: 'Formation professionnelle', statut: 'decaisse', score_analyse: 88, date_demande: '2026-03-12' },
  { id: 7, nom: 'Mbaye', prenom: 'Cheikh', cooperative: 'Mutuelle Thiès', montant: 900000, duree_mois: 18, taux_interet: 13.5, objet: 'Équipement pêche', statut: 'rejete', score_analyse: 65, date_demande: '2026-03-20' },
  { id: 8, nom: 'Diop', prenom: 'Rokhaya', cooperative: 'Caisse Ziguinchor', montant: 500000, duree_mois: 6, taux_interet: 15.0, objet: 'Fonds de roulement', statut: 'en_attente', score_analyse: null, date_demande: '2026-04-02' },
  { id: 9, nom: 'Sarr', prenom: 'Modou', cooperative: 'Caisse Centrale Dakar', montant: 1800000, duree_mois: 24, taux_interet: 12.5, objet: 'Véhicule', statut: 'en_analyse', score_analyse: 77, date_demande: '2026-04-10' },
  { id: 10, nom: 'Cissé', prenom: 'Binta', cooperative: 'Coopérative Pikine', montant: 4000000, duree_mois: 48, taux_interet: 11.0, objet: 'Clinique privée', statut: 'approuve', score_analyse: 91, date_demande: '2026-04-18' },
]

const STATUTS = {
  en_attente: { label: 'En attente', cls: 'badge-gray' },
  en_analyse: { label: 'En analyse', cls: 'badge-blue' },
  approuve: { label: 'Approuvé', cls: 'badge-green' },
  rejete: { label: 'Rejeté', cls: 'badge-red' },
  decaisse: { label: 'Décaissé', cls: 'badge-purple' },
}

export default function DemandesCredit() {
  const [data, setData] = useState(DEMO)
  const [filtreStatut, setFiltreStatut] = useState('')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState(null)

  const filtered = data.filter(d => {
    const matchStatut = !filtreStatut || d.statut === filtreStatut
    const matchSearch = !search || `${d.nom} ${d.prenom} ${d.objet}`.toLowerCase().includes(search.toLowerCase())
    return matchStatut && matchSearch
  })

  const handleStatutChange = (id, statut) => {
    setData(prev => prev.map(d => d.id === id ? {...d, statut} : d))
    fetch(`${API}/credits/${id}/statut`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({statut}) }).catch(() => {})
  }

  return (
    <div className={styles.page}>
      <PageHeader
        title="Demandes de crédit"
        subtitle="Gestion et validation des demandes"
        actions={
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={14} /> Nouvelle demande
          </button>
        }
      />
      <div className={styles.content}>
        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <Search size={14} color="var(--text-muted)" />
            <input className={styles.searchInput} placeholder="Rechercher un membre, un objet..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input" style={{width:160}} value={filtreStatut} onChange={e => setFiltreStatut(e.target.value)}>
            <option value="">Tous les statuts</option>
            {Object.entries(STATUTS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <div className={styles.stats}>
            {Object.entries(STATUTS).map(([k,v]) => (
              <span key={k} className={`badge ${v.cls}`}>{v.label}: {data.filter(d => d.statut === k).length}</span>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="table-container">
            <table>
              <thead><tr>
                <th>#</th><th>Membre</th><th>Coopérative</th><th>Montant</th>
                <th>Durée</th><th>Objet</th><th>Score</th><th>Statut</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map(d => (
                  <tr key={d.id}>
                    <td style={{color:'var(--text-muted)'}}>{d.id}</td>
                    <td style={{color:'var(--text-primary)',fontWeight:500}}>{d.prenom} {d.nom}</td>
                    <td>{d.cooperative}</td>
                    <td style={{fontWeight:600,color:'var(--text-primary)'}}>{fmtMoney(d.montant)}</td>
                    <td>{d.duree_mois} mois</td>
                    <td>{d.objet}</td>
                    <td>
                      {d.score_analyse
                        ? <span style={{color: d.score_analyse >= 70 ? 'var(--green)' : d.score_analyse >= 50 ? 'var(--amber)' : 'var(--red)', fontWeight:600}}>{d.score_analyse}/100</span>
                        : <span style={{color:'var(--text-muted)'}}>—</span>
                      }
                    </td>
                    <td><span className={`badge ${STATUTS[d.statut].cls}`}>{STATUTS[d.statut].label}</span></td>
                    <td>
                      <div style={{display:'flex',gap:4}}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setSelected(d)}><Eye size={12} /></button>
                        {d.statut === 'en_analyse' && (
                          <>
                            <button className="btn btn-sm" style={{background:'var(--green-dim)',color:'var(--green)',border:'1px solid rgba(52,229,160,0.2)'}} onClick={() => handleStatutChange(d.id,'approuve')}><CheckCircle size={12}/></button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleStatutChange(d.id,'rejete')}><XCircle size={12}/></button>
                          </>
                        )}
                        {d.statut === 'en_attente' && (
                          <button className="btn btn-sm" style={{background:'var(--blue)',color:'#fff'}} onClick={() => handleStatutChange(d.id,'en_analyse')}>Analyser</button>
                        )}
                        {d.statut === 'approuve' && (
                          <button className="btn btn-primary btn-sm" onClick={() => handleStatutChange(d.id,'decaisse')}>Décaisser</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showForm && <NouvelleDemandeModal onClose={() => setShowForm(false)} onAdd={d => { setData(prev => [d,...prev]); setShowForm(false) }} />}
      {selected && <DetailModal demande={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

function NouvelleDemandeModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ prenom:'', nom:'', cooperative:'Caisse Centrale Dakar', montant:'', duree_mois:'12', taux_interet:'12.5', objet:'' })

  const set = (k, v) => setForm(p => ({...p, [k]: v}))

  const handleSubmit = e => {
    e.preventDefault()
    onAdd({ ...form, id: Date.now(), statut: 'en_attente', score_analyse: null, date_demande: new Date().toISOString().split('T')[0], montant: parseFloat(form.montant), duree_mois: parseInt(form.duree_mois) })
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 style={{fontFamily:'Space Grotesk',fontSize:16}}>Nouvelle demande de crédit</h3>
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
              <label>Coopérative</label>
              <select className="input" value={form.cooperative} onChange={e => set('cooperative', e.target.value)}>
                <option>Caisse Centrale Dakar</option><option>Coopérative Pikine</option>
                <option>Mutuelle Thiès</option><option>Caisse Ziguinchor</option>
              </select>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Montant (FCFA)</label>
                <input className="input" type="number" value={form.montant} onChange={e => set('montant', e.target.value)} required min={50000} />
              </div>
              <div className="form-group">
                <label>Durée (mois)</label>
                <select className="input" value={form.duree_mois} onChange={e => set('duree_mois', e.target.value)}>
                  {[6,12,18,24,36,48,60].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Taux d'intérêt (%)</label>
              <input className="input" type="number" step="0.5" value={form.taux_interet} onChange={e => set('taux_interet', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Objet du crédit</label>
              <input className="input" value={form.objet} onChange={e => set('objet', e.target.value)} required placeholder="Ex: Extension boutique" />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-primary">Soumettre la demande</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DetailModal({ demande: d, onClose }) {
  const mensualite = d.montant && d.duree_mois ? Math.round(d.montant / d.duree_mois * (1 + d.taux_interet / 1200)) : 0
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 style={{fontFamily:'Space Grotesk',fontSize:16}}>Demande #{d.id} — {d.prenom} {d.nom}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            {[
              ['Coopérative', d.cooperative], ['Objet', d.objet],
              ['Montant demandé', fmtMoney(d.montant)], ['Mensualité estimée', fmtMoney(mensualite)],
              ['Durée', `${d.duree_mois} mois`], ['Taux', `${d.taux_interet}%`],
              ['Score solvabilité', d.score_analyse ? `${d.score_analyse}/100` : '—'],
              ['Statut', <span className={`badge ${STATUTS[d.statut].cls}`}>{STATUTS[d.statut].label}</span>],
              ['Date demande', d.date_demande],
            ].map(([label, val]) => (
              <div key={label}>
                <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:4}}>{label}</div>
                <div style={{fontSize:14,fontWeight:500,color:'var(--text-primary)'}}>{val}</div>
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
