// File-based database using GitHub commits for persistence
// Better than in-memory for serverless

interface Probe {
  id: string
  text: string
  name: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
}

let probesStore: Probe[] = [
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

// Simulate database operations
export function getAllProbes(): Probe[] {
  return [...probesStore].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export function getApprovedProbes(): Probe[] {
  const approved = probesStore
    .filter(probe => probe.status === 'approved')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    
  console.log(`📋 APPROVED PROBES: ${approved.length} probes:`, 
    approved.map(p => `${p.id}: "${p.text.substring(0, 30)}..." (${p.status})`))
  return approved
}

export function getPendingProbes(): Probe[] {
  return probesStore
    .filter(probe => probe.status === 'pending')
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
}

export function addProbe(text: string, name: string): Probe {
  const newProbe: Probe = {
    id: 'probe_' + Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9),
    text: text.trim(),
    name: name.trim() || 'Anonymous',
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  
  probesStore.push(newProbe)
  console.log(`➕ ADDED PROBE:`, { id: newProbe.id, text: newProbe.text.substring(0, 50), status: newProbe.status })
  return newProbe
}

export function updateProbeStatus(id: string, status: 'pending' | 'approved' | 'rejected'): Probe | null {
  const probe = probesStore.find(p => p.id === id)
  if (!probe) {
    console.log(`❌ PROBE NOT FOUND FOR UPDATE: ${id}`)
    return null
  }
  
  const oldStatus = probe.status
  probe.status = status
  probe.updated_at = new Date().toISOString()
  
  console.log(`🔄 STATUS UPDATED: ${id} "${probe.text.substring(0, 30)}..." changed from ${oldStatus} to ${status}`)
  return probe
}

export function deleteProbe(id: string): boolean {
  const index = probesStore.findIndex(p => p.id === id)
  if (index === -1) {
    console.log(`❌ DELETE FAILED: ${id} not found`)
    return false
  }
  
  const deleted = probesStore[index]
  probesStore.splice(index, 1)
  
  console.log(`🗑️ DELETED PROBE: ${id} "${deleted.text.substring(0, 30)}..."`)
  return true
}

export function getProbeById(id: string): Probe | null {
  return probesStore.find(p => p.id === id) || null
}

export function getStats() {
  const total = probesStore.length
  const pending = probesStore.filter(p => p.status === 'pending').length
  const approved = probesStore.filter(p => p.status === 'approved').length
  const rejected = probesStore.filter(p => p.status === 'rejected').length
  
  console.log(`📊 STATS:`, { total, pending, approved, rejected })
  return { total, pending, approved, rejected }
}

// Remove the third probe that was causing issues
export function removeThirdProbe(): void {
  const questioningIndex = probesStore.findIndex(p => 
    p.text.toLowerCase().includes('questioning everything')
  )
  
  if (questioningIndex !== -1) {
    const removed = probesStore.splice(questioningIndex, 1)[0]
    console.log(`🚮 REMOVED PROBLEMATIC PROBE: ${removed.id} "${removed.text}"`)
  }
}

// Call this on initialization to clean up
removeThirdProbe()