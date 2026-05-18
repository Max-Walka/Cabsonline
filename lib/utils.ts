export function isValidBRN(ref: string): boolean {
  return /^BRN\d{5}$/.test(ref)
}

export function isValidPhone(phone: string): boolean {
  return /^\d{10,12}$/.test(phone.trim())
}

export function formatDateDisplay(isoDate: string): string {
  const [y, m, d] = isoDate.split('-')
  return `${d}/${m}/${y}`
}

export function formatTimeDisplay(timeStr: string): string {
  return timeStr.substring(0, 5)
}

// Parse DD/MM/YYYY → { year, month, day } or null if invalid
export function parseDMY(str: string): { year: number; month: number; day: number } | null {
  const match = str.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return null
  const day = parseInt(match[1], 10)
  const month = parseInt(match[2], 10)
  const year = parseInt(match[3], 10)
  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  const d = new Date(year, month - 1, day)
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return null
  return { year, month, day }
}

// Convert DD/MM/YYYY to YYYY-MM-DD for Supabase
export function dmyToISO(dmy: string): string {
  const parsed = parseDMY(dmy)
  if (!parsed) return ''
  const { year, month, day } = parsed
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

// Convert YYYY-MM-DD to DD/MM/YYYY for display
export function isoToDMY(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

// Validate HH:MM format
export function parseHHMM(str: string): { hours: number; minutes: number } | null {
  const match = str.match(/^([01]\d|2[0-3]):([0-5]\d)$/)
  if (!match) return null
  return { hours: parseInt(match[1], 10), minutes: parseInt(match[2], 10) }
}

// Default date/time: now + 60 seconds, formatted for inputs
export function defaultDateTime(): { date: string; time: string } {
  const d = new Date(Date.now() + 60 * 1000)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return {
    date: `${day}/${month}/${year}`,
    time: `${hours}:${minutes}`,
  }
}
