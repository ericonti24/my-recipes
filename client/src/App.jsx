import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import RecipeDashboard from './components/RecipeDashboard'
import {
  Box,
  Button,
  Field,
  Heading,
  Input,
  Separator,
  Stack,
  Text,
} from '@chakra-ui/react'


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

  // Render the RecipeDashboard if the user is signed in, otherwise render the sign-in/sign-up form
  if (session) {
    return (
      <RecipeDashboard 
        session={session} 
        onSignOut={signOut} 
      />
    )
  }

  // Unauthenticated users see the login/signup page
  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={{ base: 4, md: 6 }}
      py={8}
      bg="gray.50"
    >
      <Box
        width="100%"
        maxW="420px"
        bg="white"
        borderWidth="1px"
        borderRadius="xl"
        p={{ base: 6, md: 8 }}
        boxShadow="sm"
      >
        <Stack gap={6}>

          {/* Header */}

          <Box textAlign="center">
            <Heading
              size="xl"
              mb={2}
            >
              TASTE OF MIND
            </Heading>

            <Text color="gray.600">
              Save and organize your favorite recipes.
            </Text>
          </Box>

          {/* Login / Sign Up Form */}

          <Box
            as="form"
            onSubmit={handleEmailAuth}
          >
            <Stack gap={4}>

              <Heading size="md">
                {isSigningUp
                  ? 'Create an account'
                  : 'Sign in'}
              </Heading>

              {/* Username */}

              {isSigningUp && (
                <Field.Root required>
                  <Field.Label>
                    Username
                    <Field.RequiredIndicator />
                  </Field.Label>

                  <Input
                    type="text"
                    value={username}
                    onChange={(event) =>
                      setUsername(event.target.value)
                    }
                    minLength={2}
                    maxLength={30}
                    pattern="[A-Za-z0-9_-]{2,30}"
                    placeholder="Enter your username"
                    autoComplete="username"
                  />
                </Field.Root>
              )}

              {/* Email */}

              <Field.Root required>
                <Field.Label>
                  Email
                  <Field.RequiredIndicator />
                </Field.Label>

                <Input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  maxLength={254}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </Field.Root>

              {/* Password */}

              <Field.Root required>
                <Field.Label>
                  Password
                  <Field.RequiredIndicator />
                </Field.Label>

                <Input
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  autoComplete={
                    isSigningUp
                      ? 'new-password'
                      : 'current-password'
                  }
                  minLength={6}
                  placeholder="Enter your password"
                />
              </Field.Root>

              {/* Error / Status Message */}

              {message && (
                <Box
                  p={3}
                  borderWidth="1px"
                  borderRadius="md"
                  bg="gray.50"
                >
                  <Text fontSize="sm">
                    {message}
                  </Text>
                </Box>
              )}

              {/* Submit */}

              <Button
                type="submit"
                width="100%"
                loading={loading}
              >
                {isSigningUp
                  ? 'Create Account'
                  : 'Sign In'}
              </Button>

            </Stack>
          </Box>

          {/* Divider */}

          <Box>
            <Stack
              direction="row"
              align="center"
              gap={3}
            >
              <Separator flex="1" />

              <Text
                fontSize="sm"
                color="gray.500"
              >
                OR
              </Text>

              <Separator flex="1" />
            </Stack>
          </Box>

          {/* Google Sign In */}

          <Button
            type="button"
            variant="outline"
            width="100%"
            onClick={signInWithGoogle}
          >
            Continue with Google
          </Button>

          {/* Switch Login / Sign Up */}

          <Box textAlign="center">
            <Text fontSize="sm" color="gray.600">
              {isSigningUp
                ? 'Already have an account?'
                : 'New here?'}
            </Text>

            <Button
              type="button"
              variant="plain"
              size="sm"
              mt={1}
              onClick={() =>
                setIsSigningUp(!isSigningUp)
              }
            >
              {isSigningUp
                ? 'Sign in'
                : 'Create an account'}
            </Button>
          </Box>

        </Stack>
      </Box>
    </Box>
  )
}