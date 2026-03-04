import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { text, name } = await request.json()
    
    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Probe text is required' },
        { status: 400 }
      )
    }

    // TODO: Save to database (Supabase/Airtable/etc)
    console.log('New probe submission:', {
      text: text.trim(),
      name: name || 'Anonymous',
      timestamp: new Date().toISOString()
    })

    // TODO: Send email notification to luke@lukeburgis.com
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing submission:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}