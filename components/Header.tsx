'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/book', label: 'Book a Taxi' },
  { href: '/track', label: 'Track Booking' },
  { href: '/admin', label: 'Admin' },
]

export default function Header() {
  const pathname = usePathname()
  return (
    <header className="bg-yellow-400 shadow-md">
      <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🚕</span>
          <span className="font-bold text-xl text-gray-900">CabsOnline</span>
          <span className="text-xs text-gray-700 hidden sm:block">Auckland Taxi Booking</span>
        </div>
        <nav className="flex gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                pathname === link.href
                  ? 'bg-gray-900 text-yellow-400'
                  : 'text-gray-900 hover:bg-yellow-300'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
