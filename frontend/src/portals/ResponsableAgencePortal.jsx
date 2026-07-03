import { useState } from 'react'
import { CheckSquare, Clock, CheckCircle, XCircle } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import styles from './Portal.module.css'
import { useAuth } from '../context/AuthContext'
import Membres from '../pages/Membres'
import DemandesCredit from '../pages/DemandesCredit'
import { getDemandes, updateDemande } from '../store/demandesStore'

const fmtMoney = n => new Intl.NumberFormat('fr-FR').format(n)

const SEUIL_N2 = 500_000

export default function ResponsableAgencePortal({ page }) {
  const { user } = useAuth()
  const [queue, setQueue] = useState(() => getDemandes().filter(d => d.statut === 'soumise'))

  const handleDecision = (id, dec) => {
    const item = queue.find(d => d.id === id)
    if (!item) return
    let changes
    if (dec === 'rejete') {
      changes = { statut: 'rejetee' }
    } else {
      changes = item.montant > SEUIL_N2
        ? { statut: 'en_validation_n2' }
        : { statut: 'approuvee' }
    }
    updateDemande(id, changes)
    setQueue(prev => prev.map(d => d.id === id ? { ...d, ...changes } : d))
  }

  if (page === 'validation') return <ValidationN1View queue={queue} onDecision={handleDecision} user={user} />
  if (page === 'credits')    return <DemandesCredit />
  if (page === 'membres')    return <Membres />

  // Dashboard : compter à partir de l'état courant de la queue
  const pending      = queue.filter(d => d.statut === 'soumise').length
  const approved     = queue.filter(d => d.statut === 'approuvee').length
  const transmitted  = queue.filter(d => d.statut === 'en_validation_n2').length
  const rejected     = queue.filter(d => d.statut === 'rejetee').length

  return (
    <div className={styles.page}>
      <PageHeader
        title={`Agence — ${user.prenom} ${user.nom}`}
        subtitle={user.agence || 'Responsable d\'agence'}
      />
      <div className={styles.content}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14}}>
          {[
            { label:'En attente validation N1', val: pending,     color:'var(--amber)',  icon: Clock        },
            { label:'Approuvés (final N1)',      val: approved,    color:'var(--green)',  icon: CheckCircle  },
            { label:'Transmis au Directeur',     val: transmitted, color:'var(--purple)', icon: CheckSquare  },
            { label:'Rejetés',                   val: rejected,    color:'var(--red)',    icon: XCircle      },
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
          <div style={{fontSize:15,fontWeight:600,color:'var(--text-primary)',marginBottom:14,display:'flex',alignItems:'center',gap:6}}>
            <CheckSquare size={15} color="var(--pink)" /> Dossiers à valider (N1)
          </div>
          <div className="table-container">
            <table>
              <thead><tr><th>Client</th><th>Produit</th><th>Montant</th><th>Score</th><th>Agent</th><th>Date</th><th>Circuit</th><th>Décision</th></tr></thead>
              <tbody>
                {queue.map(d => (
                  <tr key={d.id}>
                    <td style={{fontWeight:600,color:'var(--text-primary)'}}>{d.client}</td>
                    <td>{d.produit}</td>
                    <td style={{fontWeight:600,color:'var(--green)'}}>{fmtMoney(d.montant)} FCFA</td>
                    <td style={{color:d.score>=70?'var(--green)':d.score>=50?'var(--amber)':'var(--red)',fontWeight:600}}>
                      {d.score != null ? `${d.score}/100` : '—'}
                    </td>
                    <td style={{color:'var(--text-secondary)',fontSize:12}}>{d.agent || '—'}</td>
                    <td style={{color:'var(--text-muted)',fontSize:12}}>{d.date}</td>
                    <td>
                      <span className={`badge ${d.montant > SEUIL_N2 ? 'badge-purple' : 'badge-green'}`}>
                        {d.montant > SEUIL_N2 ? '→ N2 Directeur' : 'Décision finale'}
                      </span>
                    </td>
                    <td>
                      {d.statut !== 'soumise' ? (
                        <span className={`badge ${d.statut === 'en_validation_n2' ? 'badge-purple' : d.statut === 'approuvee' ? 'badge-green' : 'badge-red'}`}>
                          {d.statut === 'en_validation_n2' ? 'Transmis N2' : d.statut === 'approuvee' ? 'Approuvé' : 'Rejeté'}
                        </span>
                      ) : (
                        <div style={{display:'flex',gap:6}}>
                          <button className="btn btn-sm btn-primary" onClick={() => handleDecision(d.id,'approuve')}>Approuver</button>
                          <button className="btn btn-sm btn-danger"  onClick={() => handleDecision(d.id,'rejete')}>Rejeter</button>
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

function ValidationN1View({ queue, onDecision, user }) {
  const pending = queue.filter(d => d.statut === 'soumise')
  const decided = queue.filter(d => d.statut !== 'soumise')

  return (
    <div className={styles.page}>
      <PageHeader
        title="Validation N1 — Agence"
        subtitle={`${user.agence || 'Agence'} · ${pending.length} dossier(s) en attente`}
      />
      <div className={styles.content}>
        {/* En attente */}
        <div className="card">
          <div style={{fontSize:15,fontWeight:600,color:'var(--text-primary)',marginBottom:14,display:'flex',alignItems:'center',gap:6}}>
            <Clock size={14} color="var(--amber)" />
            En attente de validation ({pending.length})
          </div>
          {pending.length === 0 ? (
            <div style={{textAlign:'center',padding:'32px 0',color:'var(--text-muted)',fontSize:13}}>
              Aucun dossier en attente ✓
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              {pending.map(d => (
                <div key={d.id} style={{padding:'14px 16px',background:'var(--bg-card2)',borderRadius:10,border:'1px solid var(--border)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                    <div>
                      <div style={{fontWeight:700,color:'var(--text-primary)',fontSize:14}}>{d.client}</div>
                      <div style={{fontSize:12,color:'var(--text-muted)',marginTop:2}}>{d.produit} · Agent: {d.agent || '—'} · {d.date}</div>
                    </div>
                    <span className={`badge ${d.montant > SEUIL_N2 ? 'badge-purple' : 'badge-green'}`} style={{flexShrink:0}}>
                      {d.montant > SEUIL_N2 ? '→ Directeur (N2) si approuvé' : 'Décision finale N1'}
                    </span>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:24,marginBottom:12}}>
                    <div>
                      <div style={{fontSize:10,color:'var(--text-muted)'}}>MONTANT</div>
                      <div style={{fontSize:16,fontWeight:700,color:'var(--green)',fontFamily:'Space Grotesk'}}>{fmtMoney(d.montant)} FCFA</div>
                    </div>
                    <div>
                      <div style={{fontSize:10,color:'var(--text-muted)'}}>SCORE</div>
                      <div style={{fontSize:16,fontWeight:700,fontFamily:'Space Grotesk',color:d.score>=70?'var(--green)':d.score>=50?'var(--amber)':'var(--red)'}}>
                        {d.score != null ? `${d.score}/100` : '—'}
                      </div>
                    </div>
                    {d.objet && (
                      <div>
                        <div style={{fontSize:10,color:'var(--text-muted)'}}>OBJET</div>
                        <div style={{fontSize:13,color:'var(--text-secondary)'}}>{d.objet}</div>
                      </div>
                    )}
                  </div>
                  <div style={{display:'flex',gap:8}}>
                    <button className="btn btn-primary" style={{flex:1,justifyContent:'center'}} onClick={() => onDecision(d.id,'approuve')}>
                      <CheckCircle size={13} /> Approuver
                    </button>
                    <button className="btn btn-danger" style={{flex:1,justifyContent:'center'}} onClick={() => onDecision(d.id,'rejete')}>
                      <XCircle size={13} /> Rejeter
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Traités */}
        {decided.length > 0 && (
          <div className="card">
            <div style={{fontSize:14,fontWeight:600,color:'var(--text-primary)',marginBottom:12}}>Dossiers traités ({decided.length})</div>
            <div className="table-container">
              <table>
                <thead><tr><th>Client</th><th>Montant</th><th>Score</th><th>Décision N1</th><th>Suite du circuit</th></tr></thead>
                <tbody>
                  {decided.map(d => (
                    <tr key={d.id}>
                      <td style={{fontWeight:600,color:'var(--text-primary)'}}>{d.client}</td>
                      <td style={{color:'var(--green)',fontWeight:600}}>{fmtMoney(d.montant)} FCFA</td>
                      <td style={{color:d.score>=70?'var(--green)':'var(--amber)',fontWeight:600}}>
                        {d.score != null ? `${d.score}/100` : '—'}
                      </td>
                      <td>
                        <span className={`badge ${d.statut === 'rejetee' ? 'badge-red' : 'badge-green'}`}>
                          {d.statut === 'rejetee' ? 'Rejeté' : 'Approuvé N1'}
                        </span>
                      </td>
                      <td>
                        {d.statut === 'rejetee'
                          ? <span className="badge badge-red">Clôturé</span>
                          : d.statut === 'en_validation_n2'
                            ? <span className="badge badge-purple">Transmis → Directeur N2</span>
                            : <span className="badge badge-green">Approuvé définitivement</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
