interface FareEntry {
  distance_km: number
  estimated_fare: number
}

// Auckland suburb pair flat rates (base $5 flag fall + $2.50/km approx)
const RATES: Record<string, FareEntry> = {
  'auckland cbd|newmarket':       { distance_km: 3,   estimated_fare: 18.50 },
  'auckland cbd|ponsonby':        { distance_km: 2,   estimated_fare: 15.00 },
  'auckland cbd|parnell':         { distance_km: 2.5, estimated_fare: 16.25 },
  'auckland cbd|mt eden':         { distance_km: 4,   estimated_fare: 20.00 },
  'auckland cbd|remuera':         { distance_km: 6,   estimated_fare: 25.00 },
  'auckland cbd|epsom':           { distance_km: 5,   estimated_fare: 22.50 },
  'auckland cbd|st heliers':      { distance_km: 9,   estimated_fare: 32.50 },
  'auckland cbd|mission bay':     { distance_km: 7,   estimated_fare: 27.50 },
  'auckland cbd|glen innes':      { distance_km: 10,  estimated_fare: 35.00 },
  'auckland cbd|onehunga':        { distance_km: 10,  estimated_fare: 35.00 },
  'auckland cbd|henderson':       { distance_km: 18,  estimated_fare: 50.00 },
  'auckland cbd|manukau':         { distance_km: 25,  estimated_fare: 67.50 },
  'auckland cbd|albany':          { distance_km: 22,  estimated_fare: 60.00 },
  'auckland cbd|takapuna':        { distance_km: 8,   estimated_fare: 30.00 },
  'auckland cbd|devonport':       { distance_km: 12,  estimated_fare: 40.00 },
  'newmarket|ponsonby':           { distance_km: 3,   estimated_fare: 18.50 },
  'newmarket|parnell':            { distance_km: 2,   estimated_fare: 15.00 },
  'newmarket|remuera':            { distance_km: 3,   estimated_fare: 18.50 },
  'newmarket|epsom':              { distance_km: 2.5, estimated_fare: 16.25 },
  'ponsonby|mt eden':             { distance_km: 3,   estimated_fare: 18.50 },
  'ponsonby|parnell':             { distance_km: 4,   estimated_fare: 20.00 },
  'st heliers|mission bay':       { distance_km: 2,   estimated_fare: 15.00 },
  'st heliers|newmarket':         { distance_km: 7,   estimated_fare: 27.50 },
  'takapuna|albany':              { distance_km: 10,  estimated_fare: 35.00 },
  'manukau|onehunga':             { distance_km: 12,  estimated_fare: 40.00 },
  'henderson|albany':             { distance_km: 20,  estimated_fare: 55.00 },
  'mt eden|remuera':              { distance_km: 4,   estimated_fare: 20.00 },
  'mt eden|epsom':                { distance_km: 2,   estimated_fare: 15.00 },
  'parnell|remuera':              { distance_km: 2,   estimated_fare: 15.00 },
}

const DEFAULT: FareEntry = { distance_km: 10, estimated_fare: 30.00 }

export function getFare(from: string, to: string): FareEntry {
  const a = from.toLowerCase().trim()
  const b = to.toLowerCase().trim()
  return RATES[`${a}|${b}`] || RATES[`${b}|${a}`] || DEFAULT
}

export function getSuburbs(): string[] {
  const set = new Set<string>()
  Object.keys(RATES).forEach((key) => {
    key.split('|').forEach((s) => set.add(s.replace(/\b\w/g, (c) => c.toUpperCase())))
  })
  return Array.from(set).sort()
}
