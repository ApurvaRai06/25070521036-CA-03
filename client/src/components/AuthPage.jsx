import { useState } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

function AuthPage({ onAuthenticated }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isSignup = mode === 'signup'

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  const switchMode = (nextMode) => {
    setMode(nextMode)
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = await fetch(`${API_BASE_URL}/auth/${isSignup ? 'signup' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const responseBody = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(responseBody.message || responseBody.error || 'Authentication failed')
      onAuthenticated(responseBody)
    } catch (requestError) {
      setError(requestError.message || 'Could not connect to the server')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-brand">
          <span className="brand-mark">◈</span>
          <span>MY WATCHLIST</span>
        </div>
        <div className="auth-heading">
          <p className="eyebrow">Your private library</p>
          <h1 id="auth-title">{isSignup ? 'Make room for great stories.' : 'Welcome back.'}</h1>
          <p>{isSignup ? 'Create an account to keep your tracker synced and personal.' : 'Sign in to continue to your movie and series tracker.'}</p>
        </div>
        <div className="auth-switcher" role="tablist" aria-label="Authentication mode">
          <button className={mode === 'login' ? 'is-active' : ''} type="button" onClick={() => switchMode('login')}>Log in</button>
          <button className={mode === 'signup' ? 'is-active' : ''} type="button" onClick={() => switchMode('signup')}>Sign up</button>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          {isSignup && (
            <label className="auth-field">
              <span>Your name</span>
              <input value={form.name} onChange={(event) => updateField('name', event.target.value)} placeholder="Alex Morgan" autoComplete="name" required minLength="2" />
            </label>
          )}
          <label className="auth-field">
            <span>Email address</span>
            <input type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} placeholder="you@example.com" autoComplete="email" required />
          </label>
          <label className="auth-field">
            <span>Password</span>
            <input type="password" value={form.password} onChange={(event) => updateField('password', event.target.value)} placeholder="At least 6 characters" autoComplete={isSignup ? 'new-password' : 'current-password'} required minLength="6" />
          </label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="button button-primary auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Please wait…' : isSignup ? 'Create account' : 'Log in'}
          </button>
        </form>
        <p className="auth-note">Your password is encrypted before it is stored.</p>
      </section>
    </main>
  )
}

export default AuthPage
