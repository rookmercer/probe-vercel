export interface Probe {
  id: number
  text: string
  name: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function supabaseRequest(endpoint: string, options: RequestInit = {}) {
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
    console.error('Supabase error:', response.status, await response.text())
    throw new Error(`Supabase request failed: ${response.status}`)
  }
  
  return response.json()
}

export async function getAllProbes(): Promise<Probe[]> {
  try {
    const probes = await supabaseRequest('probes?order=created_at.desc')
    console.log(`📊 SUPABASE: Fetched ${probes.length} total probes`)
    return probes
  } catch (error) {
    console.error('Error fetching all probes:', error)
    return []
  }
}

export async function getApprovedProbes(): Promise<Probe[]> {
  try {
    const probes = await supabaseRequest('probes?status=eq.approved&order=created_at.desc')
    console.log(`✅ SUPABASE: Fetched ${probes.length} approved probes`)
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
    
    console.log(`➕ SUPABASE: Added probe ${newProbe.id}`)
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
    
    console.log(`🔄 SUPABASE: Updated probe ${id} to ${status}`)
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
    
    console.log(`🗑️ SUPABASE: Deleted probe ${id}`)
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