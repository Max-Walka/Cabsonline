'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { isValidBRN, formatDateDisplay, formatTimeDisplay } from '@/lib/utils'
import { Driver } from '@/types'

interface AdminBooking {
  id: number
  booking_ref: string
  cname: string
  phone: string
  sbname: string | null
  dsbname: string | null
  pickup_date: string
  pickup_time: string
  status: string
}

export default function AdminPage() {
  const [bsearch, setBsearch] = useState('')
  const [searchError, setSearchError] = useState('')
  const [bookings, setBookings] = useState<AdminBooking[]>([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [confirmations, setConfirmations] = useState<string[]>([])

  // Available drivers for the dropdown
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([])
  // Per-row: which driver is selected { booking_ref → driver_id }
  const [selectedDrivers, setSelectedDrivers] = useState<Record<string, string>>({})
  const [assigning, setAssigning] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetch('/api/drivers')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setAvailableDrivers(d.drivers.filter((dr: Driver) => dr.status === 'available'))
      })
  }, [])

  const handleSearch = async () => {
    const val = bsearch.trim().toUpperCase()
    setSearchError('')
    setNotFound(false)
    setBookings([])
    setConfirmations([])
    setSelectedDrivers({})

    if (val !== '' && !isValidBRN(val)) {
      setSearchError('Invalid format — must be BRN followed by 5 digits (e.g. BRN00001)')
      return
    }

    setLoading(true)
    try {
      if (val === '') {
        const res = await fetch('/api/bookings')
        const data = await res.json()
        if (data.success) {
          setBookings(data.bookings)
          if (data.bookings.length === 0) setNotFound(true)
        } else {
          setSearchError(data.message ?? 'Failed to fetch bookings')
        }
      } else {
        const res = await fetch(`/api/bookings/${val}`)
        const data = await res.json()
        if (data.success) {
          setBookings([data.booking])
        } else {
          setNotFound(true)
        }
      }
    } catch {
      setSearchError('Network error — please try again')
    } finally {
      setLoading(false)
      setSearched(true)
    }
  }

  const handleAssign = async (ref: string) => {
    const driverId = selectedDrivers[ref]
    if (!driverId) { alert('Please select a driver first'); return }

    setAssigning((prev) => ({ ...prev, [ref]: true }))
    try {
      const res = await fetch(`/api/bookings/${ref}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driver_id: parseInt(driverId, 10) }),
      })
      const data = await res.json()
      if (data.success) {
        setAvailableDrivers((prev) => prev.filter((d) => d.id !== parseInt(driverId, 10)))
        setBookings((prev) => prev.map((b) => b.booking_ref === ref ? { ...b, status: 'assigned' } : b))
        setConfirmations((prev) => [...prev, ref])
      } else {
        alert(data.message ?? 'Assignment failed')
      }
    } catch {
      alert('Network error — please try again')
    } finally {
      setAssigning((prev) => ({ ...prev, [ref]: false }))
    }
  }

  const handleStatusAdvance = async (ref: string, nextStatus: 'in_progress' | 'completed') => {
    setAssigning((prev) => ({ ...prev, [ref]: true }))
    try {
      const res = await fetch(`/api/bookings/${ref}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      const data = await res.json()
      if (data.success) {
        setBookings((prev) => prev.map((b) => b.booking_ref === ref ? { ...b, status: nextStatus } : b))
        if (nextStatus === 'completed') {
          setConfirmations((prev) => [...prev, `${ref} marked as completed`])
        }
      } else {
        alert(data.message ?? 'Update failed')
      }
    } catch {
      alert('Network error — please try again')
    } finally {
      setAssigning((prev) => ({ ...prev, [ref]: false }))
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <Link href="/admin/drivers" className="ml-auto text-sm bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg">
          Manage Drivers
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="font-semibold text-gray-700 mb-4">Booking Search</h2>
        <p className="text-sm text-gray-500 mb-3">
          Enter a booking reference to find a specific booking, or leave empty to show unassigned bookings due within the next 2 hours.
        </p>
        <div className="flex gap-3">
          <input
            type="text"
            name="bsearch"
            value={bsearch}
            onChange={(e) => { setBsearch(e.target.value); setSearchError('') }}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className={`flex-1 border rounded px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 ${searchError ? 'border-red-400' : 'border-gray-300'}`}
            placeholder="e.g. BRN00001 (or leave empty)"
          />
          <input
            type="button"
            name="sbutton"
            value={loading ? 'Searching...' : 'Search Bookings'}
            onClick={handleSearch}
            disabled={loading}
            className="px-5 py-2 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded text-sm cursor-pointer disabled:opacity-50"
          />
        </div>
        {searchError && <p className="text-red-600 text-sm mt-2">{searchError}</p>}
      </div>

      {/* Confirmation messages */}
      {confirmations.map((ref) => (
        <div key={ref} className="mb-3 bg-green-50 border border-green-300 rounded-lg px-4 py-3 text-green-800 text-sm font-medium">
          Congratulations! Booking request {ref} has been assigned!
        </div>
      ))}

      {/* Results */}
      <div className="content">
        {searched && notFound && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 text-center text-yellow-700">
            No matching bookings found.
          </div>
        )}

        {bookings.length > 0 && (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            {availableDrivers.length === 0 && (
              <div className="px-6 py-3 bg-yellow-50 border-b border-yellow-200 text-sm text-yellow-800">
                No available drivers. <Link href="/admin/drivers" className="underline">Add drivers</Link> before assigning bookings.
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {[
                      'Booking Reference Number',
                      'Customer Name',
                      'Phone',
                      'Pickup Suburb',
                      'Destination Suburb',
                      'Pickup Date and Time',
                      'Status',
                      'Assign',
                    ].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookings.map((b) => {
                    const STATUS_BADGE: Record<string, string> = {
                      unassigned:  'bg-red-100 text-red-700',
                      assigned:    'bg-blue-100 text-blue-700',
                      in_progress: 'bg-yellow-100 text-yellow-700',
                      completed:   'bg-green-100 text-green-700',
                    }
                    return (
                      <tr key={b.booking_ref} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono font-medium">{b.booking_ref}</td>
                        <td className="px-4 py-3">{b.cname}</td>
                        <td className="px-4 py-3">{b.phone}</td>
                        <td className="px-4 py-3">{b.sbname || '—'}</td>
                        <td className="px-4 py-3">{b.dsbname || '—'}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {formatDateDisplay(b.pickup_date)} {formatTimeDisplay(b.pickup_time)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${STATUS_BADGE[b.status] ?? 'bg-gray-100 text-gray-500'}`}>
                            {b.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {b.status === 'unassigned' && (
                            <div className="flex items-center gap-2 min-w-[220px]">
                              <select
                                value={selectedDrivers[b.booking_ref] ?? ''}
                                onChange={(e) => setSelectedDrivers((prev) => ({ ...prev, [b.booking_ref]: e.target.value }))}
                                className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                disabled={availableDrivers.length === 0}
                              >
                                <option value="">Select driver…</option>
                                {availableDrivers.map((d) => (
                                  <option key={d.id} value={d.id}>{d.name} — {d.vehicle}</option>
                                ))}
                              </select>
                              <button
                                name="Assign"
                                onClick={() => handleAssign(b.booking_ref)}
                                disabled={!selectedDrivers[b.booking_ref] || assigning[b.booking_ref]}
                                className="px-3 py-1 bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-xs font-medium rounded disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                              >
                                {assigning[b.booking_ref] ? '…' : 'Assign'}
                              </button>
                            </div>
                          )}
                          {b.status === 'assigned' && (
                            <button
                              onClick={() => handleStatusAdvance(b.booking_ref, 'in_progress')}
                              disabled={assigning[b.booking_ref]}
                              className="px-3 py-1 bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-xs font-medium rounded disabled:opacity-40"
                            >
                              {assigning[b.booking_ref] ? '…' : 'Mark In Progress'}
                            </button>
                          )}
                          {b.status === 'in_progress' && (
                            <button
                              onClick={() => handleStatusAdvance(b.booking_ref, 'completed')}
                              disabled={assigning[b.booking_ref]}
                              className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded disabled:opacity-40"
                            >
                              {assigning[b.booking_ref] ? '…' : 'Mark Completed'}
                            </button>
                          )}
                          {b.status === 'completed' && (
                            <span className="text-xs text-gray-400 italic">Completed</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
