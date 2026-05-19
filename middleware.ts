import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Only protect admin pages and driver API routes
  if (!pathname.startsWith('/admin') && !pathname.startsWith('/api/drivers')) {
    return NextResponse.next()
  }

  const password = process.env.ADMIN_PASSWORD
  if (!password) return NextResponse.next()

  const auth = req.headers.get('authorization') ?? ''
  const expected = 'Basic ' + btoa(`admin:${password}`)

  if (auth !== expected) {
    return new NextResponse('Unauthorised', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="CabsOnline Admin"' },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/(.*)',],
}
