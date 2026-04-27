import { useEffect, useRef } from 'react'

let L = null

const WAYPOINTS = {
  "SHP-001": [[31.2,121.4],[25.0,150.0],[21.3,158.0],[34.0,-118.2]],
  "SHP-002": [[50.1,8.6],[53.0,-20.0],[45.0,-40.0],[40.7,-74.0]],
  "SHP-003": [[25.2,55.3],[22.0,60.0],[19.0,72.8]],
  "SHP-004": [[1.3,103.8],[5.0,115.0],[-15.0,130.0],[-33.8,151.2]],
  "SHP-005": [[40.7,-74.0],[45.0,-40.0],[51.5,-0.1]],
  "SHP-006": [[51.9,4.5],[20.0,-20.0],[0.0,0.0],[-33.9,18.4]],
  "SHP-007": [[35.6,139.6],[35.0,135.0],[37.5,126.9]],
  "SHP-008": [[41.8,-87.6],[30.0,-95.0],[19.4,-99.1]],
  "SHP-009": [[19.0,72.8],[18.0,60.0],[25.2,55.3]],
  "SHP-010": [[-33.8,151.2],[-35.0,160.0],[-36.8,174.7]],
}

function getLineColor(mode) {
  if (mode === 'Air') return '#00d4ff'
  if (mode === 'Sea') return '#8b5cf6'
  return '#00ff88'
}

export default function RouteMap({ shipment }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)

  useEffect(() => {
    if (!shipment) return

    async function initMap() {
      if (!L) {
        L = (await import('leaflet')).default
        delete L.Icon.Default.prototype._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        })
      }

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }

      if (!mapRef.current) return

      const map = L.map(mapRef.current, {
        center: [
          (shipment.lat_start + shipment.lat_end) / 2,
          (shipment.lng_start + shipment.lng_end) / 2
        ],
        zoom: 3,
        zoomControl: true,
        attributionControl: false,
      })

      mapInstanceRef.current = map

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap, © CARTO',
        maxZoom: 18,
      }).addTo(map)

      const color = getLineColor(shipment.mode)
      const waypoints = WAYPOINTS[shipment.id] || [
        [shipment.lat_start, shipment.lng_start],
        [shipment.lat_end, shipment.lng_end]
      ]

      // Draw glow + main line through waypoints
      L.polyline(waypoints, { color, weight: 6, opacity: 0.15 }).addTo(map)
      L.polyline(waypoints, {
        color,
        weight: 2,
        opacity: 0.9,
        dashArray: shipment.mode === 'Air' ? '8 6' : null
      }).addTo(map)

      // Origin marker
      const originIcon = L.divIcon({
        className: '',
        html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 0 10px ${color}"></div>`,
        iconSize: [14, 14], iconAnchor: [7, 7]
      })

      // Destination marker
      const destIcon = L.divIcon({
        className: '',
        html: `<div style="width:18px;height:18px;border-radius:50%;background:#ff4466;border:2px solid #fff;box-shadow:0 0 12px #ff4466;display:flex;align-items:center;justify-content:center;font-size:9px;color:#fff;font-weight:700">▶</div>`,
        iconSize: [18, 18], iconAnchor: [9, 9]
      })

      L.marker([shipment.lat_start, shipment.lng_start], { icon: originIcon })
        .addTo(map)
        .bindPopup(`<b>${shipment.origin}</b><br>Origin`)

      L.marker([shipment.lat_end, shipment.lng_end], { icon: destIcon })
        .addTo(map)
        .bindPopup(`<b>${shipment.destination}</b><br>Destination`)

      // Animated dot at midpoint
      const midWaypoint = waypoints[Math.floor(waypoints.length / 2)]
      const shipIcon = L.divIcon({
        className: '',
        html: `<div style="width:10px;height:10px;border-radius:50%;background:#fff;box-shadow:0 0 8px ${color};animation:pulse 1.5s infinite"></div>`,
        iconSize: [10, 10], iconAnchor: [5, 5]
      })
      L.marker(midWaypoint, { icon: shipIcon }).addTo(map)

      map.fitBounds(waypoints.map(w => [w[0], w[1]]), { padding: [40, 40] })
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [shipment])

  const color = shipment ? getLineColor(shipment.mode) : '#00d4ff'

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
        <div style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:1, color:'var(--text-secondary)' }}>
          📍 Live Route Map
        </div>
        {shipment && (
          <div style={{ display:'flex', gap:12, fontSize:11, color:'var(--text-secondary)' }}>
            <span style={{ color }}>● {shipment.mode}</span>
            <span>{shipment.origin} → {shipment.destination}</span>
          </div>
        )}
      </div>
      <div ref={mapRef} className="map-wrapper" style={{ height: 280, width: '100%' }} />
      <style>{`
        @keyframes pulse {
          0%,100% { transform: scale(1); opacity:1; }
          50% { transform: scale(1.6); opacity:0.6; }
        }
        .leaflet-control-zoom a {
          background: #111827 !important;
          border-color: #1e2d4a !important;
          color: #e2e8f0 !important;
        }
        .leaflet-popup-content-wrapper {
          background: #111827 !important;
          color: #e2e8f0 !important;
          border: 1px solid #1e2d4a !important;
          border-radius: 8px !important;
        }
        .leaflet-popup-tip { background: #111827 !important; }
      `}</style>
    </div>
  )
}