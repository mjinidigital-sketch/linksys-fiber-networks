import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeftIcon } from 'lucide-react'
import ResetPasswordForm from './reset-password-form'

const ResetPassword = () => {
  return (
    <div className='relative flex h-auto min-h-screen items-center justify-center overflow-x-hidden px-4 py-10 sm:px-6 lg:px-8'>
      <Card className='z-1 w-full gap-6 py-6 sm:max-w-md p-6'>
        <CardHeader className='gap-6 px-6'>
          <div>
            <CardTitle className='mb-1.5 text-2xl font-semibold'>Reset Your Password</CardTitle>
            <CardDescription className='text-sm'>
              Enter your new password below to update your account details.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className='space-y-6 px-6'>
          <ResetPasswordForm />

          <Button variant='ghost' className='group w-full' render={<Link href='/auth/login' />}>
            <ChevronLeftIcon className='size-5 transition-transform duration-200 group-hover:-translate-x-0.5 mr-1' />
            Back to login
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default ResetPassword
