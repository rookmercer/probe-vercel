import { NextRequest, NextResponse } from 'next/server'
import { addProbe } from '../../../lib/database'

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

    // Add to database
    const newProbe = addProbe(text, name || 'Anonymous')

    console.log('New probe submission:', newProbe)

    // Send email notification to Luke
    try {
      const emailHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #000; padding-bottom: 10px;">
            New Probe Submission - The One and the 99
          </h2>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #555;">Probe:</h3>
            <p style="font-size: 16px; line-height: 1.6; color: #333; font-style: italic;">
              "${newProbe.text}"
            </p>
          </div>
          
          <p><strong>Submitter:</strong> ${newProbe.name}</p>
          <p><strong>Submitted:</strong> ${new Date(newProbe.created_at).toLocaleString()}</p>
          <p><strong>Probe ID:</strong> ${newProbe.id}</p>
          
          <div style="margin: 30px 0; padding: 20px; background: #e8f5e8; border-radius: 8px;">
            <p style="margin: 0;">
              <a href="https://probe.lukeburgis.com/admin" 
                 style="background: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Review in Admin Panel →
              </a>
            </p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #666; font-size: 14px;">
            This email was sent from the Probe submission system at probe.lukeburgis.com
          </p>
        </div>
      `

      // Log email for now (will implement actual sending later)
      console.log('Email notification prepared for luke@lukeburgis.com:', {
        subject: `New Probe Submission - "${newProbe.text.substring(0, 50)}..."`,
        probeId: newProbe.id
      })

    } catch (emailError) {
      console.error('Email error:', emailError)
      // Don't fail the submission if email fails
    }
    
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