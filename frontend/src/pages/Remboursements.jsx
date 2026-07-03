import { useState } from 'react'
import { Plus, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import styles from './Page.module.css'

const fmtMoney = n => new Intl.NumberFormat('fr-FR').format(n) + ' FCFA'
const fmtDate = d => new Date(d).toLocaleDateString('fr-FR')

const REMBOURSEMENTS = [
  { id:1, membre:'Mamadou Diallo', credit_id:1, montant:118000, date_paiement:'2026-01-15', mode:'mobile_money', ref:'MM-2026-001', statut:'paye' },
  { id:2, membre:'Fatou Sow', credit_id:2, montant:71000, date_paiement:'2026-01-22', mode:'especes', ref:'ESP-0122', statut:'paye' },
  { id:3, membre:'Marième Fall', credit_id:4, montant:107000, date_paiement:'2026-04-12', mode:'virement', ref:'VIR-0412', statut:'paye' },
  { id:4, membre:'Oumar Kane', credit_id:3, montant:100000, date_paiement:'2026-04-05', mode:'mobile_money', ref:'MM-2026-045', statut:'paye' },
  { id:5, membre:'Binta Cissé', credit_id:5, montant:103000, date_paiement:'2026-05-18', mode:'cheque', ref:'CHQ-005', statut:'paye' },
  { id:6, membre:'Modou Sarr', credit_id:7, montant:85000, date_paiement:'2026-05-10', mode:'especes', ref:'ESP-0510', statut:'paye' },
]

const IMPAYEES = [
  { id:1, membre:'Ibrahima Ndiaye', credit_id:6, echeance_id:1, montant_total:92000, date_echeance:'2026-05-15', jours_retard:40 },
  { id:2, membre:'Cheikh Mbaye', credit_id:8, echeance_id:3, montant_total:67500, date_echeance:'2026-05-28', jours_retard:27 },
  { id:3, membre:'Rokhaya Diop', credit_id:9, echeance_id:2, montant_total:102000, date_echeance:'2026-06-01', jours_retard:23 },
  { id:4, membre:'Aminata Ba', credit_id:4, echeance_id:5, montant_total:58000, date_echeance:'2026-06-05', jours_retard:19 },
]

const MODES = { especes:'Espèces', mobile_money:'Mobile Money', virement:'Virement', cheque:'Chèque' }

export default function Remboursements() {
  const [rembList, setRembList] = useState(REMBOURSEMENTS)
  const [showForm, setShowForm] = useState(false)
  const [tab, setTab] = useState('historique')

  const totalMois = rembList.filter(r => r.date_paiement.startsWith('2026-06')).reduce((s,r) => s+r.montant, 0)

  const handleAdd = r => {
    setRembList(prev => [r, ...prev])
    setShowForm(false)
  }

  return (
    <div className={styles.page}>
      <PageHeader
        title="Remboursements"
        subtitle="Suivi des paiements et détection des impayés"
        actions={
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={14} /> Enregistrer un paiement
          </button>
        }
      />
      <div className={styles.content}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
          {[
            { label:'Recouvrements ce mois', val: fmtMoney(totalMois), color:'var(--green)', icon: CheckCircle },
            { label:'Alertes impayées', val: IMPAYEES.length, color:'var(--amber)', icon: AlertTriangle },
            { label:'Taux recouvrement', val: '94,2%', color:'var(--blue)', icon: Clock },
          ].map(({ label, val, color, icon: Icon }) => (
            <div key={label} className="card" style={{display:'flex',alignItems:'center',gap:14}}>
              <div style={{width:42,height:42,borderRadius:10,background:`${color}18`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <Icon size={20} color={color} />
              </div>
              <div>
                <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:4}}>{label}</div>
                <div style={{fontSize:20,fontWeight:700,fontFamily:'Space Grotesk',color}}>{val}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{display:'flex',gap:8}}>
          {[['historique','Historique des paiements'],['impayees','Alertes impayées']].map(([k,l]) => (
            <button key={k} className={`btn ${tab===k ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>

        {tab === 'historique' && (
          <div className="card">
            <div className="table-container">
              <table>
                <thead><tr><th>Membre</th><th>Montant</th><th>Date</th><th>Mode</th><th>Référence</th><th>Statut</th></tr></thead>
                <tbody>
                  {rembList.map(r => (
                    <tr key={r.id}>
                      <td style={{color:'var(--text-primary)',fontWeight:500}}>{r.membre}</td>
                      <td style={{fontWeight:600,color:'var(--green)'}}>{fmtMoney(r.montant)}</td>
                      <td>{fmtDate(r.date_paiement)}</td>
                      <td>{MODES[r.mode] || r.mode}</td>
                      <td style={{fontFamily:'monospace',fontSize:12}}>{r.ref}</td>
                      <td><span className="badge badge-green">Payé</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'impayees' && (
          <div className="card">
            <div style={{marginBottom:14,display:'flex',alignItems:'center',gap:8}}>
              <AlertTriangle size={16} color="var(--amber)" />
              <span style={{fontSize:15,fontWeight:600,color:'var(--text-primary)'}}>Échéances en retard</span>
            </div>
            <div className="table-container">
              <table>
                <thead><tr><th>Membre</th><th>Crédit #</th><th>Montant dû</th><th>Date échéance</th><th>Retard</th><th>Niveau risque</th><th>Action</th></tr></thead>
                <tbody>
                  {IMPAYEES.map(imp => (
                    <tr key={imp.id}>
                      <td style={{color:'var(--text-primary)',fontWeight:500}}>{imp.membre}</td>
                      <td>#{imp.credit_id}</td>
                      <td style={{fontWeight:600,color:'var(--amber)'}}>{fmtMoney(imp.montant_total)}</td>
                      <td>{fmtDate(imp.date_echeance)}</td>
                      <td><span className={`badge ${imp.jours_retard>30?'badge-red':'badge-amber'}`}>{imp.jours_retard} jours</span></td>
                      <td><span className={`badge ${imp.jours_retard>30?'badge-red':'badge-amber'}`}>{imp.jours_retard>30?'Élevé':'Modéré'}</span></td>
                      <td><button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>Enregistrer paiement</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showForm && <PaiementModal onClose={() => setShowForm(false)} onAdd={handleAdd} />}
    </div>
  )
}

function PaiementModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ membre:'', credit_id:'', montant:'', date_paiement: new Date().toISOString().split('T')[0], mode:'especes', ref:'' })
  const set = (k,v) => setForm(p => ({...p,[k]:v}))

  const handleSubmit = e => {
    e.preventDefault()
    onAdd({ ...form, id: Date.now(), statut:'paye', montant: parseFloat(form.montant) })
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 style={{fontFamily:'Space Grotesk',fontSize:16}}>Enregistrer un paiement</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Membre</label>
              <input className="input" value={form.membre} onChange={e => set('membre',e.target.value)} required placeholder="Nom du membre" />
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Numéro crédit</label>
                <input className="input" type="number" value={form.credit_id} onChange={e => set('credit_id',e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Montant (FCFA)</label>
                <input className="input" type="number" value={form.montant} onChange={e => set('montant',e.target.value)} required min={1000} />
              </div>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Date de paiement</label>
                <input className="input" type="date" value={form.date_paiement} onChange={e => set('date_paiement',e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Mode de paiement</label>
                <select className="input" value={form.mode} onChange={e => set('mode',e.target.value)}>
                  {Object.entries(MODES).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Référence</label>
              <input className="input" value={form.ref} onChange={e => set('ref',e.target.value)} placeholder="Numéro de reçu" />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-primary">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>
  )
}
