import { NextRequest, NextResponse } from 'next/server'
import { getFare } from '@/lib/fareRates'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from') ?? ''
  const to = searchParams.get('to') ?? ''

  if (!from || !to) {
    return NextResponse.json({ success: false, message: 'Both from and to suburbs are required' }, { status: 400 })
  }

  const result = getFare(from, to)
  return NextResponse.json({ success: true, ...result })
}
