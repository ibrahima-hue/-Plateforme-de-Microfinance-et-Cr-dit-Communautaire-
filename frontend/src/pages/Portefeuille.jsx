import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Briefcase, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import styles from './Page.module.css'

const fmtMoney = n => new Intl.NumberFormat('fr-FR').format(n) + ' FCFA'

const CREDITS = [
  { id: 1, membre: 'Mamadou Diallo', cooperative: 'Caisse Centrale Dakar', montant: 2500000, solde: 1850000, mensualite: 118000, nbEcheances: 24, echeancePayee: 6, statut: 'actif', taux: 12.5, dateDecaissement: '2025-12-15' },
  { id: 2, membre: 'Fatou Sow', cooperative: 'Caisse Centrale Dakar', montant: 800000, solde: 0, mensualite: 71000, nbEcheances: 12, echeancePayee: 12, statut: 'cloture', taux: 14.0, dateDecaissement: '2025-02-22' },
  { id: 3, membre: 'Oumar Kane', cooperative: 'Coopérative Pikine', montant: 3000000, solde: 2680000, mensualite: 100000, nbEcheances: 36, echeancePayee: 3, statut: 'actif', taux: 11.5, dateDecaissement: '2026-03-05' },
  { id: 4, membre: 'Marième Fall', cooperative: 'Mutuelle Thiès', montant: 1200000, solde: 780000, mensualite: 107000, nbEcheances: 12, echeancePayee: 4, statut: 'actif', taux: 12.0, dateDecaissement: '2026-03-12' },
  { id: 5, membre: 'Binta Cissé', cooperative: 'Coopérative Pikine', montant: 4000000, solde: 3920000, mensualite: 103000, nbEcheances: 48, echeancePayee: 1, statut: 'actif', taux: 11.0, dateDecaissement: '2026-04-18' },
  { id: 6, membre: 'Ibrahima Ndiaye', cooperative: 'Caisse Centrale Dakar', montant: 1500000, solde: 1500000, mensualite: 92000, nbEcheances: 18, echeancePayee: 0, statut: 'en_defaut', taux: 13.0, dateDecaissement: '2026-01-10' },
  { id: 7, membre: 'Modou Sarr', cooperative: 'Caisse Centrale Dakar', montant: 1800000, solde: 1650000, mensualite: 85000, nbEcheances: 24, echeancePayee: 2, statut: 'actif', taux: 12.5, dateDecaissement: '2026-04-10' },
]

const STATUT_CREDIT = {
  actif: { label: 'Actif', cls: 'badge-green' },
  cloture: { label: 'Clôturé', cls: 'badge-gray' },
  en_defaut: { label: 'En défaut', cls: 'badge-red' },
  restructure: { label: 'Restructuré', cls: 'badge-amber' },
}

const distrib = [
  { tranche: '0-500k', nb: 12 }, { tranche: '500k-1M', nb: 28 },
  { tranche: '1M-2M', nb: 45 }, { tranche: '2M-5M', nb: 32 },
  { tranche: '5M+', nb: 8 },
]

export default function Portefeuille() {
  const [search, setSearch] = useState('')
  const [filtreStatut, setFiltreStatut] = useState('')

  const actifs = CREDITS.filter(c => c.statut === 'actif')
  const totalEncours = actifs.reduce((s, c) => s + c.solde, 0)
  const totalDefaut = CREDITS.filter(c => c.statut === 'en_defaut').reduce((s, c) => s + c.solde, 0)
  const par30 = totalEncours > 0 ? (totalDefaut / totalEncours * 100).toFixed(1) : 0

  const filtered = CREDITS.filter(c => {
    const matchSearch = !search || c.membre.toLowerCase().includes(search.toLowerCase())
    const matchStatut = !filtreStatut || c.statut === filtreStatut
    return matchSearch && matchStatut
  })

  return (
    <div className={styles.page}>
      <PageHeader title="Portefeuille" subtitle="Suivi des crédits actifs et clôturés" />
      <div className={styles.content}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}>
          {[
            { label: 'Encours total', val: `${(totalEncours/1e6).toFixed(1)} M FCFA`, icon: Briefcase, color: 'var(--green)' },
            { label: 'Crédits actifs', val: actifs.length, icon: CheckCircle, color: 'var(--green)' },
            { label: 'PAR30', val: `${par30}%`, icon: AlertTriangle, color: 'var(--amber)' },
            { label: 'En défaut', val: CREDITS.filter(c=>c.statut==='en_defaut').length, icon: TrendingUp, color: 'var(--red)' },
          ].map(({ label, val, icon: Icon, color }) => (
            <div key={label} className="card" style={{display:'flex',alignItems:'center',gap:14}}>
              <div style={{width:42,height:42,borderRadius:10,background:`${color}18`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <Icon size={20} color={color} />
              </div>
              <div>
                <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:4}}>{label}</div>
                <div style={{fontSize:22,fontWeight:700,fontFamily:'Space Grotesk',color}}>{val}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 340px',gap:16}}>
          <div className="card">
            <div style={{marginBottom:14}}>
              <div style={{fontSize:15,fontWeight:600,color:'var(--text-primary)'}}>Distribution des montants</div>
              <div style={{fontSize:12,color:'var(--text-muted)'}}>Répartition par tranche en nombre de crédits</div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={distrib} margin={{top:0,right:0,left:0,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2A3A" vertical={false} />
                <XAxis dataKey="tranche" tick={{fill:'#4A5568',fontSize:11}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill:'#4A5568',fontSize:11}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{background:'#0D1117',border:'1px solid #1E2A3A',borderRadius:8,color:'#F0F4F8',fontSize:12}} />
                <Bar dataKey="nb" fill="#34E5A0" radius={[4,4,0,0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <div style={{fontSize:15,fontWeight:600,color:'var(--text-primary)',marginBottom:14}}>Qualité du portefeuille</div>
            {[
              { label: 'Crédits sains', pct: 74, color: 'var(--green)' },
              { label: 'Surveillance', pct: 14, color: 'var(--blue)' },
              { label: 'Sous norme', pct: 8, color: 'var(--amber)' },
              { label: 'Douteux', pct: 4, color: 'var(--red)' },
            ].map(item => (
              <div key={item.label} style={{marginBottom:12}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                  <span style={{fontSize:12,color:'var(--text-secondary)'}}>{item.label}</span>
                  <span style={{fontSize:12,fontWeight:600,color:item.color}}>{item.pct}%</span>
                </div>
                <div style={{height:5,background:'var(--border)',borderRadius:3,overflow:'hidden'}}>
                  <div style={{width:`${item.pct}%`,height:'100%',background:item.color,borderRadius:3}} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className={styles.toolbar} style={{marginBottom:14}}>
            <div className={styles.searchBox}>
              <input className={styles.searchInput} placeholder="Rechercher un membre..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="input" style={{width:150}} value={filtreStatut} onChange={e => setFiltreStatut(e.target.value)}>
              <option value="">Tous</option>
              {Object.entries(STATUT_CREDIT).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div className="table-container">
            <table>
              <thead><tr>
                <th>Membre</th><th>Coopérative</th><th>Montant octroyé</th>
                <th>Solde restant</th><th>Mensualité</th><th>Avancement</th><th>Statut</th>
              </tr></thead>
              <tbody>
                {filtered.map(c => {
                  const pct = c.nbEcheances > 0 ? (c.echeancePayee / c.nbEcheances * 100) : 0
                  return (
                    <tr key={c.id}>
                      <td style={{color:'var(--text-primary)',fontWeight:500}}>{c.membre}</td>
                      <td>{c.cooperative}</td>
                      <td style={{fontWeight:600,color:'var(--text-primary)'}}>{fmtMoney(c.montant)}</td>
                      <td>{fmtMoney(c.solde)}</td>
                      <td>{fmtMoney(c.mensualite)}</td>
                      <td style={{minWidth:120}}>
                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                          <div style={{flex:1,height:4,background:'var(--border)',borderRadius:2,overflow:'hidden'}}>
                            <div style={{width:`${pct}%`,height:'100%',background: c.statut==='en_defaut' ? 'var(--red)' : 'var(--green)',borderRadius:2}} />
                          </div>
                          <span style={{fontSize:11,color:'var(--text-muted)',width:32}}>{Math.round(pct)}%</span>
                        </div>
                      </td>
                      <td><span className={`badge ${STATUT_CREDIT[c.statut].cls}`}>{STATUT_CREDIT[c.statut].label}</span></td>
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
