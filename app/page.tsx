'use client'

import { useState, useEffect, useRef } from 'react'

interface Probe {
  id: number
  text: string
  name: string
  created_at: string
}

const BOOK_URL = 'https://www.amazon.com/dp/1250373034'
const MAX = 500

export default function ProbePage() {
  const [probeText, setProbeText] = useState('')
  const [submitterName, setSubmitterName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [justSubmitted, setJustSubmitted] = useState(false)
  const [approvedProbes, setApprovedProbes] = useState<Probe[]>([])
  const [error, setError] = useState('')
  const wallRef = useRef<HTMLDivElement | null>(null)
  const submitRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // ?preview=1 (or ?preview) bypasses the localStorage gate — useful for admin/sharing
    const params = new URLSearchParams(window.location.search)
    const isPreview = params.has('preview')
    const submitted = localStorage.getItem('probe_submitted')
    if (submitted || isPreview) {
      setHasSubmitted(true)
      loadApprovedProbes()
    }
  }, [])

  const loadApprovedProbes = async () => {
    try {
      const response = await fetch('/api/probes', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      })
      if (response.ok) {
        const data = await response.json()
        setApprovedProbes(data.probes || [])
      }
    } catch (err) {
      console.error('Error loading probes:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!probeText.trim()) return
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: probeText.trim(),
          name: submitterName.trim() || 'Anonymous',
        }),
      })
      const result = await response.json()
      if (response.ok) {
        localStorage.setItem('probe_submitted', 'true')
        setHasSubmitted(true)
        setJustSubmitted(true)
        setProbeText('')
        setSubmitterName('')
        loadApprovedProbes()
        setTimeout(() => {
          wallRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 700)
      } else {
        setError(result.error || 'Failed to submit probe')
      }
    } catch (err) {
      console.error('Error:', err)
      setError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const scrollToSubmit = () => {
    submitRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <main>
      <nav className="nav">
        <div className="nav-inner">
          <div className="logo">THE ONE AND THE NINETY-NINE</div>
          <a className="book-link" href={BOOK_URL} target="_blank" rel="noopener noreferrer">
            Get the Book <span className="arrow">→</span>
          </a>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-inner">
          <div className="hero-text">
            <p className="eyebrow">A reader project · <em>The One and the Ninety-Nine</em></p>
            <h1 className="hero-title">What&rsquo;s<br />your probe?</h1>
            <hr className="hero-rule" />
            <div className="hero-prose">
              <p>
                Marshall McLuhan used the word <em>probe</em> to describe his way of approaching problems. &ldquo;Most of my work is like that of a safecracker,&rdquo; he said. &ldquo;In the beginning I don&apos;t know what&apos;s inside. I just set myself down in front of the problem and begin to work. I grope, I listen, I test, I accept and discard; I try out different sequences—until the tumblers fall and the doors spring open.&rdquo;
              </p>
              <p>
                Like the unmanned probes we send into deep space, a probe lands in unfamiliar territory and returns something of value. Not an answer—an opening. They make us think: <em>there is more there.</em>
              </p>
              <p>
                In 1970, McLuhan remarked: &ldquo;The problem of private identity vs. tribal involvement has become one of the crosses of our time.&rdquo; He named a tension but didn&apos;t resolve it. A perfect probe.
              </p>
            </div>
            <button className="scroll-down" onClick={scrollToSubmit} aria-label="Scroll to submit">
              <span className="scroll-arrow">↓</span>
            </button>
          </div>
          <div className="hero-image-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/mcluhan.jpg"
              alt="Marshall McLuhan leaning on a television set showing his own image, ca. 1967"
              className="mcluhan-photo"
            />
            <p className="mcluhan-caption">
              Marshall McLuhan, leaning on a television showing his own image.<br />
              Library of Congress / Bernard Gotfryd, no known copyright restrictions.
            </p>
          </div>
        </div>
      </section>

      <section className="submit-section" ref={submitRef}>
        <div className="submit-card">
          {!hasSubmitted ? (
            <>
              <h2 className="card-title">What&rsquo;s yours?</h2>

              <form onSubmit={handleSubmit}>
                <label className="field-label" htmlFor="name">
                  Your name <span className="optional">(optional)</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={submitterName}
                  onChange={(e) => setSubmitterName(e.target.value)}
                  placeholder="Anonymous"
                  className="text-input"
                  maxLength={50}
                />

                <label className="field-label" htmlFor="probe">
                  Your probe
                </label>
                <textarea
                  id="probe"
                  value={probeText}
                  onChange={(e) => setProbeText(e.target.value)}
                  placeholder="My probe…"
                  required
                  className="textarea"
                  maxLength={MAX}
                />
                <div className="char-row">
                  <span className="lock-hint">🔒 Submit to unlock what others have probed</span>
                  <span className={`char-count ${probeText.length > MAX - 50 ? 'warn' : ''}`}>
                    {probeText.length} / {MAX}
                  </span>
                </div>

                {error && <div className="error">{error}</div>}

                <button
                  type="submit"
                  disabled={isSubmitting || !probeText.trim()}
                  className="submit-btn"
                >
                  {isSubmitting ? 'Submitting…' : 'Submit your probe'}
                </button>
              </form>
            </>
          ) : (
            <div className="success-state">
              <div className="checkmark" aria-hidden="true">
                <svg viewBox="0 0 60 60" width="60" height="60">
                  <circle cx="30" cy="30" r="27" fill="none" stroke="#76B947" strokeWidth="3" />
                  <path
                    d="M18 31 L27 40 L43 22"
                    fill="none"
                    stroke="#76B947"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h2 className="card-title center">
                {justSubmitted ? 'Your probe has been received.' : "You're in."}
              </h2>
              <p className="card-sub center">
                {justSubmitted
                  ? "Pending review — you'll appear on the wall once approved."
                  : "You've already shared a probe. Welcome back."}
              </p>
              <p className="card-sub center italic">
                Here&apos;s what other readers have probed ↓
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="wall-section" ref={wallRef}>
        <div className="wall-inner">
          <div className="wall-heading">
            <h2 className="wall-title">The Wall</h2>
            {hasSubmitted && approvedProbes.length > 0 && (
              <span className="wall-count">
                {approvedProbes.length} probe{approvedProbes.length === 1 ? '' : 's'}
              </span>
            )}
          </div>

          {hasSubmitted ? (
            approvedProbes.length > 0 ? (
              <div className="probe-grid">
                {approvedProbes.map((p) => (
                  <article className="probe-card" key={p.id}>
                    <p className="quote">&ldquo;{p.text}&rdquo;</p>
                    <p className="attr">— {p.name || 'Anonymous'}</p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty">
                <p>
                  No approved probes yet. Yours may be among the first published.
                  Check back soon.
                </p>
              </div>
            )
          ) : (
            <div className="locked-wrap">
              <div className="probe-grid locked-grid" aria-hidden="true">
                {[
                  "A belief most people around me don't share…",
                  "The thing I see that they don't…",
                  "What I believe but rarely say out loud…",
                ].map((t, i) => (
                  <article className="probe-card locked" key={i}>
                    <p className="quote">&ldquo;{t}&rdquo;</p>
                    <p className="attr">— Reader</p>
                  </article>
                ))}
              </div>
              <div className="lock-overlay">
                <div className="lock-msg">
                  <div className="lock-icon">🔒</div>
                  <p>Submit your probe above to unlock the wall.</p>
                  <button className="lock-btn" onClick={scrollToSubmit}>
                    Take me there
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="was-section">
        <div className="was-inner">
          <p className="was-eyebrow">Want to go deeper?</p>
          <h2 className="was-title">Work as Soulcraft</h2>
          <p className="was-sub">
            The course is built around more than 8 new probes from Luke—probes that go
            further than the book could. Each module opens with one, and the course is
            designed to make sure the tumblers fall and the doors spring open.
          </p>
          <a
            className="was-link"
            href="https://learn.lukeburgis.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Explore the course <span className="arrow">→</span>
          </a>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-inner">
          <span>© Luke Burgis {new Date().getFullYear()}</span>
          <span className="dot">·</span>
          <a href="https://lukeburgis.com" target="_blank" rel="noopener noreferrer">
            lukeburgis.com
          </a>
          <span className="dot">·</span>
          <a href={BOOK_URL} target="_blank" rel="noopener noreferrer">
            The One and the Ninety-Nine
          </a>
        </div>
      </footer>

      <style jsx>{`
        main { min-height: 100vh; background: var(--cream); }

        .nav {
          position: sticky; top: 0; z-index: 50;
          background: rgba(250, 246, 237, 0.92);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border-bottom: 1px solid rgba(26,35,50,0.08);
        }
        .nav-inner {
          max-width: 1100px; margin: 0 auto;
          padding: 18px 28px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .logo {
          font-family: var(--font-playfair), Georgia, serif;
          font-weight: 600; font-size: 12px;
          letter-spacing: 0.18em; color: var(--navy);
        }
        .book-link {
          color: var(--navy); text-decoration: none;
          font-size: 14px; font-weight: 500;
          display: inline-flex; align-items: center; gap: 4px;
          transition: color 0.2s;
        }
        .book-link:hover { color: var(--green); }
        .book-link .arrow { display: inline-block; transition: transform 0.2s; }
        .book-link:hover .arrow { transform: translateX(3px); }

        .hero {
          background: var(--cream);
          border-bottom: 1px solid rgba(26,35,50,0.1);
          padding: 80px 48px 72px;
        }
        .hero-inner {
          max-width: 1100px; margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 72px;
          align-items: start;
        }
        .hero-text { padding-top: 8px; }
        .eyebrow {
          text-transform: uppercase; letter-spacing: 0.18em;
          font-size: 10.5px; color: var(--muted); margin: 0 0 22px;
        }
        .eyebrow em { font-style: italic; text-transform: none; letter-spacing: 0.04em; }
        .hero-title {
          font-family: var(--font-playfair), Georgia, serif;
          font-size: clamp(52px, 6.5vw, 96px);
          font-weight: 500; line-height: 1.0;
          letter-spacing: -0.03em; margin: 0 0 28px;
          color: var(--navy);
        }
        .hero-rule {
          width: 40px; height: 2px;
          background: var(--green);
          margin: 0 0 32px; border: none;
        }
        .hero-prose p {
          font-size: clamp(15px, 1.4vw, 17px); line-height: 1.8;
          color: #3a3a3a; margin: 0 0 18px;
        }
        .hero-prose p:last-child { margin-bottom: 0; }
        .hero-prose em {
          font-family: var(--font-playfair), Georgia, serif; font-style: italic;
        }
        .scroll-down {
          margin-top: 44px; background: transparent;
          border: 1px solid rgba(26,35,50,0.22);
          width: 42px; height: 42px; border-radius: 50%;
          color: var(--navy); cursor: pointer; font-size: 17px;
          display: inline-flex; align-items: center; justify-content: center;
          transition: all 0.2s;
          animation: bob 2.4s ease-in-out infinite;
        }
        .scroll-down:hover { border-color: var(--green); color: var(--green); }
        @keyframes bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(5px); }
        }
        .hero-image-wrap {
          position: sticky; top: 100px;
        }
        .mcluhan-photo {
          width: 100%;
          display: block;
          border-radius: 4px;
          filter: grayscale(18%) contrast(1.04);
          box-shadow:
            0 2px 4px rgba(26,35,50,0.06),
            0 20px 60px -20px rgba(26,35,50,0.22);
        }
        .mcluhan-caption {
          font-size: 10.5px; line-height: 1.5;
          color: var(--muted); margin: 10px 0 0;
          font-style: italic;
        }
        @media (max-width: 820px) {
          .hero { padding: 60px 24px 56px; }
          .hero-inner {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .hero-image-wrap { position: static; order: -1; max-width: 280px; }
          .hero-title { font-size: clamp(44px, 10vw, 72px); }
        }

        .submit-section {
          padding: 88px 24px;
          background: var(--cream);
        }
        .submit-card {
          max-width: 580px; margin: 0 auto;
          background: #fff;
          border-radius: 16px;
          padding: 48px 44px;
          box-shadow:
            0 1px 2px rgba(26,35,50,0.04),
            0 12px 40px -12px rgba(26,35,50,0.18);
          border: 1px solid rgba(26,35,50,0.06);
        }
        .card-title {
          font-family: var(--font-playfair), Georgia, serif;
          font-size: 32px; font-weight: 500; margin: 0 0 10px;
          color: var(--navy); letter-spacing: -0.01em;
        }
        .card-title.center { text-align: center; }
        .card-sub {
          color: var(--muted); margin: 0 0 28px; line-height: 1.55;
          font-size: 15px;
        }
        .card-sub.center { text-align: center; margin-bottom: 0; }
        .card-sub.italic { font-style: italic; margin-top: 18px; }

        .field-label {
          display: block; font-size: 12px; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--navy);
          font-weight: 600; margin-bottom: 8px;
        }
        .field-label .optional {
          text-transform: none; letter-spacing: normal;
          color: var(--muted); font-weight: 400;
        }
        .text-input, .textarea {
          width: 100%; padding: 14px 16px;
          font: inherit; font-size: 16px;
          border: 1px solid rgba(26,35,50,0.18);
          border-radius: 10px;
          background: #fff;
          color: var(--ink);
          transition: border-color 0.15s, box-shadow 0.15s;
          margin-bottom: 22px;
        }
        .textarea {
          min-height: 160px; resize: vertical; line-height: 1.5;
          font-family: var(--font-playfair), Georgia, serif;
          font-size: 18px;
          margin-bottom: 8px;
        }
        .text-input:focus, .textarea:focus {
          outline: none; border-color: var(--green);
          box-shadow: 0 0 0 3px rgba(118,185,71,0.18);
        }
        .char-row {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 22px; gap: 12px;
        }
        .lock-hint { font-size: 12px; color: var(--muted); }
        .char-count { font-size: 12px; color: var(--muted); font-variant-numeric: tabular-nums; }
        .char-count.warn { color: #c87b1f; }

        .submit-btn {
          width: 100%; padding: 16px 20px;
          background: var(--navy); color: #fff;
          border: none; border-radius: 10px;
          font: inherit; font-weight: 600; font-size: 15px;
          letter-spacing: 0.02em;
          cursor: pointer; transition: all 0.15s;
        }
        .submit-btn:hover:not(:disabled) {
          background: var(--navy-soft);
          transform: translateY(-1px);
          box-shadow: 0 8px 24px -8px rgba(26,35,50,0.35);
        }
        .submit-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        .error {
          background: #fdecec; border: 1px solid #f3b8b8;
          color: #a32020; padding: 12px 14px; border-radius: 8px;
          font-size: 14px; margin-bottom: 18px;
        }

        .success-state {
          text-align: center; padding: 8px 0 4px;
          animation: fadeUp 0.5s ease-out;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .checkmark { display: inline-block; margin-bottom: 18px; }
        .checkmark svg circle {
          stroke-dasharray: 170; stroke-dashoffset: 170;
          animation: drawCircle 0.7s ease-out forwards;
        }
        .checkmark svg path {
          stroke-dasharray: 50; stroke-dashoffset: 50;
          animation: drawCheck 0.4s 0.5s ease-out forwards;
        }
        @keyframes drawCircle { to { stroke-dashoffset: 0; } }
        @keyframes drawCheck { to { stroke-dashoffset: 0; } }

        .wall-section {
          background: #fff;
          padding: 88px 24px 96px;
          border-top: 1px solid rgba(26,35,50,0.06);
        }
        .wall-inner { max-width: 1100px; margin: 0 auto; }
        .wall-heading {
          display: flex; align-items: baseline;
          justify-content: space-between; gap: 16px;
          margin-bottom: 36px;
          padding-bottom: 18px;
          border-bottom: 1px solid rgba(26,35,50,0.1);
        }
        .wall-title {
          font-family: var(--font-playfair), Georgia, serif;
          font-size: clamp(32px, 4vw, 44px);
          font-weight: 500; margin: 0; letter-spacing: -0.01em;
          color: var(--navy);
        }
        .wall-count {
          font-size: 13px; color: var(--muted);
          letter-spacing: 0.05em; text-transform: uppercase;
        }

        .probe-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }
        .probe-card {
          background: var(--cream);
          border: 1px solid rgba(26,35,50,0.08);
          border-radius: 14px;
          padding: 28px 26px;
          display: flex; flex-direction: column;
          gap: 16px; min-height: 160px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .probe-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px -15px rgba(26,35,50,0.25);
        }
        .quote {
          font-family: var(--font-playfair), Georgia, serif;
          font-style: italic;
          font-size: 18px; line-height: 1.5;
          color: var(--navy); margin: 0; flex: 1;
        }
        .attr {
          font-size: 13px; color: var(--muted);
          margin: 0; letter-spacing: 0.02em;
        }

        .locked-wrap { position: relative; }
        .locked-grid { filter: blur(6px); pointer-events: none; user-select: none; opacity: 0.55; }
        .lock-overlay {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
        }
        .lock-msg {
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(6px);
          border: 1px solid rgba(26,35,50,0.08);
          border-radius: 14px;
          padding: 32px 36px;
          text-align: center;
          max-width: 360px;
          box-shadow: 0 20px 60px -20px rgba(26,35,50,0.25);
        }
        .lock-icon { font-size: 28px; margin-bottom: 10px; }
        .lock-msg p {
          margin: 0 0 18px; color: var(--navy);
          font-size: 15px; line-height: 1.5;
        }
        .lock-btn {
          background: var(--navy); color: #fff;
          border: none; border-radius: 8px;
          padding: 10px 22px;
          font: inherit; font-size: 14px; font-weight: 500;
          cursor: pointer; transition: background 0.15s, transform 0.15s;
        }
        .lock-btn:hover { background: var(--navy-soft); transform: translateY(-1px); }

        .empty {
          text-align: center; padding: 48px 20px;
          color: var(--muted); font-style: italic;
        }

        .was-section {
          background: var(--navy);
          padding: 88px 28px;
          text-align: center;
        }
        .was-inner { max-width: 560px; margin: 0 auto; }
        .was-eyebrow {
          text-transform: uppercase; letter-spacing: 0.2em;
          font-size: 11px; color: rgba(255,255,255,0.5); margin: 0 0 16px;
        }
        .was-title {
          font-family: var(--font-playfair), Georgia, serif;
          font-size: clamp(30px, 4vw, 46px);
          font-weight: 500; color: #fff;
          margin: 0 0 20px; letter-spacing: -0.01em;
        }
        .was-sub {
          font-size: 17px; line-height: 1.75; color: rgba(255,255,255,0.72);
          margin: 0 0 36px;
        }
        .was-link {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--green); color: #fff;
          text-decoration: none;
          padding: 15px 32px; border-radius: 10px;
          font-weight: 600; font-size: 15px;
          letter-spacing: 0.02em;
          transition: all 0.15s;
        }
        .was-link:hover {
          background: #5d9436;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px -8px rgba(0,0,0,0.5);
        }
        .was-link .arrow { transition: transform 0.2s; }
        .was-link:hover .arrow { transform: translateX(3px); }

        .footer {
          background: var(--navy); color: #d6d9df;
          padding: 36px 24px; text-align: center;
        }
        .footer-inner {
          max-width: 1100px; margin: 0 auto;
          font-size: 13px; letter-spacing: 0.04em;
          display: flex; align-items: center; justify-content: center;
          gap: 10px; flex-wrap: wrap;
        }
        .footer a {
          color: #fff; text-decoration: none;
          border-bottom: 1px solid rgba(255,255,255,0.3);
          padding-bottom: 1px;
        }
        .footer a:hover { border-color: var(--green); color: var(--green); }
        .dot { opacity: 0.5; }

        @media (max-width: 600px) {
          .nav-inner { padding: 14px 20px; }
          .logo { font-size: 10px; letter-spacing: 0.14em; }
          .hero { padding: 80px 24px 70px; }
          .submit-section { padding: 60px 16px; }
          .submit-card { padding: 36px 24px; }
          .wall-section { padding: 64px 16px 80px; }
          .probe-grid { grid-template-columns: 1fr; gap: 18px; }
        }
      `}</style>
    </main>
  )
}
