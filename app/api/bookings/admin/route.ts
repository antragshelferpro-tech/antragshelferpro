import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Service role key bypasses RLS for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PATCH(req: NextRequest) {
  const pwd = req.headers.get('x-admin-password')
  if (pwd !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Nicht autorisiert.' }, { status: 401 })
  }
  const { id, status } = await req.json()
  const { error } = await supabase.from('bookings').update({ status }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const pwd = req.headers.get('x-admin-password')
  if (pwd !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Nicht autorisiert.' }, { status: 401 })
  }
  const { id } = await req.json()
  // Safety: only allow deleting cancelled bookings
  const { data: booking } = await supabase.from('bookings').select('status').eq('id', id).single()
  if (!booking || booking.status !== 'storniert') {
    return NextResponse.json({ error: 'Nur stornierte Buchungen können gelöscht werden.' }, { status: 400 })
  }
  const { error } = await supabase.from('bookings').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function GET(req: NextRequest) {
  const pwd = req.headers.get('x-admin-password')
  if (pwd !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Nicht autorisiert.' }, { status: 401 })
  }
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
