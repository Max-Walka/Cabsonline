import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { dmyToISO, isValidPhone, parseDMY, parseHHMM } from '@/lib/utils'

export async function GET() {
  const now = new Date()
  const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000)
  const todayISO = now.toISOString().slice(0, 10)
  const tomorrowISO = twoHoursLater.toISOString().slice(0, 10)

  const dates = todayISO === tomorrowISO ? [todayISO] : [todayISO, tomorrowISO]

  const { data, error } = await supabase
    .from('bookings')
    .select('id, booking_ref, cname, phone, sbname, dsbname, pickup_date, pickup_time, status')
    .eq('status', 'unassigned')
    .in('pickup_date', dates)
    .order('pickup_date', { ascending: true })
    .order('pickup_time', { ascending: true })

  if (error) {
    console.error('Admin search error:', error)
    return NextResponse.json({ success: false, message: 'Database error' }, { status: 500 })
  }

  // Filter to pickups within the next 2 hours
  const upcoming = (data ?? []).filter((b) => {
    const pickupDT = new Date(`${b.pickup_date}T${b.pickup_time}`)
    return pickupDT >= now && pickupDT <= twoHoursLater
  })

  return NextResponse.json({ success: true, bookings: upcoming })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { cname, phone, unumber, snumber, stname, sbname, dsbname, pickup_date, pickup_time, pickup_lat, pickup_lng, estimated_fare } = body

  if (!cname?.trim()) return NextResponse.json({ success: false, message: 'Customer name is required' }, { status: 400 })
  if (!phone?.trim() || !isValidPhone(phone)) return NextResponse.json({ success: false, message: 'Valid phone number is required' }, { status: 400 })
  if (!snumber?.trim()) return NextResponse.json({ success: false, message: 'Street number is required' }, { status: 400 })
  if (!stname?.trim()) return NextResponse.json({ success: false, message: 'Street name is required' }, { status: 400 })
  if (!parseDMY(pickup_date)) return NextResponse.json({ success: false, message: 'Valid pickup date required (DD/MM/YYYY)' }, { status: 400 })
  if (!parseHHMM(pickup_time)) return NextResponse.json({ success: false, message: 'Valid pickup time required (HH:MM)' }, { status: 400 })

  const isoDate = dmyToISO(pickup_date)

  // Generate booking_ref server-side: find the highest existing number and increment
  const { data: last } = await supabase
    .from('bookings')
    .select('booking_ref')
    .order('id', { ascending: false })
    .limit(1)
    .maybeSingle()

  let nextNum = 1
  if (last?.booking_ref) {
    const match = last.booking_ref.match(/BRN(\d+)/)
    if (match) nextNum = parseInt(match[1], 10) + 1
  }
  const bookingRef = `BRN${String(nextNum).padStart(5, '0')}`

  const { data, error } = await supabase
    .from('bookings')
    .insert({
      booking_ref: bookingRef,
      cname: cname.trim(),
      phone: phone.trim(),
      unumber: unumber?.trim() || null,
      snumber: snumber.trim(),
      stname: stname.trim(),
      sbname: sbname?.trim() || null,
      dsbname: dsbname?.trim() || null,
      pickup_date: isoDate,
      pickup_time,
      pickup_lat: pickup_lat ?? null,
      pickup_lng: pickup_lng ?? null,
      estimated_fare: estimated_fare ?? null,
    })
    .select('booking_ref, pickup_date, pickup_time')
    .single()

  if (error) {
    console.error('Booking insert error:', error.message, error.details, error.hint)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    booking_ref: data.booking_ref,
    pickup_date: data.pickup_date,
    pickup_time: data.pickup_time,
  })
}
