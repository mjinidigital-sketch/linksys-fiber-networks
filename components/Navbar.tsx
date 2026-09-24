'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  Loader2, 
  Moon, 
  Sun, 
  Mail, 
  MapPin, 
  Menu, 
  X, 
  Phone,
  ShieldCheck,
} from 'lucide-react'
import { FaFacebook, FaGithub, FaXTwitter } from 'react-icons/fa6'
import { NavigationContent, GeneralSettings } from '@/lib/types/content'
import { Button } from './ui/button'
import { useConvexAuth, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { authClient } from "@/lib/auth-client"
import { toast } from "@/components/ui/toast"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import Image from 'next/image'

interface NavbarProps {
  navigation?: NavigationContent
  general?: GeneralSettings
}

export function Navbar({ 
  navigation, 
  general 
}: NavbarProps) {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    setMounted(true)
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setIsDark(document.documentElement.classList.contains('dark') || prefersDark)

    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function toggleTheme() {
    const nextIsDark = !isDark
    setIsDark(nextIsDark)
    document.documentElement.classList.toggle('dark', nextIsDark)
  }
  
  const { isAuthenticated, isLoading } = useConvexAuth()
  const userProfile = useQuery(
    api.users.getCurrentUserWithProfile,
    isAuthenticated ? {} : "skip"
  )
  const isAdminOrEditor = userProfile?.role === "admin" || userProfile?.role === "editor"
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleSignOut = async () => {
    startTransition(async () => {
      const { error } = await authClient.signOut()
      if (error) {
        toast.add({
          title: "Logout failed",
          description: error.message || "Something went wrong",
        })
        return
      }
      toast.add({
        title: "Logout",
        description: "Logged out successfully",
      })
      router.push("/")
      router.refresh()
    })
  }

  const phone = general?.phone || '+254 713 366 366'
  const email = general?.email || 'info@linksysfiber.ke'
  const location = general?.location || 'Generis Hotel Building, Ground Floor, Molo'
  const cleanPhone = phone.replace(/\s+/g, '')

  const navLinks = navigation?.links || [
    { label: 'Packages', href: '/packages' },
    { label: 'Services', href: '/services' },
    { label: 'Projects', href: '/projects' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact', href: '/contact' },
  ]

  return (
    <nav className="relative z-50">

      {/* Topbar — hides on scroll */}
      <div
        className="px-4 sm:px-6 md:px-8 lg:px-12 w-full border-b border-border/50 bg-primary text-secondary dark:text-white text-xs transition-all duration-300 ease-in-out overflow-hidden"
        style={{
          maxHeight: scrolled ? '0px' : '40px',
          paddingTop: scrolled ? '0px' : '',
          paddingBottom: scrolled ? '0px' : '',
          opacity: scrolled ? 0 : 1,
        }}
      >
        <div className="py-1.5 w-full max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-y-2 gap-x-4">
          {/* Left: Mobile & Email */}
          <div className="flex items-center flex-wrap gap-4 sm:gap-6">
            <a 
              href={`tel:${cleanPhone}`}
              className="inline-flex items-center gap-1.5 hover:text-primary transition-colors font-medium"
              title="Call us"
            >
              <Phone className="size-3.5 text-accent shrink-0" />
              <span className='text-secondary'>{phone}</span>
            </a>
            <span className="hidden sm:inline text-border">|</span>
            <a 
              href={`mailto:${email}`}
              className="inline-flex items-center gap-1.5 hover:text-primary transition-colors font-medium"
              title="Send email"
            >
              <Mail className="size-3.5 text-accent shrink-0" />
              <span className='text-secondary'>{email}</span>
            </a>
          </div>

          {/* Right: Address & Socials */}
          <div className="flex items-center flex-wrap gap-4 sm:gap-6 ml-auto">
            <div className="hidden md:inline-flex items-center gap-1.5 text-muted font-medium">
              <MapPin className="size-3.5 text-accent shrink-0" />
              <span className="truncate max-w-[280px] lg:max-w-none text-secondary">{location}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter / X"
                className="bg-secondary/80 p-1 rounded-md text-secondary-foreground hover:text-primary hover:bg-background/80 transition-all"
                title="Twitter / X"
              >
                <FaXTwitter className="size-3.5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="bg-secondary/80 p-1 rounded-md text-secondary-foreground hover:text-primary hover:bg-background/80 transition-all"
                title="GitHub"
              >
                <FaFacebook className="size-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    <div
      className={`px-4 md:px-8 lg:px-12 w-full transition-all duration-300 ${
        scrolled ? 'fixed top-0 left-0 right-0 shadow-md z-50' : ''
      }`}
    >
    

      {/* Main Navbar */}
      <div className="relative overflow-hidden w-full border-b border-border/60 bg-background/90 backdrop-blur-md">
        {/* ── Background Subtle SVG Pattern ── */}
        <div
          className="absolute inset-0 pointer-events-none -z-10 overflow-hidden select-none"
          aria-hidden="true"
        >
          {/* Subtle Ambient Light Glows */}
          <div
            className="absolute -top-10 left-1/4 w-[350px] h-[100px] rounded-full blur-[60px] opacity-25 dark:opacity-15 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(3, 74, 113, 0.35) 0%, rgba(13, 164, 245, 0.15) 50%, transparent 80%)',
            }}
          />
          <div
            className="absolute -bottom-10 right-1/4 w-[350px] h-[100px] rounded-full blur-[60px] opacity-20 dark:opacity-10 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(119, 192, 65, 0.3) 0%, transparent 80%)',
            }}
          />

          {/* SVG Subtle Pattern Canvas */}
          <svg
            className="absolute inset-0 w-full h-full"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Soft Edge Fade Mask */}
              <linearGradient id="nav-mask-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
                <stop offset="20%" stopColor="#ffffff" stopOpacity="0.8" />
                <stop offset="80%" stopColor="#ffffff" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
              </linearGradient>
              <mask id="nav-grid-mask">
                <rect width="100%" height="100%" fill="url(#nav-mask-grad)" />
              </mask>

              {/* Subtle Micro-Grid */}
              <pattern
                id="nav-tech-pattern"
                width="32"
                height="32"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="16" cy="16" r="0.75" className="fill-foreground/10 dark:fill-white/15" />
                <line x1="16" y1="13" x2="16" y2="19" stroke="currentColor" strokeWidth="0.5" className="stroke-foreground/[0.06] dark:stroke-white/[0.08]" />
                <line x1="13" y1="16" x2="19" y2="16" stroke="currentColor" strokeWidth="0.5" className="stroke-foreground/[0.06] dark:stroke-white/[0.08]" />
              </pattern>
            </defs>

            {/* Micro-Grid Pattern */}
            <rect
              width="100%"
              height="100%"
              fill="url(#nav-tech-pattern)"
              mask="url(#nav-grid-mask)"
            />
          </svg>
        </div>

        <header className="relative z-10 w-full max-w-7xl mx-auto flex items-center justify-between py-3 ">
          <div className="flex items-center">
            <Link href="/" className="rounded-xl">
              <Image src="/logo.webp" alt="Logo" width={180} height={40} className='dark:brightness-200' />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="flex items-center gap-6">
            <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
                     
            <div className="flex items-center gap-2">
              
              <div className="hidden sm:flex items-center gap-2">
                {isLoading ? null : isAuthenticated ? (
                  <div className="flex items-center gap-2">
                    {isAdminOrEditor && (
                      <Link href="/admin">
                        <Button size="lg" variant="default" className="gap-1.5 font-semibold shadow-xs">
                          <ShieldCheck className="size-4" />
                          <span>Admin Panel</span>
                        </Button>
                      </Link>
                    )}
                    <Button onClick={handleSignOut} disabled={isPending} size="lg" variant="outline">
                      {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing out...</> : "Logout"}
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button variant="outline" size="lg" render={<a href="/auth/login" />} nativeButton={false}>
                      Login
                    </Button>
                    <Button variant="default" size="lg" render={<a href="/auth/sign-up" />} nativeButton={false}>
                      Signup
                    </Button>
                  </>
                )}
              </div>
            </div>

            <button
                type="button"
                onClick={toggleTheme}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary cursor-pointer"
              >
                {mounted && isDark ? (
                  <Sun className="size-4" aria-hidden="true" />
                ) : (
                  <Moon className="size-4" aria-hidden="true" />
                )}
              </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden inline-flex size-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>

          </div>
        </header>
      </div>

      {/* Mobile Drawer/Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden w-full border-b border-border bg-background/95 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Mobile Auth Buttons */}
            <div className="pt-2 border-t border-border flex flex-col gap-2">
              {isLoading ? null : isAuthenticated ? (
                <div className="flex flex-col gap-2">
                  {isAdminOrEditor && (
                    <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="w-full">
                      <Button variant="default" className="w-full gap-2 font-semibold shadow-xs">
                        <ShieldCheck className="size-4" />
                        <span>Open Admin Panel</span>
                      </Button>
                    </Link>
                  )}
                  <Button onClick={handleSignOut} disabled={isPending} variant="outline" className="w-full">
                    {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing out...</> : "Logout"}
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" render={<a href="/auth/login" />} nativeButton={false} className="w-full">
                    Login
                  </Button>
                  <Button variant="default" render={<a href="/auth/sign-up" />} nativeButton={false} className="w-full">
                    Signup
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Address Detail in dropdown */}
            <div className="pt-2 border-t border-border/60 text-xs text-muted-foreground flex items-center gap-1.5">
              <MapPin className="size-3.5 text-primary shrink-0" />
              <span>{location}</span>
            </div>
          </div>
        </div>
      )}
    </div>
    </nav>
  )
}