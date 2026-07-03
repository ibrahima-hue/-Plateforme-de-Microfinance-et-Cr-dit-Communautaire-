import { useState } from 'react'
import { Plus, Search, RefreshCw, AlertTriangle, CreditCard, CheckCircle } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import styles from './Portal.module.css'
import { useAuth } from '../context/AuthContext'

const fmtMoney = n => new Intl.NumberFormat('fr-FR').format(n)
const fmtDate  = d => new Date(d).toLocaleDateString('fr-FR')

const ECHEANCES_DU_JOUR = [
  { id:1, client:'Mamadou Diallo',  credit:'CRD-2025-0001', montant:118000, date_ech:'2026-07-03', statut:'a_payer' },
  { id:2, client:'Marième Fall',    credit:'CRD-2026-0004', montant:107000, date_ech:'2026-07-03', statut:'a_payer' },
  { id:3, client:'Modou Sarr',      credit:'CRD-2026-0009', montant:85000,  date_ech:'2026-07-03', statut:'paye' },
  { id:4, client:'Binta Cissé',     credit:'CRD-2026-0010', montant:103000, date_ech:'2026-07-03', statut:'a_payer' },
  { id:5, client:'Oumar Kane',      credit:'CRD-2026-0003', montant:100000, date_ech:'2026-07-03', statut:'a_payer' },
]

const IMPAYES = [
  { id:1, client:'Ibrahima Ndiaye', credit:'CRD-2025-0012', montant:95000,  jours:40, telephone:'+221 77 345 6789' },
  { id:2, client:'Cheikh Mbaye',    credit:'CRD-2025-0018', montant:67500,  jours:27, telephone:'+221 77 789 0123' },
  { id:3, client:'Rokhaya Diop',    credit:'CRD-2025-0021', montant:102000, jours:23, telephone:'+221 77 890 1234' },
]

const RECENTS = [
  { id:1, client:'Modou Sarr',    montant:85000,  mode:'mobile_money', ref:'MM-20260703-001', heure:'08:45' },
  { id:2, client:'Fatou Sow',     montant:71000,  mode:'especes',      ref:'ESP-0703-002',    heure:'09:12' },
  { id:3, client:'Oumar Kane',    montant:100000, mode:'virement',     ref:'VIR-0703-003',    heure:'10:30' },
]

export default function CaissierPortal({ page }) {
  const { user } = useAuth()
  const [echeances, setEcheances] = useState(ECHEANCES_DU_JOUR)
  const [recents, setRecents]     = useState(RECENTS)
  const [showForm, setShowForm]   = useState(false)
  const [selectedEch, setSelectedEch] = useState(null)

  if (page === 'echeancier') return <EcheancierView />
  if (page === 'alertes')    return <ImpayesView impayes={IMPAYES} withModal />

  const aPayerAujourdHui  = echeances.filter(e => e.statut === 'a_payer')
  const payesAujourdHui   = echeances.filter(e => e.statut === 'paye')
  const totalEncaisse     = recents.reduce((s,r) => s + r.montant, 0)

  const handleEncaisser = (ech) => { setSelectedEch(ech); setShowForm(true) }
  const handlePaiementOk = (paiement) => {
    setEcheances(prev => prev.map(e => e.id === selectedEch?.id ? {...e, statut:'paye'} : e))
    setRecents(prev => [{ id: Date.now(), client: selectedEch?.client || paiement.client, montant: paiement.montant, mode: paiement.mode, ref: paiement.ref, heure: new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}) }, ...prev])
    setShowForm(false)
    setSelectedEch(null)
  }

  return (
    <div className={styles.page}>
      <PageHeader
        title={`Caisse — ${user.prenom} ${user.nom}`}
        subtitle={`Activité du ${new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})}`}
        actions={
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={14} /> Encaisser paiement
          </button>
        }
      />
      <div className={styles.content}>
        {/* Stats du jour */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14}}>
          {[
            { label:'À encaisser aujourd\'hui', val: aPayerAujourdHui.length,  color:'var(--amber)',  icon: RefreshCw },
            { label:'Encaissés aujourd\'hui',   val: payesAujourdHui.length,   color:'var(--green)',  icon: CheckCircle },
            { label:'Total encaissé',           val: `${fmtMoney(totalEncaisse)} F`, color:'var(--green)', icon: CreditCard },
            { label:'Impayés actifs',           val: IMPAYES.length,           color:'var(--red)',    icon: AlertTriangle },
          ].map(({ label, val, color, icon: Icon }) => (
            <div key={label} className="card" style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:40,height:40,borderRadius:9,background:`${color}18`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <Icon size={18} color={color} />
              </div>
              <div>
                <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:3}}>{label}</div>
                <div style={{fontSize:18,fontWeight:700,fontFamily:'Space Grotesk',color}}>{val}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 340px',gap:16}}>
          {/* Échéances du jour */}
          <div className="card">
            <div style={{fontSize:15,fontWeight:600,color:'var(--text-primary)',marginBottom:14}}>Échéances du jour</div>
            <div className="table-container">
              <table>
                <thead><tr><th>Client</th><th>Crédit</th><th>Montant</th><th>Statut</th><th>Action</th></tr></thead>
                <tbody>
                  {echeances.map(e => (
                    <tr key={e.id}>
                      <td style={{fontWeight:600,color:'var(--text-primary)'}}>{e.client}</td>
                      <td style={{fontFamily:'monospace',fontSize:12}}>{e.credit}</td>
                      <td style={{fontWeight:600,color:'var(--green)'}}>{fmtMoney(e.montant)} FCFA</td>
                      <td><span className={`badge ${e.statut==='paye'?'badge-green':'badge-amber'}`}>{e.statut==='paye'?'Payé':'À payer'}</span></td>
                      <td>
                        {e.statut === 'a_payer' && (
                          <button className="btn btn-primary btn-sm" onClick={() => handleEncaisser(e)}>Encaisser</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Paiements récents */}
          <div className="card">
            <div style={{fontSize:15,fontWeight:600,color:'var(--text-primary)',marginBottom:14}}>Paiements récents</div>
            {recents.map(r => (
              <div key={r.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
                <div>
                  <div style={{fontSize:13,fontWeight:500,color:'var(--text-primary)'}}>{r.client}</div>
                  <div style={{fontSize:11,color:'var(--text-muted)'}}>{r.ref} · {r.heure}</div>
                </div>
                <span style={{fontSize:14,fontWeight:700,color:'var(--green)'}}>{fmtMoney(r.montant)} F</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showForm && <PaiementModal echeance={selectedEch} onClose={() => { setShowForm(false); setSelectedEch(null) }} onSuccess={handlePaiementOk} />}
    </div>
  )
}

function PaiementModal({ echeance, onClose, onSuccess }) {
  const [form, setForm] = useState({
    client: echeance?.client || '',
    credit: echeance?.credit || '',
    montant: echeance?.montant || '',
    mode: 'especes',
    ref: '',
  })
  const set = (k,v) => setForm(p => ({...p,[k]:v}))

  const handleSubmit = e => {
    e.preventDefault()
    onSuccess({ ...form, montant: parseFloat(form.montant) })
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 style={{fontFamily:'Space Grotesk',fontSize:16}}>Encaisser un paiement</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group"><label>Client</label><input className="input" value={form.client} onChange={e=>set('client',e.target.value)} required /></div>
            <div className="form-group"><label>Numéro crédit</label><input className="input" value={form.credit} onChange={e=>set('credit',e.target.value)} required /></div>
            <div className="form-grid">
              <div className="form-group"><label>Montant (FCFA)</label><input className="input" type="number" value={form.montant} onChange={e=>set('montant',e.target.value)} required /></div>
              <div className="form-group"><label>Mode de paiement</label>
                <select className="input" value={form.mode} onChange={e=>set('mode',e.target.value)}>
                  <option value="especes">Espèces</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="virement">Virement</option>
                  <option value="cheque">Chèque</option>
                </select>
              </div>
            </div>
            <div className="form-group"><label>Référence</label><input className="input" value={form.ref} onChange={e=>set('ref',e.target.value)} placeholder="Numéro de reçu / transaction" /></div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-primary">Valider le paiement</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EcheancierView() {
  return (
    <div className={styles.page}>
      <PageHeader title="Échéanciers" subtitle="Tous les crédits et leurs échéances" />
      <div className={styles.content}>
        <div className="card">
          <div className="table-container">
            <table>
              <thead><tr><th>Client</th><th>Crédit</th><th>Mensualité</th><th>Prochaine échéance</th><th>Solde restant</th><th>Statut</th></tr></thead>
              <tbody>
                {[
                  { client:'Mamadou Diallo', credit:'CRD-2025-0001', mensualite:118000, prochaine:'2026-08-03', solde:1850000, statut:'actif' },
                  { client:'Oumar Kane',     credit:'CRD-2026-0003', mensualite:100000, prochaine:'2026-08-05', solde:2680000, statut:'actif' },
                  { client:'Marième Fall',   credit:'CRD-2026-0004', mensualite:107000, prochaine:'2026-08-12', solde:780000,  statut:'actif' },
                  { client:'Binta Cissé',   credit:'CRD-2026-0010', mensualite:103000, prochaine:'2026-08-18', solde:3920000, statut:'actif' },
                  { client:'Modou Sarr',     credit:'CRD-2026-0009', mensualite:85000,  prochaine:'2026-08-10', solde:1650000, statut:'actif' },
                ].map(r => (
                  <tr key={r.credit}>
                    <td style={{fontWeight:600,color:'var(--text-primary)'}}>{r.client}</td>
                    <td style={{fontFamily:'monospace',fontSize:12}}>{r.credit}</td>
                    <td style={{color:'var(--green)',fontWeight:600}}>{fmtMoney(r.mensualite)} FCFA</td>
                    <td>{fmtDate(r.prochaine)}</td>
                    <td>{fmtMoney(r.solde)} FCFA</td>
                    <td><span className="badge badge-green">Actif</span></td>
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

function ImpayesView({ impayes, withModal = false }) {
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState(null)

  const handlePayer = imp => { setSelected(imp); setShowForm(true) }
  const handleSuccess = () => { setShowForm(false); setSelected(null) }

  return (
    <div className={styles.page}>
      <PageHeader title="Impayés du jour" subtitle="Clients en retard de paiement" />
      <div className={styles.content}>
        <div className="card">
          <div className="table-container">
            <table>
              <thead><tr><th>Client</th><th>Téléphone</th><th>Crédit</th><th>Montant dû</th><th>Retard</th><th>Risque</th><th>Action</th></tr></thead>
              <tbody>
                {impayes.map(imp => (
                  <tr key={imp.id}>
                    <td style={{fontWeight:600,color:'var(--text-primary)'}}>{imp.client}</td>
                    <td style={{fontSize:12}}>{imp.telephone}</td>
                    <td style={{fontFamily:'monospace',fontSize:12}}>{imp.credit}</td>
                    <td style={{color:'var(--amber)',fontWeight:600}}>{fmtMoney(imp.montant)} FCFA</td>
                    <td><span className={`badge ${imp.jours>30?'badge-red':'badge-amber'}`}>{imp.jours}j</span></td>
                    <td><span className={`badge ${imp.jours>30?'badge-red':'badge-amber'}`}>{imp.jours>30?'Élevé':'Modéré'}</span></td>
                    <td><button className="btn btn-primary btn-sm" onClick={() => handlePayer(imp)}>Encaisser</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {withModal && showForm && (
        <PaiementModal
          echeance={selected}
          onClose={() => { setShowForm(false); setSelected(null) }}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  )
}
