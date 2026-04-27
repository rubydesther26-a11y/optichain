import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../utils/api'
import RouteMap from '../components/RouteMap'
 
const ACTIONS = [
  { value: 'reallocate_workforce', label: 'Reallocate Workforce' },
  { value: 'merge_adjacent', label: 'Merge with Adjacent Load' },
  { value: 'calculate_alt_route', label: 'Calculate Alt Route' },
]
 
function getLoadClass(load) {
  if (load >= 85) return 'load-critical'
  if (load >= 65) return 'load-high'
  return 'load-ok'
}
 
function getStatusColor(status) {
  if (status === 'on_time') return 'var(--green)'
  if (status === 'optimized') return 'var(--cyan)'
  return 'var(--yellow)'
}
 
export default function TwinSim() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [shipments, setShipments] = useState([])
  const [selected, setSelected] = useState(null)
  const [action, setAction] = useState('reallocate_workforce')
  const [simResult, setSimResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [chatQ, setChatQ] = useState('')
  const [chatA, setChatA] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
 
  useEffect(() => {
    api.shipments().then(data => {
      setShipments(data)
      const target = id ? data.find(s => s.id === id) : data[0]
      if (target) loadShipment(target.id)
    })
  }, [id])
 
  async function loadShipment(shipId) {
    setSimResult(null)
    setApplied(false)
    setChatA('')
    const detail = await api.shipment(shipId)
    setSelected(detail)
    setAction('reallocate_workforce')
  }
 
  async function runSim() {
    if (!selected) return
    setLoading(true)
    setSimResult(null)
    try {
      const result = await api.simulate(selected.id, action)
      setSimResult(result)
    } finally {
      setLoading(false)
    }
  }
 
  async function applyOpt() {
    if (!selected) return
    setApplying(true)
    try {
      const result = await api.apply(selected.id, action)
      setSelected({ ...selected, ...result.shipment, assigned_workers: selected.assigned_workers })
      setApplied(true)
    } finally {
      setApplying(false)
    }
  }
 
  async function askAI() {
    if (!chatQ.trim() || !selected) return
    setChatLoading(true)
    setChatA('')
    try {
      const res = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: chatQ, shipment_id: selected.id })
      })
      const data = await res.json()
      setChatA(data.answer)
    } catch {
      setChatA('Could not reach AI. Make sure backend is running.')
    } finally {
      setChatLoading(false)
    }
  }
 
  const delayColor = selected
    ? selected.delay_probability > 40 ? 'var(--red)' : selected.delay_probability > 20 ? 'var(--yellow)' : 'var(--green)'
    : 'var(--green)'
 
  return (
    <div>
      <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
 
      {selected && (
        <>
          <div className="sim-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="shp-title">#{selected.id}</div>
                <span style={{
                  background: selected.status === 'on_time' ? 'var(--green-dim)' : selected.status === 'optimized' ? 'var(--cyan-dim)' : 'var(--yellow-dim)',
                  color: getStatusColor(selected.status),
                  fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20
                }}>
                  {selected.status === 'on_time' ? 'Optimal' : selected.status === 'optimized' ? 'Optimized' : 'Needs Attention'}
                </span>
              </div>
              <div className="shp-route">{selected.origin} → {selected.destination}</div>
            </div>
            <div className="delay-indicator">
              <div className="delay-label">Delay Probability</div>
              <div className="delay-bar">
                <div className="delay-fill" style={{ width: `${selected.delay_probability}%`, background: delayColor }} />
              </div>
              <div className="delay-value" style={{ color: delayColor }}>{selected.delay_probability}%</div>
            </div>
          </div>
 
          <div className="twinsim-layout">
            <div className="twinsim-left">
 
              {/* MAP */}
              <div className="card">
                <RouteMap shipment={selected} />
              </div>
 
              {/* SIMULATION */}
              <div className="card">
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Digital Twin Simulation</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>Test interventions before applying to active network</div>
 
                <div className="sim-controls">
                  <select value={action} onChange={e => { setAction(e.target.value); setSimResult(null); setApplied(false) }}>
                    {ACTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                  </select>
                  <button className="btn btn-cyan" onClick={runSim} disabled={loading}>
                    {loading ? '⏳ Gemini thinking...' : '⚡ Run Simulation'}
                  </button>
                </div>
 
                {loading && (
                  <div style={{ textAlign: 'center', padding: '20px', color: 'var(--cyan)', fontSize: 13 }}>
                    🤖 Gemini AI is analyzing your shipment...
                  </div>
                )}
 
                {simResult && (
                  <>
                    <div style={{ fontSize: 11, color: 'var(--purple)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      ✨ Powered by Gemini AI
                    </div>
                    <div className="before-after">
                      <div className="state-box state-current">
                        <div className="state-label">Current State</div>
                        <div className="state-row">
                          <span>Efficiency</span>
                          <span className="state-metric">{simResult.current.efficiency}%</span>
                        </div>
                        <div className="state-row">
                          <span>Risk Score</span>
                          <span className="state-metric">{simResult.current.risk_score}</span>
                        </div>
                        <div className="state-row">
                          <span>Est. Time</span>
                          <span className="state-metric">{simResult.current.est_time}h</span>
                        </div>
                      </div>
                      <div className="state-box state-projected">
                        <div className="state-label">Projected State</div>
                        <div className="state-row">
                          <span>Efficiency</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className="state-delta delta-pos">+{simResult.projected.efficiency - simResult.current.efficiency}</span>
                            <span className="state-metric">{simResult.projected.efficiency}%</span>
                          </div>
                        </div>
                        <div className="state-row">
                          <span>Risk Score</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className="state-delta delta-neg">-{simResult.current.risk_score - simResult.projected.risk_score}</span>
                            <span className="state-metric">{simResult.projected.risk_score}</span>
                          </div>
                        </div>
                        <div className="state-row">
                          <span>Est. Time</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className="state-delta delta-neg">-{(simResult.current.est_time - simResult.projected.est_time).toFixed(1)}h</span>
                            <span className="state-metric">{simResult.projected.est_time}h</span>
                          </div>
                        </div>
                      </div>
                    </div>
 
                    <div className="recommendation-box">
                      <div style={{ fontSize: 18 }}>🤖</div>
                      <div>
                        <div className="rec-title">Gemini AI Recommendation</div>
                        <div className="rec-text">{simResult.recommendation}</div>
                      </div>
                    </div>
 
                    {!applied ? (
                      <button className="btn btn-green" style={{ marginTop: 14, width: '100%', padding: '10px' }} onClick={applyOpt} disabled={applying}>
                        {applying ? '⏳ Applying...' : '⚡ Apply to Network'}
                      </button>
                    ) : (
                      <div style={{ marginTop: 14, textAlign: 'center', color: 'var(--green)', fontWeight: 700, fontSize: 14 }}>
                        ✅ Optimization Applied Successfully
                      </div>
                    )}
                  </>
                )}
              </div>
 
              {/* GEMINI CHAT */}
              <div className="card">
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>🤖 Ask Gemini AI</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
                  Ask anything about this shipment or your supply chain
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <input
                    value={chatQ}
                    onChange={e => setChatQ(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && askAI()}
                    placeholder="e.g. Why is this shipment high risk?"
                    style={{
                      flex: 1, background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)', borderRadius: 8,
                      padding: '8px 12px', color: 'var(--text-primary)', fontSize: 13
                    }}
                  />
                  <button className="btn btn-cyan" onClick={askAI} disabled={chatLoading}>
                    {chatLoading ? '...' : 'Ask'}
                  </button>
                </div>
 
                {/* Quick questions */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                  {[
                    'Why is this shipment high risk?',
                    'Which shipments need urgent attention?',
                    'How can I reduce overall delay probability?'
                  ].map(q => (
                    <button key={q} onClick={() => { setChatQ(q); }} style={{
                      background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                      color: 'var(--text-secondary)', padding: '4px 10px',
                      borderRadius: 20, fontSize: 11, cursor: 'pointer'
                    }}>{q}</button>
                  ))}
                </div>
 
                {chatLoading && (
                  <div style={{ color: 'var(--cyan)', fontSize: 13, padding: '8px 0' }}>
                    🤖 Gemini is thinking...
                  </div>
                )}
 
                {chatA && (
                  <div style={{
                    background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)',
                    borderRadius: 10, padding: 14
                  }}>
                    <div style={{ fontSize: 11, color: 'var(--cyan)', fontWeight: 700, marginBottom: 6 }}>
                      ✨ Gemini AI Response
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>
                      {chatA}
                    </div>
                  </div>
                )}
              </div>
 
            </div>
 
            {/* RIGHT PANEL */}
            <div className="twinsim-right">
              <div className="card">
                <div className="card-title">Select Shipment</div>
                <select style={{ width: '100%' }} value={selected.id}
                  onChange={e => { navigate(`/twinsim/${e.target.value}`); loadShipment(e.target.value) }}>
                  {shipments.map(s => (
                    <option key={s.id} value={s.id}>{s.id} — {s.route}</option>
                  ))}
                </select>
              </div>
 
              <div className="card">
                <div className="card-title">📡 Telemetry</div>
                <div className="telemetry-row">
                  <span className="tel-key">Status</span>
                  <span className="tel-val" style={{ color: getStatusColor(selected.status) }}>
                    {selected.status === 'on_time' ? 'On Time' : selected.status === 'optimized' ? 'Optimized' : 'Needs Attention'}
                  </span>
                </div>
                <div className="telemetry-row">
                  <span className="tel-key">Mode</span>
                  <span className="tel-val">{selected.mode}</span>
                </div>
                <div className="telemetry-row">
                  <span className="tel-key">Risk Level</span>
                  <span className="tel-val" style={{ color: selected.risk >= 60 ? 'var(--red)' : selected.risk >= 30 ? 'var(--yellow)' : 'var(--green)' }}>
                    {selected.risk >= 60 ? 'High' : selected.risk >= 30 ? 'Medium' : 'Low'}
                  </span>
                </div>
                <div className="util-section">
                  <div className="util-numbers">
                    <span>Load Utilization</span>
                    <span style={{ color: 'var(--cyan)' }}>{selected.utilization}%</span>
                  </div>
                  <div className="util-track">
                    <div className="util-fill-full" style={{ width: `${selected.utilization}%` }} />
                  </div>
                  <div className="util-numbers" style={{ marginTop: 4 }}>
                    <span>{selected.load}t</span>
                    <span>{selected.capacity}t max</span>
                  </div>
                </div>
              </div>
 
              <div className="card">
                <div className="card-title">👥 Assigned Resources</div>
                {selected.assigned_workers && selected.assigned_workers.length > 0 ? (
                  selected.assigned_workers.map(w => (
                    <div key={w.id} className="worker-chip">
                      <div>
                        <div className="worker-name">{w.name}</div>
                        <div className="worker-role">{w.role}</div>
                      </div>
                      <span className={`worker-load-badge ${getLoadClass(w.load)}`}>{w.load}% Load</span>
                    </div>
                  ))
                ) : (
                  <div className="no-workers">No workers assigned</div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}