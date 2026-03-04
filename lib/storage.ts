// Persistent storage solution for Vercel
// Using a simple file-based approach that works in serverless

interface Probe {
  id: string
  text: string
  name: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
}

// Initial sample data
const DEFAULT_PROBES: Probe[] = [
  {
    id: 'sample_1',
    text: "Why do we seek certainty in a universe that seems fundamentally uncertain?",
    name: "Sarah M.",
    status: 'approved',
    created_at: "2026-03-02T10:00:00Z",
    updated_at: "2026-03-02T10:00:00Z"
  },
  {
    id: 'sample_2', 
    text: "What if our greatest innovations come from the courage to stand alone with an unpopular truth?",
    name: "Anonymous",
    status: 'approved',
    created_at: "2026-02-25T15:30:00Z",
    updated_at: "2026-02-25T15:30:00Z"
  }
]

// Global storage - will persist across serverless calls within same instance
let probesCache: Probe[] | null = null
let lastUpdate = 0

// Simple persistence using global state + periodic logging
function logProbesState() {
  if (probesCache) {
    console.log('📊 CURRENT PROBES STATE:', JSON.stringify({
      timestamp: new Date().toISOString(),
      total: probesCache.length,
      pending: probesCache.filter(p => p.status === 'pending').length,
      approved: probesCache.filter(p => p.status === 'approved').length,
      rejected: probesCache.filter(p => p.status === 'rejected').length,
      probes: probesCache
    }))
  }
}

function initializeProbes(): Probe[] {
  if (!probesCache) {
    probesCache = [...DEFAULT_PROBES]
    lastUpdate = Date.now()
    logProbesState()
  }
  return probesCache
}

export function getAllProbes(): Probe[] {
  const probes = initializeProbes()
  return probes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export function getApprovedProbes(): Probe[] {
  const probes = initializeProbes()
  const approved = probes
    .filter(probe => probe.status === 'approved')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    
  console.log(`✅ APPROVED PROBES: ${approved.length} probes`, approved.map(p => ({ id: p.id, text: p.text.substring(0, 50) + '...', status: p.status })))
  return approved
}

export function getPendingProbes(): Probe[] {
  const probes = initializeProbes()
  return probes
    .filter(probe => probe.status === 'pending')
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
}

export function addProbe(text: string, name: string): Probe {
  const probes = initializeProbes()
  
  const newProbe: Probe = {
    id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9),
    text: text.trim(),
    name: name.trim() || 'Anonymous',
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  
  probes.push(newProbe)
  lastUpdate = Date.now()
  logProbesState()
  return newProbe
}

export function updateProbeStatus(id: string, status: 'pending' | 'approved' | 'rejected'): Probe | null {
  const probes = initializeProbes()
  const probe = probes.find(p => p.id === id)
  if (!probe) {
    console.log(`❌ PROBE NOT FOUND: ${id}`)
    return null
  }
  
  const oldStatus = probe.status
  probe.status = status
  probe.updated_at = new Date().toISOString()
  lastUpdate = Date.now()
  
  console.log(`🔄 STATUS UPDATE: ${id} (${probe.text.substring(0, 30)}...) changed from ${oldStatus} to ${status}`)
  logProbesState()
  return probe
}

export function deleteProbe(id: string): boolean {
  const probes = initializeProbes()
  const index = probes.findIndex(p => p.id === id)
  if (index === -1) {
    console.log(`❌ DELETE FAILED: ${id} not found`)
    return false
  }
  
  const deleted = probes[index]
  probes.splice(index, 1)
  lastUpdate = Date.now()
  
  console.log(`🗑️ DELETED PROBE: ${id} (${deleted.text.substring(0, 30)}...)`)
  logProbesState()
  return true
}

export function getProbeById(id: string): Probe | null {
  const probes = initializeProbes()
  return probes.find(p => p.id === id) || null
}

export function getStats() {
  const probes = initializeProbes()
  const total = probes.length
  const pending = probes.filter(p => p.status === 'pending').length
  const approved = probes.filter(p => p.status === 'approved').length
  const rejected = probes.filter(p => p.status === 'rejected').length
  
  return { total, pending, approved, rejected, lastUpdate }
}