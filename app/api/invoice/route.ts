import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

// Colors
const NAVY  = rgb(0.059, 0.122, 0.239) // #0f1f3d
const GOLD  = rgb(0.788, 0.659, 0.298) // #c9a84c
const GRAY  = rgb(0.35,  0.41,  0.52)
const LGRAY = rgb(0.93,  0.94,  0.96)
const WHITE = rgb(1, 1, 1)
const BLACK = rgb(0, 0, 0)

function formatCurrency(amount: number) {
  return amount.toFixed(2).replace('.', ',') + ' €'
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    if ((current + ' ' + word).trim().length <= maxChars) {
      current = (current + ' ' + word).trim()
    } else {
      if (current) lines.push(current)
      current = word
    }
  }
  if (current) lines.push(current)
  return lines
}

export async function POST(req: NextRequest) {
  const pwd = req.headers.get('x-admin-password')
  if (pwd !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Nicht autorisiert.' }, { status: 401 })
  }

  const body = await req.json()
  const {
    invoiceNumber, invoiceDate, dueDate,
    customerName, customerAddress, customerCity,
    items, // [{ description, quantity, unitPrice }]
    notes,
    paymentMethod, // 'bank' | 'cash' | 'paypal'
    iban, paypalEmail,
  } = body

  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595, 842]) // A4
  const { width, height } = page.getSize()

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold    = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const m = 56 // margin

  // ── HEADER BACKGROUND ──
  page.drawRectangle({ x: 0, y: height - 100, width, height: 100, color: NAVY })

  // Company name
  page.drawText('AntragshelferPro', {
    x: m, y: height - 44,
    size: 22, font: fontBold, color: GOLD,
  })
  page.drawText('Mentor Berisha', {
    x: m, y: height - 64,
    size: 10, font: fontRegular, color: WHITE,
  })
  page.drawText('Krischerstraße 6b · 40789 Monheim am Rhein · antragshelferpro@gmail.com · +49 174 5156030', {
    x: m, y: height - 82,
    size: 8, font: fontRegular, color: rgb(0.7, 0.75, 0.85),
  })

  // RECHNUNG label top right
  page.drawText('RECHNUNG', {
    x: width - m - 120, y: height - 52,
    size: 24, font: fontBold, color: GOLD,
  })

  // ── INVOICE META ──
  let y = height - 130

  // Invoice number & dates box
  page.drawRectangle({ x: width - m - 180, y: y - 58, width: 180, height: 72, color: LGRAY })

  const metaLeft = width - m - 172
  page.drawText('Rechnungsnummer:', { x: metaLeft, y: y - 14, size: 8, font: fontBold, color: GRAY })
  page.drawText(invoiceNumber || 'RE-001', { x: metaLeft, y: y - 26, size: 9, font: fontBold, color: NAVY })

  page.drawText('Rechnungsdatum:', { x: metaLeft, y: y - 40, size: 8, font: fontBold, color: GRAY })
  page.drawText(formatDate(invoiceDate || new Date().toISOString()), { x: metaLeft, y: y - 52, size: 9, font: fontRegular, color: BLACK })

  // ── RECIPIENT ──
  page.drawText('Rechnung an:', { x: m, y: y - 6, size: 8, font: fontBold, color: GRAY })
  page.drawText(customerName || '', { x: m, y: y - 20, size: 11, font: fontBold, color: NAVY })
  if (customerAddress) page.drawText(customerAddress, { x: m, y: y - 34, size: 9, font: fontRegular, color: BLACK })
  if (customerCity)    page.drawText(customerCity,    { x: m, y: y - 47, size: 9, font: fontRegular, color: BLACK })

  // ── DIVIDER ──
  y = y - 80
  page.drawLine({ start: { x: m, y }, end: { x: width - m, y }, thickness: 0.5, color: rgb(0.85, 0.87, 0.9) })

  // ── TABLE HEADER ──
  y = y - 16
  page.drawRectangle({ x: m, y: y - 6, width: width - m * 2, height: 20, color: NAVY })
  page.drawText('Beschreibung',         { x: m + 8,           y: y,      size: 9, font: fontBold, color: WHITE })
  page.drawText('Menge',                { x: width - m - 170, y: y,      size: 9, font: fontBold, color: WHITE })
  page.drawText('Einzelpreis',          { x: width - m - 120, y: y,      size: 9, font: fontBold, color: WHITE })
  page.drawText('Gesamt',               { x: width - m - 58,  y: y,      size: 9, font: fontBold, color: WHITE })

  // ── TABLE ROWS ──
  y = y - 22
  let subtotal = 0
  const rowItems: Array<{ description: string; quantity: number; unitPrice: number }> = items || []

  rowItems.forEach((item, i) => {
    const lineTotal = item.quantity * item.unitPrice
    subtotal += lineTotal
    const bg = i % 2 === 0 ? WHITE : LGRAY
    const rowH = 22

    page.drawRectangle({ x: m, y: y - rowH + 6, width: width - m * 2, height: rowH, color: bg })

    // Description with wrapping
    const lines = wrapText(item.description, 55)
    lines.forEach((line, li) => {
      page.drawText(line, { x: m + 8, y: y - li * 11, size: 9, font: fontRegular, color: BLACK })
    })

    page.drawText(String(item.quantity),          { x: width - m - 162, y, size: 9, font: fontRegular, color: BLACK })
    page.drawText(formatCurrency(item.unitPrice), { x: width - m - 118, y, size: 9, font: fontRegular, color: BLACK })
    page.drawText(formatCurrency(lineTotal),      { x: width - m - 58,  y, size: 9, font: fontBold,    color: NAVY })

    y -= rowH
  })

  // ── TOTALS ──
  y -= 12
  page.drawLine({ start: { x: m, y }, end: { x: width - m, y }, thickness: 0.5, color: rgb(0.85, 0.87, 0.9) })
  y -= 14

  const vatRate = 0 // Kleinunternehmerregelung
  const vat = subtotal * vatRate
  const total = subtotal + vat

  const totX = width - m - 200

  // Subtotal
  page.drawText('Zwischensumme:', { x: totX, y, size: 9, font: fontRegular, color: GRAY })
  page.drawText(formatCurrency(subtotal), { x: width - m - 58, y, size: 9, font: fontRegular, color: BLACK })
  y -= 16

  // VAT note (Kleinunternehmer)
  page.drawText('Umsatzsteuer (§ 19 UStG):', { x: totX, y, size: 9, font: fontRegular, color: GRAY })
  page.drawText('entfällt', { x: width - m - 58, y, size: 9, font: fontRegular, color: GRAY })
  y -= 18

  // Total box
  page.drawRectangle({ x: totX - 8, y: y - 8, width: width - m - totX + 8, height: 26, color: NAVY })
  page.drawText('Gesamtbetrag:', { x: totX, y: y + 2, size: 10, font: fontBold, color: WHITE })
  page.drawText(formatCurrency(total), { x: width - m - 68, y: y + 2, size: 11, font: fontBold, color: GOLD })

  // ── PAYMENT INFO ──
  y -= 50
  const dueDateStr = formatDate(dueDate || new Date(Date.now() + 14 * 86400000).toISOString())
  const invNum = invoiceNumber || 'RE-001'

  if (paymentMethod === 'cash') {
    page.drawRectangle({ x: m, y: y - 44, width: width - m * 2, height: 58, color: LGRAY })
    page.drawText('Zahlungsinformationen', { x: m + 12, y: y + 6, size: 9, font: fontBold, color: NAVY })
    page.drawText('Zahlungsart: Barzahlung', { x: m + 12, y: y - 8, size: 9, font: fontBold, color: NAVY })
    page.drawText(`Bitte zahlen Sie den Betrag bis zum ${dueDateStr} in bar.`, { x: m + 12, y: y - 22, size: 8, font: fontRegular, color: GRAY })
  } else if (paymentMethod === 'paypal') {
    page.drawRectangle({ x: m, y: y - 44, width: width - m * 2, height: 58, color: LGRAY })
    page.drawText('Zahlungsinformationen', { x: m + 12, y: y + 6, size: 9, font: fontBold, color: NAVY })
    page.drawText('Zahlungsart: PayPal', { x: m + 12, y: y - 8, size: 9, font: fontBold, color: NAVY })
    page.drawText(`PayPal: ${paypalEmail || 'antragshelferpro@gmail.com'}  ·  Bitte ${dueDateStr} unter Angabe von ${invNum} zahlen.`, { x: m + 12, y: y - 22, size: 8, font: fontRegular, color: GRAY })
  } else {
    // Bank transfer (default)
    page.drawRectangle({ x: m, y: y - 44, width: width - m * 2, height: 58, color: LGRAY })
    page.drawText('Zahlungsinformationen', { x: m + 12, y: y + 6, size: 9, font: fontBold, color: NAVY })
    page.drawText(`Bitte überweisen Sie den Betrag bis zum ${dueDateStr} unter Angabe der Rechnungsnummer ${invNum}.`, { x: m + 12, y: y - 8, size: 8, font: fontRegular, color: GRAY })
    page.drawText(`Kontoinhaber: Mentor Berisha  ·  IBAN: ${iban || 'DE__ ____ ____ ____ ____ __'}`, { x: m + 12, y: y - 22, size: 8, font: fontRegular, color: GRAY })
  }

  // ── NOTES ──
  if (notes) {
    y -= 70
    page.drawText('Anmerkungen:', { x: m, y, size: 9, font: fontBold, color: NAVY })
    const noteLines = wrapText(notes, 90)
    noteLines.forEach((line, i) => {
      page.drawText(line, { x: m, y: y - 14 - i * 12, size: 9, font: fontRegular, color: GRAY })
    })
  }

  // ── KLEINUNTERNEHMER NOTE ──
  page.drawText('Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.',
    { x: m, y: 80, size: 8, font: fontRegular, color: GRAY })

  // ── FOOTER ──
  page.drawRectangle({ x: 0, y: 0, width, height: 60, color: NAVY })
  page.drawText('AntragshelferPro · Mentor Berisha · Krischerstraße 6b · 40789 Monheim am Rhein',
    { x: m, y: 38, size: 8, font: fontRegular, color: rgb(0.6, 0.65, 0.75) })
  page.drawText('antragshelferpro@gmail.com · +49 174 5156030 · antragshelfer-pro.de',
    { x: m, y: 24, size: 8, font: fontRegular, color: rgb(0.6, 0.65, 0.75) })
  page.drawText(`Seite 1`, { x: width - m - 30, y: 28, size: 8, font: fontRegular, color: rgb(0.5, 0.55, 0.65) })

  const pdfBytes = await pdfDoc.save()

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Rechnung-${invoiceNumber || 'RE-001'}.pdf"`,
    },
  })
}
