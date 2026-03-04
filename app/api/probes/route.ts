import { NextRequest, NextResponse } from 'next/server'
import { getApprovedProbes } from '../../../lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const approvedProbes = await getApprovedProbes()
    
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