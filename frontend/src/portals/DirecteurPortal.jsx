import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'
import { AlertTriangle, CheckSquare, TrendingUp, TrendingDown, Shield, Clock, ChevronRight, CheckCircle, XCircle } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import styles from './Portal.module.css'
import { getDemandes, updateDemande } from '../store/demandesStore'

const fmtMoney = n => new Intl.NumberFormat('fr-FR').format(n)

const EVOLUTION = [
  { mois: 'Jan', encours: 580, par30: 3.2 }, { mois: 'Fév', encours: 610, par30: 2.8 },
  { mois: 'Mar', encours: 645, par30: 3.5 }, { mois: 'Avr', encours: 670, par30: 3.1 },
  { mois: 'Mai', encours: 705, par30: 5.2 }, { mois: 'Jun', encours: 730, par30: 5.8 },
  { mois: 'Jul', encours: 748, par30: 5.4 }, { mois: 'Aoû', encours: 762, par30: 4.9 },
  { mois: 'Sep', encours: 788, par30: 5.1 }, { mois: 'Oct', encours: 810, par30: 5.5 },
  { mois: 'Nov', encours: 830, par30: 5.7 }, { mois: 'Déc', encours: 847, par30: 5.8 },
]

// Seuil au-delà duquel un dossier requiert une validation N3 supplémentaire
const SEUIL_N3 = 3_000_000


const ALERTES = [
  { type: 'retard_leger',  client: 'Ibrahima Ndiaye', montant: 95000, jours: 40, credit: 'CRD-2025-0012' },
  { type: 'en_souffrance', client: 'Cheikh Mbaye', montant: 67500, jours: 65, credit: 'CRD-2025-0018' },
  { type: 'en_souffrance', client: 'Rokhaya Diop', montant: 102000, jours: 55, credit: 'CRD-2025-0021' },
  { type: 'retard_leger',  client: 'Aminata Ba', montant: 58000, jours: 19, credit: 'CRD-2026-0003' },
  { type: 'douteux',       client: 'Modou Cissé', montant: 234000, jours: 110, credit: 'CRD-2024-0087' },
]

const ALERTE_CONFIG = {
  retard_leger:  { label: '1-30j', cls: 'badge-amber', color: 'var(--amber)' },
  en_souffrance: { label: '31-90j', cls: 'badge-red', color: 'var(--red)' },
  douteux:       { label: '91-180j', cls: 'badge-red', color: '#c0392b' },
  irrecouvrble:  { label: '>180j', cls: 'badge-red', color: '#7f0000' },
}

const RISQUE_DISTRIB = [
  { name: 'Faible', val: 74, color: '#34E5A0' },
  { name: 'Modéré', val: 18, color: '#F59E0B' },
  { name: 'Élevé',  val: 8,  color: '#EF4444' },
]

export default function DirecteurPortal({ page }) {
  const [validations, setValidations] = useState(() =>
    getDemandes()
      .filter(d => d.statut === 'en_validation_n2' || d.statut === 'en_validation_n3')
      .map(d => ({ ...d, niveau: d.statut === 'en_validation_n2' ? 2 : 3, _passedN2: d.statut === 'en_validation_n3' }))
  )

  const handleDecision = (id, dec) => {
    setValidations(prev => prev.map(v => {
      if (v.id !== id) return v
      if (dec === 'rejete') {
        updateDemande(id, { statut: 'rejetee' })
        return { ...v, statut: 'rejetee' }
      }
      if (v.niveau === 2 && v.montant >= SEUIL_N3) {
        updateDemande(id, { statut: 'en_validation_n3' })
        return { ...v, statut: 'en_validation_n3', niveau: 3, _passedN2: true }
      }
      updateDemande(id, { statut: 'approuvee' })
      return { ...v, statut: 'approuvee' }
    }))
  }

  if (page === 'validation') return <ValidationView validations={validations} onDecision={handleDecision} />
  if (page === 'alertes')    return <AlertesView alertes={ALERTES} />
  if (page === 'rapports')   return <RapportsView />
  if (page === 'portefeuille') return <PortefeuilleDirView />

  // Default: dashboard directeur
  return (
    <div className={styles.page}>
      <PageHeader title="Centre de pilotage des risques" badge="TEMPS RÉEL" />
      <div className={styles.content}>

        {/* KPI row */}
        <div className={styles.kpiRow}>
          {[
            { label: 'Encours total',         val: '847,2 M FCFA', trend: '+6,5%', up: true,  color: 'var(--green)',  icon: TrendingUp },
            { label: 'Taux remboursement',     val: '94,2 %',       trend: '+1,2pt', up: true, color: 'var(--green)',  icon: TrendingUp },
            { label: 'PAR30',                  val: '5,8 %',        trend: '+0,7pt', up: false, color: 'var(--amber)', icon: AlertTriangle },
            { label: 'En attente validation',  val: validations.filter(v=>v.statut!=='approuvee'&&v.statut!=='rejetee').length, trend: 'urgents', up: false, color: 'var(--purple)', icon: Clock },
            { label: 'Alertes impayés',        val: ALERTES.length, trend: 'actives',up: false, color: 'var(--red)',   icon: Shield },
          ].map(({ label, val, trend, up, color, icon: Icon }) => (
            <div key={label} className={`card ${styles.kpiCard}`}>
              <div className={styles.kpiTop}>
                <span className={styles.kpiLabel}>{label}</span>
                <div style={{width:32,height:32,borderRadius:8,background:`${color}18`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <Icon size={15} color={color} />
                </div>
              </div>
              <div className={styles.kpiVal} style={{color}}>{val}</div>
              <div className={up ? 'stat-trend-up' : 'stat-trend-warn'}>{up ? '▲' : '▼'} {trend}</div>
            </div>
          ))}
        </div>

        <div className={styles.grid2}>
          {/* Evolution + PAR30 */}
          <div className="card">
            <div className={styles.cardTitle}>Évolution Encours & PAR30</div>
            <div className={styles.cardSub}>12 mois — M FCFA / %</div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={EVOLUTION} margin={{top:10,right:10,left:0,bottom:0}}>
                <defs>
                  <linearGradient id="dEncG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34E5A0" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#34E5A0" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2A3A" vertical={false} />
                <XAxis dataKey="mois" tick={{fill:'#4A5568',fontSize:10}} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{fill:'#4A5568',fontSize:10}} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{fill:'#4A5568',fontSize:10}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{background:'#0D1117',border:'1px solid #1E2A3A',borderRadius:8,fontSize:12}} />
                <Area yAxisId="left" type="monotone" dataKey="encours" name="Encours (M)" stroke="#34E5A0" strokeWidth={2} fill="url(#dEncG)" />
                <Area yAxisId="right" type="monotone" dataKey="par30" name="PAR30 (%)" stroke="#F59E0B" strokeWidth={2} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Répartition risque */}
          <div className="card">
            <div className={styles.cardTitle}>Répartition du risque</div>
            <div className={styles.cardSub}>Distribution du portefeuille par niveau</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={RISQUE_DISTRIB} layout="vertical" margin={{top:10,right:20,left:10,bottom:0}}>
                <XAxis type="number" tick={{fill:'#4A5568',fontSize:10}} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{fill:'#8B9BB4',fontSize:11}} axisLine={false} tickLine={false} width={55} />
                <Tooltip contentStyle={{background:'#0D1117',border:'1px solid #1E2A3A',borderRadius:8,fontSize:12}} />
                <Bar dataKey="val" radius={[0,6,6,0]} name="% portefeuille">
                  {RISQUE_DISTRIB.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick validation + alertes */}
        <div className={styles.grid2}>
          <div className="card">
            <div className={styles.sectionHeader}>
              <div>
                <div className={styles.cardTitle} style={{display:'flex',alignItems:'center',gap:6}}>
                  <CheckSquare size={15} color="var(--green)" /> Dossiers à valider
                </div>
              </div>
              <span className="badge badge-purple">{validations.filter(v=>v.statut!=='approuvee'&&v.statut!=='rejetee').length} en attente</span>
            </div>
            {validations.slice(0,3).map(v => (
              <div key={v.id} className={styles.validationRow}>
                <div className={styles.valInfo}>
                  <div style={{fontWeight:600,color:'var(--text-primary)',fontSize:13}}>{v.client}</div>
                  <div style={{fontSize:11,color:'var(--text-muted)'}}>{v.produit} · {fmtMoney(v.montant)} FCFA · Niveau {v.niveau}</div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <span style={{fontSize:12,fontWeight:600,color:v.score>=70?'var(--green)':'var(--amber)'}}>{v.score}/100</span>
                  {v.statut === 'approuvee' ? (
                    <span className="badge badge-green">Approuvé ✓</span>
                  ) : v.statut === 'rejetee' ? (
                    <span className="badge badge-red">Rejeté</span>
                  ) : (
                    <>
                      {v._passedN2 && <span className="badge badge-purple" style={{marginRight:4}}>N3</span>}
                      <button className="btn btn-sm" style={{background:'var(--green-dim)',color:'var(--green)',border:'1px solid rgba(52,229,160,0.2)'}} onClick={() => handleDecision(v.id,'approuve')}><CheckCircle size={12}/></button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDecision(v.id,'rejete')}><XCircle size={12}/></button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className={styles.sectionHeader}>
              <div>
                <div className={styles.cardTitle} style={{display:'flex',alignItems:'center',gap:6}}>
                  <AlertTriangle size={15} color="var(--amber)" /> Alertes impayés
                </div>
              </div>
              <span className="badge badge-amber">{ALERTES.length} alertes</span>
            </div>
            {ALERTES.map((a, i) => {
              const cfg = ALERTE_CONFIG[a.type]
              return (
                <div key={i} className={styles.alerteRow}>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600,color:'var(--text-primary)',fontSize:13}}>{a.client}</div>
                    <div style={{fontSize:11,color:'var(--text-muted)'}}>{a.credit} · {fmtMoney(a.montant)} FCFA</div>
                  </div>
                  <span className={`badge ${cfg.cls}`}>{a.jours}j — {cfg.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function ValidationView({ validations, onDecision }) {
  const [comment, setComment] = useState({})
  return (
    <div className={styles.page}>
      <PageHeader title="Validation des crédits" subtitle="File de validation multi-niveaux" />
      <div className={styles.content}>
        <div className="card">
          <div className="table-container">
            <table>
              <thead><tr><th>Client</th><th>Produit</th><th>Montant</th><th>Score</th><th>Agent</th><th>Niveau</th><th>Date</th><th>Décision</th></tr></thead>
              <tbody>
                {validations.map(v => (
                  <tr key={v.id}>
                    <td style={{fontWeight:600,color:'var(--text-primary)'}}>{v.client}</td>
                    <td>{v.produit}</td>
                    <td style={{fontWeight:600,color:'var(--green)'}}>{fmtMoney(v.montant)} FCFA</td>
                    <td style={{color:v.score>=70?'var(--green)':v.score>=50?'var(--amber)':'var(--red)',fontWeight:600}}>{v.score}/100</td>
                    <td style={{color:'var(--text-secondary)'}}>{v.agent}</td>
                    <td><span className="badge badge-purple">N{v.niveau}</span></td>
                    <td style={{color:'var(--text-muted)',fontSize:12}}>{v.date}</td>
                    <td>
                      {v.statut === 'approuvee' ? (
                        <span className="badge badge-green">Approuvé ✓</span>
                      ) : v.statut === 'rejetee' ? (
                        <span className="badge badge-red">Rejeté</span>
                      ) : (
                        <div style={{display:'flex',gap:6,alignItems:'center'}}>
                          {v._passedN2 && <span className="badge badge-purple">→ N3</span>}
                          <button className="btn btn-sm btn-primary" onClick={() => onDecision(v.id,'approuve')}>
                            {v.niveau === 2 && v.montant >= SEUIL_N3 ? 'Approuver → N3' : 'Approuver'}
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => onDecision(v.id,'rejete')}>Rejeter</button>
                        </div>
                      )}
                    </td>
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

function AlertesView({ alertes }) {
  return (
    <div className={styles.page}>
      <PageHeader title="Alertes & Impayés" subtitle="Suivi et classification des risques" />
      <div className={styles.content}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14}}>
          {[
            { label: 'Retard léger (1-30j)',  nb: alertes.filter(a=>a.type==='retard_leger').length,  color:'var(--amber)',  prov:'10%' },
            { label: 'En souffrance (31-90j)',nb: alertes.filter(a=>a.type==='en_souffrance').length, color:'var(--red)',    prov:'25%' },
            { label: 'Douteux (91-180j)',     nb: alertes.filter(a=>a.type==='douteux').length,       color:'#c0392b',      prov:'50%' },
            { label: 'Irrécouvrables (>180j)',nb: alertes.filter(a=>a.type==='irrecouvrble').length,  color:'#7f0000',      prov:'100%' },
          ].map(c => (
            <div key={c.label} className="card">
              <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:6}}>{c.label}</div>
              <div style={{fontSize:28,fontWeight:700,fontFamily:'Space Grotesk',color:c.color}}>{c.nb}</div>
              <div style={{fontSize:11,color:'var(--text-muted)',marginTop:4}}>Provision: {c.prov}</div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="table-container">
            <table>
              <thead><tr><th>Client</th><th>Crédit</th><th>Montant impayé</th><th>Jours retard</th><th>Classification</th><th>Action</th></tr></thead>
              <tbody>
                {alertes.map((a, i) => {
                  const cfg = ALERTE_CONFIG[a.type]
                  return (
                    <tr key={i}>
                      <td style={{fontWeight:600,color:'var(--text-primary)'}}>{a.client}</td>
                      <td style={{fontFamily:'monospace',fontSize:12}}>{a.credit}</td>
                      <td style={{color:'var(--amber)',fontWeight:600}}>{fmtMoney(a.montant)} FCFA</td>
                      <td><span className={`badge ${cfg.cls}`}>{a.jours} jours</span></td>
                      <td><span className={`badge ${cfg.cls}`}>{cfg.label}</span></td>
                      <td><button className="btn btn-ghost btn-sm">Voir dossier</button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

function PortefeuilleDirView() {
  return (
    <div className={styles.page}>
      <PageHeader title="Portefeuille global" subtitle="Vue consolidée toutes agences" />
      <div className={styles.content}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14}}>
          {[
            { label:'Crédits actifs', val:'1 248', color:'var(--green)' },
            { label:'Encours total',  val:'847 M FCFA', color:'var(--green)' },
            { label:'Taux remb.',     val:'94,2 %', color:'var(--blue)' },
            { label:'PAR30',          val:'5,8 %', color:'var(--amber)' },
          ].map(c => (
            <div key={c.label} className="card">
              <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:8}}>{c.label}</div>
              <div style={{fontSize:24,fontWeight:700,fontFamily:'Space Grotesk',color:c.color}}>{c.val}</div>
            </div>
          ))}
        </div>
        <div className="card">
          <div style={{fontSize:15,fontWeight:600,color:'var(--text-primary)',marginBottom:14}}>Performance par agence</div>
          <div className="table-container">
            <table>
              <thead><tr><th>Agence</th><th>Crédits actifs</th><th>Encours</th><th>PAR30</th><th>Tx remboursement</th></tr></thead>
              <tbody>
                {[
                  { agence:'Agence Principale Dakar', nb:520, encours:'380 M', par:4.2, tx:95.8 },
                  { agence:'Agence Pikine',           nb:312, encours:'215 M', par:6.1, tx:93.2 },
                  { agence:'Agence Thiès',            nb:248, encours:'162 M', par:5.3, tx:95.1 },
                  { agence:'Agence Ziguinchor',       nb:168, encours:'90 M',  par:8.4, tx:91.4 },
                ].map(r => (
                  <tr key={r.agence}>
                    <td style={{fontWeight:500,color:'var(--text-primary)'}}>{r.agence}</td>
                    <td>{r.nb}</td>
                    <td style={{color:'var(--green)',fontWeight:600}}>{r.encours} FCFA</td>
                    <td><span className={`badge ${r.par>6?'badge-red':'badge-amber'}`}>{r.par}%</span></td>
                    <td style={{color:r.tx>=94?'var(--green)':'var(--amber)',fontWeight:600}}>{r.tx}%</td>
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

function RapportsView() {
  return (
    <div className={styles.page}>
      <PageHeader title="Rapports de direction" />
      <div className={styles.content}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14}}>
          {['Rapport mensuel portefeuille','Rapport PAR & provisions','Rapport performance agences','Rapport décaissements','Rapport recouvrements','Rapport scoring crédits'].map(r => (
            <div key={r} className="card" style={{display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer'}}>
              <div>
                <div style={{fontSize:13,fontWeight:500,color:'var(--text-primary)',marginBottom:4}}>{r}</div>
                <div style={{fontSize:11,color:'var(--text-muted)'}}>Juillet 2026</div>
              </div>
              <ChevronRight size={16} color="var(--text-muted)" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
