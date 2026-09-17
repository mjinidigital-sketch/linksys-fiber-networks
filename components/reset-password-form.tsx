'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel, FieldGroup } from '@/components/ui/field'
import { authClient } from '@/lib/auth-client'
import { Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react'

const ResetPasswordForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const errorParam = searchParams.get('error')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(
    errorParam === 'INVALID_TOKEN' ? 'Your password reset link is invalid or has expired.' : null
  )
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      setError('Missing reset token. Please request a new password reset email.')
      return
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error: resetError } = await authClient.resetPassword({
        newPassword,
        token,
      })

      if (resetError) {
        setError(resetError.message || 'Failed to reset password. Token may have expired.')
      } else {
        setSuccess(true)
        setTimeout(() => {
          router.push('/auth/login?reset=success')
        }, 2000)
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-5 text-center space-y-3">
        <CheckCircle2 className="size-10 text-emerald-500 mx-auto animate-bounce" />
        <h3 className="font-semibold text-emerald-600 dark:text-emerald-400">Password Reset Successfully!</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Redirecting you to the login page...
        </p>
      </div>
    )
  }

  if (!token && !errorParam) {
    return (
      <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-5 text-center space-y-3">
        <AlertCircle className="size-10 text-destructive mx-auto" />
        <h3 className="font-semibold text-destructive">Invalid Link</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          No reset token was found. Please request a new password reset link.
        </p>
        <Button 
          variant="outline" 
          size="sm"
          className="mt-2 w-full text-xs" 
          onClick={() => router.push('/auth/forgot-password')}
        >
          Go to Forgot Password
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup className="gap-4">
        {error && (
          <div className="rounded-lg bg-destructive/15 p-3 text-sm text-destructive flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* New Password */}
        <Field>
          <FieldLabel className="leading-5" htmlFor="newPassword">
            New Password*
          </FieldLabel>
          <div className="relative">
            <Input 
              type={showPassword ? 'text' : 'password'} 
              id="newPassword" 
              placeholder="Enter new password (min. 8 chars)" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
              required
              minLength={8}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </Field>

        {/* Confirm Password */}
        <Field>
          <FieldLabel className="leading-5" htmlFor="confirmPassword">
            Confirm New Password*
          </FieldLabel>
          <Input 
            type={showPassword ? 'text' : 'password'} 
            id="confirmPassword" 
            placeholder="Confirm new password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            required
          />
        </Field>
        
        <Field>
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Resetting Password...
              </>
            ) : (
              'Reset Password'
            )}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}

export default ResetPasswordForm
