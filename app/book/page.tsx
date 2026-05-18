'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import FareEstimator from '@/components/FareEstimator'
import { defaultDateTime, parseDMY, parseHHMM, isValidPhone, dmyToISO } from '@/lib/utils'

const MapPicker = dynamic(() => import('@/components/MapPicker'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center text-gray-500 text-sm">
      Loading map...
    </div>
  ),
})

interface FormData {
  cname: string; phone: string; unumber: string; snumber: string
  stname: string; sbname: string; dsbname: string; pickup_date: string; pickup_time: string
}
type Errors = Partial<Record<keyof FormData, string>>

export default function BookPage() {
  const [form, setForm] = useState<FormData>({
    cname: '', phone: '', unumber: '', snumber: '', stname: '', sbname: '', dsbname: '',
    pickup_date: '', pickup_time: '',
  })
  const [errors, setErrors] = useState<Errors>({})
  const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [estimatedFare, setEstimatedFare] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [confirmation, setConfirmation] = useState<{ booking_ref: string; pickup_date: string; pickup_time: string } | null>(null)
  const [serverError, setServerError] = useState('')
  const [showMap, setShowMap] = useState(false)

  useEffect(() => {
    const dt = defaultDateTime()
    setForm((f) => ({ ...f, pickup_date: dt.date, pickup_time: dt.time }))
  }, [])

  const setField = (field: keyof FormData, value: string) => {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: '' }))
  }

  const handleLocationSelect = ({ lat, lng, snumber, stname, sbname }: {
    lat: number; lng: number; snumber: string; stname: string; sbname: string
  }) => {
    setMapCoords({ lat, lng })
    setForm((f) => ({
      ...f,
      snumber: snumber || f.snumber,
      stname: stname || f.stname,
      sbname: sbname || f.sbname,
    }))
    setErrors((e) => ({ ...e, snumber: '', stname: '', sbname: '' }))
  }

  const validate = (): boolean => {
    const newErrors: Errors = {}
    if (!form.cname.trim()) newErrors.cname = 'Customer name is required'
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required'
    else if (!isValidPhone(form.phone)) newErrors.phone = 'Phone must be 10-12 digits'
    if (!form.snumber.trim()) newErrors.snumber = 'Street number is required'
    if (!form.stname.trim()) newErrors.stname = 'Street name is required'
    if (!form.pickup_date.trim()) newErrors.pickup_date = 'Pickup date is required'
    else if (!parseDMY(form.pickup_date)) newErrors.pickup_date = 'Use DD/MM/YYYY format'
    if (!form.pickup_time.trim()) newErrors.pickup_time = 'Pickup time is required'
    else if (!parseHHMM(form.pickup_time)) newErrors.pickup_time = 'Use HH:MM (24h) format'
    else {
      const isoDate = dmyToISO(form.pickup_date)
      const pickupMs = new Date(`${isoDate}T${form.pickup_time}:00`).getTime()
      if (pickupMs < Date.now()) newErrors.pickup_time = 'Pickup time cannot be in the past'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError('')
    if (!validate()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          pickup_lat: mapCoords?.lat ?? null,
          pickup_lng: mapCoords?.lng ?? null,
          estimated_fare: estimatedFare,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setConfirmation({ booking_ref: data.booking_ref, pickup_date: data.pickup_date, pickup_time: data.pickup_time })
        const dt = defaultDateTime()
        setForm({ cname: '', phone: '', unumber: '', snumber: '', stname: '', sbname: '', dsbname: '', pickup_date: dt.date, pickup_time: dt.time })
        setMapCoords(null)
        setEstimatedFare(null)
      } else {
        setServerError(data.message ?? 'Booking failed')
      }
    } catch {
      setServerError('Network error — please try again')
    } finally {
      setSubmitting(false)
    }
  }

  const FieldError = ({ field }: { field: keyof FormData }) =>
    errors[field] ? <p className="text-red-600 text-xs mt-1">{errors[field]}</p> : null

  const inputClass = (field: keyof FormData) =>
    `w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 ${errors[field] ? 'border-red-400' : 'border-gray-300'}`

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Book a Taxi</h1>

      {confirmation && (
        <div className="mb-6 bg-green-50 border border-green-300 rounded-lg p-4">
          <h2 className="font-bold text-green-800 text-lg mb-1">Booking Confirmed!</h2>
          <p className="text-green-700">Your booking reference is <strong>{confirmation.booking_ref}</strong></p>
          <p className="text-green-700">Pickup: {confirmation.pickup_date} at {confirmation.pickup_time}</p>
          <p className="text-sm text-green-600 mt-2">Save your reference to track your booking status.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5 bg-white rounded-xl shadow p-6">
        {/* Passenger Details */}
        <section>
          <h2 className="font-semibold text-gray-700 mb-3 border-b pb-1">Passenger Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name <span className="text-red-500">*</span></label>
              <input type="text" value={form.cname} onChange={(e) => setField('cname', e.target.value)} className={inputClass('cname')} placeholder="Full name" />
              <FieldError field="cname" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
              <input type="tel" value={form.phone} onChange={(e) => setField('phone', e.target.value)} className={inputClass('phone')} placeholder="021XXXXXXX" />
              <FieldError field="phone" />
            </div>
          </div>
        </section>

        {/* Map Pickup */}
        <section>
          <h2 className="font-semibold text-gray-700 mb-3 border-b pb-1">Pickup Location</h2>
          <div className="mb-3">
            <button
              type="button"
              onClick={() => setShowMap((v) => !v)}
              className="text-sm text-blue-600 hover:underline"
            >
              {showMap ? 'Hide map' : 'Use map to set pickup location (optional)'}
            </button>
          </div>
          {showMap && (
            <div className="mb-4">
              <MapPicker onLocationSelect={handleLocationSelect} />
            </div>
          )}
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit #</label>
              <input type="text" value={form.unumber} onChange={(e) => setField('unumber', e.target.value)} className={inputClass('unumber')} placeholder="Optional" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Street # <span className="text-red-500">*</span></label>
              <input type="text" value={form.snumber} onChange={(e) => setField('snumber', e.target.value)} className={inputClass('snumber')} placeholder="42" />
              <FieldError field="snumber" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Street Name <span className="text-red-500">*</span></label>
              <input type="text" value={form.stname} onChange={(e) => setField('stname', e.target.value)} className={inputClass('stname')} placeholder="Queen Street" />
              <FieldError field="stname" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Suburb</label>
            <input type="text" value={form.sbname} onChange={(e) => setField('sbname', e.target.value)} className={inputClass('sbname')} placeholder="Auckland CBD" />
          </div>
        </section>

        {/* Trip Details */}
        <section>
          <h2 className="font-semibold text-gray-700 mb-3 border-b pb-1">Trip Details</h2>
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Destination Suburb</label>
            <input type="text" value={form.dsbname} onChange={(e) => setField('dsbname', e.target.value)} className={inputClass('dsbname')} placeholder="Newmarket" />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Date <span className="text-red-500">*</span></label>
              <input type="text" value={form.pickup_date} onChange={(e) => setField('pickup_date', e.target.value)} className={inputClass('pickup_date')} placeholder="DD/MM/YYYY" />
              <FieldError field="pickup_date" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Time <span className="text-red-500">*</span></label>
              <input type="text" value={form.pickup_time} onChange={(e) => setField('pickup_time', e.target.value)} className={inputClass('pickup_time')} placeholder="HH:MM" />
              <FieldError field="pickup_time" />
            </div>
          </div>

          {/* Fare Estimator */}
          <FareEstimator
            fromSuburb={form.sbname}
            toSuburb={form.dsbname}
            onEstimate={setEstimatedFare}
          />
        </section>

        {serverError && <p className="text-red-600 text-sm">{serverError}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Book Taxi'}
        </button>
      </form>
    </div>
  )
}
