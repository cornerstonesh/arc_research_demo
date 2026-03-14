'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [passphrase, setPassphrase] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!passphrase.trim() || loading) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passphrase }),
      })

      if (res.ok) {
        router.push('/')
        router.refresh()
      } else {
        setError('Invalid access code')
        setLoading(false)
      }
    } catch {
      setError('Something went wrong. Try again.')
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .login-wordmark {
          animation: fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
          animation-delay: 0ms;
        }

        .login-card {
          animation: fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
          animation-delay: 80ms;
        }

        .login-input {
          outline: none;
          transition: border-color 0.15s ease, background 0.15s ease;
        }

        .login-input:focus {
          border-color: #3f3f50 !important;
          background: #161618 !important;
        }

        .login-input::placeholder {
          color: var(--text-muted);
        }

        .login-btn {
          transition: background 0.15s ease, opacity 0.15s ease, transform 0.1s ease;
          cursor: pointer;
        }

        .login-btn:hover:not(:disabled) {
          background: var(--accent-hover) !important;
        }

        .login-btn:active:not(:disabled) {
          transform: scale(0.985);
        }

        .login-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .login-input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-4px); }
          40% { transform: translateX(4px); }
          60% { transform: translateX(-3px); }
          80% { transform: translateX(3px); }
        }

        .error-shake {
          animation: shake 0.35s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
      `}</style>

      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg)',
          padding: '24px',
        }}
      >
        {/* Wordmark */}
        <div
          className="login-wordmark"
          style={{
            marginBottom: '28px',
            textAlign: 'center',
          }}
        >
          <span
            style={{
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--text-secondary)',
            }}
          >
            Research
          </span>
          <span
            style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 400,
              letterSpacing: '0.06em',
              color: 'var(--text-muted)',
              marginTop: '3px',
            }}
          >
            Arc Demo
          </span>
        </div>

        {/* Card */}
        <div
          className="login-card"
          style={{
            width: '100%',
            maxWidth: '360px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '28px',
          }}
        >
          <p
            style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              marginBottom: '20px',
              lineHeight: 1.5,
            }}
          >
            Enter your access code to continue.
          </p>

          {/* Input */}
          <input
            className="login-input"
            type="password"
            placeholder="Access code"
            value={passphrase}
            onChange={(e) => {
              setPassphrase(e.target.value)
              if (error) setError('')
            }}
            onKeyDown={handleKeyDown}
            disabled={loading}
            autoComplete="current-password"
            autoFocus
            style={{
              display: 'block',
              width: '100%',
              padding: '9px 12px',
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              color: 'var(--text-primary)',
              fontSize: '14px',
              fontFamily: 'inherit',
              marginBottom: '10px',
            }}
          />

          {/* Error */}
          <div
            style={{
              minHeight: '20px',
              marginBottom: '14px',
            }}
          >
            {error && (
              <p
                key={error + Date.now()}
                className="error-shake"
                style={{
                  fontSize: '12px',
                  color: '#f87171',
                  lineHeight: 1.4,
                }}
              >
                {error}
              </p>
            )}
          </div>

          {/* Button */}
          <button
            className="login-btn"
            onClick={handleSubmit}
            disabled={loading || !passphrase.trim()}
            style={{
              display: 'block',
              width: '100%',
              padding: '9px 16px',
              background: 'var(--accent)',
              border: 'none',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 500,
              fontFamily: 'inherit',
              letterSpacing: '0.01em',
            }}
          >
            {loading ? 'Verifying…' : 'Continue'}
          </button>
        </div>
      </div>
    </>
  )
}
