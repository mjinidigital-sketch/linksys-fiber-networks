import Link from 'next/link'
import { FooterContent, GeneralSettings } from '@/lib/types/content'
import { Mail, Phone } from 'lucide-react'

interface FooterProps {
  footer?: FooterContent
  general?: GeneralSettings
}

export function Footer({ footer, general }: FooterProps) {
  const rawPhone = general?.phone?.replace(/\s+/g, '') || ''
  const waPhone = rawPhone.replace('+', '')

  return (
    <footer className="border-t border-border mt-16 pt-8 pb-8 text-sm text-muted-foreground">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        {/* Left: copyright */}
        <span>{footer?.copyright || '© 2026 Linksys Fiber Networks LTD. All rights reserved.'}</span>

        {/* Center: contact details */}
        <div className="flex flex-col gap-2 sm:items-center">
          {general?.email && (
            <a
              href={`mailto:${general.email}`}
              className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <Mail className="size-3.5" />
              {general.email}
            </a>
          )}
          {rawPhone && (
            <div className="flex items-center gap-3">
              <a
                href={`tel:${rawPhone}`}
                className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
              >
                <Phone className="size-3.5" />
                {general?.phone}
              </a>
              <span className="text-muted-foreground/40">·</span>
              <a
                href={`https://wa.me/${waPhone}`}
                target="_blank"
                rel="noreferrer"
                className="text-[#25D366] hover:text-[#1ebe5d] transition-colors font-medium"
              >
                WhatsApp
              </a>
            </div>
          )}
        </div>

        {/* Right: nav links */}
        <div className="flex flex-wrap gap-5">
          {footer?.links?.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}
