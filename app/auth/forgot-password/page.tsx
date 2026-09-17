import ForgotPassword from "@/components/forgot-password"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react" // 💡 Changed to a traditional back arrow
import Link from "next/link"

const ForgotPasswordPage = () => {
  return (
    // 💡 Added relative positioning and high z-index container to ensure it stays clickable
    <div className="relative min-h-screen">
      <Link 
        href="/" 
        className="top-4 left-4 z-50 absolute flex items-center gap-2 text-sm font-medium text-primary dark:text-secondary hover:underline"
      >
        <ArrowLeft className="size-4" /> {/* 💡 Left arrow matches "Back to Home" intent */}
        Back to Home
      </Link>
      
      <ForgotPassword />
    </div>
  )
}

export default ForgotPasswordPage
