'use client'

import { useState, useEffect } from 'react'

interface Probe {
  id: string
  text: string
  name: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [probes, setProbes] = useState<Probe[]>([])
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  })
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  const ADMIN_PASSWORD = 'probe2026admin'

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      setError('')
      loadProbes()
    } else {
      setError('Incorrect password')
    }
  }

  const loadProbes = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/probes')
      if (response.ok) {
        const data = await response.json()
        setProbes(data.probes || [])
        setStats(data.stats || { total: 0, pending: 0, approved: 0, rejected: 0 })
      }
    } catch (error) {
      console.error('Error loading probes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (id: string, action: string, status?: string) => {
    try {
      const response = await fetch('/api/admin/probes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          id,
          status
        })
      })

      if (response.ok) {
        loadProbes() // Reload data
      } else {
        const result = await response.json()
        alert(result.error || 'Action failed')
      }
    } catch (error) {
      console.error('Error performing action:', error)
      alert('Network error')
    }
  }

  const logout = () => {
    setIsAuthenticated(false)
    setPassword('')
    setProbes([])
  }

  const filteredProbes = probes.filter(probe => {
    if (filter === 'all') return true
    return probe.status === filter
  })

  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <h1>Probe Admin</h1>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleLogin}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            required
          />
          <button type="submit">Login</button>
        </form>
        
        <style jsx>{`
          .login-container {
            font-family: -apple-system, sans-serif;
            max-width: 400px;
            margin: 100px auto;
            padding: 40px;
          }
          
          h1 {
            text-align: center;
            margin-bottom: 30px;
          }
          
          input {
            width: 100%;
            padding: 15px;
            margin: 10px 0;
            font-size: 16px;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-sizing: border-box;
          }
          
          button {
            background: #000;
            color: #fff;
            padding: 15px 30px;
            border: none;
            font-size: 16px;
            cursor: pointer;
            border-radius: 4px;
            width: 100%;
          }
          
          .error {
            color: red;
            margin-bottom: 20px;
            text-align: center;
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="admin-container">
      <div className="header">
        <h1>Probe Admin Panel</h1>
        <button onClick={logout} className="logout">Logout</button>
      </div>
      
      <div className="stats">
        <div className="stat">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat">
          <div className="stat-number">{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat">
          <div className="stat-number">{stats.approved}</div>
          <div className="stat-label">Approved</div>
        </div>
        <div className="stat">
          <div className="stat-number">{stats.rejected}</div>
          <div className="stat-label">Rejected</div>
        </div>
      </div>
      
      <div className="filters">
        <button 
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All ({stats.total})
        </button>
        <button 
          className={filter === 'pending' ? 'active' : ''}
          onClick={() => setFilter('pending')}
        >
          Pending ({stats.pending})
        </button>
        <button 
          className={filter === 'approved' ? 'active' : ''}
          onClick={() => setFilter('approved')}
        >
          Approved ({stats.approved})
        </button>
        <button 
          className={filter === 'rejected' ? 'active' : ''}
          onClick={() => setFilter('rejected')}
        >
          Rejected ({stats.rejected})
        </button>
      </div>
      
      <h2>
        {filter === 'all' ? 'All Probes' : 
         filter === 'pending' ? 'Pending Review' :
         filter === 'approved' ? 'Published Probes' :
         'Rejected Probes'} 
        ({filteredProbes.length})
      </h2>
      
      {loading ? (
        <div className="loading">Loading...</div>
      ) : filteredProbes.length === 0 ? (
        <div className="empty">No {filter === 'all' ? '' : filter} probes found.</div>
      ) : (
        filteredProbes.map(probe => (
          <div key={probe.id} className={`probe-item status-${probe.status}`}>
            <div className="probe-header">
              <div className={`status-badge status-${probe.status}`}>
                {probe.status.toUpperCase()}
              </div>
              <div className="probe-id">ID: {probe.id}</div>
            </div>
            
            <div className="probe-text">{probe.text}</div>
            <div className="probe-meta">
              By: {probe.name} • 
              Submitted: {new Date(probe.created_at).toLocaleString()} • 
              Updated: {new Date(probe.updated_at).toLocaleString()}
            </div>
            
            <div className="actions">
              {probe.status !== 'approved' && (
                <button 
                  onClick={() => handleAction(probe.id, 'update_status', 'approved')}
                  className="btn approve"
                >
                  ✓ Approve
                </button>
              )}
              
              {probe.status === 'approved' && (
                <button 
                  onClick={() => handleAction(probe.id, 'update_status', 'rejected')}
                  className="btn unpublish"
                >
                  📤 Unpublish
                </button>
              )}
              
              {probe.status !== 'rejected' && (
                <button 
                  onClick={() => handleAction(probe.id, 'update_status', 'rejected')}
                  className="btn reject"
                >
                  ✗ Reject
                </button>
              )}
              
              {probe.status !== 'pending' && (
                <button 
                  onClick={() => handleAction(probe.id, 'update_status', 'pending')}
                  className="btn pending"
                >
                  ⏳ Mark Pending
                </button>
              )}
              
              <button 
                onClick={() => {
                  if (confirm(`Delete this probe permanently?\n\n"${probe.text.substring(0, 100)}..."`)) {
                    handleAction(probe.id, 'delete')
                  }
                }}
                className="btn delete"
              >
                🗑 Delete
              </button>
            </div>
          </div>
        ))
      )}
      
      <style jsx>{`
        .admin-container {
          font-family: -apple-system, sans-serif;
          max-width: 1000px;
          margin: 40px auto;
          padding: 40px;
          line-height: 1.6;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #eee;
        }
        
        .logout {
          background: #666;
          color: white;
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .stat {
          background: #f9f9f9;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
        }
        
        .stat-number {
          font-size: 2em;
          font-weight: bold;
          color: #333;
        }
        
        .stat-label {
          color: #666;
          font-size: 0.9em;
        }
        
        .filters {
          display: flex;
          gap: 10px;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }
        
        .filters button {
          padding: 8px 16px;
          border: 2px solid #ddd;
          background: #fff;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .filters button.active {
          background: #000;
          color: #fff;
          border-color: #000;
        }
        
        .probe-item {
          background: #f9f9f9;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 25px;
          margin-bottom: 20px;
          border-left: 4px solid #ddd;
        }
        
        .probe-item.status-pending {
          border-left-color: #ff9800;
          background: #fff9c4;
        }
        
        .probe-item.status-approved {
          border-left-color: #4caf50;
          background: #e8f5e8;
        }
        
        .probe-item.status-rejected {
          border-left-color: #f44336;
          background: #ffebee;
        }
        
        .probe-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        
        .status-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }
        
        .status-badge.status-pending {
          background: #ff9800;
          color: white;
        }
        
        .status-badge.status-approved {
          background: #4caf50;
          color: white;
        }
        
        .status-badge.status-rejected {
          background: #f44336;
          color: white;
        }
        
        .probe-id {
          font-size: 12px;
          color: #666;
          font-family: monospace;
        }
        
        .probe-text {
          font-size: 16px;
          margin-bottom: 15px;
          background: #fff;
          padding: 15px;
          border-radius: 4px;
          line-height: 1.6;
        }
        
        .probe-meta {
          color: #666;
          font-size: 13px;
          margin-bottom: 15px;
        }
        
        .actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        
        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.2s;
        }
        
        .approve { background: #4caf50; color: white; }
        .reject { background: #f44336; color: white; }
        .delete { background: #ff9800; color: white; }
        .pending { background: #2196f3; color: white; }
        .unpublish { background: #9c27b0; color: white; }
        
        .btn:hover {
          opacity: 0.8;
          transform: translateY(-1px);
        }
        
        .loading, .empty {
          text-align: center;
          color: #666;
          font-style: italic;
          padding: 40px;
        }
        
        @media (max-width: 600px) {
          .admin-container {
            padding: 20px;
          }
          
          .stats {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .actions {
            flex-direction: column;
          }
          
          .btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}