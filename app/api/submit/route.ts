import { NextRequest, NextResponse } from 'next/server'
import { addProbe } from '../../../lib/storage'

export async function POST(request: NextRequest) {
  try {
    const { text, name } = await request.json()
    
    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Probe text is required' },
        { status: 400 }
      )
    }

    if (text.trim().length > 500) {
      return NextResponse.json(
        { error: 'Probe text too long (max 500 characters)' },
        { status: 400 }
      )
    }

    // Add to storage
    const newProbe = addProbe(text, name || 'Anonymous')

    console.log('✅ NEW PROBE SUBMITTED:', {
      id: newProbe.id,
      text: newProbe.text.substring(0, 50) + '...',
      name: newProbe.name,
      status: newProbe.status
    })

    // TODO: Send email notification to Luke
    console.log('📧 Email notification prepared for luke@lukeburgis.com')

    return NextResponse.json({ 
      success: true, 
      message: 'Probe submitted successfully',
      data: newProbe 
    })
  } catch (error) {
    console.error('Error processing submission:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}