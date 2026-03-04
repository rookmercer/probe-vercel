import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // For now, return sample approved probes since we need real Supabase setup
    const sampleProbes = [
      {
        id: 1,
        text: "Why do we seek certainty in a universe that seems fundamentally uncertain?",
        name: "Sarah M.",
        created_at: "2026-03-02T10:00:00Z"
      },
      {
        id: 2,
        text: "What if our greatest innovations come from the courage to stand alone with an unpopular truth?",
        name: "Anonymous",
        created_at: "2026-02-25T15:30:00Z"
      },
      {
        id: 3,
        text: "Is questioning everything just another form of certainty?",
        name: "Michael R.",
        created_at: "2026-02-12T09:15:00Z"
      }
    ]
    
    return NextResponse.json({ probes: sampleProbes })
  } catch (error) {
    console.error('Error fetching probes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch probes', probes: [] },
      { status: 500 }
    )
  }
}