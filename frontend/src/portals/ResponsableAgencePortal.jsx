import { useState } from 'react'
import { CheckSquare, Clock, CheckCircle, XCircle, Banknote } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import styles from './Portal.module.css'
import { useAuth } from '../context/AuthContext'
import Membres from '../pages/Membres'
import DemandesCredit from '../pages/DemandesCredit'
import { getDemandes, updateDemande } from '../store/demandesStore'

const fmtMoney = n => new Intl.NumberFormat('fr-FR').format(n)

export default function ResponsableAgencePortal({ page }) {
  const { user } = useAuth()
  const [queue, setQueue] = useState(() => getDemandes().filter(d =>
    ['soumise','en_validation_n2','rejetee','approuvee','decaissee'].includes(d.statut)
  ))

  const handleDecision = (id, dec) => {
    const changes = dec === 'rejete' ? { statut: 'rejetee' } : { statut: 'en_validation_n2' }
    updateDemande(id, changes)
    setQueue(prev => prev.map(d => d.id === id ? { ...d, ...changes } : d))
  }

  const handleDecaissement = (id) => {
    const changes = { statut: 'decaissee', date_decaissement: new Date().toISOString().slice(0,10) }
    updateDemande(id, changes)
    setQueue(prev => prev.map(d => d.id === id ? { ...d, ...changes } : d))
  }

  if (page === 'validation')   return <ValidationN1View queue={queue} onDecision={handleDecision} user={user} />
  if (page === 'decaissement') return <DecaissementView queue={queue} onDecaisser={handleDecaissement} user={user} />
  if (page === 'credits')      return <DemandesCredit />
  if (page === 'membres')      return <Membres />

  const pending     = queue.filter(d => d.statut === 'soumise').length
  const transmitted = queue.filter(d => d.statut === 'en_validation_n2').length
  const readyToPay  = queue.filter(d => d.statut === 'approuvee').length
  const disbursed   = queue.filter(d => d.statut === 'decaissee').length

  return (
    <div className={styles.page}>
      <PageHeader
        title={`Agence — ${user.prenom} ${user.nom}`}
        subtitle={user.agence || 'Responsable d\'agence'}
      />
      <div className={styles.content}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14}}>
          {[
            { label:'En attente validation N1',  val: pending,     color:'var(--amber)',  icon: Clock        },
            { label:'En attente Directeur',       val: transmitted, color:'var(--purple)', icon: CheckSquare  },
            { label:'Approuvés — à décaisser',    val: readyToPay,  color:'var(--green)',  icon: CheckCircle  },
            { label:'Décaissés',                  val: disbursed,   color:'var(--blue)',   icon: Banknote     },
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
              <thead><tr><th>Client</th><th>Produit</th><th>Montant</th><th>Score</th><th>Agent</th><th>Date</th><th>Décision</th></tr></thead>
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
                      {d.statut !== 'soumise' ? (
                        <span className={`badge ${
                          d.statut === 'en_validation_n2' ? 'badge-purple' :
                          d.statut === 'approuvee'        ? 'badge-green'  :
                          d.statut === 'decaissee'        ? 'badge-blue'   : 'badge-red'
                        }`}>
                          {d.statut === 'en_validation_n2' ? 'Transmis Directeur' :
                           d.statut === 'approuvee'        ? 'Approuvé ✓'         :
                           d.statut === 'decaissee'        ? 'Décaissé'           : 'Rejeté'}
                        </span>
                      ) : (
                        <div style={{display:'flex',gap:6}}>
                          <button className="btn btn-sm btn-primary" onClick={() => handleDecision(d.id,'approuve')}>Approuver → Directeur</button>
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
                    <span className="badge badge-purple" style={{flexShrink:0}}>
                      → Directeur (approbation requise)
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
                      <CheckCircle size={13} /> Approuver → Directeur
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
                        {d.statut === 'rejetee'          ? <span className="badge badge-red">Clôturé</span>
                        : d.statut === 'en_validation_n2' ? <span className="badge badge-purple">En attente Directeur</span>
                        : d.statut === 'approuvee'        ? <span className="badge badge-green">✓ Directeur — prêt à décaisser</span>
                        : d.statut === 'decaissee'        ? <span className="badge badge-blue">Décaissé</span>
                        : <span className="badge badge-gray">{d.statut}</span>}
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

function DecaissementView({ queue, onDecaisser, user }) {
  const ready    = queue.filter(d => d.statut === 'approuvee')
  const disbursed = queue.filter(d => d.statut === 'decaissee')

  return (
    <div className={styles.page}>
      <PageHeader
        title="Décaissement"
        subtitle={`${user.agence || 'Agence'} · ${ready.length} dossier(s) approuvé(s) par le Directeur`}
      />
      <div className={styles.content}>
        <div className="card">
          <div style={{fontSize:15,fontWeight:600,color:'var(--text-primary)',marginBottom:6,display:'flex',alignItems:'center',gap:6}}>
            <Banknote size={15} color="var(--green)" /> Prêts à décaisser
          </div>
          <div style={{fontSize:12,color:'var(--text-muted)',marginBottom:14,padding:'8px 12px',background:'#34E5A010',border:'1px solid #34E5A030',borderRadius:8}}>
            Ces dossiers ont été approuvés par le Directeur. Vous pouvez procéder au décaissement.
          </div>
          {ready.length === 0 ? (
            <div style={{textAlign:'center',padding:'32px 0',color:'var(--text-muted)',fontSize:13}}>
              Aucun dossier en attente de décaissement
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              {ready.map(d => (
                <div key={d.id} style={{padding:'16px',background:'var(--bg-card2)',borderRadius:10,border:'1px solid var(--border)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                    <div>
                      <div style={{fontWeight:700,color:'var(--text-primary)',fontSize:14}}>{d.client}</div>
                      <div style={{fontSize:12,color:'var(--text-muted)',marginTop:2}}>{d.produit} · {d.duree} mois · Agent: {d.agent || '—'}</div>
                    </div>
                    <span className="badge badge-green">✓ Approuvé Directeur</span>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:24,marginBottom:14}}>
                    <div>
                      <div style={{fontSize:10,color:'var(--text-muted)'}}>MONTANT À DÉCAISSER</div>
                      <div style={{fontSize:20,fontWeight:700,color:'var(--green)',fontFamily:'Space Grotesk'}}>{fmtMoney(d.montant)} FCFA</div>
                    </div>
                    <div>
                      <div style={{fontSize:10,color:'var(--text-muted)'}}>SCORE</div>
                      <div style={{fontSize:16,fontWeight:700,color:d.score>=70?'var(--green)':'var(--amber)',fontFamily:'Space Grotesk'}}>{d.score != null ? `${d.score}/100` : '—'}</div>
                    </div>
                    {d.objet && (
                      <div>
                        <div style={{fontSize:10,color:'var(--text-muted)'}}>OBJET</div>
                        <div style={{fontSize:13,color:'var(--text-secondary)'}}>{d.objet}</div>
                      </div>
                    )}
                  </div>
                  <button
                    className="btn btn-primary"
                    style={{justifyContent:'center',width:'100%'}}
                    onClick={() => onDecaisser(d.id)}
                  >
                    <Banknote size={14} /> Confirmer le décaissement
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {disbursed.length > 0 && (
          <div className="card">
            <div style={{fontSize:14,fontWeight:600,color:'var(--text-primary)',marginBottom:12}}>Décaissements effectués ({disbursed.length})</div>
            <div className="table-container">
              <table>
                <thead><tr><th>Client</th><th>Produit</th><th>Montant</th><th>Date décaissement</th><th>Statut</th></tr></thead>
                <tbody>
                  {disbursed.map(d => (
                    <tr key={d.id}>
                      <td style={{fontWeight:600,color:'var(--text-primary)'}}>{d.client}</td>
                      <td>{d.produit}</td>
                      <td style={{color:'var(--green)',fontWeight:600}}>{fmtMoney(d.montant)} FCFA</td>
                      <td style={{color:'var(--text-muted)',fontSize:12}}>{d.date_decaissement || '—'}</td>
                      <td><span className="badge badge-blue">Décaissé</span></td>
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
