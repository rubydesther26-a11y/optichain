const BASE = 'http://localhost:8000/api'
 
export const api = {
  dashboard: () => fetch(`${BASE}/dashboard`).then(r => r.json()),
  shipments: () => fetch(`${BASE}/shipments`).then(r => r.json()),
  shipment: (id) => fetch(`${BASE}/shipments/${id}`).then(r => r.json()),
  analytics: () => fetch(`${BASE}/analytics`).then(r => r.json()),
  simulate: (shipment_id, action) =>
    fetch(`${BASE}/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shipment_id, action })
    }).then(r => r.json()),
  apply: (shipment_id, action) =>
    fetch(`${BASE}/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shipment_id, action })
    }).then(r => r.json()),
  chat: (question, shipment_id) =>
    fetch(`${BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, shipment_id })
    }).then(r => r.json()),
}