'use client'
import { useState, useEffect } from 'react'
import { useAdminAuth } from '../../../lib/useAdminAuth'

interface LineItem {
  id: number
  description: string
  quantity: number
  unitPrice: number
}

interface InvoiceData {
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  customerName: string
  customerAddress: string
  customerCity: string
  customerEmail: string
  notes: string
  paymentMethod: 'bank' | 'cash' | 'paypal'
  iban: string
  paypalEmail: string
}

export default function RechnungGeneratorPage() {
  const { password, setPassword, authed, authError, checking, login: authLogin, logout } = useAdminAuth()
  const [loading, setLoading] = useState(false)

  const today = new Date()
  const due   = new Date(today.getTime() + 14 * 86400000)

  const [data, setData] = useState<InvoiceData>({
    invoiceNumber: 'RE-' + today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2,'0') + String(today.getDate()).padStart(2,'0'),
    invoiceDate: today.toISOString().split('T')[0],
    dueDate: due.toISOString().split('T')[0],
    customerName: '',
    customerAddress: '',
    customerCity: '',
    customerEmail: '',
    notes: '',
    paymentMethod: 'bank',
    iban: '',
    paypalEmail: '',
  })

  const [items, setItems] = useState<LineItem[]>([
    { id: 1, description: '', quantity: 1, unitPrice: 0 },
  ])

  async function login() {
    await authLogin(password)
  }

  const setD = (field: keyof InvoiceData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setData(d => ({ ...d, [field]: e.target.value }))

  function addItem() {
    setItems(items => [...items, { id: Date.now(), description: '', quantity: 1, unitPrice: 0 }])
  }

  function removeItem(id: number) {
    if (items.length === 1) return
    setItems(items => items.filter(i => i.id !== id))
  }

  function updateItem(id: number, field: keyof LineItem, value: string | number) {
    setItems(items => items.map(i => i.id === id ? { ...i, [field]: field === 'description' ? value : Number(value) } : i))
  }

  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0)
  const total    = subtotal // Kleinunternehmer – keine MwSt

  async function generate() {
    setLoading(true)
    try {
      const res = await fetch('/api/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({
          ...data,
          items: items.map(i => ({ description: i.description, quantity: i.quantity, unitPrice: i.unitPrice })),
          paymentMethod: data.paymentMethod,
          iban: data.iban,
          paypalEmail: data.paypalEmail,
        }),
      })
      if (!res.ok) { alert('Fehler bei der PDF-Erstellung'); setLoading(false); return }
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `Rechnung-${data.invoiceNumber}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) { alert('Fehler: ' + e) }
    setLoading(false)
  }

  function resetForm() {
    const t = new Date()
    const d = new Date(t.getTime() + 14 * 86400000)
    setData({
      invoiceNumber: 'RE-' + t.getFullYear() + '-' + String(t.getMonth()+1).padStart(2,'0') + String(t.getDate()).padStart(2,'0'),
      invoiceDate: t.toISOString().split('T')[0],
      dueDate: d.toISOString().split('T')[0],
      customerName: '', customerAddress: '', customerCity: '', customerEmail: '', notes: '',
    })
    setItems([{ id: 1, description: '', quantity: 1, unitPrice: 0 }])
  }

  if (checking) return (
    <div style={s.loginWrap}><div style={{...s.loginCard, textAlign:'center' as const}}><p style={{color:'#6b7280'}}>⏳ Wird geladen...</p></div></div>
  )

  if (!authed) return (
    <div style={s.loginWrap}>
      <div style={s.loginCard}>
        <a href="/admin" style={s.backLink}>← Zurück zum Admin</a>
        <h1 style={s.loginTitle}>🧾 Rechnungsgenerator</h1>
        <p style={s.loginSub}>Bitte mit Admin-Passwort einloggen</p>
        <label style={s.label}>Passwort</label>
        <input type="password" style={s.input} placeholder="Admin-Passwort"
          value={password} onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && login()} />
        {authError && <div style={s.error}>{authError}</div>}
        <button style={s.loginBtn} onClick={login}>Einloggen →</button>
      </div>
    </div>
  )

  return (
    <div style={s.wrap}>
      {/* HEADER */}
      <div style={s.header}>
        <div style={{display:'flex', alignItems:'center', gap:20}}>
          <a href="/admin" style={s.headerBack}>← Admin</a>
          <div>
            <h1 style={s.headerTitle}>🧾 Rechnungsgenerator</h1>
            <p style={s.headerSub}>Freie Rechnungserstellung – beliebige Positionen</p>
          </div>
        </div>
        <div style={{display:'flex', gap:10}}>
          <button style={s.resetBtn} onClick={resetForm}>🔄 Zurücksetzen</button>
          <button style={{...s.generateBtn, opacity: loading ? 0.7 : 1}} onClick={generate} disabled={loading}>
            {loading ? '⏳ Generiere...' : '📄 PDF erstellen & herunterladen'}
          </button>
        </div>
      </div>

      <div style={s.content}>
        <div style={s.grid}>

          {/* LEFT COLUMN */}
          <div style={s.leftCol}>

            {/* Invoice Details */}
            <div style={s.card}>
              <div style={s.cardTitle}>📋 Rechnungsdetails</div>
              <div style={s.formRow}>
                <div style={s.formGroup}>
                  <label style={s.formLabel}>Rechnungsnummer *</label>
                  <input style={s.formInput} value={data.invoiceNumber} onChange={setD('invoiceNumber')} />
                </div>
                <div style={s.formGroup}>
                  <label style={s.formLabel}>Rechnungsdatum *</label>
                  <input style={s.formInput} type="date" value={data.invoiceDate} onChange={setD('invoiceDate')} />
                </div>
                <div style={s.formGroup}>
                  <label style={s.formLabel}>Fällig bis *</label>
                  <input style={s.formInput} type="date" value={data.dueDate} onChange={setD('dueDate')} />
                </div>
              </div>
            </div>

            {/* Customer */}
            <div style={s.card}>
              <div style={s.cardTitle}>👤 Kunde</div>
              <div style={s.formGroup}>
                <label style={s.formLabel}>Name / Firma *</label>
                <input style={s.formInput} placeholder="z.B. Max Mustermann" value={data.customerName} onChange={setD('customerName')} />
              </div>
              <div style={s.formRow}>
                <div style={{...s.formGroup, flex:2}}>
                  <label style={s.formLabel}>Straße & Hausnummer</label>
                  <input style={s.formInput} placeholder="z.B. Musterstraße 1" value={data.customerAddress} onChange={setD('customerAddress')} />
                </div>
                <div style={s.formGroup}>
                  <label style={s.formLabel}>PLZ & Ort</label>
                  <input style={s.formInput} placeholder="42105 Wuppertal" value={data.customerCity} onChange={setD('customerCity')} />
                </div>
              </div>
              <div style={s.formGroup}>
                <label style={s.formLabel}>E-Mail (optional)</label>
                <input style={s.formInput} type="email" placeholder="kunde@email.de" value={data.customerEmail} onChange={setD('customerEmail')} />
              </div>
            </div>

            {/* Payment Method */}
            <div style={s.card}>
              <div style={s.cardTitle}>💳 Zahlungsart</div>
              <div style={{display:'flex', gap:8, marginBottom:12}}>
                {(['bank','cash','paypal'] as const).map(pm => (
                  <button key={pm}
                    style={{flex:1, padding:'10px 8px', borderRadius:8, cursor:'pointer', fontSize:'0.82rem', fontWeight:600, fontFamily:"'DM Sans',sans-serif", transition:'all .2s', background: data.paymentMethod===pm?'#0f1f3d':'#f3f4f6', color: data.paymentMethod===pm?'#c9a84c':'#6b7280', border: data.paymentMethod===pm?'1.5px solid #0f1f3d':'1.5px solid #e5e7eb'}}
                    onClick={() => setData(d => ({...d, paymentMethod: pm}))}>
                    {pm==='bank'?'🏦 Bank':pm==='cash'?'💵 Bar':'💙 PayPal'}
                  </button>
                ))}
              </div>
              {data.paymentMethod==='bank' && (
                <div style={s.formGroup}>
                  <label style={s.formLabel}>IBAN</label>
                  <input style={s.formInput} placeholder="DE__ ____ ____ ____ ____ __" value={data.iban} onChange={setD('iban')} />
                </div>
              )}
              {data.paymentMethod==='paypal' && (
                <div style={s.formGroup}>
                  <label style={s.formLabel}>PayPal E-Mail</label>
                  <input style={s.formInput} placeholder="paypal@email.de" value={data.paypalEmail} onChange={setD('paypalEmail')} />
                </div>
              )}
            </div>

            {/* Notes */}
            <div style={s.card}>
              <div style={s.cardTitle}>📝 Anmerkungen</div>
              <textarea style={{...s.formInput, minHeight:80, resize:'vertical'}}
                placeholder="z.B. Vielen Dank für Ihr Vertrauen in unsere Dienstleistungen."
                value={data.notes} onChange={setD('notes')} />
            </div>
          </div>

          {/* RIGHT COLUMN – Line Items */}
          <div style={s.rightCol}>
            <div style={s.card}>
              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20}}>
                <div style={s.cardTitle}>🗂️ Positionen</div>
                <button style={s.addBtn} onClick={addItem}>+ Position hinzufügen</button>
              </div>

              {/* Table Header */}
              <div style={s.tableHeader}>
                <div style={{flex:3}}>Beschreibung</div>
                <div style={{width:70, textAlign:'center' as const}}>Menge</div>
                <div style={{width:100, textAlign:'right' as const}}>Einzelpreis</div>
                <div style={{width:100, textAlign:'right' as const}}>Gesamt</div>
                <div style={{width:32}} />
              </div>

              {/* Items */}
              {items.map((item, idx) => (
                <div key={item.id} style={{...s.tableRow, background: idx % 2 === 0 ? '#fff' : '#f8fafc'}}>
                  <div style={{flex:3, paddingRight:8}}>
                    <input
                      style={{...s.formInput, fontSize:'0.88rem', padding:'8px 10px'}}
                      placeholder="z.B. Antragsbearbeitung, Übersetzung..."
                      value={item.description}
                      onChange={e => updateItem(item.id, 'description', e.target.value)}
                    />
                  </div>
                  <div style={{width:70}}>
                    <input
                      style={{...s.formInput, fontSize:'0.88rem', padding:'8px 10px', textAlign:'center' as const}}
                      type="number" min="1" step="1"
                      value={item.quantity}
                      onChange={e => updateItem(item.id, 'quantity', e.target.value)}
                    />
                  </div>
                  <div style={{width:100}}>
                    <div style={{position:'relative' as const}}>
                      <input
                        style={{...s.formInput, fontSize:'0.88rem', padding:'8px 10px 8px 8px', textAlign:'right' as const, paddingRight:20}}
                        type="number" min="0" step="0.01"
                        value={item.unitPrice}
                        onChange={e => updateItem(item.id, 'unitPrice', e.target.value)}
                      />
                      <span style={{position:'absolute' as const, right:8, top:'50%', transform:'translateY(-50%)', fontSize:'0.8rem', color:'#9ca3af', pointerEvents:'none' as const}}>€</span>
                    </div>
                  </div>
                  <div style={{width:100, display:'flex', alignItems:'center', justifyContent:'flex-end', fontWeight:700, color:'#0f1f3d', fontSize:'0.9rem'}}>
                    {(item.quantity * item.unitPrice).toFixed(2).replace('.',',')} €
                  </div>
                  <div style={{width:32, display:'flex', alignItems:'center', justifyContent:'center'}}>
                    <button style={s.removeBtn} onClick={() => removeItem(item.id)} title="Position entfernen">✕</button>
                  </div>
                </div>
              ))}

              {/* Totals */}
              <div style={s.totalsBox}>
                <div style={s.totalRow}>
                  <span style={{color:'#6b7280'}}>Zwischensumme</span>
                  <span>{subtotal.toFixed(2).replace('.',',')} €</span>
                </div>
                <div style={s.totalRow}>
                  <span style={{color:'#6b7280'}}>USt. (§ 19 UStG)</span>
                  <span style={{color:'#9ca3af'}}>entfällt</span>
                </div>
                <div style={{...s.totalRow, borderTop:'2px solid #0f1f3d', paddingTop:10, marginTop:4}}>
                  <span style={{fontWeight:800, fontSize:'1rem', color:'#0f1f3d'}}>Gesamtbetrag</span>
                  <span style={{fontWeight:800, fontSize:'1.2rem', color:'#c9a84c'}}>{total.toFixed(2).replace('.',',')} €</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  loginWrap:    { minHeight:'100vh', background:'#f3f4f6', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'DM Sans',sans-serif" },
  loginCard:    { background:'#fff', borderRadius:20, padding:'40px 36px', width:'100%', maxWidth:400, boxShadow:'0 20px 60px rgba(0,0,0,0.12)' },
  loginTitle:   { fontFamily:"'Playfair Display',serif", fontSize:'1.6rem', color:'#0f1f3d', marginBottom:6 },
  loginSub:     { color:'#6b7280', fontSize:'0.88rem', marginBottom:28 },
  backLink:     { color:'#c9a84c', textDecoration:'none', fontSize:'0.88rem', fontWeight:600, display:'block', marginBottom:20 },
  label:        { display:'block', fontSize:'0.82rem', fontWeight:600, color:'#1a2540', marginBottom:6 },
  input:        { width:'100%', border:'1.5px solid #e5e7eb', borderRadius:10, padding:'12px 14px', fontSize:'0.95rem', fontFamily:"'DM Sans',sans-serif", outline:'none', boxSizing:'border-box' as const },
  loginBtn:     { width:'100%', background:'#0f1f3d', color:'#c9a84c', border:'none', borderRadius:10, padding:14, fontSize:'1rem', fontWeight:700, cursor:'pointer', marginTop:16, fontFamily:"'DM Sans',sans-serif" },
  error:        { background:'#fef2f2', border:'1px solid #fecaca', borderRadius:8, padding:'10px 14px', color:'#dc2626', fontSize:'0.88rem', marginTop:12 },
  wrap:         { minHeight:'100vh', background:'#f8fafc', fontFamily:"'DM Sans',sans-serif" },
  header:       { background:'#0f1f3d', padding:'18px 28px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap' as const, gap:12 },
  headerBack:   { color:'rgba(255,255,255,0.5)', textDecoration:'none', fontSize:'0.85rem', fontWeight:500, transition:'color .2s' },
  headerTitle:  { fontFamily:"'Playfair Display',serif", fontSize:'1.3rem', color:'#c9a84c', margin:0 },
  headerSub:    { color:'rgba(255,255,255,0.45)', fontSize:'0.8rem', marginTop:2 },
  resetBtn:     { background:'rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.7)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:8, padding:'9px 16px', fontSize:'0.85rem', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" },
  generateBtn:  { background:'#c9a84c', color:'#0f1f3d', border:'none', borderRadius:8, padding:'9px 20px', fontSize:'0.9rem', fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" },
  content:      { padding:'24px 28px 48px' },
  grid:         { display:'grid', gridTemplateColumns:'1fr 1.4fr', gap:24, maxWidth:1200, margin:'0 auto' },
  leftCol:      { display:'flex', flexDirection:'column' as const, gap:20 },
  rightCol:     { display:'flex', flexDirection:'column' as const, gap:20 },
  card:         { background:'#fff', borderRadius:16, padding:'24px', border:'1px solid #e5e7eb', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' },
  cardTitle:    { fontSize:'0.78rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase' as const, color:'#c9a84c', marginBottom:18 },
  formRow:      { display:'flex', gap:12, flexWrap:'wrap' as const },
  formGroup:    { flex:1, minWidth:130, marginBottom:14 },
  formLabel:    { display:'block', fontSize:'0.8rem', fontWeight:600, color:'#1a2540', marginBottom:5 },
  formInput:    { width:'100%', border:'1.5px solid #e5e7eb', borderRadius:8, padding:'9px 12px', fontSize:'0.9rem', fontFamily:"'DM Sans',sans-serif", outline:'none', boxSizing:'border-box' as const, color:'#1a2540' },
  tableHeader:  { display:'flex', gap:8, alignItems:'center', padding:'8px 12px', background:'#0f1f3d', borderRadius:8, marginBottom:8, fontSize:'0.78rem', fontWeight:700, color:'rgba(255,255,255,0.7)' },
  tableRow:     { display:'flex', gap:8, alignItems:'center', padding:'8px 12px', borderRadius:8, marginBottom:4 },
  addBtn:       { background:'#0f1f3d', color:'#c9a84c', border:'none', borderRadius:8, padding:'8px 16px', fontSize:'0.82rem', fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", whiteSpace:'nowrap' as const },
  removeBtn:    { background:'#fef2f2', color:'#ef4444', border:'1px solid #fecaca', borderRadius:6, width:28, height:28, cursor:'pointer', fontSize:'0.75rem', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'DM Sans',sans-serif" },
  totalsBox:    { background:'#f8fafc', borderRadius:10, padding:'16px 20px', marginTop:16, border:'1px solid #e5e7eb' },
  totalRow:     { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0', fontSize:'0.92rem', color:'#1a2540' },
}
