import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('drivers')
    .select('id, name, phone, vehicle, plate, status, created_at')
    .order('name', { ascending: true })

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, drivers: data })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, phone, vehicle, plate } = body

  if (!name?.trim())    return NextResponse.json({ success: false, message: 'Name is required' }, { status: 400 })
  if (!phone?.trim())   return NextResponse.json({ success: false, message: 'Phone is required' }, { status: 400 })
  if (!vehicle?.trim()) return NextResponse.json({ success: false, message: 'Vehicle is required' }, { status: 400 })
  if (!plate?.trim())   return NextResponse.json({ success: false, message: 'Plate is required' }, { status: 400 })

  const { data, error } = await supabase
    .from('drivers')
    .insert({ name: name.trim(), phone: phone.trim(), vehicle: vehicle.trim(), plate: plate.trim().toUpperCase(), status: 'available' })
    .select('id, name, phone, vehicle, plate, status, created_at')
    .single()

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, driver: data })
}
