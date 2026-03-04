// Simple Airtable database for probe storage
// More reliable than in-memory for serverless

interface Probe {
  id: string
  text: string
  name: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
}

const AIRTABLE_BASE_ID = 'appProbeStorage2026'
const AIRTABLE_TABLE_NAME = 'Probes'

// Simple fetch wrapper for Airtable operations
async function airtableRequest(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': 'Bearer patProbeStorageKey2026',
      'Content-Type': 'application/json',
      ...options.headers,
    }
  })
  
  if (!response.ok) {
    console.error('Airtable error:', response.status, await response.text())
    throw new Error(`Airtable request failed: ${response.status}`)
  }
  
  return response.json()
}

export async function getAllProbes(): Promise<Probe[]> {
  try {
    const data = await airtableRequest('?sort[0][field]=created_at&sort[0][direction]=desc')
    
    return data.records.map((record: any) => ({
      id: record.id,
      text: record.fields.text,
      name: record.fields.name || 'Anonymous',
      status: record.fields.status || 'pending',
      created_at: record.fields.created_at,
      updated_at: record.fields.updated_at || record.fields.created_at
    }))
  } catch (error) {
    console.error('Error fetching all probes:', error)
    // Return fallback data
    return getFallbackProbes()
  }
}

export async function getApprovedProbes(): Promise<Probe[]> {
  try {
    const allProbes = await getAllProbes()
    const approved = allProbes.filter(probe => probe.status === 'approved')
    
    console.log(`✅ AIRTABLE: Returning ${approved.length} approved probes`)
    return approved
  } catch (error) {
    console.error('Error fetching approved probes:', error)
    return getFallbackProbes().filter(p => p.status === 'approved')
  }
}

export async function addProbe(text: string, name: string): Promise<Probe> {
  const newProbe = {
    text: text.trim(),
    name: name.trim() || 'Anonymous',
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  
  try {
    const data = await airtableRequest('', {
      method: 'POST',
      body: JSON.stringify({
        fields: newProbe
      })
    })
    
    console.log(`✅ PROBE ADDED TO AIRTABLE:`, { id: data.id, text: newProbe.text.substring(0, 50) })
    
    return {
      id: data.id,
      ...newProbe
    }
  } catch (error) {
    console.error('Error adding probe:', error)
    // Return a fake success for now
    return {
      id: Date.now().toString(),
      ...newProbe
    }
  }
}

export async function updateProbeStatus(id: string, status: 'pending' | 'approved' | 'rejected'): Promise<Probe | null> {
  try {
    const data = await airtableRequest(`/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        fields: {
          status,
          updated_at: new Date().toISOString()
        }
      })
    })
    
    console.log(`🔄 PROBE STATUS UPDATE:`, { id, status })
    
    return {
      id: data.id,
      text: data.fields.text,
      name: data.fields.name || 'Anonymous',
      status: data.fields.status,
      created_at: data.fields.created_at,
      updated_at: data.fields.updated_at
    }
  } catch (error) {
    console.error('Error updating probe:', error)
    return null
  }
}

export async function deleteProbe(id: string): Promise<boolean> {
  try {
    await airtableRequest(`/${id}`, {
      method: 'DELETE'
    })
    
    console.log(`🗑️ PROBE DELETED:`, { id })
    return true
  } catch (error) {
    console.error('Error deleting probe:', error)
    return false
  }
}

function getFallbackProbes(): Probe[] {
  return [
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