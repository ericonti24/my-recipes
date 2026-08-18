import { useState } from 'react'
import {
  Box,
  Button,
  Heading,
  Input,
  Stack,
  Text,
} from '@chakra-ui/react'
import { supabase } from '../lib/supabase'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handlePasswordReset(event) {
    event.preventDefault()

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.')
      return
    }

    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.updateUser({
      password,
    })

    setLoading(false)

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage('Password updated successfully.')
  }

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={{ base: 3, sm: 4, md: 6 }}
      py={8}
      bg="gray.50"
    >
      <Box
        width="100%"
        maxW={{ base: '100%', sm: '420px' }}
        bg="white"
        borderWidth="1px"
        borderRadius="xl"
        p={{ base: 5, md: 8 }}
        boxShadow="sm"
      >
        <Stack gap={6}>
          <Box textAlign="center">
            <Heading size="xl" mb={2}>
              Create a new password
            </Heading>

            <Text color="gray.600">
              Enter a new password for your account.
            </Text>
          </Box>

          <Box
            as="form"
            onSubmit={handlePasswordReset}
          >
            <Stack gap={4}>
              <Input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter your new password"
                autoComplete="new-password"
                minLength={6}
                required
              />

              <Input
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                placeholder="Confirm your new password"
                autoComplete="new-password"
                minLength={6}
                required
              />

              {message && (
                <Text>
                  {message}
                </Text>
              )}

              <Button
                type="submit"
                width="100%"
                loading={loading}
              >
                Update Password
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Box>
  )
}