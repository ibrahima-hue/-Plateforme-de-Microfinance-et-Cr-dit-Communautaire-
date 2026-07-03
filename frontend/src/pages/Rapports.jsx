import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { FileBarChart, Download, TrendingUp, DollarSign } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import styles from './Page.module.css'

const fmtMoney = n => new Intl.NumberFormat('fr-FR').format(n)

const MENSUEL = [
  { mois:'Jan', decaissements:85, recouvrements:68, impayees:3.2 },
  { mois:'Fév', decaissements:92, recouvrements:75, impayees:2.8 },
  { mois:'Mar', decaissements:78, recouvrements:81, impayees:3.5 },
  { mois:'Avr', decaissements:105, recouvrements:88, impayees:3.1 },
  { mois:'Mai', decaissements:118, recouvrements:96, impayees:5.2 },
  { mois:'Jun', decaissements:95, recouvrements:92, impayees:5.8 },
]

const PAR_COOP = [
  { name:'Caisse Centrale', encours: 380, remboursement: 94.8 },
  { name:'Pikine', encours: 215, remboursement: 93.2 },
  { name:'Thiès', encours: 162, remboursement: 95.1 },
  { name:'Ziguinchor', encours: 90, remboursement: 91.4 },
]

const PIE_COLORS = ['#34E5A0','#8B7CF6','#3B82F6','#F59E0B']

export default function Rapports() {
  const totDecaissements = MENSUEL.reduce((s,m) => s+m.decaissements, 0)
  const totRecouvrements = MENSUEL.reduce((s,m) => s+m.recouvrements, 0)

  return (
    <div className={styles.page}>
      <PageHeader
        title="Rapports & Analyses"
        subtitle="Synthèse de l'activité de la plateforme"
        actions={
          <button className="btn btn-primary">
            <Download size={14} /> Exporter PDF
          </button>
        }
      />
      <div className={styles.content}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}>
          {[
            { label:'Total décaissé (6 mois)', val: `${fmtMoney(totDecaissements)} M FCFA`, color:'var(--green)' },
            { label:'Total recouvré (6 mois)', val: `${fmtMoney(totRecouvrements)} M FCFA`, color:'var(--purple)' },
            { label:'Taux moyen recouvrement', val: '94.2%', color:'var(--blue)' },
            { label:'Clients servis', val: '3 420', color:'var(--amber)' },
          ].map(({ label, val, color }) => (
            <div key={label} className="card">
              <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:8}}>{label}</div>
              <div style={{fontSize:20,fontWeight:700,fontFamily:'Space Grotesk',color}}>{val}</div>
            </div>
          ))}
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
          <div className="card">
            <div style={{marginBottom:14}}>
              <div style={{fontSize:15,fontWeight:600,color:'var(--text-primary)'}}>Décaissements vs Recouvrements</div>
              <div style={{fontSize:12,color:'var(--text-muted)'}}>En millions FCFA, sur 6 mois</div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={MENSUEL} margin={{top:0,right:10,left:0,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2A3A" vertical={false} />
                <XAxis dataKey="mois" tick={{fill:'#4A5568',fontSize:11}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill:'#4A5568',fontSize:11}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{background:'#0D1117',border:'1px solid #1E2A3A',borderRadius:8,color:'#F0F4F8',fontSize:12}} />
                <Bar dataKey="decaissements" name="Décaissements" fill="#34E5A0" radius={[4,4,0,0]} opacity={0.85} />
                <Bar dataKey="recouvrements" name="Recouvrements" fill="#8B7CF6" radius={[4,4,0,0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <div style={{marginBottom:14}}>
              <div style={{fontSize:15,fontWeight:600,color:'var(--text-primary)'}}>Évolution PAR30</div>
              <div style={{fontSize:12,color:'var(--text-muted)'}}>Taux de portefeuille à risque &gt;30 jours</div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={MENSUEL} margin={{top:0,right:10,left:0,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2A3A" vertical={false} />
                <XAxis dataKey="mois" tick={{fill:'#4A5568',fontSize:11}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill:'#4A5568',fontSize:11}} axisLine={false} tickLine={false} domain={[0,8]} />
                <Tooltip contentStyle={{background:'#0D1117',border:'1px solid #1E2A3A',borderRadius:8,color:'#F0F4F8',fontSize:12}} />
                <Line type="monotone" dataKey="impayees" name="PAR30 %" stroke="#F59E0B" strokeWidth={2} dot={{fill:'#F59E0B',r:4}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 300px',gap:16}}>
          <div className="card">
            <div style={{marginBottom:14}}>
              <div style={{fontSize:15,fontWeight:600,color:'var(--text-primary)'}}>Performance par coopérative</div>
            </div>
            <div className="table-container">
              <table>
                <thead><tr><th>Coopérative</th><th>Encours (M FCFA)</th><th>Tx remboursement</th><th>Performance</th></tr></thead>
                <tbody>
                  {PAR_COOP.map(c => (
                    <tr key={c.name}>
                      <td style={{color:'var(--text-primary)',fontWeight:500}}>{c.name}</td>
                      <td style={{fontWeight:600,color:'var(--green)'}}>{c.encours} M</td>
                      <td style={{color: c.remboursement >= 94 ? 'var(--green)' : c.remboursement >= 90 ? 'var(--amber)' : 'var(--red)', fontWeight:600}}>{c.remboursement}%</td>
                      <td>
                        <div style={{width:100,height:5,background:'var(--border)',borderRadius:3,overflow:'hidden'}}>
                          <div style={{width:`${c.remboursement}%`,height:'100%',background:c.remboursement>=94?'var(--green)':'var(--amber)',borderRadius:3}} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div style={{fontSize:15,fontWeight:600,color:'var(--text-primary)',marginBottom:14}}>Répartition encours</div>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={PAR_COOP} dataKey="encours" nameKey="name" cx="50%" cy="50%" outerRadius={70} paddingAngle={3}>
                  {PAR_COOP.map((_,i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{background:'#0D1117',border:'1px solid #1E2A3A',borderRadius:8,color:'#F0F4F8',fontSize:12}} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{display:'flex',flexDirection:'column',gap:6,marginTop:8}}>
              {PAR_COOP.map((c,i) => (
                <div key={c.name} style={{display:'flex',alignItems:'center',gap:8,fontSize:12}}>
                  <span style={{width:10,height:10,borderRadius:2,background:PIE_COLORS[i],flexShrink:0}} />
                  <span style={{flex:1,color:'var(--text-secondary)'}}>{c.name}</span>
                  <span style={{color:'var(--text-primary)',fontWeight:600}}>{c.encours}M</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
