'use client'

import { useState, useEffect } from 'react'
import { supabase, type Probe } from '../lib/supabase'

export default function ProbePage() {
  const [probeText, setProbeText] = useState('')
  const [submitterName, setSubmitterName] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [approvedProbes, setApprovedProbes] = useState<Probe[]>([])

  // Load approved probes on component mount
  useEffect(() => {
    loadApprovedProbes()
  }, [])

  const loadApprovedProbes = async () => {
    const { data } = await supabase
      .from('probes')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(20)
    
    if (data) {
      setApprovedProbes(data)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: probeText,
          name: submitterName || 'Anonymous'
        })
      })

      if (response.ok) {
        setShowSuccess(true)
        setProbeText('')
        setSubmitterName('')
        setTimeout(() => setShowSuccess(false), 5000)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container">
      <h1>Probe</h1>
      
      {showSuccess && (
        <div className="success">
          Thank you! Your probe has been submitted for review.
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="form">
        <textarea
          value={probeText}
          onChange={(e) => setProbeText(e.target.value)}
          placeholder="Share your probe..."
          required
          className="textarea"
        />
        <input
          type="text"
          value={submitterName}
          onChange={(e) => setSubmitterName(e.target.value)}
          placeholder="Your name (optional)"
          className="input"
        />
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="button"
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
      
      <div className="probes">
        {approvedProbes.map((probe) => (
          <div key={probe.id} className="probe">
            <div className="probe-text">{probe.text}</div>
            <div className="probe-meta">
              {probe.name} • {new Date(probe.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 600px;
          margin: 80px auto;
          padding: 40px;
          line-height: 1.5;
          color: #000;
          background: #fff;
        }

        h1 {
          font-size: 2em;
          font-weight: 400;
          margin-bottom: 40px;
          text-align: center;
        }

        .success {
          background: #e8f5e8;
          border: 1px solid #4caf50;
          color: #2e7d32;
          padding: 15px;
          border-radius: 4px;
          margin-bottom: 30px;
          text-align: center;
        }

        .form {
          margin-bottom: 60px;
        }

        .textarea {
          width: 100%;
          min-height: 120px;
          padding: 20px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 16px;
          font-family: inherit;
          resize: vertical;
          margin-bottom: 20px;
          box-sizing: border-box;
        }

        .input {
          width: 100%;
          padding: 15px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 16px;
          margin-bottom: 20px;
          box-sizing: border-box;
        }

        .button {
          background: #000;
          color: #fff;
          padding: 15px 30px;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
        }

        .button:hover:not(:disabled) {
          background: #333;
        }

        .button:disabled {
          background: #666;
          cursor: not-allowed;
        }

        .probes {
          border-top: 1px solid #eee;
          padding-top: 40px;
        }

        .probe {
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #f5f5f5;
        }

        .probe:last-child {
          border-bottom: none;
        }

        .probe-text {
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 10px;
        }

        .probe-meta {
          font-size: 14px;
          color: #666;
        }

        @media (max-width: 600px) {
          .container {
            margin: 40px auto;
            padding: 20px;
          }
          h1 {
            font-size: 1.5em;
          }
        }
      `}</style>
    </div>
  )
}