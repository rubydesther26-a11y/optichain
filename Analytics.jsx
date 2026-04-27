import { useEffect, useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ReferenceLine, ResponsiveContainer
} from 'recharts'
import { api } from '../utils/api'

const COLORS = { Low: '#00ff88', Medium: '#ffb800', High: '#ff4466' }
const MODE_COLORS = { Sea: '#8b5cf6', Air: '#00d4ff', Road: '#00ff88' }

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#111827', border: '1px solid #1e2d4a', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: <b>{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</b>
          {p.payload?.event && <div style={{ color: '#c4b5fd', marginTop: 2 }}>⚡ {p.payload.event}</div>}
        </div>
      ))}
    </div>
  )
}

export default function Analytics() {
  const [data, setData] = useState(null)

  useEffect(() => { api.analytics().then(setData) }, [])
  if (!data) return <div style={{ color: 'var(--text-secondary)', paddingTop: 60, textAlign: 'center' }}>Loading...</div>

  const trendImprove = data.history.length >= 2
    ? (data.history[data.history.length - 1].efficiency - data.history[0].efficiency).toFixed(1)
    : 0

  const events = data.history.filter(h => h.event)

  return (
    <div>
      <div className="page-title">System Analytics</div>
      <div className="page-subtitle">Network performance, resource distribution, and optimization history.</div>

      <div className="analytics-grid">

        {/* Efficiency Trend */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Efficiency Trend — 14 Day History</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>System efficiency score over time with optimization events marked</div>
            </div>
            <span className="trend-badge">▲ +{trendImprove}% vs 14d ago</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gEff" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gUtil" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00ff88" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gRisk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff4466" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ff4466" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {events.map(e => (
                <ReferenceLine key={e.date} x={e.date} stroke="#8b5cf6" strokeDasharray="4 3" strokeWidth={1.5} />
              ))}
              <Area type="monotone" dataKey="efficiency" name="Efficiency Score" stroke="#00d4ff" fill="url(#gEff)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="utilization" name="Avg Utilization" stroke="#00ff88" fill="url(#gUtil)" strokeWidth={1.5} dot={false} />
              <Area type="monotone" dataKey="risk" name="Avg Risk Score" stroke="#ff4466" fill="url(#gRisk)" strokeWidth={1.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          {events.length > 0 && (
            <div className="event-chips">
              {events.map(e => (
                <span key={e.date} className="event-chip">⚡ {e.event}</span>
              ))}
            </div>
          )}
        </div>

        {/* Workforce + Risk */}
        <div className="chart-row chart-row-2">
          <div className="card">
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Workforce Load Distribution</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 12 }}>Current workload per team member</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.workers} layout="vertical" margin={{ left: 10, right: 20, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#64748b' }} width={90} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="load" name="Load %" radius={[0, 4, 4, 0]}>
                  {data.workers.map((w, i) => (
                    <Cell key={i} fill={w.load >= 85 ? '#ff4466' : w.load >= 65 ? '#ffb800' : '#00d4ff'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Global Risk Distribution</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 12 }}>Shipments by risk level</div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data.risk_distribution}
                  dataKey="count"
                  nameKey="level"
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={85}
                  paddingAngle={3}
                >
                  {data.risk_distribution.map((entry, i) => (
                    <Cell key={i} fill={COLORS[entry.level]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fleet Utilization */}
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Fleet Utilization Rates</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 12 }}>Load used vs capacity per vehicle type</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.vehicles} margin={{ top: 0, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" />
              <XAxis dataKey="type" tick={{ fontSize: 10, fill: '#64748b' }} angle={-20} textAnchor="end" />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="load" name="Load (t)" fill="#ff4466" radius={[4, 4, 0, 0]} />
              <Bar dataKey="capacity" name="Capacity (t)" fill="#00d4ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Shipment Mode */}
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Shipment Mode Performance</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 12 }}>Average utilization by transport mode</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={data.shipment_modes} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" />
              <XAxis dataKey="mode" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Shipments" radius={[4, 4, 0, 0]}>
                {data.shipment_modes.map((m, i) => (
                  <Cell key={i} fill={MODE_COLORS[m.mode] || '#00d4ff'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  )
}
