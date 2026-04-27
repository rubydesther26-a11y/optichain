import { BrowserRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import TwinSim from './pages/TwinSim'

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">⛓</div>
        <div className="logo-text">OPTI<span>CHAIN</span></div>
      </div>
      <NavLink to="/" end className={({isActive})=>`nav-item ${isActive?'active':''}`}>
        📊 Dashboard
      </NavLink>
      <NavLink to="/analytics" className={({isActive})=>`nav-item ${isActive?'active':''}`}>
        📈 Analytics
      </NavLink>
      <NavLink to="/twinsim" className={({isActive})=>`nav-item ${isActive?'active':''}`}>
        🔬 Twin Sim
      </NavLink>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/twinsim" element={<TwinSim />} />
            <Route path="/twinsim/:id" element={<TwinSim />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}
