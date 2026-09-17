'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel, FieldGroup } from '@/components/ui/field'
import { authClient } from '@/lib/auth-client'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError('Please enter your email address')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { error: resetError } = await authClient.forgetPassword({
        email,
        redirectTo: '/auth/reset-password',
      })

      if (resetError) {
        setError(resetError.message || 'Failed to send password reset email.')
      } else {
        setSuccess(true)
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
        <CheckCircle2 className="size-10 text-emerald-500 mx-auto" />
        <h3 className="font-semibold text-emerald-600 dark:text-emerald-400">Check your inbox</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          If an account exists for <strong className="text-foreground">{email}</strong>, we&apos;ve sent instructions to reset your password.
        </p>
        <Button 
          variant="outline" 
          size="sm"
          className="mt-2 w-full text-xs" 
          onClick={() => { setSuccess(false); setEmail(''); }}
        >
          Send to another email
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

        {/* Email */}
        <Field>
          <FieldLabel className="leading-5" htmlFor="userEmail">
            Email address*
          </FieldLabel>
          <Input 
            type="email" 
            id="userEmail" 
            placeholder="Enter your email address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
        </Field>
        
        <Field>
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Sending Link...
              </>
            ) : (
              'Send Reset Link'
            )}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}

export default ForgotPasswordForm
