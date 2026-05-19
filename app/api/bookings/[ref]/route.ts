import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { isValidBRN } from '@/lib/utils'

export async function PATCH(req: NextRequest, { params }: { params: { ref: string } }) {
  const ref = params.ref.toUpperCase()

  if (!isValidBRN(ref)) {
    return NextResponse.json({ success: false, message: 'Invalid booking reference format' }, { status: 400 })
  }

  const body = await req.json().catch(() => ({}))
  const driverId: number | null = body.driver_id ?? null
  const newStatus: string | null = body.status ?? null

  // Status progression: assigned → in_progress → completed
  if (newStatus && ['in_progress', 'completed'].includes(newStatus)) {
    const fromStatus = newStatus === 'in_progress' ? 'assigned' : 'in_progress'
    const { data, error } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('booking_ref', ref)
      .eq('status', fromStatus)
      .select('booking_ref')
      .single()

    if (error || !data) {
      return NextResponse.json({ success: false, message: 'Booking not found or wrong status' }, { status: 404 })
    }

    // Free the driver up when trip completes
    if (newStatus === 'completed') {
      const { data: booking } = await supabase
        .from('bookings')
        .select('driver_id')
        .eq('booking_ref', ref)
        .single()
      if (booking?.driver_id) {
        await supabase.from('drivers').update({ status: 'available' }).eq('id', booking.driver_id)
      }
    }

    return NextResponse.json({ success: true, booking_ref: data.booking_ref, status: newStatus })
  }

  // Initial assignment: unassigned → assigned with driver selection
  if (!driverId) {
    return NextResponse.json({ success: false, message: 'A driver must be selected' }, { status: 400 })
  }

  const [bookingResult] = await Promise.all([
    supabase
      .from('bookings')
      .update({ status: 'assigned', driver_id: driverId })
      .eq('booking_ref', ref)
      .eq('status', 'unassigned')
      .select('booking_ref')
      .single(),
    supabase
      .from('drivers')
      .update({ status: 'busy' })
      .eq('id', driverId),
  ])

  if (bookingResult.error || !bookingResult.data) {
    return NextResponse.json({ success: false, message: 'Booking not found or already assigned' }, { status: 404 })
  }

  return NextResponse.json({ success: true, booking_ref: bookingResult.data.booking_ref, status: 'assigned' })
}

export async function GET(_req: NextRequest, { params }: { params: { ref: string } }) {
  const ref = params.ref.toUpperCase()

  if (!isValidBRN(ref)) {
    return NextResponse.json({ success: false, message: 'Invalid booking reference format' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      id, booking_ref, cname, phone, unumber, snumber, stname, sbname, dsbname,
      pickup_date, pickup_time, booking_datetime, status, driver_id,
      pickup_lat, pickup_lng, estimated_fare,
      driver:drivers ( id, name, phone, vehicle, plate, status )
    `)
    .eq('booking_ref', ref)
    .single()

  if (error || !data) {
    return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true, booking: data })
}
