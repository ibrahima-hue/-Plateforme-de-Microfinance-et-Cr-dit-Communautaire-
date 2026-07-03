import { useState } from 'react'
import { CreditCard, RefreshCw, AlertTriangle, CheckCircle, User, Download } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import styles from './Portal.module.css'
import { useAuth } from '../context/AuthContext'

const fmtMoney = n => new Intl.NumberFormat('fr-FR').format(n)
const fmtDate  = d => new Date(d).toLocaleDateString('fr-FR')

const MES_CREDITS = [
  {
    id: 1, ref: 'CRD-2025-0001', produit: 'Crédit Fonds de Roulement',
    montant: 2500000, solde_restant: 1850000, mensualite: 118000,
    duree: 24, mois_restants: 16,
    prochaine_echeance: '2026-08-03', taux: 14.5,
    statut: 'actif', date_debut: '2024-08-03',
  },
]

const MES_PAIEMENTS = [
  { id:1, date:'2026-07-03', montant:118000, mode:'Mobile Money', ref:'MM-20260703-001', statut:'confirme' },
  { id:2, date:'2026-06-03', montant:118000, mode:'Espèces',      ref:'ESP-0603-014',   statut:'confirme' },
  { id:3, date:'2026-05-03', montant:118000, mode:'Espèces',      ref:'ESP-0503-007',   statut:'confirme' },
  { id:4, date:'2026-04-03', montant:118000, mode:'Virement',     ref:'VIR-0403-002',   statut:'confirme' },
  { id:5, date:'2026-03-03', montant:118000, mode:'Mobile Money', ref:'MM-20260303-009',statut:'confirme' },
]

export default function ClientPortal({ page }) {
  const { user } = useAuth()

  if (page === 'mes_credits')   return <MesCreditsView credits={MES_CREDITS} />
  if (page === 'mes_paiements') return <MesPaiementsView paiements={MES_PAIEMENTS} />
  if (page === 'mon_profil')    return <MonProfilView user={user} />

  const credit = MES_CREDITS[0]
  const totalRembourse = MES_PAIEMENTS.reduce((s,p) => s + p.montant, 0)
  const progressPct = credit ? Math.round(((credit.montant - credit.solde_restant) / credit.montant) * 100) : 0

  return (
    <div className={styles.page}>
      <PageHeader
        title={`Bonjour, ${user.prenom} ${user.nom}`}
        subtitle="Votre espace client KASSA"
      />
      <div className={styles.content}>
        {/* KPIs */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14}}>
          {[
            { label:'Encours de crédit',      val:`${fmtMoney(credit?.solde_restant || 0)} FCFA`, color:'var(--client)',   icon: CreditCard    },
            { label:'Paiements effectués',     val: MES_PAIEMENTS.length,                          color:'var(--green)',   icon: CheckCircle   },
            { label:'Prochaine échéance',      val: credit ? fmtDate(credit.prochaine_echeance) : '—', color:'var(--amber)', icon: RefreshCw },
            { label:'Mois restants',           val: credit?.mois_restants || 0,                    color:'var(--purple)',  icon: AlertTriangle },
          ].map(({ label, val, color, icon: Icon }) => (
            <div key={label} className="card" style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:40,height:40,borderRadius:9,background:`${color}18`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <Icon size={18} color={color} />
              </div>
              <div>
                <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:3}}>{label}</div>
                <div style={{fontSize:15,fontWeight:700,fontFamily:'Space Grotesk',color}}>{val}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 340px',gap:16}}>
          {/* Résumé crédit */}
          {credit && (
            <div className="card">
              <div style={{fontSize:15,fontWeight:600,color:'var(--text-primary)',marginBottom:16}}>{credit.produit}</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:20}}>
                {[
                  { label:'Montant initial',   val:`${fmtMoney(credit.montant)} FCFA` },
                  { label:'Mensualité',        val:`${fmtMoney(credit.mensualite)} FCFA` },
                  { label:'Taux annuel',       val:`${credit.taux}%` },
                  { label:'Date de début',     val: fmtDate(credit.date_debut) },
                  { label:'Durée totale',      val:`${credit.duree} mois` },
                  { label:'Référence',         val: credit.ref },
                ].map(({ label, val }) => (
                  <div key={label}>
                    <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:3}}>{label}</div>
                    <div style={{fontSize:13,fontWeight:600,color:'var(--text-primary)'}}>{val}</div>
                  </div>
                ))}
              </div>

              {/* Progression */}
              <div>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                  <span style={{fontSize:12,color:'var(--text-muted)'}}>Progression du remboursement</span>
                  <span style={{fontSize:12,fontWeight:700,color:'var(--client)'}}>{progressPct}%</span>
                </div>
                <div style={{height:8,background:'var(--border)',borderRadius:4,overflow:'hidden'}}>
                  <div style={{width:`${progressPct}%`,height:'100%',background:'var(--client)',borderRadius:4,transition:'width 0.5s'}} />
                </div>
                <div style={{display:'flex',justifyContent:'space-between',marginTop:5,fontSize:11,color:'var(--text-muted)'}}>
                  <span>Remboursé: {fmtMoney(credit.montant - credit.solde_restant)} FCFA</span>
                  <span>Restant: {fmtMoney(credit.solde_restant)} FCFA</span>
                </div>
              </div>

              <div style={{marginTop:16,padding:'10px 14px',background:'var(--bg-card2)',borderRadius:8,border:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <div style={{fontSize:11,color:'var(--text-muted)'}}>Prochaine échéance</div>
                  <div style={{fontSize:14,fontWeight:700,color:'var(--amber)'}}>{fmtDate(credit.prochaine_echeance)} — {fmtMoney(credit.mensualite)} FCFA</div>
                </div>
                <span className="badge badge-green">Actif</span>
              </div>
            </div>
          )}

          {/* Derniers paiements */}
          <div className="card">
            <div style={{fontSize:15,fontWeight:600,color:'var(--text-primary)',marginBottom:14}}>Derniers paiements</div>
            {MES_PAIEMENTS.slice(0,4).map(p => (
              <div key={p.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
                <div>
                  <div style={{fontSize:13,fontWeight:500,color:'var(--text-primary)'}}>{fmtDate(p.date)}</div>
                  <div style={{fontSize:11,color:'var(--text-muted)'}}>{p.mode} · {p.ref}</div>
                </div>
                <span style={{fontSize:14,fontWeight:700,color:'var(--green)'}}>{fmtMoney(p.montant)} F</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function MesCreditsView({ credits }) {
  return (
    <div className={styles.page}>
      <PageHeader title="Mes crédits" subtitle="Historique et détail de vos crédits" />
      <div className={styles.content}>
        {credits.map(credit => {
          const progressPct = Math.round(((credit.montant - credit.solde_restant) / credit.montant) * 100)
          return (
            <div key={credit.id} className="card">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
                <div>
                  <div style={{fontSize:15,fontWeight:600,color:'var(--text-primary)'}}>{credit.produit}</div>
                  <div style={{fontSize:12,color:'var(--text-muted)',marginTop:2}}>{credit.ref} · Début {fmtDate(credit.date_debut)}</div>
                </div>
                <span className="badge badge-green">Actif</span>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:16}}>
                {[
                  { label:'Montant', val:`${fmtMoney(credit.montant)} FCFA` },
                  { label:'Mensualité', val:`${fmtMoney(credit.mensualite)} FCFA` },
                  { label:'Solde restant', val:`${fmtMoney(credit.solde_restant)} FCFA` },
                  { label:'Prochaine échéance', val:fmtDate(credit.prochaine_echeance) },
                ].map(({label,val}) => (
                  <div key={label}>
                    <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:3}}>{label}</div>
                    <div style={{fontSize:13,fontWeight:600,color:'var(--text-primary)'}}>{val}</div>
                  </div>
                ))}
              </div>
              <div>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                  <span style={{fontSize:12,color:'var(--text-muted)'}}>Progression</span>
                  <span style={{fontSize:12,fontWeight:700,color:'var(--client)'}}>{progressPct}%</span>
                </div>
                <div style={{height:6,background:'var(--border)',borderRadius:3,overflow:'hidden'}}>
                  <div style={{width:`${progressPct}%`,height:'100%',background:'var(--client)',borderRadius:3}} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MesPaiementsView({ paiements }) {
  return (
    <div className={styles.page}>
      <PageHeader title="Mes paiements" subtitle="Historique de vos remboursements" actions={
        <button className="btn btn-ghost" style={{display:'flex',gap:6,alignItems:'center'}}><Download size={13}/> Exporter</button>
      } />
      <div className={styles.content}>
        <div className="card">
          <div className="table-container">
            <table>
              <thead><tr><th>Date</th><th>Montant</th><th>Mode</th><th>Référence</th><th>Statut</th></tr></thead>
              <tbody>
                {paiements.map(p => (
                  <tr key={p.id}>
                    <td>{fmtDate(p.date)}</td>
                    <td style={{fontWeight:600,color:'var(--green)'}}>{fmtMoney(p.montant)} FCFA</td>
                    <td>{p.mode}</td>
                    <td style={{fontFamily:'monospace',fontSize:12}}>{p.ref}</td>
                    <td><span className="badge badge-green">Confirmé</span></td>
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

function MonProfilView({ user }) {
  return (
    <div className={styles.page}>
      <PageHeader title="Mon profil" subtitle="Vos informations personnelles" />
      <div className={styles.content}>
        <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:16}}>
          <div className="card" style={{display:'flex',flexDirection:'column',alignItems:'center',gap:12,padding:24}}>
            <div style={{width:72,height:72,borderRadius:'50%',background:'var(--client)22',border:'2px solid var(--client)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,fontWeight:700,color:'var(--client)',fontFamily:'Space Grotesk'}}>
              {user.prenom?.[0]}{user.nom?.[0]}
            </div>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:16,fontWeight:700,color:'var(--text-primary)'}}>{user.prenom} {user.nom}</div>
              <div style={{fontSize:12,color:'var(--text-muted)',marginTop:3}}>{user.email}</div>
              <span className="badge badge-green" style={{marginTop:8,display:'inline-block'}}>Client actif</span>
            </div>
          </div>
          <div className="card">
            <div style={{fontSize:15,fontWeight:600,color:'var(--text-primary)',marginBottom:16}}>Informations du compte</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
              {[
                { label:'Prénom',       val: user.prenom },
                { label:'Nom',          val: user.nom },
                { label:'Email',        val: user.email },
                { label:'Numéro client',val: `CL-${user.id?.padStart(5,'0') || '00001'}` },
                { label:'Agence',       val: user.agence || 'Agence Dakar Centre' },
                { label:'Membre depuis',val: '15/01/2024' },
              ].map(({ label, val }) => (
                <div key={label} style={{padding:'12px 16px',background:'var(--bg-card2)',borderRadius:8,border:'1px solid var(--border)'}}>
                  <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:4}}>{label}</div>
                  <div style={{fontSize:13,fontWeight:500,color:'var(--text-primary)'}}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
