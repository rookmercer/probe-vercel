import { NextRequest, NextResponse } from 'next/server'
import { getApprovedProbes } from '../../../lib/database'

export async function GET(request: NextRequest) {
  try {
    const approvedProbes = getApprovedProbes()
    
    return NextResponse.json({ probes: approvedProbes })
  } catch (error) {
    console.error('Error fetching probes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch probes', probes: [] },
      { status: 500 }
    )
  }
}