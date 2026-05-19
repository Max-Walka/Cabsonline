'use client'

import { useState, useEffect } from 'react'
import { Driver } from '@/types'

const STATUS_STYLES: Record<string, string> = {
  available: 'bg-green-100 text-green-700',
  busy:      'bg-yellow-100 text-yellow-700',
  offline:   'bg-gray-100 text-gray-500',
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', phone: '', vehicle: '', plate: '' })
  const [errors, setErrors] = useState<Partial<typeof form>>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  useEffect(() => {
    fetch('/api/drivers')
      .then((r) => r.json())
      .then((d) => { if (d.success) setDrivers(d.drivers) })
      .finally(() => setLoading(false))
  }, [])

  const setField = (field: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: '' }))
  }

  const validate = () => {
    const e: Partial<typeof form> = {}
    if (!form.name.trim())    e.name    = 'Name is required'
    if (!form.phone.trim())   e.phone   = 'Phone is required'
    if (!form.vehicle.trim()) e.vehicle = 'Vehicle description is required'
    if (!form.plate.trim())   e.plate   = 'Plate number is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError('')
    if (!validate()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        setDrivers((prev) => [...prev, data.driver])
        setForm({ name: '', phone: '', vehicle: '', plate: '' })
      } else {
        setServerError(data.message ?? 'Failed to add driver')
      }
    } catch {
      setServerError('Network error — please try again')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = (field: keyof typeof form) =>
    `w-full border rounded px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 ${errors[field] ? 'border-red-400' : 'border-gray-300'}`

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Driver Management</h1>
        <a href="/admin" className="text-sm text-blue-600 hover:underline ml-auto">← Back to Admin</a>
      </div>

      {/* Add Driver Form */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="font-semibold text-gray-700 mb-4">Add New Driver</h2>
        <form onSubmit={handleAdd} noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
              <input type="text" value={form.name} onChange={(e) => setField('name', e.target.value)} className={inputClass('name')} placeholder="John Smith" />
              {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone <span className="text-red-500">*</span></label>
              <input type="tel" value={form.phone} onChange={(e) => setField('phone', e.target.value)} className={inputClass('phone')} placeholder="021XXXXXXX" />
              {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle <span className="text-red-500">*</span></label>
              <input type="text" value={form.vehicle} onChange={(e) => setField('vehicle', e.target.value)} className={inputClass('vehicle')} placeholder="Toyota Camry 2022" />
              {errors.vehicle && <p className="text-red-600 text-xs mt-1">{errors.vehicle}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plate Number <span className="text-red-500">*</span></label>
              <input type="text" value={form.plate} onChange={(e) => setField('plate', e.target.value)} className={inputClass('plate')} placeholder="ABC123" />
              {errors.plate && <p className="text-red-600 text-xs mt-1">{errors.plate}</p>}
            </div>
          </div>
          {serverError && <p className="text-red-600 text-sm mb-3">{serverError}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {submitting ? 'Adding...' : 'Add Driver'}
          </button>
        </form>
      </div>

      {/* Drivers Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-700">All Drivers ({drivers.length})</h2>
        </div>
        {loading ? (
          <p className="px-6 py-8 text-gray-500 text-sm text-center">Loading drivers...</p>
        ) : drivers.length === 0 ? (
          <p className="px-6 py-8 text-gray-500 text-sm text-center">No drivers registered yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Name', 'Phone', 'Vehicle', 'Plate', 'Status'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {drivers.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{d.name}</td>
                    <td className="px-4 py-3 text-gray-700">{d.phone}</td>
                    <td className="px-4 py-3 text-gray-700">{d.vehicle}</td>
                    <td className="px-4 py-3 font-mono text-gray-700">{d.plate}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[d.status] ?? 'bg-gray-100 text-gray-500'}`}>
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
