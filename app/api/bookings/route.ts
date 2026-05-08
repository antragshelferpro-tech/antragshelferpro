import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY)

const MAIL_TEXT: Record<string, { subject: string; greeting: string; received: string; within: string; service: string; language: string; message: string; questions: string }> = {
  default: {
    subject: '✅ Ihre Anfrage ist eingegangen – AntragshelferPro',
    greeting: 'Vielen Dank',
    received: 'Wir haben Ihre Anfrage erhalten und melden uns',
    within: 'innerhalb von 24 Stunden',
    service: 'Leistung',
    language: 'Sprache',
    message: 'Ihre Nachricht',
    questions: 'Bei Fragen stehen wir Ihnen gerne zur Verfügung',
  },
}
const MAIL_BY_LANG: Record<string, typeof MAIL_TEXT['default']> = {
  'Deutsch':            { subject: '✅ Ihre Anfrage ist eingegangen – AntragshelferPro', greeting: 'Vielen Dank', received: 'Wir haben Ihre Anfrage erhalten und melden uns', within: 'innerhalb von 24 Stunden', service: 'Leistung', language: 'Sprache', message: 'Ihre Nachricht', questions: 'Bei Fragen stehen wir Ihnen gerne zur Verfügung' },
  'Gjermanisht':        { subject: '✅ Ihre Anfrage ist eingegangen – AntragshelferPro', greeting: 'Vielen Dank', received: 'Wir haben Ihre Anfrage erhalten und melden uns', within: 'innerhalb von 24 Stunden', service: 'Leistung', language: 'Sprache', message: 'Ihre Nachricht', questions: 'Bei Fragen stehen wir Ihnen gerne zur Verfügung' },
  'Albanisch (Shqip)':  { subject: '✅ Kërkesa juaj është marrë – AntragshelferPro', greeting: 'Faleminderit', received: 'Kemi marrë kërkesën tuaj dhe do t\'ju kontaktojmë', within: 'brenda 24 orëve', service: 'Shërbimi', language: 'Gjuha', message: 'Mesazhi juaj', questions: 'Nëse keni pyetje, jemi gjithmonë në dispozicion' },
  'Shqip':              { subject: '✅ Kërkesa juaj është marrë – AntragshelferPro', greeting: 'Faleminderit', received: 'Kemi marrë kërkesën tuaj dhe do t\'ju kontaktojmë', within: 'brenda 24 orëve', service: 'Shërbimi', language: 'Gjuha', message: 'Mesazhi juaj', questions: 'Nëse keni pyetje, jemi gjithmonë në dispozicion' },
  'English':            { subject: '✅ Your request has been received – AntragshelferPro', greeting: 'Thank you', received: 'We have received your request and will get back to you', within: 'within 24 hours', service: 'Service', language: 'Language', message: 'Your message', questions: 'If you have any questions, please feel free to contact us' },
  'German':             { subject: '✅ Your request has been received – AntragshelferPro', greeting: 'Thank you', received: 'We have received your request and will get back to you', within: 'within 24 hours', service: 'Service', language: 'Language', message: 'Your message', questions: 'If you have any questions, please feel free to contact us' },
  'Albanian (Shqip)':   { subject: '✅ Your request has been received – AntragshelferPro', greeting: 'Thank you', received: 'We have received your request and will get back to you', within: 'within 24 hours', service: 'Service', language: 'Language', message: 'Your message', questions: 'If you have any questions, please feel free to contact us' },
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { vorname, nachname, email, telefon, leistung, sprache, nachricht } = body

    // Validation
    if (!vorname || !nachname || !email || !leistung) {
      return NextResponse.json({ error: 'Pflichtfelder fehlen.' }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Ungültige E-Mail-Adresse.' }, { status: 400 })
    }

    // ── Turnstile CAPTCHA verification ──
    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY
    if (turnstileSecret) {
      const { captchaToken } = body
      if (!captchaToken) {
        return NextResponse.json({ error: 'CAPTCHA fehlt.' }, { status: 400 })
      }
      const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: turnstileSecret, response: captchaToken }),
      })
      const verifyData = await verifyRes.json()
      if (!verifyData.success) {
        return NextResponse.json({ error: 'CAPTCHA ungültig. Bitte erneut versuchen.' }, { status: 400 })
      }
    }

    // Save to Supabase
    const { data, error: dbError } = await supabase
      .from('bookings')
      .insert([{ vorname, nachname, email, telefon, leistung, sprache, nachricht, status: 'neu' }])
      .select()
      .single()

    if (dbError) {
      console.error('Supabase error:', dbError)
      return NextResponse.json({ error: 'Datenbankfehler: ' + dbError.message }, { status: 500 })
    }

    const m = MAIL_BY_LANG[sprache] ?? MAIL_TEXT['default']

    // Confirmation to customer
    const customerMail = await resend.emails.send({
      from: 'AntragshelferPro <noreply@antragshelfer-pro.de>',
      to: email,
      subject: m.subject,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:auto;color:#1a2540;">
          <div style="background:#0f1f3d;padding:28px 32px;border-radius:12px 12px 0 0;">
            <h1 style="color:#c9a84c;font-size:1.4rem;margin:0;">AntragshelferPro</h1>
          </div>
          <div style="background:#faf7f0;padding:32px;border-radius:0 0 12px 12px;border:1px solid #eee;">
            <h2 style="color:#0f1f3d;">${m.greeting}, ${vorname}!</h2>
            <p style="line-height:1.6;">${m.received} <strong>${m.within}</strong>.</p>
            <div style="background:#fff;border-radius:10px;padding:20px;margin:20px 0;border:1px solid #e8e0d0;">
              <p style="margin:0 0 10px;"><strong>${m.service}:</strong> ${leistung}</p>
              <p style="margin:0 0 10px;"><strong>${m.language}:</strong> ${sprache}</p>
              ${nachricht ? `<p style="margin:0;"><strong>${m.message}:</strong> ${nachricht}</p>` : ''}
            </div>
            <div style="background:#0f1f3d;border-radius:10px;padding:16px 20px;margin-top:20px;">
              <p style="color:rgba(255,255,255,0.7);margin:0 0 6px;font-size:0.85rem;">${m.questions}:</p>
              <a href="mailto:antragshelferpro@gmail.com" style="color:#c9a84c;font-weight:700;text-decoration:none;">antragshelferpro@gmail.com</a>
              <span style="color:rgba(255,255,255,0.4);margin:0 8px;">·</span>
              <a href="tel:+4917451560330" style="color:#c9a84c;font-weight:700;text-decoration:none;">+49 174 5156030</a>
            </div>
          </div>
        </div>
      `,
    })

    if (customerMail.error) {
      console.error('Resend customer mail error:', customerMail.error)
    }

    // Notify business owner
    const businessMail = await resend.emails.send({
      from: 'AntragshelferPro <noreply@antragshelfer-pro.de>',
      to: process.env.BUSINESS_EMAIL!,
      subject: `🔔 Neue Buchung: ${leistung} – ${vorname} ${nachname}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:auto;color:#1a2540;">
          <div style="background:#0f1f3d;padding:20px 28px;border-radius:12px 12px 0 0;">
            <h2 style="color:#c9a84c;margin:0;">Neue Buchungsanfrage</h2>
          </div>
          <div style="background:#fff;padding:28px;border-radius:0 0 12px 12px;border:1px solid #eee;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#888;width:140px;">Name</td><td><strong>${vorname} ${nachname}</strong></td></tr>
              <tr><td style="padding:8px 0;color:#888;">E-Mail</td><td><a href="mailto:${email}" style="color:#0f1f3d;">${email}</a></td></tr>
              <tr><td style="padding:8px 0;color:#888;">Telefon</td><td>${telefon || '–'}</td></tr>
              <tr><td style="padding:8px 0;color:#888;">Leistung</td><td><strong style="color:#c9a84c;">${leistung}</strong></td></tr>
              <tr><td style="padding:8px 0;color:#888;">Sprache</td><td>${sprache}</td></tr>
              <tr><td style="padding:8px 0;color:#888;">Nachricht</td><td>${nachricht || '–'}</td></tr>
            </table>
            <a href="https://antragshelfer-pro.de/admin"
               style="display:inline-block;margin-top:20px;background:#0f1f3d;color:#c9a84c;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;">
              Im Admin-Bereich öffnen →
            </a>
          </div>
        </div>
      `,
    })

    if (businessMail.error) {
      console.error('Resend business mail error:', businessMail.error)
    }

    return NextResponse.json({ success: true, id: data.id })

  } catch (err: any) {
    console.error('Booking API error:', JSON.stringify(err))
    return NextResponse.json({ error: 'Serverfehler: ' + (err?.message ?? 'Unbekannter Fehler') }, { status: 500 })
  }
}
