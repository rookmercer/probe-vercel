import { NextRequest, NextResponse } from 'next/server'
import { getAllProbes, updateProbeStatus, deleteProbe, getStats } from '../../../../lib/storage'

export async function GET(request: NextRequest) {
  try {
    const allProbes = getAllProbes()
    const stats = getStats()
    
    console.log(`🔐 ADMIN REQUEST: Returning ${allProbes.length} total probes, stats:`, stats)
    
    return NextResponse.json({ probes: allProbes, stats })
  } catch (error) {
    console.error('Error fetching admin probes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch probes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, id, status } = await request.json()
    
    console.log(`🎯 ADMIN ACTION: ${action} for probe ${id}${status ? ` to ${status}` : ''}`)
    
    if (action === 'update_status') {
      if (!id || !status || !['pending', 'approved', 'rejected'].includes(status)) {
        return NextResponse.json(
          { error: 'Invalid parameters' },
          { status: 400 }
        )
      }
      
      const updatedProbe = updateProbeStatus(id, status)
      if (!updatedProbe) {
        return NextResponse.json(
          { error: 'Probe not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json({ 
        success: true, 
        message: `Probe ${status}`,
        probe: updatedProbe 
      })
    }
    
    if (action === 'delete') {
      if (!id) {
        return NextResponse.json(
          { error: 'Probe ID required' },
          { status: 400 }
        )
      }
      
      const deleted = deleteProbe(id)
      if (!deleted) {
        return NextResponse.json(
          { error: 'Probe not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Probe deleted' 
      })
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error in admin action:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}