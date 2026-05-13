import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const resend = new Resend(process.env.RESEND_API_KEY)

const PARTNER_EMAIL = 'mentor.dzemaili@allianz.de'
const PARTNER_NAME  = 'Allianz Versicherung Mentor Dzemaili Hauptvertretung'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      vorname, nachname, email, telefon, sprache,
      finanzierungsart, kreditsumme, laufzeit,
      verwendungszweck, anzahlKreditnehmer,
      arbeitsverhältnis, beschaeftigtSeit,
      nettoEinkommen, arbeitgeber, nachricht,
    } = body

    if (!vorname || !nachname || !email || !finanzierungsart || !kreditsumme || !laufzeit) {
      return NextResponse.json({ error: 'Pflichtfelder fehlen.' }, { status: 400 })
    }

    // Save to dedicated financing_requests table
    const { data, error: dbError } = await supabase
      .from('financing_requests')
      .insert([{
        vorname, nachname, email, telefon,
        sprache: sprache || 'Deutsch',
        finanzierungsart, kreditsumme, laufzeit,
        verwendungszweck, anzahl_kreditnehmer: anzahlKreditnehmer,
        arbeitsverhaeltnis: arbeitsverhältnis,
        beschaeftigt_seit: beschaeftigtSeit,
        netto_einkommen: nettoEinkommen,
        arbeitgeber, nachricht,
        status: 'weitergeleitet',
      }])
      .select()
      .single()

    if (dbError) {
      console.error('Supabase error:', dbError)
      return NextResponse.json({ error: 'Datenbankfehler: ' + dbError.message }, { status: 500 })
    }

    const tableRow = (label: string, value: string) => `
      <tr>
        <td style="padding:8px 12px;color:#6b7280;font-size:0.88rem;width:200px;border-bottom:1px solid #f3f4f6;">${label}</td>
        <td style="padding:8px 12px;color:#0f1f3d;font-size:0.88rem;font-weight:600;border-bottom:1px solid #f3f4f6;">${value || '–'}</td>
      </tr>`

    // ── Forward to partner agency ──
    await resend.emails.send({
      from: 'AntragshelferPro <noreply@antragshelfer-pro.de>',
      to: PARTNER_EMAIL,
      subject: `🏦 Neue Finanzierungsanfrage: ${finanzierungsart} – ${vorname} ${nachname}`,
      html: `
        <div style="font-family:sans-serif;max-width:620px;margin:auto;color:#1a2540;">
          <div style="background:#0f1f3d;padding:24px 32px;border-radius:12px 12px 0 0;">
            <h1 style="color:#c9a84c;font-size:1.3rem;margin:0 0 4px;">Neue Finanzierungsanfrage</h1>
            <p style="color:rgba(255,255,255,0.5);font-size:0.85rem;margin:0;">Weitergeleitet von AntragshelferPro · Mentor Berisha, Monheim am Rhein</p>
          </div>
          <div style="background:#fff;padding:28px 32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
            <h2 style="font-size:1rem;color:#0f1f3d;margin:0 0 16px;padding-bottom:8px;border-bottom:2px solid #c9a84c;">👤 Kundendaten</h2>
            <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
              ${tableRow('Name', `${vorname} ${nachname}`)}
              ${tableRow('E-Mail', `<a href="mailto:${email}" style="color:#c9a84c;">${email}</a>`)}
              ${tableRow('Telefon', telefon || '–')}
              ${tableRow('Sprache', sprache || 'Deutsch')}
            </table>
            <h2 style="font-size:1rem;color:#0f1f3d;margin:0 0 16px;padding-bottom:8px;border-bottom:2px solid #c9a84c;">🏦 Finanzierungsdetails</h2>
            <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
              ${tableRow('Finanzierungsart', finanzierungsart)}
              ${tableRow('Gewünschte Kreditsumme', kreditsumme ? kreditsumme + ' €' : '–')}
              ${tableRow('Gewünschte Laufzeit', laufzeit ? laufzeit + ' Monate' : '–')}
              ${tableRow('Verwendungszweck', verwendungszweck || '–')}
              ${tableRow('Anzahl Kreditnehmer', anzahlKreditnehmer || '–')}
            </table>
            <h2 style="font-size:1rem;color:#0f1f3d;margin:0 0 16px;padding-bottom:8px;border-bottom:2px solid #c9a84c;">💼 Wirtschaftliche Verhältnisse</h2>
            <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
              ${tableRow('Arbeitsverhältnis', arbeitsverhältnis || '–')}
              ${tableRow('Beschäftigt seit', beschaeftigtSeit || '–')}
              ${tableRow('Monatl. Nettoeinkommen', nettoEinkommen ? nettoEinkommen + ' €' : '–')}
              ${tableRow('Arbeitgeber', arbeitgeber || '–')}
            </table>
            ${nachricht ? `
            <h2 style="font-size:1rem;color:#0f1f3d;margin:0 0 12px;padding-bottom:8px;border-bottom:2px solid #c9a84c;">💬 Nachricht</h2>
            <div style="background:#f8fafc;border-radius:8px;padding:14px;font-size:0.9rem;color:#4b5563;margin-bottom:24px;">${nachricht}</div>
            ` : ''}
            <div style="background:#fef9ec;border:1px solid #fde68a;border-radius:8px;padding:14px 18px;font-size:0.85rem;color:#92400e;">
              <strong>Hinweis:</strong> Diese Anfrage wurde über AntragshelferPro eingereicht. Bitte nehmen Sie direkt Kontakt mit dem Kunden auf.
            </div>
          </div>
          <p style="text-align:center;color:#9ca3af;font-size:0.78rem;margin-top:16px;">
            AntragshelferPro · Mentor Berisha · Krischerstraße 6b · 40789 Monheim am Rhein<br/>
            antragshelferpro@gmail.com · +49 174 5156030
          </p>
        </div>
      `,
    })

    // ── Confirmation to customer ──
    await resend.emails.send({
      from: 'AntragshelferPro <noreply@antragshelfer-pro.de>',
      to: email,
      subject: '✅ Ihre Finanzierungsanfrage ist eingegangen – AntragshelferPro',
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:auto;color:#1a2540;">
          <div style="background:#0f1f3d;padding:28px 32px;border-radius:12px 12px 0 0;">
            <h1 style="color:#c9a84c;font-size:1.4rem;margin:0;">AntragshelferPro</h1>
          </div>
          <div style="background:#faf7f0;padding:32px;border-radius:0 0 12px 12px;border:1px solid #eee;">
            <h2 style="color:#0f1f3d;">Vielen Dank, ${vorname}!</h2>
            <p style="line-height:1.6;color:#5a6a85;">Wir haben Ihre Finanzierungsanfrage erhalten und direkt an unseren Partner weitergeleitet:</p>
            <div style="background:#fff;border-radius:10px;padding:16px 20px;margin:16px 0;border:1px solid #e8e0d0;">
              <p style="margin:0 0 6px;font-weight:700;color:#0f1f3d;">${PARTNER_NAME}</p>
              <p style="margin:0;font-size:0.85rem;color:#6b7280;">Krischerstraße 6b · 40789 Monheim am Rhein</p>
            </div>
            <div style="background:#fff;border-radius:10px;padding:16px 20px;margin:16px 0;border:1px solid #e8e0d0;">
              <p style="margin:0 0 8px;"><strong>Finanzierungsart:</strong> ${finanzierungsart}</p>
              <p style="margin:0 0 8px;"><strong>Kreditsumme:</strong> ${kreditsumme} €</p>
              <p style="margin:0;"><strong>Laufzeit:</strong> ${laufzeit} Monate</p>
            </div>
            <p style="line-height:1.6;color:#5a6a85;">Der Partner wird sich <strong>innerhalb von 24–48 Stunden</strong> bei Ihnen melden.</p>
            <div style="background:#0f1f3d;border-radius:10px;padding:16px 20px;margin-top:20px;">
              <p style="color:rgba(255,255,255,0.7);margin:0 0 6px;font-size:0.85rem;">Bei Fragen stehen wir Ihnen gerne zur Verfügung:</p>
              <a href="mailto:antragshelferpro@gmail.com" style="color:#c9a84c;font-weight:700;text-decoration:none;">antragshelferpro@gmail.com</a>
              <span style="color:rgba(255,255,255,0.4);margin:0 8px;">·</span>
              <a href="tel:+4917451560330" style="color:#c9a84c;font-weight:700;text-decoration:none;">+49 174 5156030</a>
            </div>
          </div>
        </div>
      `,
    })

    // ── Notify business owner ──
    await resend.emails.send({
      from: 'AntragshelferPro <noreply@antragshelfer-pro.de>',
      to: process.env.BUSINESS_EMAIL!,
      subject: `🔔 Neue Finanzierungsanfrage: ${finanzierungsart} – ${vorname} ${nachname}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:auto;">
          <div style="background:#0f1f3d;padding:20px 28px;border-radius:12px 12px 0 0;">
            <h2 style="color:#c9a84c;margin:0;">Neue Finanzierungsanfrage</h2>
          </div>
          <div style="background:#fff;padding:28px;border-radius:0 0 12px 12px;border:1px solid #eee;">
            <p><strong>${vorname} ${nachname}</strong> · ${email} · ${telefon || '–'}</p>
            <p><strong style="color:#c9a84c;">${finanzierungsart}</strong> · ${kreditsumme} € · ${laufzeit} Monate</p>
            <p style="color:#6b7280;font-size:0.88rem;">Wurde automatisch an ${PARTNER_NAME} weitergeleitet.</p>
            <a href="https://antragshelfer-pro.de/admin" style="display:inline-block;margin-top:16px;background:#0f1f3d;color:#c9a84c;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:700;">
              Im Admin öffnen →
            </a>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ success: true, id: data.id })

  } catch (err: any) {
    console.error('Financing API error:', err)
    return NextResponse.json({ error: 'Serverfehler: ' + (err?.message ?? 'Unbekannter Fehler') }, { status: 500 })
  }
}
