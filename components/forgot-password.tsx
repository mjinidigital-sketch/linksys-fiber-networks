import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'


import { ChevronLeftIcon } from 'lucide-react'
import ForgotPasswordForm from './forgot-password-form'

const ForgotPassword = () => {
  return (
    <div className='relative flex h-auto min-h-screen items-center justify-center overflow-x-hidden px-4 py-10 sm:px-6 lg:px-8'>
     

      <Card className='z-1 w-full gap-6 py-6 sm:max-w-md p-6'>
        <CardHeader className='gap-6 px-6'>

          <div>
            <CardTitle className='mb-1.5 text-2xl font-semibold'>Forgot Password?</CardTitle>
            <CardDescription className='text-sm'>
              Enter your email and we&apos;ll send you instructions to reset your password
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className='space-y-6 px-6'>
          {/* ForgotPassword Form */}
          <ForgotPasswordForm />

          <Button variant='ghost' className='group w-full' render={<a href='#' />} nativeButton={false}>
            <ChevronLeftIcon className='size-5 transition-transform duration-200 group-hover:-translate-x-0.5' />
            Back to login
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default ForgotPassword
