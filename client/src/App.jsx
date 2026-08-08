import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import RecipeDashboard from './components/RecipeDashboard'

// Username pattern: 2-30 characters, letters, numbers, underscores, and hyphens only
const USERNAME_PATTERN = /^[A-Za-z0-9_-]{2,30}$/

export default function App() {
  const [session, setSession] = useState(null)
  const [isSigningUp, setIsSigningUp] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    //keeps user login state on page refresh
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    //listens for changes in the user login state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    //stops listener when component unmounts
    return () => subscription.unsubscribe()
  }, [])

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })

    if (error) alert(error.message)
  }

  //handles both sign up and sign in with email and password
  async function handleEmailAuth(event) {
    event.preventDefault()

    //trim whitespace from username and email
    const cleanedUsername = username.trim()
    const cleanedEmail = email.trim()

    if (isSigningUp && !USERNAME_PATTERN.test(cleanedUsername)) {
      setMessage(
        'Username must be 2–30 characters and use only letters, numbers, underscores, or hyphens.'
      )
      return
    }

    setMessage('')
    setLoading(true)

    const result = isSigningUp
      ? await supabase.auth.signUp({
        email: cleanedEmail,
        password,
        options: {
          data: {
            username: cleanedUsername,
          },
          emailRedirectTo: window.location.origin,
        },
      })
      : await supabase.auth.signInWithPassword({
          email: cleanedEmail,
          password,
        })

    setLoading(false)

    if (result.error) {
      setMessage(result.error.message)
      return
    }

    if (isSigningUp && !result.data.session) {
      setMessage('Account created. Check your email to confirm your address.')
      return
    }

    setMessage(isSigningUp ? 'Account created.' : 'Signed in successfully.')
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      setMessage(error.message)
      return 
    }

    setSession(null)
    setIsSigningUp(false)
    setUsername('')
    setEmail('')
    setPassword('')
    setMessage('')
  }

  // display name is either the username, full name, or email of the user
  if (session) {
    return (
      <RecipeDashboard session={session} onSignOut={signOut} />
    )
  }

  return (
    <main>
      <h1>My Recipes</h1>
      <p>Save and organize your favorite recipes.</p>

      <form onSubmit={handleEmailAuth}>
        <h2>{isSigningUp ? 'Create an account' : 'Sign in'}</h2>

        {isSigningUp && (
          <label>
            Username
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              minLength="2"
              maxLength="30"
              pattern="[A-Za-z0-9_-]{2,30}"
              required
            />
          </label>
        )}

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            maxLength="254"
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={isSigningUp ? 'new-password' : 'current-password'}
            minLength="6"
            required
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading
            ? 'Please wait…'
            : isSigningUp
              ? 'Create account'
              : 'Sign in'}
        </button>
      </form>

      <p>or</p>

      <button onClick={signInWithGoogle}>Continue with Google</button>

      <p>
        {isSigningUp ? 'Already have an account?' : 'New here?'}{' '}
        <button type="button" onClick={() => setIsSigningUp(!isSigningUp)}>
          {isSigningUp ? 'Sign in' : 'Create an account'}
        </button>
      </p>

      {message && <p>{message}</p>}
    </main>
  )
}