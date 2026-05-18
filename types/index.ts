export interface Driver {
  id: number
  name: string
  phone: string
  vehicle: string
  plate: string
  status: 'available' | 'busy' | 'offline'
  created_at: string
}

export interface Booking {
  id: number
  booking_ref: string
  cname: string
  phone: string
  unumber?: string
  snumber: string
  stname: string
  sbname?: string
  dsbname?: string
  pickup_date: string
  pickup_time: string
  booking_datetime: string
  status: 'unassigned' | 'assigned' | 'in_progress' | 'completed'
  driver_id?: number
  driver?: Driver
  pickup_lat?: number
  pickup_lng?: number
  estimated_fare?: number
}
