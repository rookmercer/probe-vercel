import { NextRequest, NextResponse } from 'next/server'
import { getApprovedProbes } from '../../../lib/storage'

export async function GET(request: NextRequest) {
  try {
    const approvedProbes = getApprovedProbes()
    
    console.log(`📋 FRONTEND REQUEST: Returning ${approvedProbes.length} approved probes`)
    
    // Add cache control headers to ensure fresh data
    return NextResponse.json(
      { 
        probes: approvedProbes,
        timestamp: new Date().toISOString(),
        count: approvedProbes.length
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    )
  } catch (error) {
    console.error('Error fetching probes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch probes', probes: [] },
      { status: 500 }
    )
  }
}