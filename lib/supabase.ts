export interface Probe {
  id: number
  text: string
  name: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
}

const supabaseUrl = 'https://fwyczhwlgygzebunfojq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3eWN6aHdsZ3lnemVidW5mb2pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NDE0MDIsImV4cCI6MjA4ODIxNzQwMn0.L6q3b07s3WAXokfvZgKBY0jsgHdKkCKOrtOS-GDbHSE'

async function supabaseRequest(endpoint: string, options: RequestInit = {}) {
  console.log(`🔗 SUPABASE REQUEST: ${endpoint}`)
  
  const response = await fetch(`${supabaseUrl}/rest/v1/${endpoint}`, {
    ...options,
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...options.headers,
    }
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error('Supabase error:', response.status, errorText)
    throw new Error(`Supabase request failed: ${response.status}`)
  }
  
  const data = await response.json()
  console.log(`📊 SUPABASE RESPONSE:`, { endpoint, count: Array.isArray(data) ? data.length : 'not array', data: Array.isArray(data) ? data.map(p => p.id) : data })
  return data
}

export async function getAllProbes(): Promise<Probe[]> {
  try {
    const probes = await supabaseRequest('probes?order=created_at.desc')
    return probes
  } catch (error) {
    console.error('Error fetching all probes:', error)
    return []
  }
}

export async function getApprovedProbes(): Promise<Probe[]> {
  try {
    const probes = await supabaseRequest('probes?status=eq.approved&order=created_at.desc')
    return probes
  } catch (error) {
    console.error('Error fetching approved probes:', error)
    return []
  }
}

export async function addProbe(text: string, name: string): Promise<Probe> {
  try {
    const [newProbe] = await supabaseRequest('probes', {
      method: 'POST',
      body: JSON.stringify({
        text: text.trim(),
        name: name.trim() || 'Anonymous',
        status: 'pending'
      })
    })
    
    return newProbe
  } catch (error) {
    console.error('Error adding probe:', error)
    throw error
  }
}

export async function updateProbeStatus(id: number, status: 'pending' | 'approved' | 'rejected'): Promise<Probe> {
  try {
    const [updatedProbe] = await supabaseRequest(`probes?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status,
        updated_at: new Date().toISOString()
      })
    })
    
    return updatedProbe
  } catch (error) {
    console.error('Error updating probe:', error)
    throw error
  }
}

export async function deleteProbe(id: number): Promise<void> {
  try {
    await supabaseRequest(`probes?id=eq.${id}`, {
      method: 'DELETE'
    })
  } catch (error) {
    console.error('Error deleting probe:', error)
    throw error
  }
}

export async function getStats() {
  try {
    const allProbes = await getAllProbes()
    const total = allProbes.length
    const pending = allProbes.filter(p => p.status === 'pending').length
    const approved = allProbes.filter(p => p.status === 'approved').length
    const rejected = allProbes.filter(p => p.status === 'rejected').length
    
    return { total, pending, approved, rejected }
  } catch (error) {
    console.error('Error getting stats:', error)
    return { total: 0, pending: 0, approved: 0, rejected: 0 }
  }
}