'use client'

import { useState } from 'react'
import { Booking } from '@/types'
import { formatDateDisplay, formatTimeDisplay, isValidBRN } from '@/lib/utils'

const STEPS = [
  { key: 'unassigned', label: 'Booking Received', desc: 'Your booking is confirmed and awaiting a driver' },
  { key: 'assigned', label: 'Driver Assigned', desc: 'A driver has been assigned to your trip' },
  { key: 'in_progress', label: 'In Progress', desc: 'Your driver is on the way or trip is underway' },
  { key: 'completed', label: 'Completed', desc: 'Your trip has been completed' },
]

function StatusStepper({ status }: { status: string }) {
  const currentIndex = STEPS.findIndex((s) => s.key === status)
  return (
    <div className="relative">
      {/* Connector line */}
      <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200" />
      <div className="space-y-4">
        {STEPS.map((step, i) => {
          const done = i < currentIndex
          const active = i === currentIndex
          return (
            <div key={step.key} className="flex items-start gap-4 relative">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 z-10 ${
                  done ? 'bg-green-500 text-white' : active ? 'bg-yellow-400 text-gray-900' : 'bg-gray-200 text-gray-400'
                }`}
              >
                {done ? '✓' : i + 1}
              </div>
              <div className="pt-1">
                <p className={`font-medium text-sm ${active ? 'text-gray-900' : done ? 'text-green-700' : 'text-gray-400'}`}>
                  {step.label}
                </p>
                {active && <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function TrackPage() {
  const [brnInput, setBrnInput] = useState('')
  const [inputError, setInputError] = useState('')
  const [booking, setBooking] = useState<Booking | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleTrack = async () => {
    const val = brnInput.trim().toUpperCase()
    if (!val) { setInputError('Please enter a booking reference'); return }
    if (!isValidBRN(val)) { setInputError('Format must be BRN followed by 5 digits (e.g. BRN00001)'); return }
    setInputError('')
    setNotFound(false)
    setBooking(null)
    setLoading(true)
    try {
      const res = await fetch(`/api/bookings/${val}`)
      const data = await res.json()
      if (data.success) {
        setBooking(data.booking)
      } else {
        setNotFound(true)
      }
    } catch {
      setInputError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Track Your Booking</h1>

      {/* Search */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Booking Reference</label>
        <div className="flex gap-3">
          <input
            type="text"
            value={brnInput}
            onChange={(e) => { setBrnInput(e.target.value); setInputError('') }}
            onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
            className={`flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 ${inputError ? 'border-red-400' : 'border-gray-300'}`}
            placeholder="e.g. BRN00001"
          />
          <button
            onClick={handleTrack}
            disabled={loading}
            className="px-5 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium rounded text-sm disabled:opacity-50"
          >
            {loading ? 'Tracking...' : 'Track'}
          </button>
        </div>
        {inputError && <p className="text-red-600 text-sm mt-2">{inputError}</p>}
      </div>

      {/* Not Found */}
      {notFound && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center">
          <p className="text-red-700 font-medium">Booking not found</p>
          <p className="text-red-500 text-sm mt-1">Check the reference and try again</p>
        </div>
      )}

      {/* Booking Result */}
      {booking && (
        <div className="space-y-4">
          {/* Booking Info */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs text-gray-500">Booking Reference</p>
                <p className="font-mono font-bold text-lg">{booking.booking_ref}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                booking.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                booking.status === 'assigned' ? 'bg-blue-100 text-blue-700' :
                'bg-red-100 text-red-700'
              }`}>
                {booking.status.replace('_', ' ')}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500">Customer</p>
                <p className="font-medium">{booking.cname}</p>
              </div>
              <div>
                <p className="text-gray-500">Pickup</p>
                <p className="font-medium">{formatDateDisplay(booking.pickup_date)} at {formatTimeDisplay(booking.pickup_time)}</p>
              </div>
              <div>
                <p className="text-gray-500">From</p>
                <p className="font-medium">{[booking.snumber, booking.stname, booking.sbname].filter(Boolean).join(' ')}</p>
              </div>
              <div>
                <p className="text-gray-500">To</p>
                <p className="font-medium">{booking.dsbname || '—'}</p>
              </div>
              {booking.estimated_fare && (
                <div>
                  <p className="text-gray-500">Estimated Fare</p>
                  <p className="font-medium text-green-700">${booking.estimated_fare.toFixed(2)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Status Stepper */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="font-semibold text-gray-700 mb-4">Trip Status</h2>
            <StatusStepper status={booking.status} />
          </div>

          {/* Driver Info (shown once assigned) */}
          {booking.driver && booking.status !== 'unassigned' && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <h2 className="font-semibold text-blue-800 mb-3">Your Driver</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-blue-600">Name</p>
                  <p className="font-medium text-blue-900">{booking.driver.name}</p>
                </div>
                <div>
                  <p className="text-blue-600">Phone</p>
                  <p className="font-medium text-blue-900">{booking.driver.phone}</p>
                </div>
                <div>
                  <p className="text-blue-600">Vehicle</p>
                  <p className="font-medium text-blue-900">{booking.driver.vehicle}</p>
                </div>
                <div>
                  <p className="text-blue-600">Plate</p>
                  <p className="font-mono font-medium text-blue-900">{booking.driver.plate}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
