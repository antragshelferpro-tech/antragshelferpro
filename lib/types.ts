export type BookingStatus = 'neu' | 'bestätigt' | 'abgeschlossen' | 'storniert'

export interface Booking {
  id: string
  created_at: string
  vorname: string
  nachname: string
  email: string
  telefon: string
  leistung: string
  sprache: string
  nachricht: string
  status: BookingStatus
}
