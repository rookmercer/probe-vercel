'use client'

import { useState, useEffect } from 'react'

export default function ProbePage() {
  const [probeText, setProbeText] = useState('')
  const [submitterName, setSubmitterName] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [approvedProbes, setApprovedProbes] = useState<any[]>([])
  const [error, setError] = useState('')

  // Check if user has submitted before (using localStorage)
  useEffect(() => {
    const submitted = localStorage.getItem('probe_submitted')
    if (submitted) {
      setHasSubmitted(true)
      loadApprovedProbes()
    }
  }, [])

  const loadApprovedProbes = async () => {
    try {
      const response = await fetch('/api/probes', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      if (response.ok) {
        const data = await response.json()
        setApprovedProbes(data.probes || [])
      }
    } catch (error) {
      console.error('Error loading probes:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: probeText.trim(),
          name: submitterName.trim() || 'Anonymous'
        })
      })

      const result = await response.json()

      if (response.ok) {
        // Mark as submitted in localStorage
        localStorage.setItem('probe_submitted', 'true')
        setHasSubmitted(true)
        
        // Show success message
        setShowSuccess(true)
        
        // Clear form
        setProbeText('')
        setSubmitterName('')
        
        // Load approved probes now that they've submitted
        loadApprovedProbes()
        
        // Hide success message after 6 seconds
        setTimeout(() => setShowSuccess(false), 6000)
      } else {
        setError(result.error || 'Failed to submit probe')
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container">
      <h1>Probe</h1>
      
      {showSuccess && (
        <div className="success">
          <strong>🎉 Thank you!</strong> Your probe has been submitted and will be reviewed for publication. 
          You can now see what other readers have probed below.
        </div>
      )}
      
      {error && (
        <div className="error">
          {error}
        </div>
      )}
      
      {!hasSubmitted ? (
        <>
          <div className="unlock-message">
            <p>💡 <strong>Once you submit your probe, you'll unlock what other readers have probed.</strong></p>
          </div>
          
          <form onSubmit={handleSubmit} className="form">
            <textarea
              value={probeText}
              onChange={(e) => setProbeText(e.target.value)}
              placeholder="Share your probe..."
              required
              className="textarea"
              maxLength={500}
            />
            <div className="char-count">{probeText.length}/500</div>
            <input
              type="text"
              value={submitterName}
              onChange={(e) => setSubmitterName(e.target.value)}
              placeholder="Your name (optional)"
              className="input"
              maxLength={50}
            />
            <button 
              type="submit" 
              disabled={isSubmitting || !probeText.trim()}
              className="button"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Probe'}
            </button>
          </form>
        </>
      ) : (
        <div className="submitted-state">
          <div className="submitted-message">
            <p>✅ You've unlocked the probes! Your submission is being reviewed.</p>
          </div>
        </div>
      )}
      
      <div className="probes">
        <h2>
          {hasSubmitted ? 
            `Probes from Fellow Readers (${approvedProbes.length})` : 
            'Fellow Readers Have Probed...'
          }
        </h2>
        
        {hasSubmitted ? (
          approvedProbes.length > 0 ? (
            approvedProbes.map((probe) => (
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
            ))
          ) : (
            <div className="empty-probes">
              <p>No approved probes yet. Yours might be the first!</p>
            </div>
          )
        ) : (
          <>
            <div className="probe locked">
              <div className="probe-text">
                Submit your probe to see what other readers have shared...
              </div>
              <div className="probe-meta">? • Submit to unlock</div>
            </div>
            
            <div className="locked-message">
              <p>🔒 Submit your probe above to see the full collection from other readers of <em>The One and the 99</em>.</p>
            </div>
          </>
        )}
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
          margin-bottom: 20px;
          text-align: center;
        }

        .unlock-message {
          background: #f0f8ff;
          border: 1px solid #4a90e2;
          padding: 15px;
          border-radius: 6px;
          margin-bottom: 30px;
          text-align: center;
        }

        .unlock-message p {
          margin: 0;
          color: #2c5aa0;
        }

        .submitted-state {
          margin-bottom: 40px;
        }

        .submitted-message {
          background: #f0f9f0;
          border: 1px solid #4caf50;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
        }

        .submitted-message p {
          margin: 0;
          color: #2e7d32;
          font-weight: 500;
        }

        .success {
          background: #e8f5e8;
          border: 1px solid #4caf50;
          color: #2e7d32;
          padding: 20px;
          border-radius: 6px;
          margin-bottom: 30px;
          text-align: center;
          animation: fadeIn 0.5s ease-in;
        }

        .error {
          background: #ffeaea;
          border: 1px solid #f44336;
          color: #c62828;
          padding: 15px;
          border-radius: 6px;
          margin-bottom: 30px;
          text-align: center;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .form {
          margin-bottom: 60px;
        }

        .textarea {
          width: 100%;
          min-height: 120px;
          padding: 20px;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          font-size: 16px;
          font-family: inherit;
          resize: vertical;
          margin-bottom: 10px;
          box-sizing: border-box;
          transition: border-color 0.2s ease;
        }

        .textarea:focus {
          outline: none;
          border-color: #4a90e2;
        }

        .char-count {
          text-align: right;
          font-size: 12px;
          color: #666;
          margin-bottom: 20px;
        }

        .input {
          width: 100%;
          padding: 15px 20px;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          font-size: 16px;
          margin-bottom: 25px;
          box-sizing: border-box;
          transition: border-color 0.2s ease;
        }

        .input:focus {
          outline: none;
          border-color: #4a90e2;
        }

        .button {
          background: #000;
          color: #fff;
          padding: 18px 35px;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
        }

        .button:hover:not(:disabled) {
          background: #333;
          transform: translateY(-1px);
        }

        .button:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
        }

        .probes {
          border-top: 2px solid #f0f0f0;
          padding-top: 40px;
        }

        .probes h2 {
          font-size: 1.3em;
          font-weight: 500;
          margin-bottom: 30px;
          color: #333;
        }

        .probe {
          margin-bottom: 30px;
          padding: 20px;
          background: #fafafa;
          border-radius: 8px;
          border-left: 4px solid #e0e0e0;
        }

        .probe.locked {
          background: #f8f9fa;
          border-left-color: #ddd;
          opacity: 0.6;
        }

        .probe-text {
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 12px;
          color: #333;
        }

        .probe-meta {
          font-size: 14px;
          color: #666;
          font-style: italic;
        }

        .locked-message {
          text-align: center;
          margin-top: 40px;
          padding: 30px;
          background: #f8f9fa;
          border-radius: 8px;
          border: 2px dashed #ddd;
        }

        .locked-message p {
          margin: 0;
          color: #666;
          font-style: italic;
        }

        .empty-probes {
          text-align: center;
          padding: 40px;
          color: #666;
          font-style: italic;
        }

        .empty-probes p {
          margin: 0;
        }

        @media (max-width: 600px) {
          .container {
            margin: 40px auto;
            padding: 20px;
          }
          
          h1 {
            font-size: 1.8em;
          }
          
          .unlock-message, .success, .error, .submitted-message {
            padding: 12px;
          }
        }
      `}</style>
    </div>
  )
}