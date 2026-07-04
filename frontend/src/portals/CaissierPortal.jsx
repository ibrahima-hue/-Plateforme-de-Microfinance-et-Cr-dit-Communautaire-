import { useState } from 'react'
import { Plus, RefreshCw, AlertTriangle, CreditCard, CheckCircle, Search, ChevronDown, ChevronUp } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import styles from './Portal.module.css'
import { useAuth } from '../context/AuthContext'
import {
  getActiveCredits,
  getEcheancier,
  getEcheancesAujourdhui,
  getImpayes,
  recordPayment,
  getPayments,
} from '../store/creditsStore'

const fmtMoney = n => new Intl.NumberFormat('fr-FR').format(n)
const fmtDate  = d => new Date(d).toLocaleDateString('fr-FR')

export default function CaissierPortal({ page }) {
  const { user } = useAuth()
  const [refresh, setRefresh] = useState(0)
  const bump = () => setRefresh(r => r + 1)

  const credits   = getActiveCredits()
  const echeances = getEcheancesAujourdhui()
  const impayes   = getImpayes()
  const payments  = getPayments()

  if (page === 'echeancier') return <EcheancierView credits={credits} onPaid={bump} key={refresh} />
  if (page === 'alertes')    return <ImpayesView impayes={impayes} onPaid={bump} key={refresh} />

  const aPayerAujourdHui = echeances.filter(e => e.statut === 'a_payer')
  const payesAujourdHui  = echeances.filter(e => e.statut === 'paye')
  const totalEncaisse    = payments
    .filter(p => p.date === new Date().toISOString().slice(0, 10))
    .reduce((s, p) => s + p.montant, 0)

  return (
    <div className={styles.page}>
      <PageHeader
        title={`Caisse — ${user.prenom} ${user.nom}`}
        subtitle={`Activité du ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}`}
        actions={<span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{credits.length} crédit(s) actif(s)</span>}
      />
      <div className={styles.content}>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
          {[
            { label: 'À encaisser aujourd\'hui', val: aPayerAujourdHui.length,          color: 'var(--amber)',  icon: RefreshCw     },
            { label: 'Encaissés aujourd\'hui',   val: payesAujourdHui.length,            color: 'var(--green)',  icon: CheckCircle   },
            { label: 'Total encaissé (jour)',    val: `${fmtMoney(totalEncaisse)} F`,    color: 'var(--green)',  icon: CreditCard    },
            { label: 'Impayés actifs',           val: impayes.length,                    color: 'var(--red)',    icon: AlertTriangle },
          ].map(({ label, val, color, icon: Icon }) => (
            <div key={label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 9, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} color={color} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'Space Grotesk', color }}>{val}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>
          {/* Échéances du jour */}
          <div className="card">
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 14 }}>
              Échéances du jour
            </div>
            {echeances.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                Aucune échéance prévue aujourd'hui
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead><tr><th>Client</th><th>Crédit</th><th>Mensualité</th><th>Statut</th><th>Action</th></tr></thead>
                  <tbody>
                    {echeances.map(e => (
                      <tr key={e.id}>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{e.client}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{e.credit_ref}</td>
                        <td style={{ fontWeight: 600, color: 'var(--green)' }}>{fmtMoney(e.montant)} FCFA</td>
                        <td>
                          <span className={`badge ${e.statut === 'paye' ? 'badge-green' : 'badge-amber'}`}>
                            {e.statut === 'paye' ? 'Payé' : 'À payer'}
                          </span>
                        </td>
                        <td>
                          {e.statut === 'a_payer' && (
                            <EncaisserBtn echeance={e} onDone={bump} />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Paiements récents du jour */}
          <div className="card">
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 14 }}>
              Paiements du jour
            </div>
            {payments.filter(p => p.date === new Date().toISOString().slice(0, 10)).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                Aucun paiement enregistré
              </div>
            ) : (
              payments
                .filter(p => p.date === new Date().toISOString().slice(0, 10))
                .slice(0, 8)
                .map(p => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{p.client}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.ref_transaction || p.credit_ref} · {p.heure}</div>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--green)' }}>{fmtMoney(p.montant)} F</span>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Crédits actifs — aperçu */}
        <div className="card">
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 14 }}>
            Crédits actifs ({credits.length})
          </div>
          <div className="table-container">
            <table>
              <thead><tr><th>Client</th><th>Référence</th><th>Produit</th><th>Montant</th><th>Mensualité</th><th>Durée</th><th>Début</th><th>Avancement</th></tr></thead>
              <tbody>
                {credits.map(c => {
                  const echs = getEcheancier(c)
                  const paid = echs.filter(e => e.statut === 'paye').length
                  const late = echs.filter(e => e.statut === 'en_retard').length
                  const pct  = Math.round((paid / c.duree) * 100)
                  return (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.client}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{c.ref}</td>
                      <td>{c.produit}</td>
                      <td style={{ color: 'var(--green)', fontWeight: 600 }}>{fmtMoney(c.montant)} FCFA</td>
                      <td>{fmtMoney(c.mensualite)} FCFA</td>
                      <td>{paid}/{c.duree} mois</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{fmtDate(c.date_debut)}</td>
                      <td style={{ minWidth: 120 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--border)' }}>
                            <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: late > 0 ? 'var(--amber)' : 'var(--green)' }} />
                          </div>
                          <span style={{ fontSize: 11, color: late > 0 ? 'var(--amber)' : 'var(--text-muted)', fontWeight: 600, flexShrink: 0 }}>
                            {pct}%{late > 0 ? ` (${late} retard)` : ''}
                          </span>
                        </div>
                      </td>
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

/* ---------- Bouton encaisser inline ---------- */
function EncaisserBtn({ echeance, onDone }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ mode: 'especes', ref_transaction: '' })

  const handleSubmit = e => {
    e.preventDefault()
    recordPayment({
      echeance_id:     echeance.id,
      credit_ref:      echeance.credit_ref,
      client:          echeance.client,
      montant:         echeance.montant,
      mode:            form.mode,
      ref_transaction: form.ref_transaction,
    })
    setOpen(false)
    onDone()
  }

  if (!open) return (
    <button className="btn btn-primary btn-sm" onClick={() => setOpen(true)}>Encaisser</button>
  )

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', minWidth: 280 }}>
      <select className="input" style={{ padding: '4px 8px', fontSize: 12, height: 30 }} value={form.mode} onChange={e => setForm(p => ({ ...p, mode: e.target.value }))}>
        <option value="especes">Espèces</option>
        <option value="mobile_money">Mobile Money</option>
        <option value="virement">Virement</option>
        <option value="cheque">Chèque</option>
      </select>
      <input className="input" style={{ padding: '4px 8px', fontSize: 12, height: 30, width: 120 }} placeholder="Réf. transaction" value={form.ref_transaction} onChange={e => setForm(p => ({ ...p, ref_transaction: e.target.value }))} />
      <button type="submit" className="btn btn-primary btn-sm">✓</button>
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>✕</button>
    </form>
  )
}

/* ---------- Vue Échéancier complet ---------- */
function EcheancierView({ credits, onPaid }) {
  const [search, setSearch]     = useState('')
  const [expanded, setExpanded] = useState(null)

  const filtered = credits.filter(c =>
    !search || c.client.toLowerCase().includes(search.toLowerCase()) || c.ref.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className={styles.page}>
      <PageHeader title="Échéanciers" subtitle="Suivi des remboursements par crédit" />
      <div className={styles.content}>
        <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '7px 12px', maxWidth: 340 }}>
          <Search size={13} color="var(--text-muted)" />
          <input style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: 13, width: '100%' }} placeholder="Rechercher un client ou une référence..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {filtered.map(credit => {
          const echs  = getEcheancier(credit)
          const paid  = echs.filter(e => e.statut === 'paye').length
          const late  = echs.filter(e => e.statut === 'en_retard').length
          const open  = expanded === credit.id

          return (
            <div key={credit.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {/* Header crédit */}
              <button
                onClick={() => setExpanded(open ? null : credit.id)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14 }}>{credit.client}</span>
                    <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>{credit.ref}</span>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'var(--green-dim)', color: 'var(--green)', fontWeight: 600 }}>{credit.produit}</span>
                    {late > 0 && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#EF444418', color: 'var(--red)', fontWeight: 600 }}>{late} retard(s)</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                    <span>{fmtMoney(credit.montant)} FCFA · {credit.duree} mois · {fmtMoney(credit.mensualite)} F/mois</span>
                    <span>Depuis {fmtDate(credit.date_debut)}</span>
                    <span style={{ color: late > 0 ? 'var(--amber)' : 'var(--green)', fontWeight: 600 }}>{paid}/{credit.duree} versements</span>
                  </div>
                </div>
                {/* Barre de progression */}
                <div style={{ width: 100, flexShrink: 0 }}>
                  <div style={{ height: 6, borderRadius: 3, background: 'var(--border)', marginBottom: 4 }}>
                    <div style={{ width: `${Math.round((paid / credit.duree) * 100)}%`, height: '100%', borderRadius: 3, background: late > 0 ? 'var(--amber)' : 'var(--green)' }} />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right' }}>{Math.round((paid / credit.duree) * 100)}%</div>
                </div>
                {open ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
              </button>

              {/* Tableau des échéances */}
              {open && (
                <div style={{ borderTop: '1px solid var(--border)' }}>
                  <div className="table-container">
                    <table>
                      <thead><tr><th>#</th><th>Date échéance</th><th>Montant</th><th>Statut</th><th>Mode</th><th>Action</th></tr></thead>
                      <tbody>
                        {echs.map(e => (
                          <tr key={e.id}>
                            <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{e.num}</td>
                            <td style={{ fontWeight: e.statut !== 'paye' ? 600 : 400 }}>{fmtDate(e.date_echeance)}</td>
                            <td style={{ color: 'var(--green)', fontWeight: 600 }}>{fmtMoney(e.montant)} FCFA</td>
                            <td>
                              <span className={`badge ${e.statut === 'paye' ? 'badge-green' : e.statut === 'en_retard' ? 'badge-red' : 'badge-amber'}`}>
                                {e.statut === 'paye' ? 'Payé' : e.statut === 'en_retard' ? 'En retard' : 'À venir'}
                              </span>
                            </td>
                            <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                              {e.payment ? e.payment.mode.replace('_', ' ') : '—'}
                            </td>
                            <td>
                              {e.statut !== 'paye' && (
                                <EncaisserBtn echeance={e} onDone={onPaid} />
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 13 }}>
            Aucun crédit actif trouvé
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------- Vue Impayés ---------- */
function ImpayesView({ impayes, onPaid }) {
  return (
    <div className={styles.page}>
      <PageHeader title="Impayés" subtitle="Échéances en retard — tous crédits actifs" />
      <div className={styles.content}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          {[
            { label: 'Retard 1-30j',  nb: impayes.filter(i => i.jours <= 30).length,  color: 'var(--amber)', prov: '10%' },
            { label: 'Retard 31-90j', nb: impayes.filter(i => i.jours > 30 && i.jours <= 90).length, color: 'var(--red)', prov: '25%' },
            { label: 'Retard > 90j',  nb: impayes.filter(i => i.jours > 90).length,   color: '#c0392b',      prov: '50%' },
          ].map(c => (
            <div key={c.label} className="card">
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{c.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Space Grotesk', color: c.color }}>{c.nb}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Provision suggérée : {c.prov}</div>
            </div>
          ))}
        </div>

        <div className="card">
          {impayes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--green)', fontSize: 13 }}>
              ✓ Aucun impayé détecté
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead><tr><th>Client</th><th>Crédit</th><th>Échéance N°</th><th>Montant dû</th><th>Retard</th><th>Risque</th><th>Action</th></tr></thead>
                <tbody>
                  {impayes.map(i => (
                    <tr key={i.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{i.client}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{i.credit_ref}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>#{i.num} — {fmtDate(i.date_echeance)}</td>
                      <td style={{ color: 'var(--amber)', fontWeight: 600 }}>{fmtMoney(i.montant)} FCFA</td>
                      <td><span className={`badge ${i.jours > 30 ? 'badge-red' : 'badge-amber'}`}>{i.jours}j</span></td>
                      <td><span className={`badge ${i.jours > 90 ? 'badge-red' : i.jours > 30 ? 'badge-red' : 'badge-amber'}`}>{i.jours > 90 ? 'Douteux' : i.jours > 30 ? 'Élevé' : 'Modéré'}</span></td>
                      <td><EncaisserBtn echeance={i} onDone={onPaid} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
