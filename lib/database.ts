// Simple file-based database until we set up Supabase properly

interface Probe {
  id: string
  text: string
  name: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
}

// For Vercel, we'll use a simple in-memory store with local storage fallback
// This will reset on each deployment, but it's better than nothing for now

let probesStore: Probe[] = [
  {
    id: '1',
    text: "Why do we seek certainty in a universe that seems fundamentally uncertain?",
    name: "Sarah M.",
    status: 'approved',
    created_at: "2026-03-02T10:00:00Z",
    updated_at: "2026-03-02T10:00:00Z"
  },
  {
    id: '2', 
    text: "What if our greatest innovations come from the courage to stand alone with an unpopular truth?",
    name: "Anonymous",
    status: 'approved',
    created_at: "2026-02-25T15:30:00Z",
    updated_at: "2026-02-25T15:30:00Z"
  },
  {
    id: '3',
    text: "Is questioning everything just another form of certainty?", 
    name: "Michael R.",
    status: 'approved',
    created_at: "2026-02-12T09:15:00Z",
    updated_at: "2026-02-12T09:15:00Z"
  }
]

export function getAllProbes(): Probe[] {
  return probesStore.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export function getApprovedProbes(): Probe[] {
  return probesStore
    .filter(probe => probe.status === 'approved')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export function getPendingProbes(): Probe[] {
  return probesStore
    .filter(probe => probe.status === 'pending')
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
}

export function addProbe(text: string, name: string): Probe {
  const newProbe: Probe = {
    id: Date.now().toString(),
    text: text.trim(),
    name: name.trim() || 'Anonymous',
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  
  probesStore.push(newProbe)
  return newProbe
}

export function updateProbeStatus(id: string, status: 'pending' | 'approved' | 'rejected'): Probe | null {
  const probe = probesStore.find(p => p.id === id)
  if (!probe) return null
  
  probe.status = status
  probe.updated_at = new Date().toISOString()
  return probe
}

export function deleteProbe(id: string): boolean {
  const index = probesStore.findIndex(p => p.id === id)
  if (index === -1) return false
  
  probesStore.splice(index, 1)
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
  
  return { total, pending, approved, rejected }
}