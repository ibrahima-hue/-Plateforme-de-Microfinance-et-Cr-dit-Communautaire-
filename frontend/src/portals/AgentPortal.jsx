import { useState } from 'react'
import { Plus, Search, FileText, Users, BarChart2, CheckCircle, Clock, XCircle } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import styles from './Portal.module.css'
import { useAuth } from '../context/AuthContext'
import { getDemandes, addDemande } from '../store/demandesStore'
import { getMembres } from '../store/membresStore'

const fmtMoney = n => new Intl.NumberFormat('fr-FR').format(n)

const STATUTS = {
  soumise:           { label:'Soumise',          cls:'badge-gray'   },
  en_analyse:        { label:'En analyse',        cls:'badge-blue'   },
  en_validation_n1:  { label:'Validation N1',     cls:'badge-purple' },
  en_validation_n2:  { label:'Validation N2',     cls:'badge-purple' },
  en_validation_n3:  { label:'Validation N3',     cls:'badge-purple' },
  approuvee:         { label:'Approuvée',          cls:'badge-green'  },
  rejetee:           { label:'Rejetée',            cls:'badge-red'   },
  annulee:           { label:'Annulée',            cls:'badge-gray'  },
  decaissee:         { label:'Décaissée',          cls:'badge-blue'  },
}

export default function AgentPortal({ page, onNavigate = () => {} }) {
  const { user } = useAuth()
  const agentName = `${user.prenom} ${user.nom}`
  const [demandes, setDemandes] = useState(() => getDemandes().filter(d => !d.agent || d.agent === agentName))
  const [clients] = useState(() => getMembres())
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')

  const handleAdd = d => {
    const full = { ...d, agent: agentName }
    const next = addDemande(full)
    setDemandes(next.filter(dem => !dem.agent || dem.agent === agentName))
  }

  if (page === 'clients')    return <ClientsView clients={clients} />
  if (page === 'solvabilite') return <SolvabiliteAgentView clients={clients} />
  if (page === 'nouvelle_demande') return <NouvelleDemandePage onClose={() => onNavigate('dashboard')} onAdd={d => { handleAdd(d); onNavigate('dashboard') }} clients={clients} />

  // Dashboard agent
  const stats = {
    total: demandes.length,
    en_cours: demandes.filter(d => d.statut.startsWith('en_') || d.statut === 'soumise').length,
    approuvees: demandes.filter(d => d.statut === 'approuvee').length,
    rejetees: demandes.filter(d => d.statut === 'rejetee').length,
  }

  const filtered = demandes.filter(d =>
    !search || d.client.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className={styles.page}>
      <PageHeader
        title={`Bonjour, ${user.prenom}`}
        subtitle="Vos demandes de crédit en cours"
        actions={
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={14} /> Nouvelle demande
          </button>
        }
      />
      <div className={styles.content}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14}}>
          {[
            { label:'Total demandes',  val: stats.total,      color:'var(--purple)', icon: FileText    },
            { label:'En cours',        val: stats.en_cours,   color:'var(--blue)',   icon: Clock       },
            { label:'Approuvées',      val: stats.approuvees, color:'var(--green)',  icon: CheckCircle },
            { label:'Rejetées',        val: stats.rejetees,   color:'var(--red)',    icon: XCircle     },
          ].map(({ label, val, color, icon: Icon }) => (
            <div key={label} className="card" style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:40,height:40,borderRadius:9,background:`${color}18`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <Icon size={18} color={color} />
              </div>
              <div>
                <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:3}}>{label}</div>
                <div style={{fontSize:22,fontWeight:700,fontFamily:'Space Grotesk',color}}>{val}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div style={{marginBottom:14,display:'flex',gap:10,alignItems:'center'}}>
            <div style={{flex:1,display:'flex',alignItems:'center',gap:8,background:'var(--bg-card2)',border:'1px solid var(--border)',borderRadius:'var(--radius-sm)',padding:'7px 12px'}}>
              <Search size={13} color="var(--text-muted)" />
              <input style={{background:'none',border:'none',outline:'none',color:'var(--text-primary)',fontSize:13,width:'100%'}} placeholder="Rechercher un client..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="table-container">
            <table>
              <thead><tr><th>Client</th><th>Produit</th><th>Montant</th><th>Score</th><th>Statut</th><th>Date</th></tr></thead>
              <tbody>
                {filtered.map(d => (
                  <tr key={d.id}>
                    <td style={{fontWeight:600,color:'var(--text-primary)'}}>{d.client}</td>
                    <td>{d.produit}</td>
                    <td style={{fontWeight:600,color:'var(--green)'}}>{fmtMoney(d.montant)} FCFA</td>
                    <td style={{color:d.score>=70?'var(--green)':d.score>=50?'var(--amber)':'var(--red)',fontWeight:600}}>{d.score ? `${d.score}/100` : '—'}</td>
                    <td><span className={`badge ${STATUTS[d.statut].cls}`}>{STATUTS[d.statut].label}</span></td>
                    <td style={{color:'var(--text-muted)',fontSize:12}}>{d.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {showForm && <NouvelleDemandePage onClose={() => setShowForm(false)} onAdd={d => { handleAdd(d); setShowForm(false) }} clients={clients} />}
    </div>
  )
}

function ClientsView({ clients }) {
  const [search, setSearch] = useState('')
  const filtered = clients.filter(c => !search || `${c.nom} ${c.prenom}`.toLowerCase().includes(search.toLowerCase()))
  return (
    <div className={styles.page}>
      <PageHeader title="Mes clients" subtitle="Portefeuille de clients assignés" />
      <div className={styles.content}>
        <div className="card">
          <div style={{marginBottom:14,display:'flex',alignItems:'center',gap:8,background:'var(--bg-card2)',border:'1px solid var(--border)',borderRadius:'var(--radius-sm)',padding:'7px 12px',width:280}}>
            <Search size={13} color="var(--text-muted)" />
            <input style={{background:'none',border:'none',outline:'none',color:'var(--text-primary)',fontSize:13,width:'100%'}} placeholder="Rechercher..." value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          <div className="table-container">
            <table>
              <thead><tr><th>Client</th><th>Téléphone</th><th>Profession</th><th>Revenu</th><th>Score</th><th>Demandes</th></tr></thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td style={{fontWeight:600,color:'var(--text-primary)'}}>{c.prenom} {c.nom}</td>
                    <td style={{fontSize:12}}>{c.telephone}</td>
                    <td>{c.profession}</td>
                    <td style={{color:'var(--text-primary)'}}>{fmtMoney(c.revenu_mensuel ?? c.revenu ?? 0)} FCFA</td>
                    <td style={{color:c.score>=70?'var(--green)':c.score>=50?'var(--amber)':'var(--red)',fontWeight:600}}>{c.score}</td>
                    <td><span className="badge badge-purple">{c.nb_credits ?? c.nbDemandes ?? 0}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

function SolvabiliteAgentView({ clients }) {
  const [selected, setSelected] = useState(null)
  const [montant, setMontant] = useState(1000000)
  const [duree, setDuree] = useState(12)
  const [result, setResult] = useState(null)

  const analyse = () => {
    if (!selected) return
    const ratio = montant / duree / (selected.revenu_mensuel ?? selected.revenu ?? 1)
    const scoreCapacite = ratio <= 0.3 ? 30 : ratio <= 0.4 ? 22 : ratio <= 0.5 ? 15 : 5
    const scoreHistorique = selected.score >= 80 ? 25 : selected.score >= 65 ? 18 : 10
    const total = scoreCapacite + scoreHistorique + 12 + 15 + 7
    setResult({
      total,
      decision: total >= 70 ? 'APPROUVÉ' : total >= 50 ? 'SOUS CONDITIONS' : 'REFUSÉ',
      criteres: [
        { nom: 'Capacité remboursement', score: scoreCapacite, max: 30 },
        { nom: 'Historique crédit',      score: scoreHistorique, max: 25 },
        { nom: 'Ancienneté',             score: 12, max: 20 },
        { nom: 'Encours actuel',         score: 15, max: 15 },
        { nom: 'Stabilité revenus',      score: 7,  max: 10 },
      ],
    })
  }

  const decColor = result ? (result.total >= 70 ? 'var(--green)' : result.total >= 50 ? 'var(--amber)' : 'var(--red)') : 'var(--green)'

  return (
    <div className={styles.page}>
      <PageHeader title="Analyse solvabilité" subtitle="Outil de scoring avant soumission" />
      <div className={styles.content}>
        <div style={{display:'grid',gridTemplateColumns:'300px 1fr',gap:16}}>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <div className="card">
              <div style={{fontSize:14,fontWeight:600,color:'var(--text-primary)',marginBottom:12}}>Paramètres</div>
              <div className="form-group"><label>Client</label>
                <select className="input" value={selected?.id || ''} onChange={e => { setSelected(clients.find(c => c.id == e.target.value)); setResult(null) }}>
                  <option value="">— Sélectionner —</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Montant (FCFA)</label>
                <input className="input" type="number" value={montant} onChange={e => setMontant(+e.target.value)} step={50000} />
              </div>
              <div className="form-group"><label>Durée (mois)</label>
                <select className="input" value={duree} onChange={e => setDuree(+e.target.value)}>
                  {[6,12,18,24,36,48].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <button className="btn btn-primary" style={{width:'100%',justifyContent:'center'}} onClick={analyse} disabled={!selected}>
                Analyser
              </button>
            </div>
          </div>
          <div>
            {result ? (
              <div style={{display:'flex',flexDirection:'column',gap:14}}>
                <div className="card" style={{border:`1px solid ${decColor}30`}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <div>
                      <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:4}}>Décision</div>
                      <div style={{fontSize:22,fontWeight:700,fontFamily:'Space Grotesk',color:decColor}}>{result.decision}</div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:4}}>Score</div>
                      <div style={{fontSize:40,fontWeight:700,fontFamily:'Space Grotesk',color:decColor}}>{result.total}<span style={{fontSize:16,color:'var(--text-muted)'}}>/100</span></div>
                    </div>
                  </div>
                </div>
                <div className="card">
                  {result.criteres.map(c => (
                    <div key={c.nom} style={{marginBottom:12}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                        <span style={{fontSize:12,color:'var(--text-secondary)'}}>{c.nom}</span>
                        <span style={{fontSize:12,fontWeight:600,color:'var(--green)'}}>{c.score}/{c.max}</span>
                      </div>
                      <div style={{height:4,background:'var(--border)',borderRadius:2,overflow:'hidden'}}>
                        <div style={{width:`${(c.score/c.max)*100}%`,height:'100%',background:c.score/c.max>=0.7?'var(--green)':c.score/c.max>=0.4?'var(--amber)':'var(--red)',borderRadius:2}} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="card empty-state" style={{minHeight:300}}>
                <BarChart2 size={40} />
                <div style={{color:'var(--text-secondary)'}}>Sélectionnez un client et lancez l'analyse</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function NouvelleDemandePage({ onClose, onAdd, clients = [] }) {
  const [form, setForm] = useState({ client_id:'', produit:'Crédit Fonds de Roulement', montant:'', duree:'12', objet:'' })
  const set = (k,v) => setForm(p => ({...p,[k]:v}))
  const handleSubmit = e => {
    e.preventDefault()
    const client = clients.find(c => c.id == form.client_id)
    onAdd && onAdd({ id: Date.now(), client: client ? `${client.prenom} ${client.nom}` : 'Nouveau client', montant: parseFloat(form.montant), produit: form.produit, duree: parseInt(form.duree), objet: form.objet, score: null, statut: 'soumise', date: new Date().toISOString().split('T')[0] })
    onClose && onClose()
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
            <div className="form-group"><label>Client</label>
              <select className="input" value={form.client_id} onChange={e=>set('client_id',e.target.value)} required>
                <option value="">— Choisir un client —</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Produit de crédit</label>
              <select className="input" value={form.produit} onChange={e=>set('produit',e.target.value)}>
                {['Crédit Fonds de Roulement','Crédit Équipement','Crédit Habitat','Crédit Agricole'].map(p=><option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-grid">
              <div className="form-group"><label>Montant (FCFA)</label><input className="input" type="number" value={form.montant} onChange={e=>set('montant',e.target.value)} required min={50000} /></div>
              <div className="form-group"><label>Durée (mois)</label>
                <select className="input" value={form.duree} onChange={e=>set('duree',e.target.value)}>
                  {[6,12,18,24,36,48].map(d=><option key={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group"><label>Objet du crédit</label><input className="input" value={form.objet} onChange={e=>set('objet',e.target.value)} required placeholder="Ex: Achat matériel" /></div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-primary">Soumettre</button>
          </div>
        </form>
      </div>
    </div>
  )
}
