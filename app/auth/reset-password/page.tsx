import { Suspense } from 'react'
import ResetPassword from "@/components/reset-password"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

const ResetPasswordPage = () => {
  return (
    <div className="relative min-h-screen">
      <Link 
        href="/" 
        className="top-4 left-4 z-50 absolute flex items-center gap-2 text-sm font-medium text-primary dark:text-secondary hover:underline"
      >
        <ArrowLeft className="size-4" />
        Back to Home
      </Link>
      
      <Suspense fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }>
        <ResetPassword />
      </Suspense>
    </div>
  )
}

export default ResetPasswordPage
