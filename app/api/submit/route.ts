import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { text, name } = await request.json()
    
    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Probe text is required' },
        { status: 400 }
      )
    }

    // Save to Supabase
    const { data, error } = await supabase
      .from('probes')
      .insert([
        {
          text: text.trim(),
          name: (name || 'Anonymous').trim(),
          status: 'pending'
        }
      ])
      .select()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to save submission' },
        { status: 500 }
      )
    }

    // Send email notification
    try {
      const emailData = {
        to: 'luke@lukeburgis.com',
        subject: 'New Probe Submission - The One and the 99',
        html: `
          <h2>New Probe Submission</h2>
          <p><strong>Probe:</strong> ${text.trim()}</p>
          <p><strong>Submitter:</strong> ${(name || 'Anonymous').trim()}</p>
          <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
          <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://probe.lukeburgis.com'}/admin">Review in Admin Panel</a></p>
        `
      }

      // Send via Resend API (you'll need to add API key)
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Probe System <noreply@lukeburgis.com>',
          to: [emailData.to],
          subject: emailData.subject,
          html: emailData.html,
        }),
      })

      if (!emailResponse.ok) {
        console.error('Email sending failed:', await emailResponse.text())
      }
    } catch (emailError) {
      console.error('Email error:', emailError)
      // Don't fail the submission if email fails
    }
    
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error processing submission:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}