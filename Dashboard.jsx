import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../utils/api'

function getRiskClass(risk) {
  if (risk >= 60) return 'risk-high'
  if (risk >= 30) return 'risk-medium'
  return 'risk-low'
}
function getRiskLabel(risk) {
  if (risk >= 60) return 'High'
  if (risk >= 30) return 'Medium'
  return 'Low'
}
function getUtilColor(u) {
  if (u >= 75) return 'var(--cyan)'
  if (u >= 40) return 'var(--yellow)'
  return 'var(--red)'
}
function getStatusBadge(status) {
  if (status === 'on_time') return <span className="status-badge status-on-time">✓ On Time</span>
  if (status === 'optimized') return <span className="status-badge status-optimized">⚡ Optimized</span>
  return <span className="status-badge status-attention">⚠ Needs Attention</span>
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    api.dashboard().then(setData)
  }, [])

  if (!data) return <div style={{color:'var(--text-secondary)', paddingTop:60, textAlign:'center'}}>Loading...</div>

  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: 28}}>
        <div>
          <div className="page-title">Command Center</div>
          <div className="page-subtitle">Real-time supply chain overview & anomaly detection.</div>
        </div>
        <div className="alert-badge">⚠ {data.inefficiencies} Inefficiencies Detected</div>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">System Efficiency</div>
          <div className="kpi-value">{data.system_efficiency}%</div>
          <div className="kpi-badge positive">▲ +2.4%</div>
          <div className="kpi-icon">📈</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Active Shipments</div>
          <div className="kpi-value">{data.active_shipments}</div>
          <div className="kpi-sub">{data.needs_attention} requiring attention</div>
          <div className="kpi-icon">🚢</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Workforce Load</div>
          <div className="kpi-value">{data.workforce_count}</div>
          <div className="kpi-sub">{data.overloaded_workers} overloaded teams</div>
          <div className="kpi-icon">👷</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Fleet Utilization</div>
          <div className="kpi-value">{data.avg_vehicle_utilization}%</div>
          <div className="kpi-sub">{data.idle_vehicles} idle units</div>
          <div className="kpi-icon">🚛</div>
        </div>
      </div>

      {/* Resources */}
      <div className="resource-grid">
        <div className="resource-card">
          <div className="resource-left">
            <div className="resource-icon" style={{background:'rgba(0,212,255,0.15)'}}>👷</div>
            <div>
              <div className="resource-name">Workers</div>
              <div className="resource-count">{data.workforce_count} Active</div>
            </div>
          </div>
          <div className="resource-right">
            <div className="resource-metric">{data.avg_worker_load}%</div>
            <div className="resource-label">Avg Workload</div>
          </div>
        </div>
        <div className="resource-card">
          <div className="resource-left">
            <div className="resource-icon" style={{background:'rgba(139,92,246,0.15)'}}>🚛</div>
            <div>
              <div className="resource-name">Vehicles</div>
              <div className="resource-count">{data.vehicle_count} Active</div>
            </div>
          </div>
          <div className="resource-right">
            <div className="resource-metric">{data.avg_vehicle_utilization}%</div>
            <div className="resource-label">Avg Utilization</div>
          </div>
        </div>
        <div className="resource-card">
          <div className="resource-left">
            <div className="resource-icon" style={{background:'rgba(255,184,0,0.15)'}}>🏭</div>
            <div>
              <div className="resource-name">Warehouses</div>
              <div className="resource-count">{data.warehouse_count} Active</div>
            </div>
          </div>
          <div className="resource-right">
            <div className="resource-metric">{data.critical_warehouses}</div>
            <div className="resource-label">Critical Capacity</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <div className="table-header">
          <span style={{color:'var(--cyan)'}}>⚡</span>
          <h3>Active Logistics Feed</h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Route</th><th>Status</th><th>Risk</th><th>Utilization</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.shipments.map(s => (
              <tr key={s.id}>
                <td><span className="shipment-id">{s.id}</span></td>
                <td>
                  <div className="route-name">{s.route}</div>
                  <div className="route-mode">{s.mode}</div>
                </td>
                <td>{getStatusBadge(s.status)}</td>
                <td>
                  <span className={`risk-badge ${getRiskClass(s.risk)}`}>
                    {getRiskLabel(s.risk)} {s.risk}
                  </span>
                </td>
                <td>
                  <div style={{display:'flex', alignItems:'center', gap:8}}>
                    <div className="util-bar">
                      <div className="util-fill" style={{width:`${s.utilization}%`, background: getUtilColor(s.utilization)}} />
                    </div>
                    <span style={{fontSize:12}}>{s.utilization}%</span>
                  </div>
                </td>
                <td>
                  <button className="btn btn-outline" onClick={() => navigate(`/twinsim/${s.id}`)}>
                    Details ↗
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
