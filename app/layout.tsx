import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'

export const metadata: Metadata = {
  title: 'CabsOnline - Auckland Taxi Booking',
  description: 'Fast, reliable taxi bookings across Auckland',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 min-h-screen flex flex-col">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-1">
          {children}
        </main>
        <footer className="text-center py-4 text-sm text-gray-400 border-t">
          CabsOnline — Auckland Taxi Booking Service &copy; 2026
        </footer>
      </body>
    </html>
  )
}
