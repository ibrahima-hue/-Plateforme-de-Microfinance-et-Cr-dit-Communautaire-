import { useState } from 'react'
import { BarChart2, CheckCircle, XCircle, AlertTriangle, Search } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import styles from './Page.module.css'

const MEMBRES = [
  { id:1, nom:'Diallo', prenom:'Mamadou', cooperative:'Caisse Centrale Dakar', revenu:350000, profession:'Commerçant', score:82 },
  { id:2, nom:'Sow', prenom:'Fatou', cooperative:'Caisse Centrale Dakar', revenu:180000, profession:'Artisane', score:74 },
  { id:3, nom:'Ndiaye', prenom:'Ibrahima', cooperative:'Caisse Centrale Dakar', revenu:220000, profession:'Agriculteur', score:68 },
  { id:4, nom:'Ba', prenom:'Aminata', cooperative:'Coopérative Pikine', revenu:150000, profession:'Couturière', score:71 },
  { id:5, nom:'Kane', prenom:'Oumar', cooperative:'Coopérative Pikine', revenu:280000, profession:'Mécanicien', score:79 },
  { id:6, nom:'Fall', prenom:'Marième', cooperative:'Mutuelle Thiès', revenu:320000, profession:'Enseignante', score:88 },
  { id:7, nom:'Mbaye', prenom:'Cheikh', cooperative:'Mutuelle Thiès', revenu:200000, profession:'Pêcheur', score:65 },
  { id:8, nom:'Cissé', prenom:'Binta', cooperative:'Coopérative Pikine', revenu:380000, profession:'Infirmière', score:91 },
]

const fmtMoney = n => new Intl.NumberFormat('fr-FR').format(n) + ' FCFA'

function calculerScore(membre, montant, duree) {
  const criteres = []
  const mensualite = montant / duree
  const ratio = membre.revenu > 0 ? mensualite / membre.revenu : 1

  let scoreCapacite = ratio <= 0.3 ? 30 : ratio <= 0.4 ? 22 : ratio <= 0.5 ? 15 : 5
  criteres.push({ nom: 'Capacité de remboursement', score: scoreCapacite, max: 30, detail: `Ratio: ${(ratio*100).toFixed(0)}%` })

  let scoreHistorique = membre.score >= 80 ? 25 : membre.score >= 65 ? 18 : membre.score >= 50 ? 10 : 3
  criteres.push({ nom: 'Historique crédit', score: scoreHistorique, max: 25, detail: `Score actuel: ${membre.score}` })

  let scoreAnciennete = 12
  criteres.push({ nom: 'Ancienneté membre', score: scoreAnciennete, max: 20, detail: '2-3 ans' })

  let scoreEncours = 15
  criteres.push({ nom: 'Encours actuel', score: scoreEncours, max: 15, detail: 'Pas de crédit actif' })

  let scoreRevenu = membre.revenu >= 300000 ? 10 : membre.revenu >= 150000 ? 7 : membre.revenu >= 80000 ? 4 : 2
  criteres.push({ nom: 'Stabilité revenus', score: scoreRevenu, max: 10, detail: fmtMoney(membre.revenu) + '/mois' })

  const total = criteres.reduce((s, c) => s + c.score, 0)
  return {
    total,
    decision: total >= 70 ? 'APPROUVÉ' : total >= 50 ? 'SOUS CONDITIONS' : 'REFUSÉ',
    risque: total >= 70 ? 'Faible' : total >= 50 ? 'Modéré' : 'Élevé',
    criteres,
  }
}

export default function Solvabilite() {
  const [selectedMembre, setSelectedMembre] = useState(null)
  const [montant, setMontant] = useState(1000000)
  const [duree, setDuree] = useState(12)
  const [result, setResult] = useState(null)
  const [search, setSearch] = useState('')

  const handleAnalyse = () => {
    if (!selectedMembre) return
    const score = calculerScore(selectedMembre, montant, duree)
    setResult(score)
  }

  const filtered = MEMBRES.filter(m =>
    !search || `${m.nom} ${m.prenom}`.toLowerCase().includes(search.toLowerCase())
  )

  const decisionColor = result ? (result.total >= 70 ? 'var(--green)' : result.total >= 50 ? 'var(--amber)' : 'var(--red)') : 'var(--text-muted)'
  const decisionIcon = result ? (result.total >= 70 ? <CheckCircle size={24} color="var(--green)" /> : result.total >= 50 ? <AlertTriangle size={24} color="var(--amber)" /> : <XCircle size={24} color="var(--red)" />) : null

  return (
    <div className={styles.page}>
      <PageHeader title="Analyse de solvabilité" subtitle="Scoring automatique des demandeurs" />
      <div className={styles.content}>
        <div style={{display:'grid',gridTemplateColumns:'320px 1fr',gap:20}}>
          {/* Panneau de saisie */}
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <div className="card">
              <div style={{fontSize:15,fontWeight:600,color:'var(--text-primary)',marginBottom:14,display:'flex',alignItems:'center',gap:8}}>
                <BarChart2 size={16} color="var(--green)" /> Paramètres d'analyse
              </div>
              <div className="form-group">
                <label>Montant demandé (FCFA)</label>
                <input className="input" type="number" value={montant} onChange={e => setMontant(parseInt(e.target.value))} min={50000} step={50000} />
              </div>
              <div className="form-group">
                <label>Durée (mois)</label>
                <select className="input" value={duree} onChange={e => setDuree(parseInt(e.target.value))}>
                  {[6,12,18,24,36,48].map(d => <option key={d} value={d}>{d} mois</option>)}
                </select>
              </div>
              <div style={{padding:'10px 12px',background:'var(--bg-card2)',borderRadius:'var(--radius-sm)',marginBottom:12}}>
                <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:4}}>Mensualité estimée</div>
                <div style={{fontSize:18,fontWeight:700,fontFamily:'Space Grotesk',color:'var(--green)'}}>{fmtMoney(Math.round(montant/duree))}</div>
              </div>
              <button className="btn btn-primary" style={{width:'100%',justifyContent:'center'}} onClick={handleAnalyse} disabled={!selectedMembre}>
                Analyser la solvabilité
              </button>
            </div>

            <div className="card">
              <div style={{fontSize:13,fontWeight:600,color:'var(--text-primary)',marginBottom:10}}>Sélectionner un membre</div>
              <div style={{marginBottom:10}}>
                <div className={styles.searchBox}>
                  <Search size={13} color="var(--text-muted)" />
                  <input className={styles.searchInput} placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:4,maxHeight:280,overflowY:'auto'}}>
                {filtered.map(m => (
                  <button key={m.id}
                    style={{
                      display:'flex',alignItems:'center',justifyContent:'space-between',
                      padding:'8px 10px',borderRadius:'var(--radius-sm)',border:'none',
                      background: selectedMembre?.id === m.id ? 'var(--green-dim)' : 'var(--bg-card2)',
                      color: selectedMembre?.id === m.id ? 'var(--green)' : 'var(--text-secondary)',
                      cursor:'pointer',transition:'all 0.1s',
                    }}
                    onClick={() => { setSelectedMembre(m); setResult(null) }}
                  >
                    <span style={{fontSize:13,fontWeight:selectedMembre?.id===m.id?600:400}}>{m.prenom} {m.nom}</span>
                    <span style={{fontSize:11,color: m.score>=70?'var(--green)':m.score>=50?'var(--amber)':'var(--red)',fontWeight:600}}>{m.score}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Résultat */}
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            {!result && !selectedMembre && (
              <div className="card empty-state">
                <BarChart2 size={40} color="var(--text-muted)" />
                <div style={{fontSize:15,color:'var(--text-secondary)'}}>Sélectionner un membre et paramétrer l'analyse</div>
                <div style={{fontSize:12,color:'var(--text-muted)'}}>Le score de solvabilité sera calculé automatiquement</div>
              </div>
            )}

            {selectedMembre && !result && (
              <div className="card">
                <div style={{fontSize:15,fontWeight:600,color:'var(--text-primary)',marginBottom:16}}>Profil du membre</div>
                <div className={styles.infoGrid}>
                  {[
                    ['Membre', `${selectedMembre.prenom} ${selectedMembre.nom}`],
                    ['Coopérative', selectedMembre.cooperative],
                    ['Profession', selectedMembre.profession],
                    ['Revenu mensuel', fmtMoney(selectedMembre.revenu)],
                    ['Score actuel', `${selectedMembre.score}/100`],
                    ['Niveau risque', selectedMembre.score >= 70 ? 'Faible' : selectedMembre.score >= 50 ? 'Modéré' : 'Élevé'],
                  ].map(([l,v]) => (
                    <div key={l}>
                      <div className={styles.infoLabel}>{l}</div>
                      <div className={styles.infoValue}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result && (
              <>
                <div className="card" style={{border: `1px solid ${decisionColor}30`, background: `${decisionColor}06`}}>
                  <div style={{display:'flex',alignItems:'center',gap:14}}>
                    {decisionIcon}
                    <div>
                      <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:4}}>Décision d'analyse</div>
                      <div style={{fontSize:24,fontWeight:700,fontFamily:'Space Grotesk',color:decisionColor}}>{result.decision}</div>
                    </div>
                    <div style={{marginLeft:'auto',textAlign:'right'}}>
                      <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:4}}>Score total</div>
                      <div style={{fontSize:36,fontWeight:700,fontFamily:'Space Grotesk',color:decisionColor}}>{result.total}<span style={{fontSize:16,color:'var(--text-muted)'}}>/100</span></div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div style={{fontSize:15,fontWeight:600,color:'var(--text-primary)',marginBottom:16}}>Détail par critère</div>
                  <div className={styles.criteriaList}>
                    {result.criteres.map(c => (
                      <div key={c.nom} className={styles.criteriaItem}>
                        <div className={styles.criteriaHeader}>
                          <span className={styles.criteriaName}>{c.nom} <span style={{color:'var(--text-muted)',fontSize:11}}>({c.detail})</span></span>
                          <span className={styles.criteriaScore}>{c.score}/{c.max}</span>
                        </div>
                        <div className={styles.criteriaBar}>
                          <div className={styles.criteriaFill} style={{
                            width: `${(c.score/c.max)*100}%`,
                            background: c.score/c.max >= 0.7 ? 'var(--green)' : c.score/c.max >= 0.4 ? 'var(--amber)' : 'var(--red)'
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <div style={{fontSize:15,fontWeight:600,color:'var(--text-primary)',marginBottom:12}}>Membres avec scores similaires</div>
                  <div style={{display:'flex',flexDirection:'column',gap:6}}>
                    {MEMBRES.filter(m => m.id !== selectedMembre?.id && Math.abs(m.score - result.total) < 15).slice(0,3).map(m => (
                      <div key={m.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 10px',background:'var(--bg-card2)',borderRadius:'var(--radius-sm)'}}>
                        <span style={{fontSize:13,color:'var(--text-secondary)'}}>{m.prenom} {m.nom}</span>
                        <span style={{fontSize:12,fontWeight:600,color:'var(--green)'}}>{m.score}/100</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
