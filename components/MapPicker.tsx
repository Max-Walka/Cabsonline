'use client'

import { useEffect, useRef, useState } from 'react'

interface LocationResult {
  lat: number
  lng: number
  snumber: string
  stname: string
  sbname: string
}

interface Props {
  onLocationSelect: (result: LocationResult) => void
}

export default function MapPicker({ onLocationSelect }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<import('leaflet').Map | null>(null)
  const markerRef = useRef<import('leaflet').Marker | null>(null)
  const [status, setStatus] = useState<string>('Click on the map to set your pickup location')

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current || mapInstanceRef.current) return

    let cancelled = false

    // Dynamic import to avoid SSR issues
    import('leaflet').then((L) => {
      if (cancelled || !mapRef.current || mapInstanceRef.current) return
      // Guard against container already claimed by a previous Leaflet instance
      if ((mapRef.current as unknown as Record<string, unknown>)['_leaflet_id']) return

      import('leaflet/dist/leaflet.css')

      // Fix broken marker icons in webpack
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current!).setView([-36.8485, 174.7633], 13)
      mapInstanceRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map)

      map.on('click', async (e: import('leaflet').LeafletMouseEvent) => {
        const { lat, lng } = e.latlng

        // Drop/move marker
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng])
        } else {
          markerRef.current = L.marker([lat, lng]).addTo(map)
        }

        setStatus('Resolving address...')

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { 'User-Agent': 'CabsOnline-Student-Project' } }
          )
          const data = await res.json()
          const addr = data.address ?? {}

          const snumber = addr.house_number ?? ''
          const stname = addr.road ?? addr.pedestrian ?? ''
          const sbname =
            addr.suburb ?? addr.neighbourhood ?? addr.village ?? addr.town ?? addr.city_district ?? ''

          setStatus(
            snumber || stname
              ? `Selected: ${[snumber, stname, sbname].filter(Boolean).join(', ')}`
              : 'Location selected (address not resolved)'
          )

          onLocationSelect({ lat, lng, snumber, stname, sbname })
        } catch {
          setStatus('Location selected (could not resolve address)')
          onLocationSelect({ lat, lng, snumber: '', stname: '', sbname: '' })
        }
      })
    })

    return () => {
      cancelled = true
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        markerRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div>
      <div ref={mapRef} className="w-full h-64 rounded-lg border border-gray-300 z-0" />
      <p className="mt-1 text-sm text-gray-600">{status}</p>
    </div>
  )
}
