'use client'

import { useState, useEffect } from 'react'
import { supabase, type Probe } from '../../lib/supabase'

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
    
    // Load pending probes
    const { data: pendingData } = await supabase
      .from('probes')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
    
    // Load stats
    const { data: statsData } = await supabase
      .from('probes')
      .select('status')
    
    if (pendingData) {
      setProbes(pendingData)
    }
    
    if (statsData) {
      setStats({
        total: statsData.length,
        pending: statsData.filter(p => p.status === 'pending').length,
        approved: statsData.filter(p => p.status === 'approved').length,
        rejected: statsData.filter(p => p.status === 'rejected').length
      })
    }
    
    setLoading(false)
  }

  const handleAction = async (id: number, action: 'approve' | 'reject' | 'delete') => {
    if (action === 'delete') {
      await supabase.from('probes').delete().eq('id', id)
    } else {
      await supabase
        .from('probes')
        .update({ status: action === 'approve' ? 'approved' : 'rejected' })
        .eq('id', id)
    }
    
    loadProbes() // Reload data
  }

  const logout = () => {
    setIsAuthenticated(false)
    setPassword('')
    setProbes([])
  }

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
      
      <h2>Pending Submissions ({probes.length})</h2>
      
      {loading ? (
        <div className="loading">Loading...</div>
      ) : probes.length === 0 ? (
        <div className="empty">No pending submissions.</div>
      ) : (
        probes.map(probe => (
          <div key={probe.id} className="probe-item">
            <div className="probe-text">{probe.text}</div>
            <div className="probe-meta">
              By: {probe.name} • {new Date(probe.created_at).toLocaleString()}
            </div>
            <div className="actions">
              <button 
                onClick={() => handleAction(probe.id, 'approve')}
                className="btn approve"
              >
                ✓ Approve
              </button>
              <button 
                onClick={() => handleAction(probe.id, 'reject')}
                className="btn reject"
              >
                ✗ Reject
              </button>
              <button 
                onClick={() => handleAction(probe.id, 'delete')}
                className="btn delete"
                onClick={(e) => {
                  if (!confirm('Delete permanently?')) e.preventDefault()
                  else handleAction(probe.id, 'delete')
                }}
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
          max-width: 900px;
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
          margin-bottom: 40px;
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
        
        .probe-item {
          background: #f9f9f9;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 25px;
          margin-bottom: 20px;
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
          font-size: 14px;
          margin-bottom: 15px;
        }
        
        .actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        
        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        
        .approve { background: #4caf50; color: white; }
        .reject { background: #f44336; color: white; }
        .delete { background: #ff9800; color: white; }
        
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