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

    if (text.trim().length > 500) {
      return NextResponse.json(
        { error: 'Probe text too long (max 500 characters)' },
        { status: 400 }
      )
    }

    const submissionData = {
      text: text.trim(),
      name: (name || 'Anonymous').trim(),
      submitted_at: new Date().toISOString(),
      status: 'pending'
    }

    console.log('New probe submission:', submissionData)

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
              "${submissionData.text}"
            </p>
          </div>
          
          <p><strong>Submitter:</strong> ${submissionData.name}</p>
          <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
          
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

      // Try sending via fetch to a simple email service
      // For now, we'll just log it since we need proper email service setup
      console.log('Would send email to luke@lukeburgis.com:', {
        subject: 'New Probe Submission - The One and the 99',
        html: emailHTML
      })

      // TODO: Set up actual email sending service (Resend, SendGrid, etc.)
      
    } catch (emailError) {
      console.error('Email error:', emailError)
      // Don't fail the submission if email fails
    }

    // TODO: Save to actual database (Supabase)
    // For now, we'll simulate success
    
    return NextResponse.json({ 
      success: true, 
      message: 'Probe submitted successfully',
      data: submissionData 
    })
  } catch (error) {
    console.error('Error processing submission:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}