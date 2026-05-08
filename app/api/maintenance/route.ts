import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'maintenance_mode')
    .single()

  if (error) return NextResponse.json({ maintenance: false })
  return NextResponse.json({ maintenance: data.value === 'true' })
}

export async function PATCH(req: NextRequest) {
  const pwd = req.headers.get('x-admin-password')
  if (pwd !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Nicht autorisiert.' }, { status: 401 })
  }
  const { enabled } = await req.json()
  const { error } = await supabase
    .from('settings')
    .upsert({ key: 'maintenance_mode', value: String(enabled), updated_at: new Date().toISOString() })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ maintenance: enabled })
}
