'use client'
import { useState, useCallback, useEffect } from 'react'
import { Booking, BookingStatus } from '../../lib/types'

const STATUS_COLORS: Record<BookingStatus, string> = {
  neu: '#3b82f6', bestätigt: '#10b981', abgeschlossen: '#6b7280', storniert: '#ef4444',
}
const STATUS_LABELS: Record<BookingStatus, string> = {
  neu: '🔵 Neu', bestätigt: '✅ Bestätigt', abgeschlossen: '⬛ Abgeschlossen', storniert: '❌ Storniert',
}

// Price lookup from service name
function extractPrice(leistung: string): number {
  const map: Record<string, number> = {
    'Basis': 99, 'Basic': 99, 'Bazë': 99,
    'Komplett': 239, 'Full': 239, 'Shërbim i plotë': 239,
    'Anerkennung': 469, 'Recognition': 469, 'Njohja': 469,
    'Übersetzung': 35, 'Translation': 35, 'Përkthim': 35,
    'Versicherung': 0, 'Insurance': 0, 'Sigurim': 0,
  }
  for (const [key, val] of Object.entries(map)) {
    if (leistung.includes(key)) return val
  }
  return 0
}

interface InvoiceForm {
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  customerName: string
  customerAddress: string
  customerCity: string
  description: string
  quantity: number
  unitPrice: number
  notes: string
  paymentMethod: 'bank' | 'cash' | 'paypal'
  iban: string
  paypalEmail: string
}

export default function AdminPage() {
  const { password, setPassword, authed, authError, checking, login: authLogin, logout } = useAdminAuth()
  const [bookings, setBookings]             = useState<Booking[]>([])
  const [loading, setLoading]               = useState(false)
  const [filter, setFilter]                 = useState<BookingStatus | 'alle'>('alle')
  const [search, setSearch]                 = useState('')
  const [updating, setUpdating]             = useState<string | null>(null)
  const [maintenance, setMaintenance]       = useState(false)
  const [maintLoading, setMaintLoading]     = useState(false)
  const [invoiceBooking, setInvoiceBooking] = useState<Booking | null>(null)
  const [invoiceLoading, setInvoiceLoading] = useState(false)
  const [invoiceForm, setInvoiceForm]       = useState<InvoiceForm | null>(null)

  const load = useCallback(async (pwd: string) => {
    setLoading(true)
    const res = await fetch('/api/bookings/admin', { headers: { 'x-admin-password': pwd } })
    if (res.status === 401) { setLoading(false); return }
    const data = await res.json()
    setBookings(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  // Auto-load bookings when authed (e.g. restored from sessionStorage)
  useEffect(() => {
    if (authed && password && bookings.length === 0) {
      load(password)
      loadMaintenance(password)
    }
  }, [authed, password])

  const loadMaintenance = useCallback(async (pwd: string) => {
    const res = await fetch('/api/maintenance', { headers: { 'x-admin-password': pwd } })
    const data = await res.json()
    setMaintenance(data.maintenance === true)
  }, [])

  async function login() {
    const inputPwd = password
    const ok = await authLogin(inputPwd)
    if (!ok) return
    const res = await fetch('/api/bookings/admin', { headers: { 'x-admin-password': inputPwd } })
    const data = await res.json()
    setBookings(Array.isArray(data) ? data : [])
    loadMaintenance(inputPwd)
  }

  async function toggleMaintenance() {
    setMaintLoading(true)
    const res = await fetch('/api/maintenance', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({ enabled: !maintenance }),
    })
    const data = await res.json()
    setMaintenance(data.maintenance)
    setMaintLoading(false)
  }

  async function updateStatus(id: string, status: BookingStatus) {
    setUpdating(id)
    await fetch('/api/bookings/admin', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({ id, status }),
    })
    setBookings(bs => bs.map(b => b.id === id ? { ...b, status } : b))
    setUpdating(null)
  }

  function openInvoice(b: Booking) {
    const today = new Date()
    const due   = new Date(today.getTime() + 14 * 86400000)
    const num   = 'RE-' + today.getFullYear() + '-' + String(Math.floor(Math.random() * 900) + 100)
    setInvoiceForm({
      invoiceNumber: num,
      invoiceDate: today.toISOString().split('T')[0],
      dueDate: due.toISOString().split('T')[0],
      customerName: `${b.vorname} ${b.nachname}`,
      customerAddress: '',
      customerCity: '',
      description: b.leistung,
      quantity: 1,
      unitPrice: extractPrice(b.leistung),
      notes: '',
      paymentMethod: 'bank',
      iban: '',
      paypalEmail: '',
    })
    setInvoiceBooking(b)
  }

  async function generateInvoice() {
    if (!invoiceForm) return
    setInvoiceLoading(true)
    try {
      const res = await fetch('/api/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({
          ...invoiceForm,
          items: [{ description: invoiceForm.description, quantity: invoiceForm.quantity, unitPrice: invoiceForm.unitPrice }],
        }),
      })
      if (!res.ok) { alert('Fehler bei der PDF-Erstellung'); setInvoiceLoading(false); return }
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `Rechnung-${invoiceForm.invoiceNumber}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      setInvoiceBooking(null)
      setInvoiceForm(null)
    } catch (e) {
      alert('Fehler: ' + e)
    }
    setInvoiceLoading(false)
  }

  const setIF = (field: keyof InvoiceForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setInvoiceForm(f => f ? { ...f, [field]: field === 'quantity' || field === 'unitPrice' ? Number(e.target.value) : e.target.value } : f)

  const filtered = bookings.filter(b => {
    const matchStatus = filter === 'alle' || b.status === filter
    const q = search.toLowerCase()
    const matchSearch = !q || `${b.vorname} ${b.nachname} ${b.email} ${b.leistung}`.toLowerCase().includes(q)
    return matchStatus && matchSearch
  })

  const counts: Record<string, number> = { alle: bookings.length }
  bookings.forEach(b => { counts[b.status] = (counts[b.status] || 0) + 1 })

  if (checking) return (
    <div style={s.loginWrap}><div style={{...s.loginCard, textAlign:'center' as const}}><p style={{color:'#6b7280'}}>⏳ Wird geladen...</p></div></div>
  )

  if (!authed) return (
    <div style={s.loginWrap}>
      <div style={s.loginCard}>
        <h1 style={s.loginTitle}>🔐 Admin-Bereich</h1>
        <p style={s.loginSub}>AntragshelferPro – Buchungsverwaltung</p>
        <label style={s.label}>Passwort</label>
        <input type="password" style={s.input} placeholder="Admin-Passwort eingeben"
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
        <div>
          <h1 style={s.headerTitle}>📋 Buchungsverwaltung</h1>
          <p style={s.headerSub}>AntragshelferPro – Admin Dashboard</p>
        </div>
        <div style={{display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' as const}}>
          <div style={{...s.maintBox, borderColor: maintenance ? '#ef4444' : 'rgba(255,255,255,0.15)'}}>
            <div>
              <div style={{fontSize:'0.8rem', color: maintenance ? '#fca5a5' : 'rgba(255,255,255,0.6)', fontWeight:600}}>
                {maintenance ? '🔴 Wartungsmodus AKTIV' : '🟢 Seite online'}
              </div>
              <div style={{fontSize:'0.7rem', color:'rgba(255,255,255,0.35)', marginTop:2}}>
                {maintenance ? 'Besucher sehen Wartungsseite' : 'Seite für alle erreichbar'}
              </div>
            </div>
            <button style={{...s.toggleBtn, background: maintenance ? '#ef4444' : '#10b981', opacity: maintLoading ? 0.6 : 1}}
              onClick={toggleMaintenance} disabled={maintLoading}>
              {maintLoading ? '...' : maintenance ? 'Deaktivieren' : 'Aktivieren'}
            </button>
          </div>
          <a href="/admin/rechnung" style={s.invoiceGenBtn}>🧾 Rechnungsgenerator</a>
          <button style={s.refreshBtn} onClick={() => load(password)}>🔄 Aktualisieren</button>
          <button style={s.logoutBtn} onClick={() => { logout(); setBookings([]) }}>Logout</button>
        </div>
      </div>

      {/* STATS */}
      <div style={s.statsRow}>
        {(['alle','neu','bestätigt','abgeschlossen','storniert'] as const).map(st => (
          <button key={st} style={{...s.statCard, background: filter===st?'#0f1f3d':'#fff', color: filter===st?'#c9a84c':'#1a2540', borderColor: filter===st?'#0f1f3d':'#e5e7eb'}}
            onClick={() => setFilter(st)}>
            <div style={{fontSize:'1.5rem', fontWeight:900}}>{counts[st]??0}</div>
            <div style={{fontSize:'0.78rem', marginTop:3}}>{st==='alle'?'Gesamt':STATUS_LABELS[st as BookingStatus]}</div>
          </button>
        ))}
      </div>

      {/* SEARCH */}
      <div style={s.searchBar}>
        <input style={s.searchInput} placeholder="🔍  Name, E-Mail oder Leistung suchen..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* BOOKINGS */}
      {loading ? <div style={s.loading}>Lade Buchungen...</div> : (
        <div style={s.tableWrap}>
          {filtered.length === 0
            ? <div style={s.empty}>Keine Buchungen gefunden.</div>
            : filtered.map(b => (
              <div key={b.id} style={s.row}>
                <div style={s.rowTop}>
                  <div>
                    <div style={s.rowName}>{b.vorname} {b.nachname}</div>
                    <div style={s.rowMeta}>{b.email}{b.telefon ? ` · ${b.telefon}` : ''}</div>
                  </div>
                  <div style={{display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' as const}}>
                    <span style={{...s.badge, background:STATUS_COLORS[b.status]+'22', color:STATUS_COLORS[b.status], border:`1px solid ${STATUS_COLORS[b.status]}44`}}>
                      {STATUS_LABELS[b.status]}
                    </span>
                    {/* Invoice button – show for bestätigt & abgeschlossen */}
                    {(b.status === 'bestätigt' || b.status === 'abgeschlossen') && (
                      <button style={s.invoiceBtn} onClick={() => openInvoice(b)}>
                        🧾 Rechnung erstellen
                      </button>
                    )}
                  </div>
                </div>
                <div style={s.rowLeistung}>🗂️ {b.leistung}</div>
                <div style={s.rowMeta}>🌐 {b.sprache} · 📅 {new Date(b.created_at).toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})}</div>
                {b.nachricht && <div style={s.rowMsg}>💬 {b.nachricht}</div>}
                <div style={s.rowActions}>
                  <span style={{fontSize:'0.78rem',color:'#6b7280'}}>Status ändern:</span>
                  {(['neu','bestätigt','abgeschlossen','storniert'] as BookingStatus[]).map(st => (
                    <button key={st} disabled={b.status===st||updating===b.id}
                      style={{...s.actionBtn, opacity:b.status===st?0.4:1, background:STATUS_COLORS[st]+'18', color:STATUS_COLORS[st], borderColor:STATUS_COLORS[st]+'44'}}
                      onClick={() => updateStatus(b.id, st)}>
                      {updating===b.id?'...':st.charAt(0).toUpperCase()+st.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* ── INVOICE MODAL ── */}
      {invoiceBooking && invoiceForm && (
        <div style={s.overlay} onClick={() => { setInvoiceBooking(null); setInvoiceForm(null) }}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>🧾 Rechnung erstellen</h2>
              <button style={s.modalClose} onClick={() => { setInvoiceBooking(null); setInvoiceForm(null) }}>✕</button>
            </div>

            <div style={s.modalBody}>
              {/* Invoice details */}
              <div style={s.formSection}>
                <div style={s.sectionLabel}>Rechnungsdetails</div>
                <div style={s.formRow}>
                  <div style={s.formGroup}>
                    <label style={s.formLabel}>Rechnungsnummer</label>
                    <input style={s.formInput} value={invoiceForm.invoiceNumber} onChange={setIF('invoiceNumber')} />
                  </div>
                  <div style={s.formGroup}>
                    <label style={s.formLabel}>Rechnungsdatum</label>
                    <input style={s.formInput} type="date" value={invoiceForm.invoiceDate} onChange={setIF('invoiceDate')} />
                  </div>
                  <div style={s.formGroup}>
                    <label style={s.formLabel}>Fälligkeitsdatum</label>
                    <input style={s.formInput} type="date" value={invoiceForm.dueDate} onChange={setIF('dueDate')} />
                  </div>
                </div>
              </div>

              {/* Customer */}
              <div style={s.formSection}>
                <div style={s.sectionLabel}>Kunde</div>
                <div style={s.formRow}>
                  <div style={{...s.formGroup, flex:2}}>
                    <label style={s.formLabel}>Name</label>
                    <input style={s.formInput} value={invoiceForm.customerName} onChange={setIF('customerName')} />
                  </div>
                </div>
                <div style={s.formRow}>
                  <div style={{...s.formGroup, flex:2}}>
                    <label style={s.formLabel}>Straße & Hausnummer</label>
                    <input style={s.formInput} placeholder="z.B. Musterstraße 1" value={invoiceForm.customerAddress} onChange={setIF('customerAddress')} />
                  </div>
                  <div style={s.formGroup}>
                    <label style={s.formLabel}>PLZ & Ort</label>
                    <input style={s.formInput} placeholder="z.B. 42105 Wuppertal" value={invoiceForm.customerCity} onChange={setIF('customerCity')} />
                  </div>
                </div>
              </div>

              {/* Position */}
              <div style={s.formSection}>
                <div style={s.sectionLabel}>Position</div>
                <div style={s.formGroup}>
                  <label style={s.formLabel}>Leistungsbeschreibung</label>
                  <input style={s.formInput} value={invoiceForm.description} onChange={setIF('description')} />
                </div>
                <div style={s.formRow}>
                  <div style={s.formGroup}>
                    <label style={s.formLabel}>Menge</label>
                    <input style={s.formInput} type="number" min="1" value={invoiceForm.quantity} onChange={setIF('quantity')} />
                  </div>
                  <div style={s.formGroup}>
                    <label style={s.formLabel}>Einzelpreis (€)</label>
                    <input style={s.formInput} type="number" min="0" step="0.01" value={invoiceForm.unitPrice} onChange={setIF('unitPrice')} />
                  </div>
                  <div style={s.formGroup}>
                    <label style={s.formLabel}>Gesamt</label>
                    <div style={{...s.formInput, background:'#f3f4f6', fontWeight:700, color:'#0f1f3d'}}>
                      {(invoiceForm.quantity * invoiceForm.unitPrice).toFixed(2).replace('.',',')} €
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div style={s.formSection}>
                <div style={s.sectionLabel}>Zahlungsart</div>
                <div style={s.formRow}>
                  {(['bank','cash','paypal'] as const).map(pm => (
                    <button key={pm} style={{...s.pmBtn, background: invoiceForm.paymentMethod===pm?'#0f1f3d':'#f3f4f6', color: invoiceForm.paymentMethod===pm?'#c9a84c':'#6b7280', border: invoiceForm.paymentMethod===pm?'1.5px solid #0f1f3d':'1.5px solid #e5e7eb'}}
                      onClick={() => setInvoiceForm(f => f ? {...f, paymentMethod: pm} : f)}>
                      {pm==='bank'?'🏦 Banküberweisung':pm==='cash'?'💵 Barzahlung':'💙 PayPal'}
                    </button>
                  ))}
                </div>
                {invoiceForm.paymentMethod==='bank' && (
                  <div style={{...s.formGroup, marginTop:10}}>
                    <label style={s.formLabel}>IBAN</label>
                    <input style={s.formInput} placeholder="DE__ ____ ____ ____ ____ __" value={invoiceForm.iban} onChange={e => setInvoiceForm(f => f ? {...f, iban: e.target.value} : f)} />
                  </div>
                )}
                {invoiceForm.paymentMethod==='paypal' && (
                  <div style={{...s.formGroup, marginTop:10}}>
                    <label style={s.formLabel}>PayPal E-Mail</label>
                    <input style={s.formInput} placeholder="paypal@email.de" value={invoiceForm.paypalEmail} onChange={e => setInvoiceForm(f => f ? {...f, paypalEmail: e.target.value} : f)} />
                  </div>
                )}
              </div>

              {/* Notes */}
              <div style={s.formSection}>
                <div style={s.sectionLabel}>Anmerkungen (optional)</div>
                <textarea style={{...s.formInput, minHeight:72, resize:'vertical'}} placeholder="z.B. Danke für Ihr Vertrauen..."
                  value={invoiceForm.notes} onChange={setIF('notes')} />
              </div>


            </div>

            <div style={s.modalFooter}>
              <button style={s.cancelBtn} onClick={() => { setInvoiceBooking(null); setInvoiceForm(null) }}>Abbrechen</button>
              <button style={{...s.generateBtn, opacity: invoiceLoading ? 0.7 : 1}} onClick={generateInvoice} disabled={invoiceLoading}>
                {invoiceLoading ? '⏳ Wird generiert...' : '📄 PDF herunterladen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  loginWrap:    { minHeight:'100vh', background:'#f3f4f6', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'DM Sans',sans-serif" },
  loginCard:    { background:'#fff', borderRadius:20, padding:'40px 36px', width:'100%', maxWidth:400, boxShadow:'0 20px 60px rgba(0,0,0,0.12)' },
  loginTitle:   { fontFamily:"'Playfair Display',serif", fontSize:'1.6rem', color:'#0f1f3d', marginBottom:6 },
  loginSub:     { color:'#6b7280', fontSize:'0.88rem', marginBottom:28 },
  label:        { display:'block', fontSize:'0.82rem', fontWeight:600, color:'#1a2540', marginBottom:6 },
  input:        { width:'100%', border:'1.5px solid #e5e7eb', borderRadius:10, padding:'12px 14px', fontSize:'0.95rem', fontFamily:"'DM Sans',sans-serif", outline:'none', boxSizing:'border-box' as const },
  loginBtn:     { width:'100%', background:'#0f1f3d', color:'#c9a84c', border:'none', borderRadius:10, padding:14, fontSize:'1rem', fontWeight:700, cursor:'pointer', marginTop:16, fontFamily:"'DM Sans',sans-serif" },
  error:        { background:'#fef2f2', border:'1px solid #fecaca', borderRadius:8, padding:'10px 14px', color:'#dc2626', fontSize:'0.88rem', marginTop:12 },
  wrap:         { minHeight:'100vh', background:'#f8fafc', fontFamily:"'DM Sans',sans-serif" },
  header:       { background:'#0f1f3d', padding:'20px 28px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap' as const, gap:12 },
  headerTitle:  { fontFamily:"'Playfair Display',serif", fontSize:'1.4rem', color:'#c9a84c', margin:0 },
  headerSub:    { color:'rgba(255,255,255,0.5)', fontSize:'0.82rem', marginTop:3 },
  maintBox:     { display:'flex', alignItems:'center', gap:12, background:'rgba(255,255,255,0.05)', border:'1px solid', borderRadius:10, padding:'10px 14px' },
  toggleBtn:    { color:'#fff', border:'none', borderRadius:8, padding:'7px 14px', fontSize:'0.82rem', fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", whiteSpace:'nowrap' as const },
  invoiceGenBtn:{ background:'rgba(201,168,76,0.2)', color:'#c9a84c', border:'1px solid rgba(201,168,76,0.4)', borderRadius:8, padding:'8px 16px', fontSize:'0.85rem', fontWeight:600, textDecoration:'none', fontFamily:"'DM Sans',sans-serif", display:'flex', alignItems:'center' },
  refreshBtn:   { background:'rgba(201,168,76,0.15)', color:'#c9a84c', border:'1px solid rgba(201,168,76,0.3)', borderRadius:8, padding:'8px 16px', fontSize:'0.85rem', fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" },
  logoutBtn:    { background:'rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.6)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:8, padding:'8px 16px', fontSize:'0.85rem', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" },
  statsRow:     { display:'flex', gap:12, padding:'20px 24px', flexWrap:'wrap' as const },
  statCard:     { flex:'1 1 100px', border:'1px solid', borderRadius:12, padding:'14px 16px', cursor:'pointer', textAlign:'center' as const, fontFamily:"'DM Sans',sans-serif", transition:'all .2s' },
  searchBar:    { padding:'0 24px 16px' },
  searchInput:  { width:'100%', border:'1.5px solid #e5e7eb', borderRadius:10, padding:'12px 16px', fontSize:'0.93rem', fontFamily:"'DM Sans',sans-serif", outline:'none', background:'#fff', boxSizing:'border-box' as const },
  tableWrap:    { padding:'0 24px 40px', display:'flex', flexDirection:'column' as const, gap:14 },
  row:          { background:'#fff', borderRadius:14, padding:'20px 22px', border:'1px solid #e5e7eb', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' },
  rowTop:       { display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10, gap:10, flexWrap:'wrap' as const },
  rowName:      { fontWeight:700, fontSize:'1rem', color:'#0f1f3d' },
  rowMeta:      { fontSize:'0.82rem', color:'#6b7280', marginTop:3 },
  rowLeistung:  { fontSize:'0.9rem', color:'#1a2540', fontWeight:600, marginBottom:6 },
  rowMsg:       { background:'#f8fafc', borderRadius:8, padding:'8px 12px', fontSize:'0.85rem', color:'#4b5563', margin:'8px 0', border:'1px solid #e5e7eb' },
  rowActions:   { display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' as const, marginTop:12 },
  badge:        { borderRadius:100, padding:'4px 12px', fontSize:'0.78rem', fontWeight:700, whiteSpace:'nowrap' as const },
  actionBtn:    { border:'1px solid', borderRadius:8, padding:'5px 12px', fontSize:'0.78rem', fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" },
  invoiceBtn:   { background:'#0f1f3d', color:'#c9a84c', border:'none', borderRadius:8, padding:'6px 14px', fontSize:'0.8rem', fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", whiteSpace:'nowrap' as const },
  loading:      { padding:'48px', textAlign:'center' as const, color:'#6b7280' },
  empty:        { padding:'48px', textAlign:'center' as const, color:'#9ca3af', fontSize:'0.95rem' },
  // Modal
  overlay:      { position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:20, backdropFilter:'blur(4px)' },
  modal:        { background:'#fff', borderRadius:20, width:'100%', maxWidth:680, maxHeight:'90vh', overflow:'hidden', display:'flex', flexDirection:'column' as const, boxShadow:'0 24px 80px rgba(0,0,0,0.2)' },
  modalHeader:  { background:'#0f1f3d', padding:'20px 28px', display:'flex', alignItems:'center', justifyContent:'space-between' },
  modalTitle:   { fontFamily:"'Playfair Display',serif", fontSize:'1.3rem', color:'#c9a84c', margin:0 },
  modalClose:   { background:'rgba(255,255,255,0.1)', border:'none', borderRadius:'50%', width:32, height:32, color:'#fff', fontSize:'1rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' },
  modalBody:    { padding:'24px 28px', overflowY:'auto' as const, flex:1 },
  modalFooter:  { padding:'16px 28px', borderTop:'1px solid #e5e7eb', display:'flex', justifyContent:'flex-end', gap:12, background:'#f8fafc' },
  formSection:  { marginBottom:20 },
  sectionLabel: { fontSize:'0.72rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase' as const, color:'#c9a84c', marginBottom:10 },
  formRow:      { display:'flex', gap:12, flexWrap:'wrap' as const },
  formGroup:    { flex:1, minWidth:140, marginBottom:10 },
  formLabel:    { display:'block', fontSize:'0.8rem', fontWeight:600, color:'#1a2540', marginBottom:5 },
  formInput:    { width:'100%', border:'1.5px solid #e5e7eb', borderRadius:8, padding:'9px 12px', fontSize:'0.9rem', fontFamily:"'DM Sans',sans-serif", outline:'none', boxSizing:'border-box' as const },
  pmBtn:        { flex:1, padding:'10px 14px', borderRadius:8, cursor:'pointer', fontSize:'0.88rem', fontWeight:600, fontFamily:"'DM Sans',sans-serif", transition:'all .2s' },
  cancelBtn:    { background:'#f3f4f6', color:'#6b7280', border:'none', borderRadius:10, padding:'10px 20px', fontSize:'0.9rem', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" },
  generateBtn:  { background:'#0f1f3d', color:'#c9a84c', border:'none', borderRadius:10, padding:'10px 24px', fontSize:'0.9rem', fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" },
}
