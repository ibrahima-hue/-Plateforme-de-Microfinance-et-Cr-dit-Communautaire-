import { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'
import { TrendingUp, TrendingDown, AlertTriangle, CreditCard, Users, Clock, ArrowUpRight } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import styles from './Dashboard.module.css'

const API = 'http://localhost:5000/api'

const DEMO_STATS = {
  encoursTotalMFCFA: 847.2, tauxRemboursement: 94.2,
  par30: 5.8, creditsActifs: 1248, membresActifs: 3420, demandesEnAttente: 24
}
const DEMO_EVOLUTION = [
  { mois: 'Jan', encours: 580, rembourse: 410 }, { mois: 'Fév', encours: 610, rembourse: 445 },
  { mois: 'Mar', encours: 645, rembourse: 478 }, { mois: 'Avr', encours: 670, rembourse: 502 },
  { mois: 'Mai', encours: 705, rembourse: 531 }, { mois: 'Jun', encours: 730, rembourse: 558 },
  { mois: 'Jul', encours: 748, rembourse: 574 }, { mois: 'Aoû', encours: 762, rembourse: 589 },
  { mois: 'Sep', encours: 788, rembourse: 612 }, { mois: 'Oct', encours: 810, rembourse: 634 },
  { mois: 'Nov', encours: 830, rembourse: 651 }, { mois: 'Déc', encours: 847, rembourse: 668 },
]
const DEMO_IMPAYEES = [
  { nom: 'Ndiaye', prenom: 'Ibrahima', montant_total: 95000, jours_retard: 40 },
  { nom: 'Mbaye', prenom: 'Cheikh', montant_total: 67500, jours_retard: 27 },
  { nom: 'Diop', prenom: 'Rokhaya', montant_total: 102000, jours_retard: 23 },
  { nom: 'Ba', prenom: 'Aminata', montant_total: 58000, jours_retard: 19 },
  { nom: 'Cissé', prenom: 'Modou', montant_total: 134000, jours_retard: 14 },
]
const DEMO_REPARTITION = [
  { nom: 'Caisse Centrale Dakar', nb_credits: 520, encours: 380 },
  { nom: 'Coopérative Pikine', nb_credits: 312, encours: 215 },
  { nom: 'Mutuelle Thiès', nb_credits: 248, encours: 162 },
  { nom: 'Caisse Ziguinchor', nb_credits: 168, encours: 90 },
]

const PIE_COLORS = ['#34E5A0', '#8B7CF6', '#3B82F6', '#F59E0B']

const fmtNum = n => new Intl.NumberFormat('fr-FR').format(n)
const fmtMoney = n => new Intl.NumberFormat('fr-FR').format(n) + ' FCFA'

export default function Dashboard() {
  const [stats, setStats] = useState(DEMO_STATS)
  const [evolution, setEvolution] = useState(DEMO_EVOLUTION)
  const [impayees, setImpayees] = useState(DEMO_IMPAYEES)
  const [repartition, setRepartition] = useState(DEMO_REPARTITION)
  const [period, setPeriod] = useState('12 mois')

  useEffect(() => {
    fetch(`${API}/dashboard/stats`).then(r => r.json()).then(setStats).catch(() => {})
    fetch(`${API}/dashboard/evolution`).then(r => r.json()).then(setEvolution).catch(() => {})
    fetch(`${API}/dashboard/impayees`).then(r => r.json()).then(setImpayees).catch(() => {})
    fetch(`${API}/dashboard/repartition`).then(r => r.json()).then(d => {
      setRepartition(d.map(x => ({ ...x, encours: Math.round(x.encours / 1000000) })))
    }).catch(() => {})
  }, [])

  const scoreValue = 78
  const scoreColor = scoreValue >= 70 ? '#34E5A0' : scoreValue >= 50 ? '#F59E0B' : '#EF4444'
  const circumference = 2 * Math.PI * 54
  const dash = (scoreValue / 100) * circumference

  return (
    <div className={styles.page}>
      <PageHeader title="Centre de pilotage des risques" badge="TEMPS RÉEL" />

      <div className={styles.content}>
        {/* KPI Cards */}
        <div className={styles.kpiGrid}>
          <KPICard
            label="Encours total"
            value={`${stats.encoursTotalMFCFA} M FCFA`}
            trend="+6,5%"
            trendUp={true}
            chart={<MiniChart data={DEMO_EVOLUTION} dataKey="encours" color="#34E5A0" />}
          />
          <KPICard
            label="Taux de remboursement"
            value={`${stats.tauxRemboursement}%`}
            trend="+1,2 pts"
            trendUp={true}
            chart={<MiniChart data={DEMO_EVOLUTION} dataKey="rembourse" color="#34E5A0" />}
          />
          <KPICard
            label={<>Portefeuille à risque<br /><span style={{color:'var(--amber)',fontSize:11}}>PAR30</span></>}
            value={`${stats.par30}%`}
            trend="+0,7 pt"
            trendUp={false}
            warn={true}
            chart={<MiniChart data={DEMO_EVOLUTION.map((d,i) => ({...d, par: 3+i*0.25}))} dataKey="par" color="#F59E0B" />}
          />
          <KPICard
            label="Crédits actifs"
            value={fmtNum(stats.creditsActifs)}
            trend="+48"
            trendUp={true}
            chart={<MiniChart data={DEMO_EVOLUTION.map((d,i) => ({...d, credits: 1100+i*12}))} dataKey="credits" color="#8B7CF6" purple />}
          />
        </div>

        <div className={styles.middleGrid}>
          {/* Evolution Chart */}
          <div className={`card ${styles.chartCard}`}>
            <div className={styles.chartHeader}>
              <div>
                <div className={styles.chartTitle}>Évolution de l'encours</div>
                <div className={styles.chartSub}>Décaissements nets · cumul du portefeuille (M FCFA)</div>
                <div className={styles.legend}>
                  <span className={styles.legendDot} style={{background:'#34E5A0'}} />Encours
                  <span className={styles.legendDot} style={{background:'#8B7CF6',marginLeft:12}} />Remboursé
                </div>
              </div>
              <div className={styles.periodBtns}>
                {['30 j','6 mois','12 mois'].map(p => (
                  <button key={p} className={`btn btn-sm ${period === p ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPeriod(p)}>{p}</button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={period === '30 j' ? DEMO_EVOLUTION.slice(-1) : period === '6 mois' ? DEMO_EVOLUTION.slice(-6) : DEMO_EVOLUTION} margin={{top:10,right:10,left:0,bottom:0}}>
                <defs>
                  <linearGradient id="encG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34E5A0" stopOpacity={0.18}/>
                    <stop offset="95%" stopColor="#34E5A0" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="remG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B7CF6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#8B7CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2A3A" vertical={false} />
                <XAxis dataKey="mois" tick={{fill:'#4A5568',fontSize:11}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill:'#4A5568',fontSize:11}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{background:'#0D1117',border:'1px solid #1E2A3A',borderRadius:8,color:'#F0F4F8',fontSize:12}} />
                <Area type="monotone" dataKey="encours" stroke="#34E5A0" strokeWidth={2} fill="url(#encG)" />
                <Area type="monotone" dataKey="rembourse" stroke="#8B7CF6" strokeWidth={2} fill="url(#remG)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Score de santé */}
          <div className={`card ${styles.scoreCard}`}>
            <div className={styles.chartTitle}>Score de santé</div>
            <div className={styles.chartSub}>Indice global du portefeuille</div>
            <div className={styles.scoreGauge}>
              <svg width="160" height="160" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="54" fill="none" stroke="#1E2A3A" strokeWidth="10"/>
                <circle cx="80" cy="80" r="54" fill="none" stroke={scoreColor}
                  strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={circumference * 0.25}
                  transform="rotate(-90 80 80)"
                  style={{filter:`drop-shadow(0 0 8px ${scoreColor}55)`}}
                />
                <text x="80" y="76" textAnchor="middle" fill={scoreColor} fontSize="32" fontWeight="700" fontFamily="Space Grotesk">{scoreValue}</text>
                <text x="80" y="93" textAnchor="middle" fill="#8B9BB4" fontSize="12">/100</text>
              </svg>
              <span className={`badge badge-green`} style={{position:'absolute',bottom:46}}>SAIN</span>
            </div>
            <div className={styles.scoreItems}>
              {[
                { label: 'Liquidité', value: 82, color: '#34E5A0' },
                { label: 'Concentration', value: 71, color: '#8B7CF6' },
                { label: 'Rentabilité', value: 76, color: '#3B82F6' },
                { label: 'Qualité portfolio', value: 74, color: '#F59E0B' },
              ].map(item => (
                <div key={item.label} className={styles.scoreItem}>
                  <span className={styles.scoreItemLabel}>{item.label}</span>
                  <div className={styles.scoreBar}>
                    <div className={styles.scoreBarFill} style={{width:`${item.value}%`, background: item.color}} />
                  </div>
                  <span className={styles.scoreItemVal} style={{color: item.color}}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.bottomGrid}>
          {/* Impayés */}
          <div className={`card ${styles.impayesCard}`}>
            <div className={styles.sectionHeader}>
              <div>
                <div className={styles.chartTitle} style={{display:'flex',alignItems:'center',gap:8}}>
                  <AlertTriangle size={16} color="#F59E0B" />Alertes impayés
                </div>
                <div className={styles.chartSub}>Échéances en retard</div>
              </div>
              <span className="badge badge-amber">{impayees.length} alertes</span>
            </div>
            <div className="table-container">
              <table>
                <thead><tr>
                  <th>Membre</th><th>Montant</th><th>Retard</th><th>Risque</th>
                </tr></thead>
                <tbody>
                  {impayees.map((imp, i) => (
                    <tr key={i}>
                      <td style={{color:'var(--text-primary)',fontWeight:500}}>{imp.prenom} {imp.nom}</td>
                      <td>{fmtMoney(imp.montant_total)}</td>
                      <td><span className={`badge ${imp.jours_retard > 30 ? 'badge-red' : 'badge-amber'}`}>{imp.jours_retard}j</span></td>
                      <td><span className={`badge ${imp.jours_retard > 30 ? 'badge-red' : 'badge-amber'}`}>{imp.jours_retard > 30 ? 'Élevé' : 'Modéré'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Répartition */}
          <div className={`card ${styles.repartCard}`}>
            <div className={styles.chartTitle}>Répartition par coopérative</div>
            <div className={styles.chartSub}>Encours en M FCFA</div>
            <div className={styles.pieRow}>
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={repartition} dataKey="encours" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3}>
                    {repartition.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{background:'#0D1117',border:'1px solid #1E2A3A',borderRadius:8,color:'#F0F4F8',fontSize:12}} />
                </PieChart>
              </ResponsiveContainer>
              <div className={styles.pieLegend}>
                {repartition.map((r, i) => (
                  <div key={i} className={styles.pieLegendItem}>
                    <span style={{width:10,height:10,borderRadius:3,background:PIE_COLORS[i],flexShrink:0,display:'block'}} />
                    <span className={styles.pieLegendLabel}>{r.nom.split(' ')[0]}</span>
                    <span className={styles.pieLegendVal}>{r.encours}M</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.repartStats}>
              <div className={styles.repartStat}>
                <div className={styles.repartStatVal}>{fmtNum(stats.membresActifs)}</div>
                <div className={styles.repartStatLabel}>Membres actifs</div>
              </div>
              <div className={styles.repartStat}>
                <div className={styles.repartStatVal}>{fmtNum(stats.demandesEnAttente)}</div>
                <div className={styles.repartStatLabel}>Demandes en attente</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function KPICard({ label, value, trend, trendUp, warn, chart }) {
  return (
    <div className={`card ${styles.kpiCard}`}>
      <div className={styles.kpiHeader}>
        <span className={styles.kpiLabel}>{label}</span>
        <span className={warn ? 'stat-trend-warn' : trendUp ? 'stat-trend-up' : 'stat-trend-down'}>
          {trendUp ? '▲' : '▼'} {trend}
        </span>
      </div>
      <div className={styles.kpiValue}>{value}</div>
      <div className={styles.kpiChart}>{chart}</div>
    </div>
  )
}

function MiniChart({ data, dataKey, color }) {
  return (
    <ResponsiveContainer width="100%" height={50}>
      <AreaChart data={data} margin={{top:5,right:0,left:0,bottom:0}}>
        <defs>
          <linearGradient id={`g${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.2}/>
            <stop offset="95%" stopColor={color} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={1.5} fill={`url(#g${dataKey})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
