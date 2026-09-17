'use client'

import { ArrowUpRight, Mail } from "lucide-react"
import Link from "next/link"
import { badgeVariants } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { HeroContent, SocialLink } from '@/lib/types/content'

interface Hero2Props {
  hero?: HeroContent
  socials?: SocialLink[]
}

export function Hero2({
  hero,
}: Hero2Props) {
  if (!hero) return null
  return (
    <div className="flex min-h-[50vh] lg:min-h-[60vh] items-center justify-start py-8 lg:py-12">
      <div className="w-full max-w-5xl text-left flex flex-col items-start">
        {hero.badge && (
          <div className="flex justify-start">
            <Link 
              href={hero.primaryCtaLink || '/contact'}
              className={cn(
                badgeVariants({ variant: "secondary" }), 
                "rounded-full border border-border/80 bg-secondary/80 hover:bg-secondary px-4 py-1.5 text-xs font-semibold tracking-wide transition-colors"
              )}
            >
              {hero.badge} <ArrowUpRight className="ml-1.5 size-3.5" />
            </Link>
          </div>
        )}

        <h1 className="mt-4 font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-6xl tracking-tight text-foreground leading-[1.12]">
          {hero.titleLine1}{' '}
          <span className="text-primary dark:text-secondary">{hero.titleHighlight1}</span>
          {hero.titleLine2 && (
            <>
              <br />
              {hero.titleLine2}{' '}
              <span className="text-primary dark:text-secondary">{hero.titleHighlight2}</span>
            </>
          )}
        </h1>

        {hero.bio && (
          <p className="mt-5 max-w-3xl text-left text-muted-foreground text-base sm:text-lg md:text-xl leading-relaxed">
            {hero.bio}
          </p>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-4 justify-start">
          {hero.primaryCtaText && (
            <Link 
              href={hero.primaryCtaLink || '/contact'}
              className={cn(buttonVariants({ size: "lg" }), "rounded-full px-7 py-3 font-semibold shadow-lg shadow-primary/20 hover:scale-105 transition-all")}
            >
              {hero.primaryCtaText} <ArrowUpRight className="ml-2 h-5 w-5" />
            </Link>
          )}
          {hero.secondaryCtaText && (
            <Link 
              href={hero.secondaryCtaLink || '/contact'}
              className={cn(buttonVariants({ size: "lg", variant: "outline" }), "border-secondary dark:border-secondary/80 rounded-full px-7 py-3 font-semibold hover:bg-secondary/80 transition-all")}
            >
              <Mail className="mr-2 h-5 w-5 text-secondary" /> {hero.secondaryCtaText}
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

